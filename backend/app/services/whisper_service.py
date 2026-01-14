import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
from threading import Lock
from app.config import get_settings

settings = get_settings()


class WhisperService:
    def __init__(self):
        self.device = "cuda:0" if torch.cuda.is_available() else "cpu"
        self.torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
        self.model = None
        self.processor = None
        self.pipe = None
        self._lock = Lock()

    def load_model(self):
        """Load Whisper model from Hugging Face (thread-safe)"""
        if self.pipe is None:
            with self._lock:
                # Double-check after acquiring lock
                if self.pipe is None:
                    print(f"Loading Whisper model: {settings.WHISPER_MODEL}")
                    self.model = AutoModelForSpeechSeq2Seq.from_pretrained(
                        settings.WHISPER_MODEL,
                        torch_dtype=self.torch_dtype,
                        low_cpu_mem_usage=True,
                        use_safetensors=True
                    )
                    self.model.to(self.device)

                    self.processor = AutoProcessor.from_pretrained(settings.WHISPER_MODEL)

                    self.pipe = pipeline(
                        "automatic-speech-recognition",
                        model=self.model,
                        tokenizer=self.processor.tokenizer,
                        feature_extractor=self.processor.feature_extractor,
                        max_new_tokens=128,
                        chunk_length_s=30,
                        batch_size=16,
                        return_timestamps=True,
                        torch_dtype=self.torch_dtype,
                        device=self.device,
                    )
                    print("Whisper model loaded successfully")

    def transcribe_audio(self, audio_file_path: str) -> str:
        """Transcribe audio file to text"""
        self.load_model()
        
        result = self.pipe(audio_file_path)
        return result["text"]


# Global instance
whisper_service = WhisperService()
