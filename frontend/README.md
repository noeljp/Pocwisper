# Pocwisper Frontend

Interface web React pour la transcription de réunions audio.

## Développement

1. Installer les dépendances :
```bash
npm install
```

2. Configurer l'URL de l'API :
Le frontend se connecte par défaut à `http://localhost:8000` pour l'API backend.
Vous pouvez modifier cette URL dans `src/services/api.js` si nécessaire.

3. Lancer le serveur de développement :
```bash
npm run dev
```

L'application sera disponible sur http://localhost:3000

## Build de production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

## Structure du projet

```
src/
├── components/       # Composants réutilisables
│   ├── Navbar.jsx
│   └── PrivateRoute.jsx
├── pages/           # Pages de l'application
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── NewTranscription.jsx
│   └── TranscriptionDetail.jsx
├── services/        # Services API
│   └── api.js
├── contexts/        # Contextes React
│   └── AuthContext.jsx
├── App.jsx          # Composant principal
├── App.css          # Styles globaux
└── main.jsx         # Point d'entrée
```

## Fonctionnalités

- **Authentification** : Inscription et connexion utilisateur
- **Upload de fichiers audio** : Support de multiples formats audio
- **Formulaire de transcription** : Titre, date, prompt initial
- **Liste des transcriptions** : Vue d'ensemble de toutes les transcriptions
- **Détails de transcription** : Visualisation complète du résultat
- **Téléchargement DOCX** : Export des transcriptions traitées
- **Gestion des transcriptions** : Suppression et traitement
