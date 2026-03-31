import React, { useEffect, useState } from 'react';
import { adminApiService } from '../../../../services/adminService';
import { useAuth } from '../../../../context/AuthContext';
import ReviewModal from '../../ReviewModal';
import CorrectModal from '../../CorrectModal';
import RejectModal from '../../RejectModal';
import './MonsterSummaryTab.css';

const MonsterSummaryTab = ({
  monster,
  canApproveReject,
  canCorrect,
  monsterId,
  onMonsterUpdate,
  onActionError,
}) => {
  const { user } = useAuth();
  const [isProcessLoading, setIsProcessLoading] = useState(false);
  const [isTransmitLoading, setIsTransmitLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [correctNotes, setCorrectNotes] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showCorrectForm, setShowCorrectForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    setReviewNotes('');
    setCorrectNotes('');
    setRejectNotes('');
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
        user?.username || 'Admin',
        reviewNotes || null
      );
      // Refresh monster data
      const detail = await adminApiService.getMonsterDetail(monsterId);
      const history = await adminApiService.getMonsterHistory(monsterId);
      onMonsterUpdate?.(detail, history.history || []);
      setShowReviewForm(false);
      setReviewNotes('');
      alert('Monstre approuve avec succes');
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
      await adminApiService.correctMonster(
        monsterId,
        user?.username || 'Admin',
        correctNotes || null
      );
      // Refresh monster data
      const detail = await adminApiService.getMonsterDetail(monsterId);
      const history = await adminApiService.getMonsterHistory(monsterId);
      onMonsterUpdate?.(detail, history.history || []);
      setShowCorrectForm(false);
      setCorrectNotes('');
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

  const handleReject = async () => {
    try {
      setIsActionLoading(true);
      onActionError?.(null);
      await adminApiService.rejectMonster(
        monsterId,
        user?.username || 'Admin',
        rejectNotes || null
      );
      const detail = await adminApiService.getMonsterDetail(monsterId);
      const history = await adminApiService.getMonsterHistory(monsterId);
      onMonsterUpdate?.(detail, history.history || []);
      setShowRejectForm(false);
      setRejectNotes('');
      alert('Monstre rejete avec succes');
    } catch (err) {
      onActionError?.(
        err.response?.data?.detail || 'Erreur lors du rejet du monstre'
      );
      console.error('Error rejecting monster:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTransmitMonster = async () => {
    try {
      setIsTransmitLoading(true);
      onActionError?.(null);
      const result = await adminApiService.transmitMonster(monsterId, false);
      const detail = await adminApiService.getMonsterDetail(monsterId);
      const history = await adminApiService.getMonsterHistory(monsterId);
      onMonsterUpdate?.(detail, history.history || []);
      alert(result?.message || 'Monstre transmis avec succès');
    } catch (err) {
      onActionError?.(
        err.response?.data?.detail ||
          'Erreur lors de la transmission du monstre vers Invocation'
      );
      console.error('Error transmitting monster:', err);
    } finally {
      setIsTransmitLoading(false);
    }
  };

  const handleRetransmitMonster = async () => {
    const confirmRetransmit = window.confirm(
      'Ce monstre est déjà transmis. Voulez-vous forcer la re-transmission vers Invocation ?'
    );

    if (!confirmRetransmit) {
      return;
    }

    try {
      setIsTransmitLoading(true);
      onActionError?.(null);
      const result = await adminApiService.transmitMonster(monsterId, true);
      const detail = await adminApiService.getMonsterDetail(monsterId);
      const history = await adminApiService.getMonsterHistory(monsterId);
      onMonsterUpdate?.(detail, history.history || []);
      alert(result?.message || 'Monstre retransmis avec succès');
    } catch (err) {
      onActionError?.(
        err.response?.data?.detail ||
          'Erreur lors de la re-transmission du monstre vers Invocation'
      );
      console.error('Error retransmitting monster:', err);
    } finally {
      setIsTransmitLoading(false);
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
          {monster?.metadata?.state === 'APPROVED' && (
            <button
              className="btn-secondary"
              onClick={handleTransmitMonster}
              disabled={isTransmitLoading}
            >
              {isTransmitLoading
                ? 'Transmission en cours...'
                : 'Transmettre à Invocation'}
            </button>
          )}
          {monster?.metadata?.state === 'TRANSMITTED' && (
            <button
              className="btn-secondary"
              onClick={handleRetransmitMonster}
              disabled={isTransmitLoading}
            >
              {isTransmitLoading
                ? 'Re-transmission en cours...'
                : 'Re-transmettre à Invocation'}
            </button>
          )}
          {canApproveReject && (
            <button
              className="btn-primary"
              onClick={() => setShowReviewForm(true)}
            >
              Approuver
            </button>
          )}
          {['GENERATED', 'PENDING_REVIEW', 'DEFECTIVE'].includes(
            monster?.metadata?.state
          ) && (
            <button
              className="btn-danger"
              onClick={() => setShowRejectForm(true)}
            >
              Rejeter
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
        reviewNotes={reviewNotes}
        setReviewNotes={setReviewNotes}
        isActionLoading={isActionLoading}
        onConfirm={handleReview}
      />
      <CorrectModal
        open={showCorrectForm}
        onClose={() => setShowCorrectForm(false)}
        reviewNotes={correctNotes}
        setReviewNotes={setCorrectNotes}
        isActionLoading={isActionLoading}
        onConfirm={handleCorrect}
      />
      <RejectModal
        open={showRejectForm}
        onClose={() => setShowRejectForm(false)}
        reviewNotes={rejectNotes}
        setReviewNotes={setRejectNotes}
        isActionLoading={isActionLoading}
        onConfirm={handleReject}
      />
    </>
  );
};

export default MonsterSummaryTab;
