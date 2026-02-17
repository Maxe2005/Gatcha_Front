import React from 'react';

const CorrectModal = ({
  open,
  onClose,
  correctedData,
  setCorrectedData,
  reviewNotes,
  setReviewNotes,
  isActionLoading,
  onConfirm,
}) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
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
          <button className="btn-danger" onClick={onClose}>
            Annuler
          </button>
          <button
            className="btn-primary"
            onClick={onConfirm}
            disabled={isActionLoading}
          >
            {isActionLoading ? 'En cours...' : 'Corriger'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorrectModal;
