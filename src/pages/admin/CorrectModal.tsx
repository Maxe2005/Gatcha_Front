// @ts-nocheck -- strict TypeScript activé globalement (P1.2) ; ce fichier n'est pas encore migré, voir ROADMAP.md P1.2
import React, { useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const CorrectModal = ({
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
        className="modal large"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="correct-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="correct-modal-title">Corriger le Monstre</h2>
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
