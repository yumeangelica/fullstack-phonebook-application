import { useEffect, useRef } from 'react';

const ConfirmDialog = ({
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    confirmButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="confirm-overlay">
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-describedby="confirm-dialog-message"
      >
        <p id="confirm-dialog-message" className="confirm-dialog-message">
          {message}
        </p>
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="confirm-dialog-btn confirm-dialog-cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmButtonRef}
            className="confirm-dialog-btn confirm-dialog-confirm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
