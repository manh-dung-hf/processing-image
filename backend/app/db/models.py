import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Table, Boolean, Numeric, BigInteger, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

def generate_uuid():
    return str(uuid.uuid4())

# Many-to-Many for Image and Tags
image_tags = Table(
    "image_tags",
    Base.metadata,
    Column("image_id", String, ForeignKey("images.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
    Column("ai_generated", Boolean, default=False),
    Column("confidence", Numeric(4, 1)),
    Column("added_at", DateTime(timezone=True), server_default=func.now()),
    Column("added_by", String, ForeignKey("users.id"))
)

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String)
    role = Column(String, default="user") # user | admin
    telegram_id = Column(BigInteger, unique=True, index=True)
    telegram_username = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_active_at = Column(DateTime(timezone=True))

    workspaces = relationship("Workspace", back_populates="owner")
    images = relationship("Image", back_populates="uploader")

class Workspace(Base):
    __tablename__ = "workspaces"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="workspaces")
    members = relationship("WorkspaceMember", back_populates="workspace")
    images = relationship("Image", back_populates="workspace")
    tags = relationship("Tag", back_populates="workspace")

class WorkspaceMember(Base):
    __tablename__ = "workspace_members"
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role = Column(String, default="member") # owner | admin | member | viewer
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    workspace = relationship("Workspace", back_populates="members")

class Image(Base):
    __tablename__ = "images"
    id = Column(String, primary_key=True, default=generate_uuid)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=False)
    uploaded_by = Column(String, ForeignKey("users.id"), nullable=False)

    # file identity
    filename = Column(String, nullable=False)
    content_type = Column(String, nullable=False)
    size_bytes = Column(BigInteger, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    hash_sha256 = Column(String, nullable=False)

    # storage abstraction
    storage_provider = Column(String, nullable=False) # local | s3 | gcs | azure
    storage_bucket = Column(String)
    storage_key = Column(String, nullable=False)

    # AI outputs
    category = Column(String) # receipt | screenshot | document | photo
    ai_summary = Column(Text)
    ai_confidence = Column(Numeric(4, 1))
    ai_model = Column(String)

    # OCR outputs
    ocr_text = Column(Text)
    ocr_confidence = Column(Numeric(4, 1))
    ocr_engine = Column(String)

    # lifecycle
    status = Column(String, default="queued") # queued | processing | analyzed | failed
    source = Column(String, nullable=False) # telegram | web | api
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    analyzed_at = Column(DateTime(timezone=True))
    failed_reason = Column(Text)

    # soft delete
    deleted_at = Column(DateTime(timezone=True))

    # audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    workspace = relationship("Workspace", back_populates="images")
    uploader = relationship("User", back_populates="images")
    tags = relationship("Tag", secondary=image_tags, back_populates="images")
    audit_events = relationship("AuditEvent", back_populates="image", cascade="all, delete-orphan")
    jobs = relationship("ProcessingJob", back_populates="image", cascade="all, delete-orphan")

class Tag(Base):
    __tablename__ = "tags"
    id = Column(String, primary_key=True, default=generate_uuid)
    workspace_id = Column(String, ForeignKey("workspaces.id"), nullable=False)
    label = Column(String, nullable=False)
    tone = Column(String, default="gray") # gray | accent | success | warning | danger | info
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    workspace = relationship("Workspace", back_populates="tags")
    images = relationship("Image", secondary=image_tags, back_populates="tags")

class AuditEvent(Base):
    __tablename__ = "audit_events"
    id = Column(String, primary_key=True, default=generate_uuid)
    image_id = Column(String, ForeignKey("images.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String, nullable=False) # received | ai-completed | ocr-completed | tag-added | etc
    severity = Column(String, nullable=False) # info | success | warning | danger
    label = Column(String, nullable=False)
    sub = Column(String)
    metadata_json = Column(JSON)
    actor_id = Column(String, ForeignKey("users.id"))
    occurred_at = Column(DateTime(timezone=True), server_default=func.now())

    image = relationship("Image", back_populates="audit_events")

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"
    id = Column(String, primary_key=True, default=generate_uuid)
    image_id = Column(String, ForeignKey("images.id", ondelete="CASCADE"), nullable=False)
    stage = Column(String, nullable=False) # vision | ocr | tagging | embedding
    status = Column(String, default="queued") # queued | running | done | failed
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    error = Column(Text)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    worker_id = Column(String)

    image = relationship("Image", back_populates="jobs")

class TelegramLinkCode(Base):
    __tablename__ = "telegram_link_codes"
    code = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TelegramConfig(Base):
    __tablename__ = "telegram_configs"
    id = Column(String, primary_key=True, default=generate_uuid)
    workspace_id = Column(String, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, unique=True)
    bot_token = Column(String, nullable=False)
    bot_username = Column(String)          # filled after validation
    bot_name = Column(String)              # filled after validation
    is_active = Column(Boolean, default=False)
    webhook_secret = Column(String)        # random secret for webhook verification
    last_connected_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(String, ForeignKey("users.id"))
