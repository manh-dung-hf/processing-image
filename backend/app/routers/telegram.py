"""
Telegram Bot — polling mode for local dev, webhook for production.

When config is saved, a background polling loop starts automatically.
No ngrok or public URL needed for development.
"""

import asyncio
import hashlib
import logging
import secrets
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.deps import get_current_admin, get_current_user
from ..db.models import AuditEvent, Image, TelegramConfig, User
from ..db.session import AsyncSessionLocal, get_db
from ..schemas.telegram import TelegramConfigCreate, TelegramConfigResponse, TelegramTestResult
from ..services.ai_service import ai_service

logger = logging.getLogger(__name__)
router = APIRouter()

TELEGRAM_API = "https://api.telegram.org/bot{token}"
UPLOAD_DIR = Path("uploads")

# ─── Polling state ────────────────────────────────────────────────────────────
_polling_task: Optional[asyncio.Task] = None


def mask_token(token: str) -> str:
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

@router.post("/config", status_code=status.HTTP_201_CREATED, summary="Save and activate bot")
async def save_config(
    payload: TelegramConfigCreate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    test = await _test_bot_token(payload.bot_token)
    if not test["success"]:
        raise HTTPException(status_code=400, detail=test.get("error", "Invalid bot token."))

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
        cfg.last_connected_at = datetime.now(timezone.utc)
    else:
        cfg = TelegramConfig(
            id=str(uuid.uuid4()),
            workspace_id="default-ws",
            bot_token=payload.bot_token,
            bot_username=test.get("bot_username"),
            bot_name=test.get("bot_name"),
            is_active=True,
            webhook_secret=webhook_secret,
            last_connected_at=datetime.now(timezone.utc),
            created_by=current_user.id,
        )
        db.add(cfg)

    await db.commit()
    await db.refresh(cfg)

    # Start polling (works on localhost without ngrok)
    _start_polling(payload.bot_token, cfg.workspace_id)

    return config_to_response(cfg)


# ─── POST /telegram/test ─────────────────────────────────────────────────────

@router.post("/test", response_model=TelegramTestResult, summary="Test a bot token")
async def test_token(payload: TelegramConfigCreate, _user: User = Depends(get_current_user)):
    return TelegramTestResult(**await _test_bot_token(payload.bot_token))


# ─── DELETE /telegram/config ─────────────────────────────────────────────────

@router.delete("/config", status_code=204, summary="Disconnect bot")
async def delete_config(_admin: User = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TelegramConfig).where(TelegramConfig.workspace_id == "default-ws")
    )
    cfg = result.scalar_one_or_none()
    if not cfg:
        raise HTTPException(status_code=404, detail="No configuration found.")

    _stop_polling()

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(TELEGRAM_API.format(token=cfg.bot_token) + "/deleteWebhook")
    except Exception:
        pass

    await db.delete(cfg)
    await db.commit()


# ─── POST /telegram/webhook/{secret} (still works if public URL is set) ──────

@router.post("/webhook/{secret}", include_in_schema=False)
async def telegram_webhook(
    secret: str, request: Request, background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TelegramConfig).where(
            TelegramConfig.webhook_secret == secret, TelegramConfig.is_active == True,
        )
    )
    cfg = result.scalar_one_or_none()
    if not cfg:
        raise HTTPException(status_code=403, detail="Invalid webhook secret.")

    body = await request.json()
    await _handle_update(body, cfg.bot_token, cfg.workspace_id)
    return {"ok": True}


# ─── Polling loop ─────────────────────────────────────────────────────────────

def _start_polling(bot_token: str, workspace_id: str):
    global _polling_task
    _stop_polling()

    async def poll_loop():
        offset = 0
        logger.info("🤖 Telegram polling started")
        # Delete any existing webhook so polling works
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.post(TELEGRAM_API.format(token=bot_token) + "/deleteWebhook")
        except Exception:
            pass

        while True:
            try:
                async with httpx.AsyncClient(timeout=35) as client:
                    resp = await client.get(
                        TELEGRAM_API.format(token=bot_token) + "/getUpdates",
                        params={"offset": offset, "timeout": 30, "allowed_updates": '["message"]'},
                    )
                    data = resp.json()

                if data.get("ok"):
                    for update in data.get("result", []):
                        offset = update["update_id"] + 1
                        await _handle_update(update, bot_token, workspace_id)
            except asyncio.CancelledError:
                logger.info("🤖 Telegram polling stopped")
                return
            except Exception as e:
                logger.warning(f"Polling error (retrying in 5s): {e}")
                await asyncio.sleep(5)

    _polling_task = asyncio.create_task(poll_loop())


def _stop_polling():
    global _polling_task
    if _polling_task and not _polling_task.done():
        _polling_task.cancel()
        _polling_task = None


# ─── Handle a single Telegram update ─────────────────────────────────────────

