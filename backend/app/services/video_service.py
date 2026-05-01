"""
Video processing utilities using ffmpeg/ffprobe.
Extracts thumbnails and metadata from video files.
"""

import asyncio
import json
import logging
import subprocess
from pathlib import Path
from typing import Optional, Tuple

logger = logging.getLogger(__name__)


def _check_ffmpeg() -> bool:
    """Check if ffmpeg is available on the system."""
    try:
        subprocess.run(["ffprobe", "-version"], capture_output=True, timeout=5)
        return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


HAS_FFMPEG = _check_ffmpeg()


async def get_video_metadata(video_path: str) -> dict:
    """
    Extract video metadata using ffprobe.
    Returns: {width, height, duration, fps, codec}
    """
    if not HAS_FFMPEG:
        logger.warning("ffprobe not found — returning default video metadata")
        return {"width": 0, "height": 0, "duration": 0, "fps": 0, "codec": "unknown"}

    try:
        cmd = [
            "ffprobe", "-v", "quiet",
            "-print_format", "json",
            "-show_streams", "-show_format",
            str(video_path),
        ]
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: subprocess.run(cmd, capture_output=True, text=True, timeout=30),
        )

        data = json.loads(result.stdout)
        video_stream = next(
            (s for s in data.get("streams", []) if s.get("codec_type") == "video"),
            {},
        )

        # Parse fps from r_frame_rate like "30/1"
        fps_str = video_stream.get("r_frame_rate", "0/1")
        try:
            num, den = fps_str.split("/")
            fps = round(int(num) / int(den), 2) if int(den) > 0 else 0
        except Exception:
            fps = 0

        duration = float(data.get("format", {}).get("duration", 0))

        return {
            "width": int(video_stream.get("width", 0)),
            "height": int(video_stream.get("height", 0)),
            "duration": round(duration, 2),
            "fps": fps,
            "codec": video_stream.get("codec_name", "unknown"),
        }
    except Exception as e:
        logger.error(f"Failed to get video metadata: {e}")
        return {"width": 0, "height": 0, "duration": 0, "fps": 0, "codec": "unknown"}


async def extract_thumbnail(video_path: str, output_path: str, time_offset: float = 1.0) -> bool:
    """
    Extract a single frame from the video as a JPEG thumbnail.
    time_offset: seconds into the video to capture (default 1s).
    """
    if not HAS_FFMPEG:
        logger.warning("ffmpeg not found — cannot extract thumbnail")
        return False

    try:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        cmd = [
            "ffmpeg", "-y",
            "-ss", str(time_offset),
            "-i", str(video_path),
            "-vframes", "1",
            "-q:v", "2",
            str(output_path),
        ]
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: subprocess.run(cmd, capture_output=True, timeout=30),
        )
        return Path(output_path).exists()
    except Exception as e:
        logger.error(f"Failed to extract thumbnail: {e}")
        return False


async def extract_frame_for_ai(video_path: str, output_path: str) -> Optional[str]:
    """
    Extract a representative frame for AI analysis.
    Tries to get a frame at 25% of the video duration for better content.
    Returns the output path if successful, None otherwise.
    """
    meta = await get_video_metadata(video_path)
    duration = meta.get("duration", 0)
    # Pick frame at 25% of duration, minimum 0.5s
    offset = max(0.5, duration * 0.25) if duration > 0 else 1.0

    success = await extract_thumbnail(video_path, output_path, time_offset=offset)
    return output_path if success else None
