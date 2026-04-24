from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional

from ..db.session import get_db
from ..db.models import Image, Tag, image_tags
from ..schemas.search import SearchResponse, SearchResult

router = APIRouter()


# ─── GET /search ──────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=SearchResponse,
    summary="Search images by keyword or tag label",
)
async def search_images(
    q: str = Query(..., min_length=1, description="Keyword or tag to search for"),
    category: Optional[str] = Query(None, description="Filter by image category"),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    term = f"%{q.strip().lower()}%"

    # Images that have a matching tag (via join on image_tags association table)
    tag_match_subq = (
        select(image_tags.c.image_id)
        .join(Tag, Tag.id == image_tags.c.tag_id)
        .where(Tag.label.ilike(term))
        .scalar_subquery()
    )

    stmt = (
        select(Image)
        .options(selectinload(Image.tags))  # eager-load tags in async context
        .where(Image.deleted_at == None)
        .where(
            or_(
                Image.filename.ilike(term),
                Image.ai_summary.ilike(term),
                Image.ocr_text.ilike(term),
                Image.category.ilike(term),
                Image.id.in_(tag_match_subq),
            )
        )
        .order_by(Image.uploaded_at.desc())
        .limit(limit)
    )

    if category:
        stmt = stmt.where(Image.category == category)

    result = await db.execute(stmt)
    images = result.scalars().all()

    items = [
        SearchResult(
            id=img.id,
            filename=img.filename,
            category=img.category,
            status=img.status,
            ai_summary=img.ai_summary,
            uploaded_at=img.uploaded_at,
            tags=[t.label for t in img.tags],
        )
        for img in images
    ]

    return SearchResponse(query=q, total=len(items), items=items)


# ─── GET /search/tags ─────────────────────────────────────────────────────────

@router.get(
    "/tags",
    response_model=List[dict],
    summary="List all available tags",
)
async def list_tags(
    workspace_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Tag).order_by(Tag.label)
    if workspace_id:
        stmt = stmt.where(Tag.workspace_id == workspace_id)

    result = await db.execute(stmt)
    tags = result.scalars().all()
    return [{"id": t.id, "label": t.label, "tone": t.tone} for t in tags]


# ─── GET /search/suggestions ──────────────────────────────────────────────────

@router.get(
    "/suggestions",
    response_model=List[str],
    summary="Autocomplete suggestions for the search box",
)
async def search_suggestions(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    term = f"%{q.strip().lower()}%"
    result = await db.execute(
        select(Tag.label).where(Tag.label.ilike(term)).limit(10)
    )
    return result.scalars().all()
