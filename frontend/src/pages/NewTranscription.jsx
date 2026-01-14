import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transcriptionService } from '../services/api';

const NewTranscription = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [initialPrompt, setInitialPrompt] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!audioFile) {
      setError('Veuillez sélectionner un fichier audio');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('date', date);
      if (initialPrompt) {
        formData.append('initial_prompt', initialPrompt);
      }
      formData.append('audio_file', audioFile);

      await transcriptionService.create(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Nouvelle Transcription</h2>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Titre *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réunion d'équipe - Sprint Planning"
              required
            />
          </div>

          <div className="form-group">
            <label>Date de la réunion *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Fichier audio *</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files[0])}
              required
            />
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              Formats acceptés : MP3, WAV, M4A, etc.
            </small>
          </div>

          <div className="form-group">
            <label>Prompt initial (facultatif)</label>
            <textarea
              value={initialPrompt}
              onChange={(e) => setInitialPrompt(e.target.value)}
              placeholder={`Ajoutez ici les acronymes, termes techniques et contexte métier pour améliorer la transcription.\n\nExemple:\n- API: Application Programming Interface\n- POC: Proof of Concept\n- Sprint: période de développement de 2 semaines\n- Équipe composée de: Jean (développeur), Marie (designer), Paul (chef de projet)`}
              rows="8"
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTranscription;
