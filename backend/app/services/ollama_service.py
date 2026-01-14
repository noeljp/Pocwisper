import httpx
from app.config import get_settings

settings = get_settings()


class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_URL

    async def generate_text(self, prompt: str, context: str = "") -> str:
        """Generate text using Ollama LLM"""
        async with httpx.AsyncClient(timeout=300.0) as client:
            try:
                full_prompt = f"{context}\n\n{prompt}" if context else prompt
                
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": "llama2",
                        "prompt": full_prompt,
                        "stream": False
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result.get("response", "")
            except httpx.HTTPError as e:
                print(f"Error calling Ollama: {e}")
                return ""

    async def process_transcription(self, transcription: str, initial_prompt: str = "") -> str:
        """Process transcription with LLM to improve formatting and clarity"""
        system_context = """Tu es un assistant qui améliore les transcriptions de réunions.
Ta tâche est de :
1. Corriger les erreurs de transcription
2. Améliorer la ponctuation et la structure
3. Organiser le texte en paragraphes cohérents
4. Identifier les intervenants si possible
5. Utiliser les acronymes et le contexte fournis pour améliorer la précision"""

        user_prompt = f"""Contexte et acronymes : {initial_prompt}

Transcription à améliorer :
{transcription}

Merci de produire une version améliorée de cette transcription."""

        full_prompt = f"{system_context}\n\n{user_prompt}"
        
        processed_text = await self.generate_text(full_prompt)
        return processed_text if processed_text else transcription


# Global instance
ollama_service = OllamaService()