async def _handle_update(update: dict, bot_token: str, workspace_id: str):
    message = update.get("message", {})
    photos = message.get("photo")
    if not photos:
        return

    photo = photos[-1]  # largest size
    file_id = photo["file_id"]
    tg_user = message.get("from", {})
    chat_id = message.get("chat", {}).get("id")

    # Send "processing" reply
    if chat_id:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.post(
                    TELEGRAM_API.format(token=bot_token) + "/sendMessage",
                    json={"chat_id": chat_id, "text": "📥 Image received! Analyzing with AI... 🤖"},
                )
        except Exception:
            pass

    # Process in background
    asyncio.create_task(
        _process_telegram_photo(bot_token, file_id, tg_user, workspace_id, chat_id)
    )


# ─── Download + save + AI pipeline ───────────────────────────────────────────

async def _process_telegram_photo(
    bot_token: str, file_id: str, tg_user: dict, workspace_id: str,
    chat_id: int = None,
):
    try:
        # 1. Download from Telegram
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                TELEGRAM_API.format(token=bot_token) + f"/getFile?file_id={file_id}"
            )
            file_data = resp.json()
            if not file_data.get("ok"):
                logger.error(f"Failed to get file: {file_data}")
                return

            file_path_tg = file_data["result"]["file_path"]
            file_size = file_data["result"].get("file_size", 0)

            download_url = f"https://api.telegram.org/file/bot{bot_token}/{file_path_tg}"
            file_resp = await client.get(download_url)
            content = file_resp.content

        # 2. Save locally
        image_id = str(uuid.uuid4())
        ext = Path(file_path_tg).suffix or ".jpg"
        storage_key = f"{datetime.now().strftime('%Y/%m/%d')}/{image_id}{ext}"
        local_path = UPLOAD_DIR / storage_key
        local_path.parent.mkdir(parents=True, exist_ok=True)

        with open(local_path, "wb") as f:
            f.write(content)

        # Dimensions
        try:
            from PIL import Image as PILImage
            with PILImage.open(local_path) as img:
                width, height = img.size
        except Exception:
            width, height = 0, 0

        hash_sha256 = hashlib.sha256(content).hexdigest()
        username = tg_user.get("username", tg_user.get("id", "unknown"))
        filename = f"telegram_{username}_{image_id[:8]}{ext}"

        # 3. Save to DB
        async with AsyncSessionLocal() as db:
            new_image = Image(
                id=image_id, workspace_id=workspace_id, uploaded_by="default-user",
                filename=filename, content_type=f"image/{ext.lstrip('.')}",
                size_bytes=file_size or len(content), width=width, height=height,
                hash_sha256=hash_sha256, storage_provider="local",
                storage_key=storage_key, status="queued", source="telegram",
            )
            db.add(new_image)
            db.add(AuditEvent(
                image_id=image_id, event_type="received", severity="info",
                label=f"Image received from Telegram @{username}",
            ))
            await db.commit()

            # 4. AI pipeline
            result_text = ""
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
                new_image.analyzed_at = datetime.now(timezone.utc)

                db.add(AuditEvent(
                    image_id=image_id, event_type="ai-completed", severity="success",
                    label="AI analysis complete (Telegram)",
                ))
                await db.commit()

                result_text = (
                    f"✅ *Analysis Complete*\n\n"
                    f"📂 *Category:* {new_image.category or 'unknown'}\n"
                    f"📝 *Summary:* {(new_image.ai_summary or '')[:200]}\n"
                    f"🔍 *Confidence:* {round(new_image.ai_confidence or 0)}%"
                )

            except Exception as e:
                logger.exception("AI pipeline failed for telegram image %s", image_id)
                new_image.status = "failed"
                new_image.failed_reason = str(e)
                await db.commit()
                result_text = f"⚠️ Image saved but AI analysis failed:\n{str(e)[:200]}"

        # 5. Reply to user on Telegram
        if chat_id and result_text:
            try:
                async with httpx.AsyncClient(timeout=10) as client:
                    await client.post(
                        TELEGRAM_API.format(token=bot_token) + "/sendMessage",
                        json={"chat_id": chat_id, "text": result_text, "parse_mode": "Markdown"},
                    )
            except Exception:
                pass

    except Exception as e:
        logger.exception("Failed to process Telegram photo: %s", e)


# ─── Auto-start polling on app startup ────────────────────────────────────────

async def auto_start_polling():
    """Called from main.py lifespan to resume polling if a config exists."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(TelegramConfig).where(TelegramConfig.is_active == True)
        )
        cfg = result.scalar_one_or_none()
        if cfg:
            _start_polling(cfg.bot_token, cfg.workspace_id)
            logger.info(f"🤖 Auto-started polling for @{cfg.bot_username}")


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _test_bot_token(token: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(TELEGRAM_API.format(token=token) + "/getMe")
            data = resp.json()
            if data.get("ok"):
                bot = data["result"]
                return {"success": True, "bot_username": bot.get("username"), "bot_name": bot.get("first_name")}
            return {"success": False, "error": data.get("description", "Unknown error")}
    except httpx.TimeoutException:
        return {"success": False, "error": "Connection timed out."}
    except Exception as e:
        return {"success": False, "error": str(e)}
