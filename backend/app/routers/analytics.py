from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import List

from ..db.session import get_db
from ..db.models import Image, User, Workspace, Tag
from ..schemas.analytics import StatsResponse, UserActivityItem

router = APIRouter()


# ─── GET /analytics/stats ─────────────────────────────────────────────────────

@router.get(
    "/stats",
    response_model=StatsResponse,
    summary="Platform-wide aggregate statistics",
)
async def get_stats(db: AsyncSession = Depends(get_db)):
    total_images = (
        await db.execute(select(func.count(Image.id)).where(Image.deleted_at == None))
    ).scalar() or 0

    total_users = (
        await db.execute(select(func.count(User.id)))
    ).scalar() or 0

    total_workspaces = (
        await db.execute(select(func.count(Workspace.id)))
    ).scalar() or 0

    # Breakdown by status
    status_rows = await db.execute(
        select(Image.status, func.count(Image.id))
        .where(Image.deleted_at == None)
        .group_by(Image.status)
    )
    images_by_status = {row[0]: row[1] for row in status_rows}

    # Breakdown by source
    source_rows = await db.execute(
        select(Image.source, func.count(Image.id))
        .where(Image.deleted_at == None)
        .group_by(Image.source)
    )
    images_by_source = {row[0]: row[1] for row in source_rows}

    # Breakdown by category (exclude NULL)
    category_rows = await db.execute(
        select(Image.category, func.count(Image.id))
        .where(Image.deleted_at == None)
        .where(Image.category != None)
        .group_by(Image.category)
    )
    images_by_category = {row[0]: row[1] for row in category_rows}

    return StatsResponse(
        total_images=total_images,
        total_users=total_users,
        total_workspaces=total_workspaces,
        images_by_status=images_by_status,
        images_by_source=images_by_source,
        images_by_category=images_by_category,
    )


# ─── GET /analytics/users/activity ───────────────────────────────────────────

@router.get(
    "/users/activity",
    response_model=List[UserActivityItem],
    summary="Upload activity per user (top contributors)",
)
async def user_activity(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
):
    """
    Returns users ordered by image count descending.
    LEFT JOIN ensures users with 0 images are included.
    The deleted_at filter is applied only on the join condition so NULL-joined
    rows (users with no images) still appear.
    """
    rows = await db.execute(
        select(
            User.id,
            User.name,
            User.email,
            func.count(Image.id).label("image_count"),
        )
        .join(
            Image,
            (Image.uploaded_by == User.id) & (Image.deleted_at == None),
            isouter=True,
        )
        .group_by(User.id)
        .order_by(func.count(Image.id).desc())
        .limit(limit)
    )
    return [
        UserActivityItem(user_id=r[0], name=r[1], email=r[2], image_count=r[3])
        for r in rows
    ]


# ─── GET /analytics/images/trend ─────────────────────────────────────────────

@router.get(
    "/images/trend",
    response_model=List[dict],
    summary="Daily upload counts (SQLite strftime)",
)
async def image_trend(db: AsyncSession = Depends(get_db)):
    """Daily upload counts for the available data range (SQLite only)."""
    rows = await db.execute(
        select(
            func.strftime("%Y-%m-%d", Image.uploaded_at).label("day"),
            func.count(Image.id).label("count"),
        )
        .where(Image.deleted_at == None)
        .group_by("day")
        .order_by("day")
    )
    return [{"date": r[0], "count": r[1]} for r in rows]


# ─── GET /analytics/tags/top ─────────────────────────────────────────────────

@router.get(
    "/tags/top",
    response_model=List[dict],
    summary="Most-used tags across all images",
)
async def top_tags(limit: int = 10, db: AsyncSession = Depends(get_db)):
    from ..db.models import image_tags

    rows = await db.execute(
        select(Tag.label, Tag.tone, func.count(image_tags.c.image_id).label("usage"))
        .join(image_tags, image_tags.c.tag_id == Tag.id)
        .group_by(Tag.id)
        .order_by(func.count(image_tags.c.image_id).desc())
        .limit(limit)
    )
    return [{"label": r[0], "tone": r[1], "usage": r[2]} for r in rows]
