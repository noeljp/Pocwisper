from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os
import shutil
from app.models.database import User, Transcription
from app.models.schemas import TranscriptionCreate, TranscriptionResponse
from app.utils.auth import get_current_user, get_db
from app.services.whisper_service import whisper_service
from app.services.ollama_service import ollama_service
from app.services.document_service import document_service
from app.config import get_settings
from fastapi.responses import FileResponse

router = APIRouter(prefix="/transcriptions", tags=["transcriptions"])
settings = get_settings()


@router.post("/", response_model=TranscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_transcription(
    title: str = Form(...),
    date: str = Form(...),
    initial_prompt: str = Form(None),
    audio_file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Parse date
    try:
        meeting_date = datetime.fromisoformat(date.replace('Z', '+00:00'))
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format"
        )
    
    # Create user-specific upload directory
    user_upload_dir = os.path.join(settings.UPLOAD_DIR, "audio", str(current_user.id))
    os.makedirs(user_upload_dir, exist_ok=True)
    
    # Save audio file
    audio_filename = f"{datetime.now().timestamp()}_{audio_file.filename}"
    audio_path = os.path.join(user_upload_dir, audio_filename)
    
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)
    
    # Create transcription record
    transcription = Transcription(
        user_id=current_user.id,
        title=title,
        date=meeting_date,
        initial_prompt=initial_prompt,
        audio_file_path=audio_path,
        status="pending"
    )
    db.add(transcription)
    db.commit()
    db.refresh(transcription)
    
    return transcription


@router.post("/{transcription_id}/process")
async def process_transcription(
    transcription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transcription = db.query(Transcription).filter(
        Transcription.id == transcription_id,
        Transcription.user_id == current_user.id
    ).first()
    
    if not transcription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcription not found"
        )
    
    if transcription.status == "processing":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcription is already being processed"
        )
    
    # Update status
    transcription.status = "processing"
    db.commit()
    
    try:
        # Step 1: Transcribe audio with Whisper
        print(f"Starting transcription for ID {transcription_id}")
        transcription_text = whisper_service.transcribe_audio(transcription.audio_file_path)
        transcription.transcription_text = transcription_text
        db.commit()
        
        # Step 2: Process with Ollama
        print(f"Processing with Ollama for ID {transcription_id}")
        processed_text = await ollama_service.process_transcription(
            transcription_text,
            transcription.initial_prompt or ""
        )
        transcription.processed_text = processed_text
        db.commit()
        
        # Step 3: Generate DOCX document
        print(f"Generating document for ID {transcription_id}")
        doc_dir = os.path.join(settings.UPLOAD_DIR, "documents", str(current_user.id))
        os.makedirs(doc_dir, exist_ok=True)
        doc_filename = f"{transcription.id}_{transcription.title.replace(' ', '_')}.docx"
        doc_path = os.path.join(doc_dir, doc_filename)
        
        document_service.create_docx(
            title=transcription.title,
            date=transcription.date,
            content=processed_text,
            output_path=doc_path
        )
        
        transcription.document_path = doc_path
        transcription.status = "completed"
        db.commit()
        
        return {"status": "completed", "message": "Transcription processed successfully"}
        
    except Exception as e:
        transcription.status = "failed"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing transcription: {str(e)}"
        )


@router.get("/", response_model=List[TranscriptionResponse])
def get_transcriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transcriptions = db.query(Transcription).filter(
        Transcription.user_id == current_user.id
    ).order_by(Transcription.created_at.desc()).all()
    
    return transcriptions


@router.get("/{transcription_id}", response_model=TranscriptionResponse)
def get_transcription(
    transcription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transcription = db.query(Transcription).filter(
        Transcription.id == transcription_id,
        Transcription.user_id == current_user.id
    ).first()
    
    if not transcription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcription not found"
        )
    
    return transcription


@router.get("/{transcription_id}/download")
async def download_document(
    transcription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transcription = db.query(Transcription).filter(
        Transcription.id == transcription_id,
        Transcription.user_id == current_user.id
    ).first()
    
    if not transcription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcription not found"
        )
    
    if not transcription.document_path or not os.path.exists(transcription.document_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return FileResponse(
        path=transcription.document_path,
        filename=os.path.basename(transcription.document_path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )


@router.delete("/{transcription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transcription(
    transcription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transcription = db.query(Transcription).filter(
        Transcription.id == transcription_id,
        Transcription.user_id == current_user.id
    ).first()
    
    if not transcription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcription not found"
        )
    
    # Delete files
    if transcription.audio_file_path and os.path.exists(transcription.audio_file_path):
        os.remove(transcription.audio_file_path)
    
    if transcription.document_path and os.path.exists(transcription.document_path):
        os.remove(transcription.document_path)
    
    # Delete database record
    db.delete(transcription)
    db.commit()
    
    return None
