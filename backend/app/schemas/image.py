from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TagSchema(BaseModel):
    id: str
    label: str
    tone: str
    ai_generated: bool = False

    class Config:
        from_attributes = True


class ImageMeta(BaseModel):
    id: str
    filename: str
    width: int
    height: int
    size_bytes: int
    content_type: str
    source: str
    status: str
    category: Optional[str] = None
    uploaded_at: datetime
    analyzed_at: Optional[datetime] = None
    ai_summary: Optional[str] = None
    ai_confidence: Optional[float] = None
    tags: List[TagSchema] = []

    class Config:
        from_attributes = True


class ImageDetail(ImageMeta):
    ocr_text: Optional[str] = None
    ocr_confidence: Optional[float] = None
    ocr_engine: Optional[str] = None
    failed_reason: Optional[str] = None
    storage_key: Optional[str] = None


class ImageListResponse(BaseModel):
    items: List[ImageMeta]
    total: int
    next_cursor: Optional[str] = None

    class Config:
        from_attributes = True
