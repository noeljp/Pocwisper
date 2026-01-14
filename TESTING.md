# Testing Guide - Pocwisper

This guide covers manual and automated testing approaches for Pocwisper.

## Manual Testing

### 1. Basic Functionality Test

#### Setup
1. Start all services (backend, frontend, Ollama)
2. Ensure services are running:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - Ollama: http://localhost:11434

#### Test User Registration
1. Navigate to http://localhost:3000
2. Click "Créer un compte"
3. Fill in:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123!`
4. Click "S'inscrire"
5. Verify: Success message appears

#### Test User Login
1. Click "Se connecter"
2. Enter:
   - Username: `testuser`
   - Password: `Test123!`
3. Click "Se connecter"
4. Verify: Redirected to dashboard with "Bonjour, testuser" displayed

#### Test Transcription Creation
1. Click "Nouvelle Transcription"
2. Fill in:
   - Titre: "Test Meeting"
   - Date: Select today's date
   - Fichier audio: Upload a short audio file (test with a 10-30 second sample)
   - Prompt initial: "Test context with acronym API: Application Programming Interface"
3. Click "Créer"
4. Verify: Redirected to dashboard, new transcription appears with "En attente" status

#### Test Transcription Processing
1. Find the test transcription
2. Click "Traiter"
3. Confirm the dialog
4. Wait for processing (may take 1-5 minutes depending on file size)
5. Refresh the page periodically
6. Verify: Status changes from "En attente" → "En cours" → "Terminé"

#### Test Document Download
1. Once status is "Terminé"
2. Click "Télécharger DOCX"
3. Verify: DOCX file downloads
4. Open the file in Word/LibreOffice
5. Verify: Contains title, date, and transcribed/processed text

#### Test Transcription Details
1. Click "Voir détails" on a transcription
2. Verify: Shows all information including:
   - Title and date
   - Status
   - Initial prompt
   - Raw transcription (if processed)
   - Processed text (if completed)

#### Test Transcription Deletion
1. Click "Supprimer" on a transcription
2. Confirm the dialog
3. Verify: Transcription removed from list

#### Test Logout
1. Click "Déconnexion"
2. Verify: Redirected to login page
3. Try to access http://localhost:3000
4. Verify: Redirected to login (requires authentication)

### 2. API Testing with curl

#### Health Check
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

#### Register User
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "apitest",
    "email": "apitest@example.com",
    "password": "Test123!"
  }'
# Expected: User object with id, username, email
```

#### Login
```bash
TOKEN=$(curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=apitest&password=Test123!" \
  | jq -r '.access_token')

echo $TOKEN
# Expected: JWT token string
```

#### Get Current User
```bash
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"
# Expected: User object
```

#### Create Transcription
```bash
curl -X POST http://localhost:8000/transcriptions/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=API Test Meeting" \
  -F "date=2024-01-15T10:00:00" \
  -F "initial_prompt=Test context" \
  -F "audio_file=@/path/to/test-audio.mp3"
# Expected: Transcription object with id
```

#### List Transcriptions
```bash
curl http://localhost:8000/transcriptions/ \
  -H "Authorization: Bearer $TOKEN"
# Expected: Array of transcription objects
```

#### Process Transcription
```bash
# Replace {id} with actual transcription ID
curl -X POST http://localhost:8000/transcriptions/{id}/process \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"status":"completed","message":"..."}
```

### 3. Error Handling Tests

