"""
Telegram Bot configuration & webhook endpoints.

Flow:
1. Admin saves a bot token via POST /telegram/config
2. Backend validates the token with Telegram API (getMe)
3. Backend registers a webhook with Telegram pointing to our /telegram/webhook/{secret}
4. When users send photos to the bot, Telegram POSTs to our webhook
5. We download the photo, save it, and run the AI pipeline — same as web uploads
"""

import hashlib
import logging
import secrets
import uuid
from datetime import datetime
from pathlib import Path

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..core.deps import get_current_admin, get_current_user
from ..db.models import AuditEvent, Image, TelegramConfig, User
from ..db.session import get_db
from ..schemas.telegram import TelegramConfigCreate, TelegramConfigResponse, TelegramTestResult
from ..services.ai_service import ai_service

logger = logging.getLogger(__name__)
router = APIRouter()

TELEGRAM_API = "https://api.telegram.org/bot{token}"
UPLOAD_DIR = Path("uploads")


def mask_token(token: str) -> str:
    """Show first 6 and last 4 chars only."""
    if len(token) < 14:
        return "***"
    return token[:6] + "•" * (len(token) - 10) + token[-4:]


def config_to_response(cfg: TelegramConfig) -> TelegramConfigResponse:
    return TelegramConfigResponse(
        id=cfg.id,
        workspace_id=cfg.workspace_id,
        bot_username=cfg.bot_username,
        bot_name=cfg.bot_name,
        is_active=cfg.is_active,
        last_connected_at=cfg.last_connected_at,
        created_at=cfg.created_at,
        updated_at=cfg.updated_at,
        bot_token_masked=mask_token(cfg.bot_token),
    )


# ─── GET /telegram/config ────────────────────────────────────────────────────

@router.get("/config", summary="Get current Telegram bot configuration")
async def get_config(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TelegramConfig).where(TelegramConfig.workspace_id == "default-ws")
    )
    cfg = result.scalar_one_or_none()
    if not cfg:
        return None
    return config_to_response(cfg)


# ─── POST /telegram/config ───────────────────────────────────────────────────

@router.post(
    "/config",
    status_code=status.HTTP_201_CREATED,
    summary="Save and activate Telegram bot configuration",
)
async def save_config(
    payload: TelegramConfigCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    # 1. Validate token with Telegram
    test = await _test_bot_token(payload.bot_token)
    if not test["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=test.get("error", "Invalid bot token."),
        )

    # 2. Upsert config
    result = await db.execute(
        select(TelegramConfig).where(TelegramConfig.workspace_id == "default-ws")
    )
    cfg = result.scalar_one_or_none()

    webhook_secret = secrets.token_urlsafe(32)

    if cfg:
        cfg.bot_token = payload.bot_token
        cfg.bot_username = test.get("bot_username")
        cfg.bot_name = test.get("bot_name")
        cfg.is_active = True
        cfg.webhook_secret = webhook_secret
        cfg.last_connected_at = datetime.utcnow()
    else:
        cfg = TelegramConfig(
            id=str(uuid.uuid4()),
            workspace_id="default-ws",
            bot_token=payload.bot_token,
            bot_username=test.get("bot_username"),
            bot_name=test.get("bot_name"),
            is_active=True,
            webhook_secret=webhook_secret,
            last_connected_at=datetime.utcnow(),
            created_by=current_user.id,
        )
        db.add(cfg)

    await db.commit()
    await db.refresh(cfg)

    # 3. Register webhook with Telegram (best-effort, don't fail if server not public)
    await _set_webhook(payload.bot_token, webhook_secret)

    return config_to_response(cfg)


# ─── POST /telegram/test ─────────────────────────────────────────────────────

@router.post("/test", response_model=TelegramTestResult, summary="Test a bot token without saving")
async def test_token(
    payload: TelegramConfigCreate,
    _user: User = Depends(get_current_user),
):
    result = await _test_bot_token(payload.bot_token)
    return TelegramTestResult(**result)


# ─── DELETE /telegram/config ─────────────────────────────────────────────────

@router.delete("/config", status_code=status.HTTP_204_NO_CONTENT, summary="Disconnect and remove bot config")
async def delete_config(
    _admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TelegramConfig).where(TelegramConfig.workspace_id == "default-ws")
    )
    cfg = result.scalar_one_or_none()
    if not cfg:
        raise HTTPException(status_code=404, detail="No configuration found.")

    # Remove webhook from Telegram
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                TELEGRAM_API.format(token=cfg.bot_token) + "/deleteWebhook"
            )
    except Exception:
        pass

    await db.delete(cfg)
    await db.commit()


# ─── POST /telegram/webhook/{secret} ─────────────────────────────────────────

