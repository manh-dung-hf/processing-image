import ollama
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, vision_model: str = "llama3.2-vision", embed_model: str = "nomic-embed-text"):
        self.vision_model = vision_model
        self.embed_model = embed_model

    async def run_vision_stage(self, image_path: str) -> Dict[str, Any]:
        """
        Stage 1: Describe image and detect category.
        """
        prompt = """
        Analyze this image and provide a structured JSON response with:
        - title: Short descriptive title.
        - description: Detailed visual description.
        - category: One of [receipt, screenshot, document, photo].
        - summary: One sentence summary.
        - confidence: Float between 0-100.
        
        Respond ONLY with JSON.
        """
        try:
            # Using sync call in executor since ollama-python might be blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: ollama.generate(
                    model=self.vision_model,
                    prompt=prompt,
                    images=[image_path],
                    format='json',
                    stream=False
                )
            )
            return json.loads(response['response'])
        except Exception as e:
            logger.error(f"Vision stage failed: {e}")
            raise

    async def run_ocr_stage(self, image_path: str) -> Dict[str, Any]:
        """
        Stage 2: Extract text from image.
        """
        # In a real production system, we'd use Tesseract or PaddleOCR.
        # For this local demo, we can ask the vision model or use a stub.
        prompt = "Extract all readable text from this image. Respond ONLY with the extracted text as a string."
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: ollama.generate(
                    model=self.vision_model,
                    prompt=prompt,
                    images=[image_path],
                    stream=False
                )
            )
            return {
                "text": response['response'].strip(),
                "confidence": 95.0, # Mock confidence
                "engine": "vision-llm"
            }
        except Exception as e:
            logger.error(f"OCR stage failed: {e}")
            return {"text": "", "confidence": 0, "engine": "failed"}

    async def run_tagging_stage(self, vision_data: Dict[str, Any], ocr_text: str) -> List[Dict[str, Any]]:
        """
        Stage 3: Generate tags based on description and text.
        """
        prompt = f"""
        Based on this description: {vision_data.get('description')} 
        And this extracted text: {ocr_text[:500]}
        Generate 5-10 relevant tags. For each tag, provide:
        - label: The tag name.
        - tone: One of [accent, success, warning, danger, info, gray].
        - confidence: Float 0-100.
        
        Respond ONLY with a JSON array of tag objects.
        """
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: ollama.generate(
                    model="llama3.1:8b", # Faster model for text tasks
                    prompt=prompt,
                    format='json',
                    stream=False
                )
            )
            return json.loads(response['response'])
        except Exception as e:
            logger.error(f"Tagging stage failed: {e}")
            return []

    async def run_embedding_stage(self, text: str) -> List[float]:
        """
        Stage 4: Generate embeddings for similarity search.
        """
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: ollama.embeddings(model=self.embed_model, prompt=text)
            )
            return response['embedding']
        except Exception as e:
            logger.error(f"Embedding stage failed: {e}")
            return []

ai_service = AIService()
