# Pocwisper Backend

API backend pour la transcription de réunions audio.

## Installation

1. Créer un environnement virtuel Python :
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

2. Installer les dépendances :
```bash
pip install -r requirements.txt
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. S'assurer qu'Ollama est installé et en cours d'exécution :
```bash
# Installer Ollama (voir https://ollama.ai)
ollama pull llama2
ollama serve
```

## Démarrage

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

L'API sera disponible sur http://localhost:8000

Documentation interactive : http://localhost:8000/docs

## Endpoints

### Authentication
- `POST /auth/register` - Créer un compte utilisateur
- `POST /auth/login` - Se connecter
- `GET /auth/me` - Obtenir les informations de l'utilisateur courant

### Transcriptions
- `POST /transcriptions/` - Créer une nouvelle transcription
- `POST /transcriptions/{id}/process` - Traiter une transcription
- `GET /transcriptions/` - Lister toutes les transcriptions de l'utilisateur
- `GET /transcriptions/{id}` - Obtenir une transcription spécifique
- `GET /transcriptions/{id}/download` - Télécharger le document DOCX
- `DELETE /transcriptions/{id}` - Supprimer une transcription

## Architecture

- **FastAPI** : Framework web
- **SQLAlchemy** : ORM pour la base de données
- **Whisper** : Modèle de transcription (Hugging Face)
- **Ollama** : LLM local pour le traitement intelligent du texte
- **python-docx** : Génération de documents DOCX
