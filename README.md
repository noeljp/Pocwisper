# Pocwisper
Transcription de réunion audio
Le projet consiste en une interface web qui proposede de convertire des fichier audio en document docx.
elle contient une authentification par user pour séparer les fichier et document produit.
elle propose un formulaire qui permet a l'utilisateur d'inserer 
    - un fichier audio
    - un titre
    - une date
    - un initial prompte ( contiient les acronymes et contexte metier)

Le backend intègre 
    -whisper (telecharger depuis hugging face)
    -ollama (acces en local)

Le texte est produit par étape intéligeante avec le llm

L'interface est produite avec react sur une machine alamalinux 10 et lancer avec podman
