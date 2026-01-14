# Development Guide - Pocwisper

This guide is for developers who want to contribute to or customize Pocwisper.

## Project Structure

```
Pocwisper/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Database models and schemas
│   │   │   ├── database.py # SQLAlchemy models
│   │   │   └── schemas.py  # Pydantic schemas
│   │   ├── routes/         # API endpoints
│   │   │   ├── auth.py     # Authentication endpoints
│   │   │   └── transcriptions.py  # Transcription endpoints
│   │   ├── services/       # Business logic
│   │   │   ├── whisper_service.py   # Whisper integration
│   │   │   ├── ollama_service.py    # Ollama integration
│   │   │   └── document_service.py  # DOCX generation
│   │   ├── utils/          # Utilities
│   │   │   └── auth.py     # Authentication utilities
│   │   ├── config.py       # Configuration
│   │   └── main.py         # Application entry point
│   ├── uploads/            # Uploaded files (gitignored)
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Docker Compose config
├── podman-compose.yml      # Podman Compose config
├── setup.sh               # Setup script
└── README.md

```

## Development Setup

### Backend Development

1. **Setup environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env as needed
```

3. **Run development server with auto-reload:**
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

4. **Access API documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Frontend Development

1. **Setup environment:**
```bash
cd frontend
npm install
```

2. **Run development server:**
```bash
npm run dev
```

3. **Access frontend:**
   - http://localhost:3000

### Database

The application uses SQLite by default for simplicity. The database file is created automatically.

**Viewing the database:**
```bash
cd backend
sqlite3 pocwisper.db
.tables
.schema users
SELECT * FROM users;
```

**Resetting the database:**
```bash
cd backend
rm pocwisper.db
# Restart backend - tables will be recreated
```

## Adding New Features

### Adding a New Backend Endpoint

1. **Create or modify a route file in `backend/app/routes/`:**

```python
from fastapi import APIRouter, Depends
from app.models.database import User
from app.utils.auth import get_current_user

router = APIRouter(prefix="/myfeature", tags=["myfeature"])

@router.get("/")
async def my_endpoint(current_user: User = Depends(get_current_user)):
    return {"message": "Hello from my feature"}
```

2. **Register the router in `backend/app/main.py`:**

```python
from app.routes import auth, transcriptions, myfeature

app.include_router(myfeature.router)
```

### Adding a New Frontend Page

1. **Create a new page component in `frontend/src/pages/`:**

```jsx
import React from 'react';

const MyNewPage = () => {
  return (
    <div className="container">
      <h2>My New Page</h2>
      {/* Your content */}
    </div>
  );
};

export default MyNewPage;
```

2. **Add route in `frontend/src/App.jsx`:**

```jsx
import MyNewPage from './pages/MyNewPage';

// In the Routes component:
<Route
  path="/mypage"
  element={
    <PrivateRoute>
      <MyNewPage />
    </PrivateRoute>
  }
/>
```

## Customization

### Changing the Whisper Model

Edit `backend/.env`:
```
# For better accuracy (larger, slower):
WHISPER_MODEL=openai/whisper-large-v3

# For faster processing (smaller, less accurate):
WHISPER_MODEL=openai/whisper-tiny
```

Available models:
- `openai/whisper-tiny` (fastest, least accurate)
- `openai/whisper-base` (default - good balance)
- `openai/whisper-small`
- `openai/whisper-medium`
- `openai/whisper-large-v3` (slowest, most accurate)

### Customizing the LLM Prompt

Edit `backend/app/services/ollama_service.py`:

```python
async def process_transcription(self, transcription: str, initial_prompt: str = "") -> str:
    system_context = """Your custom system prompt here"""
    # ... rest of the method
```

### Changing the Ollama Model

Edit the prompt in the service or update the model:

```python
# In backend/app/services/ollama_service.py
response = await client.post(
    f"{self.base_url}/api/generate",
    json={
        "model": "mistral",  # Change to your preferred model
        "prompt": full_prompt,
        "stream": False
    }
)
```

Available models (need to pull first with `ollama pull <model>`):
- `llama2` (default)
- `mistral`
- `codellama`
- `mixtral`

### Styling the Frontend

Edit `frontend/src/App.css` for global styles, or add styles directly in components.

## Testing

### Backend Testing

Create test files in `backend/tests/`:

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
```

Run tests:
```bash
cd backend
pytest
```

### Frontend Testing

Add tests using your preferred framework (not included by default).

## API Reference

### Authentication Endpoints

**Register:**
```
POST /auth/register
Content-Type: application/json

{
  "username": "user",
  "email": "user@example.com",
  "password": "password"
}
```

**Login:**
```
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=user&password=password
```

**Get Current User:**
```
GET /auth/me
Authorization: Bearer <token>
```

### Transcription Endpoints

**Create Transcription:**
```
POST /transcriptions/
Content-Type: multipart/form-data
Authorization: Bearer <token>

title: Meeting Title
date: 2024-01-15
initial_prompt: Context and acronyms
audio_file: <file>
```

**Process Transcription:**
```
POST /transcriptions/{id}/process
Authorization: Bearer <token>
```

**List Transcriptions:**
```
GET /transcriptions/
Authorization: Bearer <token>
```

**Get Transcription:**
```
GET /transcriptions/{id}
Authorization: Bearer <token>
```

**Download Document:**
```
GET /transcriptions/{id}/download
Authorization: Bearer <token>
```

**Delete Transcription:**
```
DELETE /transcriptions/{id}
Authorization: Bearer <token>
```

## Common Issues

### "Module not found" errors
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Ollama connection refused
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve
```

### CORS errors
Check that the frontend URL is in the CORS allowed origins in `backend/app/main.py`.

### Database locked errors
SQLite doesn't handle high concurrency well. For production, consider PostgreSQL.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Performance Optimization

### Backend
- Use a more efficient database (PostgreSQL) for production
- Implement caching for frequently accessed data
- Use background tasks for long-running operations
- Consider using Celery for async processing

### Frontend
- Implement code splitting
- Add loading states and optimistic updates
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

## Security Considerations

- Change `SECRET_KEY` in production
- Use HTTPS in production
- Implement rate limiting
- Add input validation and sanitization
- Store sensitive data securely
- Regular security audits

## Deployment

See README.md for deployment instructions on AlmaLinux 10 with Podman.

For other platforms:
- Use environment variables for configuration
- Set up reverse proxy (Nginx/Apache)
- Configure SSL/TLS certificates
- Set up monitoring and logging
- Implement backup strategy
