"""
seed.py — Idempotent database seed script.

Run from the `backend/` directory:
    python seed.py

Safe to run multiple times — existing records are skipped.
"""

import asyncio
import uuid
from datetime import datetime, timedelta

from app.core.security import hash_password
from app.db.base import Base
from app.db.models import AuditEvent, Image, Tag, User, Workspace, WorkspaceMember
from app.db.session import AsyncSessionLocal, engine


# ─── Fixed IDs so re-runs are idempotent ──────────────────────────────────────
ADMIN_ID = "admin-user-0001"
DEFAULT_USER_ID = "default-user"
DEFAULT_WS_ID = "default-ws"


async def get_or_create(db, model, pk_field: str, pk_value: str, **kwargs):
    """Fetch by primary key; insert only if not found."""
    from sqlalchemy import select

    result = await db.execute(
        select(model).where(getattr(model, pk_field) == pk_value)
    )
    obj = result.scalar_one_or_none()
    if obj is None:
        obj = model(**{pk_field: pk_value}, **kwargs)
        db.add(obj)
    return obj, obj is None  # (instance, was_created)


async def seed():
    # 1. Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        print("🌱  Seeding database …")

        # ── Users ──────────────────────────────────────────────────────────────
        admin, created = await get_or_create(
            db, User, "id", ADMIN_ID,
            email="admin@lumen.local",
            password_hash=hash_password("admin1234"),
            name="Admin User",
            role="admin",
        )
        if created:
            print("  ✅  Created admin user")
        else:
            print("  ⏭️   Admin user already exists — skipping")

        user, created = await get_or_create(
            db, User, "id", DEFAULT_USER_ID,
            email="minh@lumen.local",
            password_hash=hash_password("minh1234"),
            name="Minh T.",
            role="user",
            telegram_id=12345678,
            telegram_username="@minh_t",
        )
        if created:
            print("  ✅  Created default user")
        else:
            print("  ⏭️   Default user already exists — skipping")

        await db.flush()

        # ── Workspace ──────────────────────────────────────────────────────────
        ws, created = await get_or_create(
            db, Workspace, "id", DEFAULT_WS_ID,
            name="Lumen Workspace",
            owner_id=DEFAULT_USER_ID,
        )
        if created:
            print("  ✅  Created workspace")
        else:
            print("  ⏭️   Workspace already exists — skipping")

        await db.flush()

        # ── Workspace member ───────────────────────────────────────────────────
        from sqlalchemy import select

        existing_member = await db.execute(
            select(WorkspaceMember).where(
                WorkspaceMember.workspace_id == DEFAULT_WS_ID,
                WorkspaceMember.user_id == DEFAULT_USER_ID,
            )
        )
        if not existing_member.scalar_one_or_none():
            db.add(WorkspaceMember(
                workspace_id=DEFAULT_WS_ID,
                user_id=DEFAULT_USER_ID,
                role="owner",
            ))
            print("  ✅  Created workspace membership")

        # ── Tags ───────────────────────────────────────────────────────────────
        common_tags_def = [
            {"label": "receipt",    "tone": "accent"},
            {"label": "screenshot", "tone": "info"},
            {"label": "invoice",    "tone": "success"},
            {"label": "food",       "tone": "warning"},
            {"label": "travel",     "tone": "accent"},
        ]
        tags: list[Tag] = []
        for t in common_tags_def:
            result = await db.execute(
                select(Tag).where(Tag.label == t["label"], Tag.workspace_id == DEFAULT_WS_ID)
            )
            tag = result.scalar_one_or_none()
            if tag is None:
                tag = Tag(
                    id=str(uuid.uuid4()),
                    workspace_id=DEFAULT_WS_ID,
                    label=t["label"],
                    tone=t["tone"],
                )
                db.add(tag)
                print(f"  ✅  Created tag: {t['label']}")
            tags.append(tag)

        await db.flush()

        # ── Sample images ──────────────────────────────────────────────────────
        images_created = 0
        for i in range(20):
            img_id = f"sample-image-{i:04d}"
            result = await db.execute(select(Image).where(Image.id == img_id))
            if result.scalar_one_or_none():
                continue  # already seeded

            tag_def = common_tags_def[i % len(common_tags_def)]
            new_image = Image(
                id=img_id,
                workspace_id=DEFAULT_WS_ID,
                uploaded_by=DEFAULT_USER_ID,
                filename=f"sample_{i:02d}.jpg",
                content_type="image/jpeg",
                size_bytes=1024 * 100 * (i + 1),
                width=1920,
                height=1080,
                hash_sha256=f"deadbeef{i:04x}" * 4,  # fake but valid-looking
                storage_provider="local",
                storage_key=f"sample/sample_{i % 5}.jpg",
                status="analyzed",
                source="telegram" if i % 2 == 0 else "web",
                uploaded_at=datetime.now() - timedelta(days=i),
                ai_summary=(
                    f"This is an AI-generated summary for image {i}. "
                    f"It looks like a typical {tag_def['label']}."
                ),
                ai_confidence=92.5 + (i % 5),
                category=tag_def["label"],
                ocr_text=f"Sample text for image {i}\nDate: 2026-04-{(i % 28) + 1:02d}\nTotal: {1000 * (i + 1)} VND",
                ocr_confidence=98.0,
                analyzed_at=datetime.now() - timedelta(days=i, hours=1),
            )
            new_image.tags.append(tags[i % len(tags)])
            db.add(new_image)

            db.add(AuditEvent(
                image_id=img_id,
                event_type="received",
                severity="info",
                label=f"Image received from {new_image.source}",
                occurred_at=new_image.uploaded_at,
            ))
            db.add(AuditEvent(
                image_id=img_id,
                event_type="ai-completed",
                severity="success",
                label="AI Analysis complete",
                sub=f"Category: {new_image.category}",
                occurred_at=new_image.analyzed_at,
            ))
            images_created += 1

        await db.commit()

        if images_created:
            print(f"  ✅  Created {images_created} sample images")
        else:
            print("  ⏭️   Sample images already exist — skipping")

        print("\n🎉  Seeding complete!")
        print(f"     Login: admin@lumen.local / admin1234")
        print(f"     Login: minh@lumen.local  / minh1234")


if __name__ == "__main__":
    asyncio.run(seed())
