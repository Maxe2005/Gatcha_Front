// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const RejectModal = ({
  open,
  onClose,
  reviewNotes,
  setReviewNotes,
  isActionLoading,
  onConfirm,
}) => {
  const modalRef = useRef(null);

  useFocusTrap(open, modalRef);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="reject-modal-title">Rejeter le Monstre</h2>
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
