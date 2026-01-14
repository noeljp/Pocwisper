# Pocwisper

[![Security Status](https://img.shields.io/badge/security-all%20vulnerabilities%20fixed-brightgreen)](SECURITY.md)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-18.2-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.115.5-green.svg)](https://fastapi.tiangolo.com/)

Application web de transcription de réunions audio avec traitement intelligent par LLM.

> **Note:** All security vulnerabilities have been addressed. See [SECURITY.md](SECURITY.md) for details.

## Description

Pocwisper est une solution complète pour transcrire des réunions audio et générer des documents DOCX formatés. Le projet combine :

- **Transcription audio** via Whisper (Hugging Face)
- **Traitement intelligent** via Ollama (LLM local)
- **Interface utilisateur** développée avec React
- **Authentification utilisateur** pour séparer les fichiers par utilisateur

## Fonctionnalités

### Frontend (React)
- Interface utilisateur intuitive et moderne
- Authentification utilisateur (inscription/connexion)
- Formulaire de téléchargement comprenant :
  - Fichier audio (MP3, WAV, M4A, etc.)
  - Titre de la réunion
  - Date de la réunion
  - Prompt initial (acronymes et contexte métier)
- Dashboard pour gérer toutes les transcriptions
- Visualisation détaillée des transcriptions
- Téléchargement des documents DOCX générés

### Backend (FastAPI)
- API REST complète
- Intégration de Whisper (modèle de transcription depuis Hugging Face)
- Intégration d'Ollama (LLM local) pour le traitement intelligent
- Génération de documents DOCX
- Stockage SQLite
- Gestion des fichiers par utilisateur

### Infrastructure
- Conteneurisation avec Docker/Podman
- Configuration pour AlmaLinux 10
- Déploiement simplifié via docker-compose/podman-compose

## Installation

### Prérequis

- Python 3.11+
- Node.js 18+
- Docker ou Podman
- Ollama installé localement (ou via container)

### Installation avec Docker/Podman

1. Cloner le repository :
```bash
git clone https://github.com/noeljp/Pocwisper.git
cd Pocwisper
```

2. Lancer avec Docker Compose :
```bash
docker-compose up -d
```

Ou avec Podman Compose (pour AlmaLinux 10) :
```bash
podman-compose up -d
```

3. Installer le modèle Ollama :
```bash
# Si Ollama est dans un container
docker exec -it pocwisper-ollama ollama pull llama2

# Ou si Ollama est local
ollama pull llama2
```

4. Accéder à l'application :
- Frontend : http://localhost:3000
- Backend API : http://localhost:8000
- Documentation API : http://localhost:8000/docs

### Installation manuelle

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate pour Windows
pip install -r requirements.txt
cp .env.example .env
# Éditer .env avec vos configurations
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Utilisation

1. **Créer un compte** : Inscrivez-vous sur la page de connexion
2. **Se connecter** : Utilisez vos identifiants
3. **Créer une transcription** :
   - Cliquez sur "Nouvelle Transcription"
   - Remplissez le formulaire (titre, date, fichier audio)
   - Ajoutez un prompt initial avec les acronymes et contexte
   - Soumettez le formulaire
4. **Traiter la transcription** :
   - Cliquez sur "Traiter" pour lancer la transcription
   - Attendez que le traitement se termine
5. **Télécharger le document** :
   - Une fois terminé, téléchargez le document DOCX

## Architecture

### Stack technique

**Frontend:**
- React 18
- React Router
- Axios
- Vite

**Backend:**
- FastAPI
- SQLAlchemy
- Transformers (Hugging Face)
- PyTorch
- Ollama
- python-docx

**Infrastructure:**
- Docker/Podman
- Nginx
- SQLite

### Flux de traitement

1. L'utilisateur télécharge un fichier audio via l'interface web
2. Le backend sauvegarde le fichier et crée un enregistrement en base de données
3. Lors du traitement :
   - Whisper transcrit l'audio en texte brut
   - Ollama traite le texte avec le contexte fourni pour l'améliorer
   - Un document DOCX est généré avec le texte formaté
4. L'utilisateur peut télécharger le document final

## Configuration

### Variables d'environnement (Backend)

```
SECRET_KEY=votre-clé-secrète
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./pocwisper.db
WHISPER_MODEL=openai/whisper-base
OLLAMA_URL=http://localhost:11434
UPLOAD_DIR=./uploads
```

### Configuration Ollama

Assurez-vous qu'Ollama est en cours d'exécution et que le modèle llama2 est téléchargé :

```bash
ollama serve  # Lance le serveur Ollama
ollama pull llama2  # Télécharge le modèle
```

## Déploiement sur AlmaLinux 10

1. Installer Podman :
```bash
sudo dnf install -y podman podman-compose
```

2. Cloner et lancer l'application :
```bash
git clone https://github.com/noeljp/Pocwisper.git
cd Pocwisper
podman-compose up -d
```

3. Configurer le pare-feu (si nécessaire) :
```bash
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --add-port=8000/tcp --permanent
sudo firewall-cmd --reload
```

## Développement

### Structure du projet

```
Pocwisper/
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── models/       # Modèles de données
│   │   ├── routes/       # Endpoints API
│   │   ├── services/     # Logique métier
│   │   ├── utils/        # Utilitaires
│   │   └── main.py       # Point d'entrée
│   ├── uploads/          # Fichiers uploadés
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/             # Interface React
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # Services API
│   │   └── contexts/     # Contextes React
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── podman-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter
- `GET /auth/me` - Obtenir l'utilisateur courant

### Transcriptions
- `POST /transcriptions/` - Créer une transcription
- `POST /transcriptions/{id}/process` - Traiter une transcription
- `GET /transcriptions/` - Lister les transcriptions
- `GET /transcriptions/{id}` - Obtenir une transcription
- `GET /transcriptions/{id}/download` - Télécharger le DOCX
- `DELETE /transcriptions/{id}` - Supprimer une transcription

Documentation complète : http://localhost:8000/docs

## Licence

Ce projet est sous licence MIT.

## Auteur

Pocwisper - Projet de transcription intelligente de réunions