#### Test Invalid Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=wrong&password=wrong"
# Expected: 401 Unauthorized
```

#### Test Duplicate Registration
1. Register user "duplicate@example.com"
2. Try to register same email again
3. Expected: Error message "Email already registered"

#### Test Unauthorized Access
```bash
curl http://localhost:8000/transcriptions/
# Expected: 401 Unauthorized (no token)
```

#### Test Invalid File Upload
1. Try to upload non-audio file (e.g., .txt)
2. System should accept it (no strict validation)
3. Processing will fail during transcription

#### Test Missing Required Fields
1. Try to create transcription without title
2. Expected: Validation error
3. Try without audio file
4. Expected: Error "Veuillez sélectionner un fichier audio"

## Performance Testing

### Test File Size Limits
1. Upload progressively larger audio files
2. Note processing times:
   - 1 minute audio: ~30-60 seconds
   - 5 minutes: ~2-5 minutes
   - 30 minutes: ~10-20 minutes
3. Monitor system resources (CPU, RAM, disk)

### Test Concurrent Users
1. Create multiple user accounts
2. Upload files simultaneously
3. Monitor:
   - Response times
   - Processing queue
   - System stability

### Test Large Prompts
1. Create transcription with very long initial prompt (1000+ characters)
2. Verify system handles it gracefully

## Integration Testing

### Test Whisper Integration
1. Upload audio with clear speech
2. Verify transcription accuracy
3. Test different audio formats:
   - MP3
   - WAV
   - M4A
   - OGG

### Test Ollama Integration
1. Verify Ollama is running: `curl http://localhost:11434/api/tags`
2. Stop Ollama: `docker stop pocwisper-ollama`
3. Try to process transcription
4. Expected: Error or fallback to raw transcription
5. Restart Ollama: `docker start pocwisper-ollama`
6. Verify processing works again

### Test Database Operations
1. Create 10+ transcriptions
2. Restart backend service
3. Verify all data persists
4. Check database file size
5. Test pagination (if implemented)

## Automated Testing (Future Implementation)

### Backend Unit Tests (pytest)

Create `backend/tests/test_auth.py`:
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 201
    assert "username" in response.json()

def test_login_user():
    # First register
    client.post("/auth/register", json={
        "username": "logintest",
        "email": "login@example.com",
        "password": "password123"
    })
    
    # Then login
    response = client.post(
        "/auth/login",
        data={"username": "logintest", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
```

Run tests:
```bash
cd backend
pytest tests/
```

### Frontend Tests (Jest + React Testing Library)

Create `frontend/src/__tests__/Login.test.jsx`:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../contexts/AuthContext';

test('renders login form', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
  
  expect(screen.getByText(/connexion/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/nom d'utilisateur/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
});
```

## Test Audio Samples

For testing, you can:
1. Record your own short audio samples
2. Generate test audio using text-to-speech tools
3. Use free audio samples from:
   - https://freesound.org/
   - https://www.voiptroubleshooter.com/open_speech/
   - Create using: `espeak "This is a test" -w test.wav`

### Sample Test Audio Script
```bash
# Generate test audio using espeak (if available)
espeak "Hello, this is a test meeting transcript. We are discussing the new API implementation. The POC will be ready next week." -w test-meeting.wav

# Or use ffmpeg to generate tone
ffmpeg -f lavfi -i sine=frequency=1000:duration=10 test-tone.wav
```

## Checklist for Release Testing

Before releasing a new version:

- [ ] All user flows work end-to-end
- [ ] Authentication (register, login, logout)
- [ ] File upload works for common formats
- [ ] Transcription processing completes successfully
- [ ] Document generation and download works
- [ ] UI is responsive on mobile and desktop
- [ ] Error messages are clear and helpful
- [ ] No sensitive data in logs or responses
- [ ] Database migrations work correctly
- [ ] Backup and restore procedures tested
- [ ] Performance acceptable for expected load
- [ ] Security scan completed (no high/critical vulnerabilities)
- [ ] Documentation is up to date
- [ ] All environment variables documented

## Known Issues & Limitations

1. **Large Files**: Very large audio files (>100MB) may timeout
   - Workaround: Split into smaller segments
   
2. **Concurrent Processing**: SQLite may lock under heavy concurrent load
   - Workaround: Use PostgreSQL for production
   
3. **Model Download**: First-time setup downloads large models
   - Expected behavior, requires good internet connection
   
4. **Browser Compatibility**: Tested on Chrome, Firefox, Edge
   - Safari may have minor styling differences

## Reporting Bugs

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/environment details
5. Console errors (if any)
6. Screenshots (if UI issue)
