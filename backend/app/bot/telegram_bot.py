import os
import logging
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes
from ..services.ai_service import ai_service
from ..db.session import AsyncSessionLocal
from ..db.models import Image, User, Tag
from sqlalchemy import select
import uuid
from pathlib import Path

# Configure logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "👋 Welcome to VisionSense AI Bot!\n\n"
        "Send me an image, and I'll analyze it, extract text, and organize it for you.\n"
        "Use /help to see available commands."
    )

async def handle_image(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    username = update.effective_user.username
    
    photo = update.message.photo[-1]
    file = await context.bot.get_file(photo.file_id)
    
    # Save file
    file_ext = ".jpg" # Default for telegram photos
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / filename
    await file.download_to_drive(str(file_path))
    
    await update.message.reply_text("📥 Image received! Analyzing with local AI... 🤖")
    
    # AI Analysis
    analysis = await ai_service.analyze_image(str(file_path))
    
    # Save to Database
    async with AsyncSessionLocal() as db:
        # Check if user exists or create
        result = await db.execute(select(User).where(User.telegram_id == str(user_id)))
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(username=username or f"tg_{user_id}", telegram_id=str(user_id))
            db.add(user)
            await db.flush()
            
        new_image = Image(
            filename=filename,
            file_path=str(file_path),
            file_size=photo.file_size,
            mime_type="image/jpeg",
            title=analysis.get("title"),
            description=analysis.get("description"),
            extracted_text=analysis.get("extracted_text"),
            category=analysis.get("category"),
            ai_summary=analysis.get("summary"),
            user_id=user.id
        )
        
        # Handle tags
        for tag_name in analysis.get("tags", []):
            tag_result = await db.execute(select(Tag).where(Tag.name == tag_name))
            tag = tag_result.scalar_one_or_none()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
            new_image.tags.append(tag)
            
        db.add(new_image)
        await db.commit()
        
    # Respond to user
    response_msg = (
        f"✅ *Analysis Complete*\n\n"
        f"🏷 *Title:* {analysis.get('title')}\n"
        f"📂 *Category:* {analysis.get('category')}\n"
        f"📝 *Summary:* {analysis.get('summary')}\n\n"
        f"✨ Tags: {', '.join(analysis.get('tags', []))}"
    )
    await update.message.reply_markdown(response_msg)

def run_bot():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN not found in environment variables")
        return

    application = ApplicationBuilder().token(token).build()
    
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.PHOTO, handle_image))
    
    logger.info("Telegram Bot started...")
    application.run_polling()

if __name__ == '__main__':
    run_bot()
