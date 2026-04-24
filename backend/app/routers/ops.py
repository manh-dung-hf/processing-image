import platform
import sys
from datetime import datetime, timezone

from fastapi import APIRouter

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
