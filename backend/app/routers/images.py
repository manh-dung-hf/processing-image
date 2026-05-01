import hashlib
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile
from PIL import Image as PILImage
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..db.models import AuditEvent, Image, Tag
from ..db.session import get_db
from ..schemas.image import ImageDetail, ImageListResponse, ImageMeta
from ..services.ai_service import ai_service
from ..services.video_service import extract_frame_for_ai, extract_thumbnail, get_video_metadata

logger = logging.getLogger(__name__)

router = APIRouter()
UPLOAD_DIR = Path("uploads")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo", "video/webm", "video/x-matroska"}
ALLOWED_TYPES = ALLOWED_IMAGE_TYPES | ALLOWED_VIDEO_TYPES


def _is_video(content_type: str) -> bool:
    return content_type in ALLOWED_VIDEO_TYPES


# ─── GET /images ──────────────────────────────────────────────────────────────

@router.get("", response_model=ImageListResponse, summary="List media with optional filters")
async def list_images(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    media_type: Optional[str] = Query(None, description="Filter by media_type: image or video"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Image)
        .options(selectinload(Image.tags))
        .where(Image.deleted_at == None)
        .order_by(Image.uploaded_at.desc())
    )

    if category:
        stmt = stmt.where(Image.category == category)
    if status:
        stmt = stmt.where(Image.status == status)
    if media_type:
        stmt = stmt.where(Image.media_type == media_type)

    result = await db.execute(stmt.limit(limit))
    items = result.scalars().all()

    total_result = await db.execute(
        select(func.count(Image.id)).where(Image.deleted_at == None)
    )
    total = total_result.scalar() or 0

    return ImageListResponse(items=items, total=total, next_cursor=None)


# ─── POST /images/upload ──────────────────────────────────────────────────────

@router.post("/upload", response_model=ImageMeta, status_code=201, summary="Upload image or video")
async def upload_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    file_id = str(uuid.uuid4())
    file_ext = Path(file.filename).suffix.lower()

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type: {file.content_type}. Supported: images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV, AVI, WebM, MKV).",
        )

    is_video = _is_video(file.content_type)
    media_type = "video" if is_video else "image"

    storage_key = f"{datetime.now().strftime('%Y/%m/%d')}/{file_id}{file_ext}"
    file_path = UPLOAD_DIR / storage_key
    file_path.parent.mkdir(parents=True, exist_ok=True)

    content = await file.read()
    hash_sha256 = hashlib.sha256(content).hexdigest()

    with open(file_path, "wb") as f:
        f.write(content)

    width, height, duration, thumbnail_key = 0, 0, None, None

    if is_video:
        # Extract video metadata
        meta = await get_video_metadata(str(file_path))
        width = meta.get("width", 0)
        height = meta.get("height", 0)
        duration = meta.get("duration")

        # Extract thumbnail
        thumb_key = f"{datetime.now().strftime('%Y/%m/%d')}/{file_id}_thumb.jpg"
        thumb_path = UPLOAD_DIR / thumb_key
        success = await extract_thumbnail(str(file_path), str(thumb_path))
        if success:
            thumbnail_key = thumb_key
    else:
        # Image dimensions
        try:
            with PILImage.open(file_path) as img:
                width, height = img.size
        except Exception:
            pass

    new_image = Image(
        id=file_id,
        workspace_id="default-ws",
        uploaded_by="default-user",
        filename=file.filename,
        content_type=file.content_type,
        size_bytes=len(content),
        width=width,
        height=height,
        hash_sha256=hash_sha256,
        storage_provider="local",
        storage_key=str(storage_key),
        media_type=media_type,
        duration=duration,
        thumbnail_key=thumbnail_key,
        status="queued",
        source="web",
    )
    db.add(new_image)

    db.add(AuditEvent(
        image_id=file_id,
        event_type="received",
        severity="info",
        label=f"{'Video' if is_video else 'Image'} received from web upload",
        actor_id="default-user",
    ))

    await db.commit()
    await db.refresh(new_image)
    await db.execute(select(Image).options(selectinload(Image.tags)).where(Image.id == file_id))

    background_tasks.add_task(process_media_pipeline, file_id)

    return new_image


