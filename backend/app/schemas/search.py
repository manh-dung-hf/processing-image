from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class SearchResult(BaseModel):
    id: str
    filename: str
    category: Optional[str] = None
    status: str
    ai_summary: Optional[str] = None
    uploaded_at: datetime
    tags: List[str] = []

    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    query: str
    total: int
    items: List[SearchResult]
