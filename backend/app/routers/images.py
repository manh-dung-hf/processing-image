from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
import os
import uuid
import hashlib
from pathlib import Path
from datetime import datetime
from PIL import Image as PILImage

from ..db.session import get_db
from ..db.models import Image, Tag, User, Workspace, AuditEvent, ProcessingJob
from ..schemas.image import ImageMeta, ImageDetail
from ..services.ai_service import ai_service

router = APIRouter()
UPLOAD_DIR = Path("uploads")

@router.get("", response_model=dict)
async def list_images(
    category: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    query = select(Image).where(Image.deleted_at == None).order_by(Image.uploaded_at.desc())
    
    if category:
        query = query.where(Image.category == category)
    if status:
        query = query.where(Image.status == status)
        
    result = await db.execute(query.limit(limit))
    items = result.scalars().all()
    
    # Simple count for now
    total_result = await db.execute(select(func.count(Image.id)).where(Image.deleted_at == None))
    total = total_result.scalar()
    
    return {
        "items": items,
        "total": total,
        "nextCursor": None
    }

@router.post("/upload", response_model=ImageMeta)
async def upload_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    file_id = str(uuid.uuid4())
    file_ext = Path(file.filename).suffix
    storage_key = f"{datetime.now().strftime('%Y/%m/%d')}/{file_id}{file_ext}"
    file_path = UPLOAD_DIR / storage_key
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    content = await file.read()
    hash_sha256 = hashlib.sha256(content).hexdigest()
    
    with open(file_path, "wb") as f:
        f.write(content)
        
    # Get image dimensions
    with PILImage.open(file_path) as img:
        width, height = img.size
        
    # Create DB record
    new_image = Image(
        id=file_id,
        workspace_id="default-ws", # Stub
        uploaded_by="default-user", # Stub
        filename=file.filename,
        content_type=file.content_type,
        size_bytes=len(content),
        width=width,
        height=height,
        hash_sha256=hash_sha256,
        storage_provider="local",
        storage_key=str(storage_key),
        status="queued",
        source="web"
    )
    
    db.add(new_image)
    
    # Audit event
    audit = AuditEvent(
        image_id=file_id,
        event_type="received",
        severity="info",
        label="Image received from web upload",
        actor_id="default-user"
    )
    db.add(audit)
    
    await db.commit()
    await db.refresh(new_image)
    
    # Trigger AI pipeline in background
    background_tasks.add_task(process_image_pipeline, file_id)
    
    return new_image

@router.get("/{id}", response_model=ImageDetail)
async def get_image(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Image).where(Image.id == id))
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image

async def process_image_pipeline(image_id: str):
    from ..db.session import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Image).where(Image.id == image_id))
        image = result.scalar_one_or_none()
        if not image: return
        
        image.status = "processing"
        await db.commit()
        
        file_path = UPLOAD_DIR / image.storage_key
        
        try:
            # 1. Vision
            vision_data = await ai_service.run_vision_stage(str(file_path))
            image.title = vision_data.get("title") # Note: title field was in my previous model, data-model has ai_summary
            image.ai_summary = vision_data.get("summary")
            image.category = vision_data.get("category")
            image.ai_confidence = vision_data.get("confidence")
            image.ai_model = ai_service.vision_model
            
            # 2. OCR
            ocr_data = await ai_service.run_ocr_stage(str(file_path))
            image.ocr_text = ocr_data.get("text")
            image.ocr_confidence = ocr_data.get("confidence")
            image.ocr_engine = ocr_data.get("engine")
            
            # 3. Tags
            tags_data = await ai_service.run_tagging_stage(vision_data, image.ocr_text or "")
            for tag_info in tags_data:
                # Find or create tag
                tag_result = await db.execute(select(Tag).where(Tag.label == tag_info["label"]))
                tag = tag_result.scalar_one_or_none()
                if not tag:
                    tag = Tag(id=str(uuid.uuid4()), workspace_id=image.workspace_id, label=tag_info["label"], tone=tag_info["tone"])
                    db.add(tag)
                image.tags.append(tag)
            
            image.status = "analyzed"
            image.analyzed_at = datetime.now()
            
            audit = AuditEvent(
                image_id=image_id,
                event_type="ai-completed",
                severity="success",
                label="AI Analysis complete",
                sub=f"Extracted {len(tags_data)} tags and summary."
            )
            db.add(audit)
            
        except Exception as e:
            image.status = "failed"
            image.failed_reason = str(e)
            audit = AuditEvent(
                image_id=image_id,
                event_type="failed",
                severity="danger",
                label="Analysis failed",
                sub=str(e)
            )
            db.add(audit)
            
        await db.commit()
