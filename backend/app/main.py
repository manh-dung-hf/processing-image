from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Dict
import json
import logging

from .db.session import engine
from .db.base import Base
from .routers import auth, images, search, analytics, ops

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Lumen AI Image Platform", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(images.router, prefix="/api/v1/images", tags=["Images"])
app.include_router(search.router, prefix="/api/v1/search", tags=["Search"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(ops.router, prefix="/api/v1/ops", tags=["Operations"])

# Storage
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {
            "images": [],
            "ops": [],
            "notifications": []
        }

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel in self.active_connections:
            self.active_connections[channel].append(websocket)

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections:
            self.active_connections[channel].remove(websocket)

    async def broadcast(self, channel: str, message: dict):
        if channel in self.active_connections:
            for connection in self.active_connections[channel]:
                await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = None):
    # In a real app, validate JWT here
    await manager.connect(websocket, "images")
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming client messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, "images")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
