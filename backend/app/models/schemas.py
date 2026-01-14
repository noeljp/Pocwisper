from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Transcription schemas
class TranscriptionBase(BaseModel):
    title: str
    date: datetime
    initial_prompt: Optional[str] = None


class TranscriptionCreate(TranscriptionBase):
    pass


class TranscriptionResponse(TranscriptionBase):
    id: int
    user_id: int
    audio_file_path: str
    status: str
    transcription_text: Optional[str] = None
    processed_text: Optional[str] = None
    document_path: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