@router.post("/webhook/{secret}", include_in_schema=False)
async def telegram_webhook(
    secret: str,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Receives updates from Telegram."""
    result = await db.execute(
        select(TelegramConfig).where(
            TelegramConfig.webhook_secret == secret,
            TelegramConfig.is_active == True,
        )
    )
    cfg = result.scalar_one_or_none()
    if not cfg:
        raise HTTPException(status_code=403, detail="Invalid webhook secret.")

    body = await request.json()
    message = body.get("message", {})

    # Only handle photo messages
    photos = message.get("photo")
    if not photos:
        return {"ok": True}

    # Get the largest photo
    photo = photos[-1]
    file_id = photo["file_id"]
    tg_user = message.get("from", {})

    background_tasks.add_task(
        _process_telegram_photo,
        cfg.bot_token,
        file_id,
        tg_user,
        cfg.workspace_id,
        message.get("caption", ""),
    )

    return {"ok": True}


# ─── Internal helpers ─────────────────────────────────────────────────────────

async def _test_bot_token(token: str) -> dict:
    """Call Telegram getMe to validate a bot token."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(TELEGRAM_API.format(token=token) + "/getMe")
            data = resp.json()
            if data.get("ok"):
                bot = data["result"]
                return {
                    "success": True,
                    "bot_username": bot.get("username"),
                    "bot_name": bot.get("first_name"),
                }
            return {"success": False, "error": data.get("description", "Unknown error")}
    except httpx.TimeoutException:
        return {"success": False, "error": "Connection timed out. Check your network."}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def _set_webhook(token: str, secret: str):
    """Register webhook URL with Telegram. Best-effort — works only if server is publicly accessible."""
    # In production, replace with your actual public URL
    # For local dev, you'd use ngrok or similar
    try:
        # We'll try to set it, but it's fine if it fails in local dev
        webhook_url = f"http://localhost:8000/api/v1/telegram/webhook/{secret}"
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(
                TELEGRAM_API.format(token=token) + "/setWebhook",
                json={"url": webhook_url},
            )
    except Exception as e:
        logger.warning(f"Could not set webhook (expected in local dev): {e}")


async def _process_telegram_photo(
    bot_token: str,
    file_id: str,
    tg_user: dict,
    workspace_id: str,
    caption: str,
):
    """Download photo from Telegram, save to DB, run AI pipeline."""
    from ..db.session import AsyncSessionLocal

    try:
        # 1. Get file path from Telegram
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                TELEGRAM_API.format(token=bot_token) + f"/getFile?file_id={file_id}"
            )
            file_data = resp.json()
            if not file_data.get("ok"):
                logger.error(f"Failed to get file info: {file_data}")
                return

            file_path_tg = file_data["result"]["file_path"]
            file_size = file_data["result"].get("file_size", 0)

            # 2. Download the file
            download_url = f"https://api.telegram.org/file/bot{bot_token}/{file_path_tg}"
            file_resp = await client.get(download_url)
            content = file_resp.content

        # 3. Save locally
        image_id = str(uuid.uuid4())
        ext = Path(file_path_tg).suffix or ".jpg"
        storage_key = f"{datetime.now().strftime('%Y/%m/%d')}/{image_id}{ext}"
        local_path = UPLOAD_DIR / storage_key
        local_path.parent.mkdir(parents=True, exist_ok=True)

        with open(local_path, "wb") as f:
            f.write(content)

        # Get dimensions
        try:
            from PIL import Image as PILImage
            with PILImage.open(local_path) as img:
                width, height = img.size
        except Exception:
            width, height = 0, 0

        hash_sha256 = hashlib.sha256(content).hexdigest()
        filename = f"telegram_{tg_user.get('username', tg_user.get('id', 'unknown'))}_{image_id[:8]}{ext}"

        # 4. Save to DB
        async with AsyncSessionLocal() as db:
            new_image = Image(
                id=image_id,
                workspace_id=workspace_id,
                uploaded_by="default-user",
                filename=filename,
                content_type=f"image/{ext.lstrip('.')}",
                size_bytes=file_size or len(content),
                width=width,
                height=height,
                hash_sha256=hash_sha256,
                storage_provider="local",
                storage_key=storage_key,
                status="queued",
                source="telegram",
            )
            db.add(new_image)

            audit = AuditEvent(
                image_id=image_id,
                event_type="received",
                severity="info",
                label=f"Image received from Telegram user @{tg_user.get('username', 'unknown')}",
            )
            db.add(audit)
            await db.commit()

            # 5. Run AI pipeline
            try:
                new_image.status = "processing"
                await db.commit()

                vision_data = await ai_service.run_vision_stage(str(local_path))
                new_image.ai_summary = vision_data.get("summary")
                new_image.category = vision_data.get("category")
                new_image.ai_confidence = vision_data.get("confidence")
                new_image.ai_model = ai_service.vision_model

                ocr_data = await ai_service.run_ocr_stage(str(local_path))
                new_image.ocr_text = ocr_data.get("text")
                new_image.ocr_confidence = ocr_data.get("confidence")
                new_image.ocr_engine = ocr_data.get("engine")

                new_image.status = "analyzed"
                new_image.analyzed_at = datetime.utcnow()

                audit2 = AuditEvent(
                    image_id=image_id,
                    event_type="ai-completed",
                    severity="success",
                    label="AI analysis complete (Telegram upload)",
                )
                db.add(audit2)
                await db.commit()

            except Exception as e:
                logger.exception("AI pipeline failed for telegram image %s", image_id)
                new_image.status = "failed"
                new_image.failed_reason = str(e)
                await db.commit()

    except Exception as e:
        logger.exception("Failed to process Telegram photo: %s", e)
