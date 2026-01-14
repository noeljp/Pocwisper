# Quick Start Guide - Pocwisper

## Option 1: Using Docker/Podman (Recommended)

### Prerequisites
- Docker or Podman installed
- At least 8GB of RAM available
- ~10GB of disk space for models

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
- Set up the backend environment
- Install frontend dependencies
- Start all services (backend, frontend, Ollama)
- Download the Ollama llama2 model

3. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

4. **Create your account and start transcribing!**

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

# If not running, start it
ollama serve

# Or restart the container
docker restart pocwisper-ollama
```

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
