import platform
import sys
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import Image
from ..db.session import get_db

router = APIRouter()


# ─── GET /ops/health ──────────────────────────────────────────────────────────

@router.get(
    "/health",
    response_model=dict,
    summary="Liveness probe — returns 200 if the service is up",
)
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ─── GET /ops/info ────────────────────────────────────────────────────────────

@router.get(
    "/info",
    response_model=dict,
    summary="System and runtime information",
)
async def system_info():
    return {
        "app": "Lumen AI Image Platform",
        "version": "1.0.0",
        "status": "running",
        "server_time_utc": datetime.now(timezone.utc).isoformat(),
        "python_version": sys.version,
        "platform": platform.platform(),
        "architecture": platform.machine(),
    }


# ─── GET /ops/ping ────────────────────────────────────────────────────────────

@router.get(
    "/ping",
    response_model=dict,
    summary="Simple ping/pong for latency checks",
)
async def ping():
    return {"ping": "pong"}


# ─── GET /ops/progress ────────────────────────────────────────────────────────

@router.get(
    "/progress",
    response_model=dict,
    summary="AI processing progress — queued, processing, analyzed, failed counts",
)
async def processing_progress(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Image.status, func.count(Image.id))
        .where(Image.deleted_at == None)
        .group_by(Image.status)
    )
    counts = {row[0]: row[1] for row in result.all()}

    total = sum(counts.values())
    queued = counts.get("queued", 0)
    processing = counts.get("processing", 0)
    analyzed = counts.get("analyzed", 0)
    failed = counts.get("failed", 0)

    # Recent failures with reasons
    fail_result = await db.execute(
        select(Image.id, Image.filename, Image.failed_reason)
        .where(Image.status == "failed", Image.deleted_at == None)
        .order_by(Image.uploaded_at.desc())
        .limit(10)
    )
    failures = [
        {"id": r.id, "filename": r.filename, "reason": (r.failed_reason or "")[:120]}
        for r in fail_result.all()
    ]

    return {
        "total": total,
        "queued": queued,
        "processing": processing,
        "analyzed": analyzed,
        "failed": failed,
        "percent_done": round((analyzed / total) * 100, 1) if total > 0 else 0,
        "recent_failures": failures,
    }


# ─── POST /ops/retry-failed ──────────────────────────────────────────────────

@router.post(
    "/retry-failed",
    response_model=dict,
    summary="Reset all failed images to queued and re-trigger AI pipeline",
)
async def retry_failed(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Image.id).where(Image.status == "failed", Image.deleted_at == None)
    )
    failed_ids = [r[0] for r in result.all()]

    if not failed_ids:
        return {"retried": 0, "message": "No failed images to retry."}

    await db.execute(
        update(Image)
        .where(Image.id.in_(failed_ids))
        .values(status="queued", failed_reason=None)
    )
    await db.commit()

    # Re-trigger AI pipeline for each
    from .images import process_media_pipeline
    for img_id in failed_ids:
        background_tasks.add_task(process_media_pipeline, img_id)

    return {"retried": len(failed_ids), "message": f"Re-queued {len(failed_ids)} images for processing."}
