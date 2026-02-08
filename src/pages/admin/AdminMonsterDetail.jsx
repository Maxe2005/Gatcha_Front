import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';
import '../admin/AdminMonsterDetail.css';

const AdminMonsterDetail = () => {
  const { monsterId } = useParams();
  const navigate = useNavigate();
  const [monster, setMonster] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Form states for actions
  const [reviewNotes, setReviewNotes] = useState('');
  const [correctedData, setCorrectedData] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showCorrectForm, setShowCorrectForm] = useState(false);
  const [reviewAction, setReviewAction] = useState('approve');

  useEffect(() => {
    const fetchMonsterDetail = async () => {
      try {
        setLoading(true);
        const [detailRes, historyRes] = await Promise.all([
          adminApi.get(`/monsters/${monsterId}`),
          adminApi.get(`/monsters/${monsterId}/history`),
        ]);
        setMonster(detailRes.data);
        setHistory(historyRes.data?.history || []);
        setCorrectedData(
          JSON.stringify(detailRes.data?.monster_data || {}, null, 2)
        );
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.detail || 'Erreur lors du chargement du monstre'
        );
        console.error('Error fetching monster:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonsterDetail();
  }, [monsterId]);

  const handleReview = async () => {
    try {
      setIsActionLoading(true);
      setActionError(null);

      const payload = {
        action: reviewAction,
        notes: reviewNotes || null,
      };

      await adminApi.post(`/monsters/${monsterId}/review`, payload);

      // Refresh monster data
      const detailRes = await adminApi.get(`/monsters/${monsterId}`);
      const historyRes = await adminApi.get(`/monsters/${monsterId}/history`);
      setMonster(detailRes.data);
      setHistory(historyRes.data?.history || []);

      setShowReviewForm(false);
      setReviewNotes('');
      alert(`Monstre ${reviewAction} avec succès`);
    } catch (err) {
      setActionError(
        err.response?.data?.detail || 'Erreur lors de la révision du monstre'
      );
      console.error('Error reviewing monster:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCorrect = async () => {
    try {
      setIsActionLoading(true);
      setActionError(null);

      let parsedData;
      try {
        parsedData = JSON.parse(correctedData);
      } catch (e) {
        setActionError('Données JSON invalides');
        setIsActionLoading(false);
        return;
      }

      const payload = {
        corrected_data: parsedData,
        notes: reviewNotes || null,
      };

      await adminApi.post(`/monsters/${monsterId}/correct`, payload);

      // Refresh monster data
      const detailRes = await adminApi.get(`/monsters/${monsterId}`);
      const historyRes = await adminApi.get(`/monsters/${monsterId}/history`);
      setMonster(detailRes.data);
      setHistory(historyRes.data?.history || []);

      setShowCorrectForm(false);
      setReviewNotes('');
      alert('Monstre corrigé avec succès');
    } catch (err) {
      setActionError(
        err.response?.data?.detail || 'Erreur lors de la correction'
      );
      console.error('Error correcting monster:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-monster-detail">
        <div className="loading">Chargement du monstre...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-monster-detail">
        <button
          onClick={() => navigate('/admin/monsters')}
          className="btn-back"
        >
          ← Retour
        </button>
        <div className="error">{error}</div>
      </div>
    );
  }

  const canApproveReject = monster?.metadata?.state === 'PENDING_REVIEW';
  const canCorrect = monster?.metadata?.state === 'DEFECTIVE';

  return (
    <div className="admin-monster-detail">
      <div className="detail-header">
        <button
          onClick={() => navigate('/admin/monsters')}
          className="btn-back"
        >
          ← Retour
        </button>
        <h1>{monster?.metadata?.filename}</h1>
        <span
          className={`state-badge state-${monster?.metadata?.state.toLowerCase()}`}
        >
          {monster?.metadata?.state}
        </span>
      </div>

      {actionError && <div className="error-message">{actionError}</div>}

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Résumé
        </button>
        <button
          className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          Données
        </button>
        <button
          className={`tab-button ${activeTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveTab('validation')}
        >
          Validation
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historique
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'summary' && (
          <div className="summary-tab">
            <h2>Informations du Monstre</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>ID</label>
                <span>{monster?.metadata?.monster_id}</span>
              </div>
              <div className="info-item">
                <label>État</label>
                <span
                  className={`state-badge state-${monster?.metadata?.state.toLowerCase()}`}
                >
                  {monster?.metadata?.state}
                </span>
              </div>
              <div className="info-item">
                <label>Créé le</label>
                <span>
                  {new Date(monster?.metadata?.created_at).toLocaleString(
                    'fr-FR'
                  )}
                </span>
              </div>
              <div className="info-item">
                <label>Mis à jour le</label>
                <span>
                  {new Date(monster?.metadata?.updated_at).toLocaleString(
                    'fr-FR'
                  )}
                </span>
              </div>
              <div className="info-item">
                <label>Valide</label>
                <span
                  className={monster?.metadata?.is_valid ? 'valid' : 'invalid'}
                >
                  {monster?.metadata?.is_valid ? 'Oui' : 'Non'}
                </span>
              </div>
              {monster?.metadata?.reviewed_by && (
                <>
                  <div className="info-item">
                    <label>Révisé par</label>
                    <span>{monster.metadata.reviewed_by}</span>
                  </div>
                  <div className="info-item">
                    <label>Date de révision</label>
                    <span>
                      {new Date(monster.metadata.review_date).toLocaleString(
                        'fr-FR'
                      )}
                    </span>
                  </div>
                </>
              )}
              {monster?.metadata?.review_notes && (
                <div className="info-item full-width">
                  <label>Notes de révision</label>
                  <p>{monster.metadata.review_notes}</p>
                </div>
              )}
            </div>

            {monster?.image_url && (
              <div className="image-section">
                <h3>Image du Monstre</h3>
                <img
                  src={monster.image_url}
                  alt="Monster"
                  className="monster-image"
                />
              </div>
            )}

            <div className="actions-section">
              {canApproveReject && (
                <button
                  className="btn-primary"
                  onClick={() => setShowReviewForm(true)}
                >
                  Approuver / Rejeter
                </button>
              )}
              {canCorrect && (
                <button
                  className="btn-warning"
                  onClick={() => setShowCorrectForm(true)}
                >
                  Corriger
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="data-tab">
            <h2>Données du Monstre</h2>
            <pre>{JSON.stringify(monster?.monster_data, null, 2)}</pre>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="validation-tab">
            <h2>Rapport de Validation</h2>
            {monster?.metadata?.validation_errors &&
            monster.metadata.validation_errors.length > 0 ? (
              <div className="errors-list">
                {monster.metadata.validation_errors.map((error, idx) => (
                  <div key={idx} className="error-item">
                    <strong>{error.field}</strong>: {error.message}
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucune erreur de validation détectée.</p>
            )}

            {monster?.validation_report && (
              <>
                <h3>Rapport complet</h3>
                <pre>{JSON.stringify(monster.validation_report, null, 2)}</pre>
              </>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-tab">
            <h2>Historique des Transitions</h2>
            {history && history.length > 0 ? (
              <div className="history-list">
                {history.map((entry, idx) => (
                  <div key={idx} className="history-item">
                    <div className="history-transition">
                      <span className="from-state">{entry.from_state}</span>
                      <span className="arrow">→</span>
                      <span className="to-state">{entry.to_state}</span>
                    </div>
                    <div className="history-details">
                      <span>{entry.actor || 'System'}</span>
                      <span>
                        {new Date(entry.timestamp).toLocaleString('fr-FR')}
                      </span>
                      {entry.note && <span className="note">{entry.note}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucun historique disponible</p>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewForm && (
        <div className="modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Review du Monstre</h2>
            <div className="form-group">
              <label>Action</label>
              <select
                value={reviewAction}
                onChange={(e) => setReviewAction(e.target.value)}
              >
                <option value="approve">Approuver</option>
                <option value="reject">Rejeter</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes (optionnel)</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Entrez vos notes..."
                rows={5}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={() => setShowReviewForm(false)}
              >
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={handleReview}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'En cours...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Correct Modal */}
      {showCorrectForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowCorrectForm(false)}
        >
          <div className="modal large" onClick={(e) => e.stopPropagation()}>
            <h2>Corriger le Monstre</h2>
            <div className="form-group">
              <label>Données Corrigées (JSON)</label>
              <textarea
                value={correctedData}
                onChange={(e) => setCorrectedData(e.target.value)}
                rows={15}
                className="json-editor"
              />
            </div>
            <div className="form-group">
              <label>Notes (optionnel)</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Entrez vos notes de correction..."
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-danger"
                onClick={() => setShowCorrectForm(false)}
              >
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={handleCorrect}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'En cours...' : 'Corriger'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMonsterDetail;
