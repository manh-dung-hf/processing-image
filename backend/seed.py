import asyncio
import uuid
from datetime import datetime, timedelta
from app.db.session import AsyncSessionLocal, engine
from app.db.models import User, Workspace, WorkspaceMember, Image, Tag, AuditEvent

from app.db.base import Base

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        # 1. Users
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@lumen.local",
            password_hash="pbkdf2:sha256:250000$dummyhash",
            name="Admin User",
            role="admin"
        )
        user = User(
            id="default-user", # Fixed ID for convenience
            email="minh@lumen.local",
            password_hash="pbkdf2:sha256:250000$dummyhash",
            name="Minh T.",
            role="user",
            telegram_id=12345678,
            telegram_username="@minh_t"
        )
        db.add_all([admin, user])
        await db.flush()

        # 2. Workspace
        ws = Workspace(
            id="default-ws",
            name="Lumen Workspace",
            owner_id=user.id
        )
        db.add(ws)
        await db.flush()

        # 3. Workspace Member
        member = WorkspaceMember(workspace_id=ws.id, user_id=user.id, role="owner")
        db.add(member)
        
        # 4. Tags
        common_tags = [
            {"label": "receipt", "tone": "accent"},
            {"label": "screenshot", "tone": "info"},
            {"label": "invoice", "tone": "success"},
            {"label": "food", "tone": "warning"},
            {"label": "travel", "tone": "accent"},
        ]
        tags = []
        for t in common_tags:
            tag = Tag(id=str(uuid.uuid4()), workspace_id=ws.id, label=t["label"], tone=t["tone"])
            db.add(tag)
            tags.append(tag)
        await db.flush()

        # 5. Images
        for i in range(20):
            img_id = str(uuid.uuid4())
            new_image = Image(
                id=img_id,
                workspace_id=ws.id,
                uploaded_by=user.id,
                filename=f"sample_{i}.jpg",
                content_type="image/jpeg",
                size_bytes=1024 * 100 * (i + 1),
                width=1920,
                height=1080,
                hash_sha256=f"hash_{i}",
                storage_provider="local",
                storage_key=f"sample/sample_{i%5}.jpg", 
                status="analyzed",
                source="telegram" if i % 2 == 0 else "web",
                uploaded_at=datetime.now() - timedelta(days=i),
                ai_summary=f"This is an AI generated summary for image {i}. It looks like a typical {common_tags[i%len(common_tags)]['label']}.",
                ai_confidence=92.5 + (i % 5),
                category=common_tags[i%len(common_tags)]["label"],
                ocr_text=f"Sample extracted text for image {i}\nDate: 2026-04-23\nTotal: {1000 * (i+1)} VND",
                ocr_confidence=98.0
            )
            # Add some tags
            new_image.tags.append(tags[i % len(tags)])
            db.add(new_image)
            
            # Audit event
            audit = AuditEvent(
                image_id=img_id,
                event_type="received",
                severity="info",
                label=f"Image received from {new_image.source}",
                occurred_at=new_image.uploaded_at
            )
            db.add(audit)

        await db.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
