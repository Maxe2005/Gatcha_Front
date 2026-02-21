import React, { useEffect, useState } from 'react';
import { adminApiService } from '../../services/adminService';
import ReviewModal from './ReviewModal';
import CorrectModal from './CorrectModal';
import './MonsterSummaryTab.css';

const MonsterSummaryTab = ({
  monster,
  canApproveReject,
  canCorrect,
  monsterId,
  onMonsterUpdate,
  onActionError,
}) => {
  const [isProcessLoading, setIsProcessLoading] = useState(false);
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

  const handleProcessGenerated = async () => {
    try {
      setIsProcessLoading(true);
      onActionError?.(null);
      await adminApiService.processGeneratedMonster(monsterId);
      // Refresh monster data
      const detail = await adminApiService.getMonsterDetail(monsterId);
      const history = await adminApiService.getMonsterHistory(monsterId);
      onMonsterUpdate?.(detail, history.history || []);
      alert('Vérification du monstre généré effectuée avec succès');
    } catch (err) {
      onActionError?.(
        err.response?.data?.detail ||
          'Erreur lors de la vérification du monstre généré'
      );
      console.error('Error processing generated monster:', err);
    } finally {
      setIsProcessLoading(false);
    }
  };

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

  // Fonction pour copier l'UUID
  const handleCopyUUID = () => {
    if (monster?.metadata?.monster_id) {
      navigator.clipboard.writeText(monster.metadata.monster_id);
      alert('UUID copié dans le presse-papier !');
    }
  };

  return (
    <>
      <div className="summary-tab redesigned">
        <h2 className="summary-title">Résumé du Monstre</h2>
        <div className="summary-content">
          <div className="summary-info">
            <div className="summary-row">
              <div className="summary-label">UUID :</div>
              <div className="summary-value">
                <span className="uuid-value">
                  {monster?.metadata?.monster_id}
                </span>
                <button
                  className="copy-btn"
                  onClick={handleCopyUUID}
                  title="Copier l'UUID"
                >
                  📋
                </button>
              </div>
            </div>
            <div className="summary-row">
              <div className="summary-label">État :</div>
              <div className="summary-value">
                <span
                  className={`state-badge state-${monster?.metadata?.state?.toLowerCase()}`}
                >
                  {monster?.metadata?.state}
                </span>
              </div>
            </div>
            <div className="summary-row">
              <div className="summary-label">Créé le :</div>
              <div className="summary-value">
                {monster?.metadata?.created_at &&
                  new Date(monster?.metadata?.created_at).toLocaleString(
                    'fr-FR'
                  )}
              </div>
            </div>
            <div className="summary-row">
              <div className="summary-label">Mis à jour le :</div>
              <div className="summary-value">
                {monster?.metadata?.updated_at &&
                  new Date(monster?.metadata?.updated_at).toLocaleString(
                    'fr-FR'
                  )}
              </div>
            </div>
            <div className="summary-row">
              <div className="summary-label">Valide :</div>
              <div className="summary-value">
                <span
                  className={monster?.metadata?.is_valid ? 'valid' : 'invalid'}
                >
                  {monster?.metadata?.is_valid ? 'Oui' : 'Non'}
                </span>
              </div>
            </div>
            {monster?.metadata?.reviewed_by && (
              <>
                <div className="summary-row">
                  <div className="summary-label">Révisé par :</div>
                  <div className="summary-value">
                    {monster.metadata.reviewed_by}
                  </div>
                </div>
                <div className="summary-row">
                  <div className="summary-label">Date de révision :</div>
                  <div className="summary-value">
                    {monster.metadata.review_date &&
                      new Date(monster.metadata.review_date).toLocaleString(
                        'fr-FR'
                      )}
                  </div>
                </div>
              </>
            )}
            {monster?.metadata?.review_notes && (
              <div className="summary-row full-width">
                <div className="summary-label">Notes de révision :</div>
                <div className="summary-value notes-value">
                  {monster.metadata.review_notes}
                </div>
              </div>
            )}
          </div>
          {monster?.image_url && (
            <div className="summary-image">
              <img
                src={monster.image_url}
                alt="Monster"
                className="monster-image"
              />
            </div>
          )}
        </div>
        <div className="summary-actions">
          {monster?.metadata?.state === 'GENERATED' && (
            <button
              className="btn-secondary"
              onClick={handleProcessGenerated}
              disabled={isProcessLoading}
            >
              {isProcessLoading
                ? 'Vérification en cours...'
                : 'Vérifier le monstre'}
            </button>
          )}
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