# ─── GET /images/{id} ────────────────────────────────────────────────────────

@router.get("/{id}", response_model=ImageDetail, summary="Get full media detail")
async def get_image(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Image).options(selectinload(Image.tags)).where(Image.id == id)
    )
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Media not found")
    return image


# ─── DELETE /images/{id} ─────────────────────────────────────────────────────

@router.delete("/{id}", status_code=204, summary="Soft-delete media")
async def delete_image(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Image).where(Image.id == id))
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Media not found")
    image.deleted_at = datetime.now()
    await db.commit()


# ─── Background: AI pipeline (works for both image and video) ─────────────────

async def process_media_pipeline(image_id: str):
    from ..db.session import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Image).options(selectinload(Image.tags)).where(Image.id == image_id)
        )
        image = result.scalar_one_or_none()
        if not image:
            return

        image.status = "processing"
        await db.commit()

        file_path = UPLOAD_DIR / image.storage_key
        ai_input_path = str(file_path)

        try:
            # For video: extract a frame for AI analysis
            if image.media_type == "video":
                frame_path = str(UPLOAD_DIR / f"_tmp_frame_{image_id}.jpg")
                extracted = await extract_frame_for_ai(str(file_path), frame_path)
                if extracted:
                    ai_input_path = extracted
                else:
                    # If frame extraction fails, use thumbnail if available
                    if image.thumbnail_key:
                        ai_input_path = str(UPLOAD_DIR / image.thumbnail_key)
                    else:
                        raise Exception("Cannot extract frame from video for AI analysis (ffmpeg not available?)")

            # Stage 1 — Vision
            vision_data = await ai_service.run_vision_stage(ai_input_path)
            image.ai_summary = vision_data.get("summary")
            image.category = vision_data.get("category")
            image.ai_confidence = vision_data.get("confidence")
            image.ai_model = ai_service.vision_model

            # Stage 2 — OCR
            ocr_data = await ai_service.run_ocr_stage(ai_input_path)
            image.ocr_text = ocr_data.get("text")
            image.ocr_confidence = ocr_data.get("confidence")
            image.ocr_engine = ocr_data.get("engine")

            # Stage 3 — Tagging
            tags_data = await ai_service.run_tagging_stage(vision_data, image.ocr_text or "")
            for tag_info in tags_data:
                tag_result = await db.execute(select(Tag).where(Tag.label == tag_info["label"]))
                tag = tag_result.scalar_one_or_none()
                if not tag:
                    tag = Tag(
                        id=str(uuid.uuid4()),
                        workspace_id=image.workspace_id,
                        label=tag_info["label"],
                        tone=tag_info.get("tone", "gray"),
                    )
                    db.add(tag)
                image.tags.append(tag)

            image.status = "analyzed"
            image.analyzed_at = datetime.now()

            db.add(AuditEvent(
                image_id=image_id,
                event_type="ai-completed",
                severity="success",
                label="AI Analysis complete",
                sub=f"Extracted {len(tags_data)} tags and summary.",
            ))

            # Cleanup temp frame
            if image.media_type == "video":
                frame_tmp = Path(UPLOAD_DIR / f"_tmp_frame_{image_id}.jpg")
                if frame_tmp.exists():
                    frame_tmp.unlink()

        except Exception as e:
            logger.exception("AI pipeline failed for media %s", image_id)
            image.status = "failed"
            image.failed_reason = str(e)
            db.add(AuditEvent(
                image_id=image_id,
                event_type="failed",
                severity="danger",
                label="Analysis failed",
                sub=str(e),
            ))

        await db.commit()
