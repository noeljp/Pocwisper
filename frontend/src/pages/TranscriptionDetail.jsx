import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transcriptionService } from '../services/api';

const TranscriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transcription, setTranscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTranscription();
  }, [id]);

  const loadTranscription = async () => {
    try {
      const data = await transcriptionService.getOne(id);
      setTranscription(data);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await transcriptionService.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${transcription.title}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Erreur lors du téléchargement');
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error || !transcription) {
    return (
      <div className="container">
        <div className="error">{error || 'Transcription non trouvée'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
        ← Retour
      </button>

      <div className="card">
        <h2>{transcription.title}</h2>
        <div style={{ marginTop: '10px', color: '#666' }}>
          <div><strong>Date:</strong> {new Date(transcription.date).toLocaleDateString('fr-FR')}</div>
          <div><strong>Statut:</strong> {transcription.status}</div>
          <div><strong>Créé le:</strong> {new Date(transcription.created_at).toLocaleString('fr-FR')}</div>
        </div>

        {transcription.initial_prompt && (
          <div style={{ marginTop: '20px' }}>
            <h3>Contexte initial</h3>
            <p style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
              {transcription.initial_prompt}
            </p>
          </div>
        )}

        {transcription.transcription_text && (
          <div style={{ marginTop: '20px' }}>
            <h3>Transcription brute</h3>
            <div style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '15px', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
              {transcription.transcription_text}
            </div>
          </div>
        )}

        {transcription.processed_text && (
          <div style={{ marginTop: '20px' }}>
            <h3>Texte traité</h3>
            <div style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '15px', borderRadius: '4px', maxHeight: '400px', overflowY: 'auto' }}>
              {transcription.processed_text}
            </div>
          </div>
        )}

        {transcription.status === 'completed' && (
          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={handleDownload}>
              Télécharger le document DOCX
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionDetail;
