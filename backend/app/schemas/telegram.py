from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class TelegramConfigCreate(BaseModel):
    bot_token: str

    @field_validator("bot_token")
    @classmethod
    def validate_token(cls, v: str) -> str:
        v = v.strip()
        if not v or ":" not in v:
            raise ValueError("Invalid bot token format. Expected format: 123456:ABC-DEF...")
        return v


class TelegramConfigResponse(BaseModel):
    id: str
    workspace_id: str
    bot_username: Optional[str] = None
    bot_name: Optional[str] = None
    is_active: bool
    last_connected_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    # Never expose the full token — only masked
    bot_token_masked: str = ""

    class Config:
        from_attributes = True


class TelegramTestResult(BaseModel):
    success: bool
    bot_username: Optional[str] = None
    bot_name: Optional[str] = None
    error: Optional[str] = None
