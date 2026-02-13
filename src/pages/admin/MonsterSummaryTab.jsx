import React from 'react';

const MonsterSummaryTab = ({
  monster,
  canApproveReject,
  canCorrect,
  setShowReviewForm,
  setShowCorrectForm,
}) => (
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
              {new Date(monster?.metadata?.created_at).toLocaleString('fr-FR')}
            </span>
          </div>
          <div className="info-item">
            <label>Mis à jour le</label>
            <span>
              {new Date(monster?.metadata?.updated_at).toLocaleString('fr-FR')}
            </span>
          </div>
          <div className="info-item">
            <label>Valide</label>
            <span className={monster?.metadata?.is_valid ? 'valid' : 'invalid'}>
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
        <button className="btn-primary" onClick={() => setShowReviewForm(true)}>
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
);

export default MonsterSummaryTab;
