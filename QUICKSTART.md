# Quick Start Guide - Pocwisper

## Option 1: Using Docker/Podman (Recommended)

### Prerequisites
- Docker or Podman installed
- At least 8GB of RAM available
- ~10GB of disk space for models (if installing Ollama in container)
- **OR** Ollama already installed on your server on port 11434

### Steps

1. **Clone the repository:**
```bash
git clone https://github.com/noeljp/Pocwisper.git
cd Pocwisper
```

2. **Run the setup script:**
```bash
chmod +x setup.sh
./setup.sh
```

This script will:
- Detect if Ollama is already running on localhost:11434
- Ask if you want to use container Ollama or external Ollama
- Set up the backend environment
- Install frontend dependencies
- Start services (backend, frontend, and optionally Ollama)
- Download the Ollama llama2 model (if using container Ollama)

**If you have Ollama on port 11434:**
The script will detect it and skip the Ollama container setup.

**If you don't have Ollama:**
The script will offer to run Ollama in a container.

3. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

4. **Create your account and start transcribing!**

### Manual Setup with External Ollama

If you already have Ollama running on your server (port 11434):

```bash
# With Docker
docker-compose -f docker-compose.no-ollama.yml up -d

# With Podman  
podman-compose -f podman-compose.no-ollama.yml up -d
```

Make sure llama2 model is installed:
```bash
ollama pull llama2
```

## Option 2: Manual Development Setup

### Backend

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create and activate virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Setup environment:**
```bash
cp .env.example .env
# Edit .env with your settings
```

5. **Install and start Ollama:**
```bash
# Install from https://ollama.ai
ollama serve &
ollama pull llama2
```

6. **Start the backend:**
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

1. **Navigate to frontend directory (in a new terminal):**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Access the application at http://localhost:3000**

## First Time Usage

1. **Register an account:**
   - Go to http://localhost:3000
   - Click "Créer un compte"
   - Fill in username, email, and password
   - Click "S'inscrire"

2. **Login:**
   - Enter your username and password
   - Click "Se connecter"

3. **Create your first transcription:**
   - Click "Nouvelle Transcription"
   - Fill in:
     - **Titre**: Name of your meeting (e.g., "Sprint Planning Q1")
     - **Date**: Date of the meeting
     - **Fichier audio**: Select your audio file (MP3, WAV, M4A, etc.)
     - **Prompt initial** (optional but recommended): Add context like:
       ```
       Réunion d'équipe de développement.
       Acronymes:
       - API: Application Programming Interface
       - CI/CD: Continuous Integration/Continuous Deployment
       - POC: Proof of Concept
       
       Participants: Alice (Product Owner), Bob (Developer), Carol (Designer)
       ```
   - Click "Créer"

4. **Process the transcription:**
   - In the dashboard, find your transcription
   - Click "Traiter" to start the transcription process
   - Wait for the processing to complete (this may take several minutes depending on audio length)

5. **Download the result:**
   - Once status shows "Terminé" (Completed)
   - Click "Télécharger DOCX" to download the formatted document
   - Or click "Voir détails" to view the transcription in the browser

## Troubleshooting

### Ollama not responding
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If using external Ollama and not running, start it
ollama serve

# If using container Ollama and not running, restart the container
docker restart pocwisper-ollama
# or
podman restart pocwisper-ollama
```

### Backend can't connect to Ollama
- Check that Ollama is accessible on the configured port
- Verify `OLLAMA_URL` in backend/.env matches your setup
  - For external Ollama: `OLLAMA_URL=http://localhost:11434`
  - For container Ollama with Docker: `OLLAMA_URL=http://ollama:11434`
- Check container networking if using Docker/Podman

### Frontend can't connect to backend
- Check backend is running on port 8000
- Check CORS settings in backend/app/main.py
- Verify API URL in frontend/src/services/api.js

### Database errors
```bash
# Delete and recreate database
cd backend
rm pocwisper.db
# Restart the backend (tables will be created automatically)
```

### Model download is slow
- The Whisper and Ollama models are large
- First run will download models from Hugging Face and Ollama
- Be patient, this is one-time setup
- Ensure stable internet connection

## Performance Tips

- Use smaller Whisper model for faster processing (already default: `openai/whisper-base`)
- For better accuracy, upgrade to `openai/whisper-large-v3` (edit backend/.env)
- Process shorter audio files for faster results
- Ensure sufficient RAM (8GB minimum, 16GB recommended)

## Next Steps

- Check the full README.md for detailed documentation
- Explore the API documentation at http://localhost:8000/docs
- Customize the Ollama prompt in backend/app/services/ollama_service.py
- Adjust the UI styling in frontend/src/App.css
