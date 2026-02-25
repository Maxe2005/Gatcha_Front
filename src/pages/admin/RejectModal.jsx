import React from 'react';

const RejectModal = ({
  open,
  onClose,
  reviewNotes,
  setReviewNotes,
  isActionLoading,
  onConfirm,
}) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Rejeter le Monstre</h2>
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
          <button className="btn-danger" onClick={onClose}>
            Annuler
          </button>
          <button
            className="btn-primary"
            onClick={onConfirm}
            disabled={isActionLoading}
          >
            {isActionLoading ? 'En cours...' : 'Rejeter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
