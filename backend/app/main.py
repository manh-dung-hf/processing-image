from contextlib import asynccontextmanager
from pathlib import Path
from typing import Dict, List
import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .db.base import Base
from .db.session import engine
from .routers import analytics, auth, images, ops, search

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)  # ensure exists before StaticFiles binds


# ─── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and uploads directory exist
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("✅  Database tables ready.")
    yield
    # Shutdown cleanup (if needed) goes here

# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Lumen AI Image Platform",
    version="1.0.0",
    description="AI-powered image intelligence platform.",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/api/v1/auth",      tags=["Auth"])
app.include_router(images.router,    prefix="/api/v1/images",    tags=["Images"])
app.include_router(search.router,    prefix="/api/v1/search",    tags=["Search"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(ops.router,       prefix="/api/v1/ops",       tags=["Operations"])

# ─── Static files (uploads) ───────────────────────────────────────────────────
# Directory is guaranteed to exist by lifespan above
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# ─── WebSocket Connection Manager ────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {
            "images": [],
            "ops": [],
            "notifications": [],
        }

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel in self.active_connections:
            self.active_connections[channel].append(websocket)

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections:
            try:
                self.active_connections[channel].remove(websocket)
            except ValueError:
                pass

    async def broadcast(self, channel: str, message: dict):
        dead: List[WebSocket] = []
        for ws in self.active_connections.get(channel, []):
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, channel)


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    """Real-time channel for image processing events."""
    await manager.connect(websocket, "images")
    try:
        while True:
            await websocket.receive_text()  # keep alive; handle messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, "images")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
