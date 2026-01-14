import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transcriptionService } from '../services/api';

const Dashboard = () => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTranscriptions();
  }, []);

  const loadTranscriptions = async () => {
    try {
      const data = await transcriptionService.getAll();
      setTranscriptions(data);
    } catch (err) {
      setError('Erreur lors du chargement des transcriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette transcription ?')) {
      try {
        await transcriptionService.delete(id);
        loadTranscriptions();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleProcess = async (id) => {
    if (window.confirm('Lancer le traitement de cette transcription ? Cela peut prendre plusieurs minutes.')) {
      try {
        await transcriptionService.process(id);
        alert('Traitement lancé ! La transcription sera mise à jour automatiquement.');
        // Reload after a delay to show processing status
        setTimeout(() => loadTranscriptions(), 2000);
      } catch (err) {
        alert('Erreur lors du lancement du traitement : ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleDownload = async (id, title) => {
    try {
      const blob = await transcriptionService.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Erreur lors du téléchargement');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'status-pending', text: 'En attente' },
      processing: { class: 'status-processing', text: 'En cours' },
      completed: { class: 'status-completed', text: 'Terminé' },
      failed: { class: 'status-failed', text: 'Échoué' },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Mes Transcriptions</h2>
        <Link to="/new">
          <button className="btn btn-primary">Nouvelle Transcription</button>
        </Link>
      </div>

      {error && <div className="error">{error}</div>}

      {transcriptions.length === 0 ? (
        <div className="card">
          <p>Aucune transcription. Commencez par créer une nouvelle transcription.</p>
        </div>
      ) : (
        <div className="transcription-list">
          {transcriptions.map((transcription) => (
            <div key={transcription.id} className="transcription-item">
              <h3>{transcription.title}</h3>
              <div className="meta">
                <div>Date: {new Date(transcription.date).toLocaleDateString('fr-FR')}</div>
                <div>Créé le: {new Date(transcription.created_at).toLocaleString('fr-FR')}</div>
                <div style={{ marginTop: '10px' }}>{getStatusBadge(transcription.status)}</div>
              </div>
              
              {transcription.initial_prompt && (
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  <strong>Contexte:</strong> {transcription.initial_prompt.substring(0, 100)}...
                </div>
              )}

              <div className="actions">
                <Link to={`/transcription/${transcription.id}`}>
                  <button className="btn btn-primary">Voir détails</button>
                </Link>
                
                {transcription.status === 'pending' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleProcess(transcription.id)}
                  >
                    Traiter
                  </button>
                )}
                
                {transcription.status === 'completed' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDownload(transcription.id, transcription.title)}
                  >
                    Télécharger DOCX
                  </button>
                )}
                
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(transcription.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
