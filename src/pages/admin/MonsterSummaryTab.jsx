import React, { useEffect, useState } from 'react';
import { adminApiService } from '../../services/adminService';
import ReviewModal from './ReviewModal';
import CorrectModal from './CorrectModal';

const MonsterSummaryTab = ({
  monster,
  canApproveReject,
  canCorrect,
  monsterId,
  onMonsterUpdate,
  onActionError,
}) => {
  // États pour les formulaires et modaux
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState('approve');
  const [correctedData, setCorrectedData] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showCorrectForm, setShowCorrectForm] = useState(false);

  useEffect(() => {
    // Met à jour les données corrigées lorsque le monstre change
    setCorrectedData(JSON.stringify(monster?.monster_data || {}, null, 2));
  }, [monster]);

  // Appelé par le modal ReviewModal
  const handleReview = async () => {
    try {
      setIsActionLoading(true);
      onActionError?.(null);
      await adminApiService.reviewMonster(
        monsterId,
        reviewAction,
        reviewNotes || null
      );
      // Refresh monster data
      const detail = await adminApiService.getMonsterDetail(monsterId);
      const history = await adminApiService.getMonsterHistory(monsterId);
      onMonsterUpdate?.(detail, history.history || []);
      setShowReviewForm(false);
      setReviewNotes('');
      alert(`Monstre ${reviewAction} avec succès`);
    } catch (err) {
      onActionError?.(
        err.response?.data?.detail || 'Erreur lors de la révision du monstre'
      );
      console.error('Error reviewing monster:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Appelé par le modal CorrectModal
  const handleCorrect = async () => {
    try {
      setIsActionLoading(true);
      onActionError?.(null);
      let parsedData;
      try {
        parsedData = JSON.parse(correctedData);
      } catch (e) {
        onActionError?.('Données JSON invalides');
        setIsActionLoading(false);
        return;
      }
      await adminApiService.correctMonster(
        monsterId,
        parsedData,
        reviewNotes || null
      );
      // Refresh monster data
      const detail = await adminApiService.getMonsterDetail(monsterId);
      const history = await adminApiService.getMonsterHistory(monsterId);
      onMonsterUpdate?.(detail, history.history || []);
      setShowCorrectForm(false);
      setReviewNotes('');
      alert('Monstre corrigé avec succès');
    } catch (err) {
      onActionError?.(
        err.response?.data?.detail || 'Erreur lors de la correction'
      );
      console.error('Error correcting monster:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <>
      <div className="summary-tab">
        <h2>Informations du Monstre</h2>
        <div className="summary-container">
          <div className="info-section">
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
          </div>
          {monster?.image_url && (
            <div className="image-section">
              <img
                src={monster.image_url}
                alt="Monster"
                className="monster-image"
              />
            </div>
          )}
        </div>
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
      <ReviewModal
        open={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        reviewAction={reviewAction}
        setReviewAction={setReviewAction}
        reviewNotes={reviewNotes}
        setReviewNotes={setReviewNotes}
        isActionLoading={isActionLoading}
        onConfirm={handleReview}
      />
      <CorrectModal
        open={showCorrectForm}
        onClose={() => setShowCorrectForm(false)}
        correctedData={correctedData}
        setCorrectedData={setCorrectedData}
        reviewNotes={reviewNotes}
        setReviewNotes={setReviewNotes}
        isActionLoading={isActionLoading}
        onConfirm={handleCorrect}
      />
    </>
  );
};

export default MonsterSummaryTab;
