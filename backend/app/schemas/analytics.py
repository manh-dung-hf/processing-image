from pydantic import BaseModel
from typing import Dict, Any, Optional


class StatsResponse(BaseModel):
    total_images: int
    total_users: int
    total_workspaces: int
    images_by_status: Dict[str, int]
    images_by_source: Dict[str, int]
    images_by_category: Dict[str, int]


class UserActivityItem(BaseModel):
    user_id: str
    name: str
    email: str
    image_count: int
