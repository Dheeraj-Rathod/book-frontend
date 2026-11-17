import { useEffect, useRef } from "react";
import { SpinnerIcon } from "./icons.jsx";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  loading = false,
  onConfirm,
  onCancel
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancelEvent = (e) => {
      e.preventDefault();
      if (!loading && onCancel) {
        onCancel();
      }
    };

    // Close on backdrop click (outside bounding box)
    let pressedOutside = false;
    const isOutside = (e) => {
      const rect = dialog.getBoundingClientRect();
      return (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      );
    };

    const handlePointerDown = (e) => {
      pressedOutside = isOutside(e);
    };

    const handlePointerUp = (e) => {
      if (pressedOutside && isOutside(e)) {
        if (!loading && onCancel) {
          onCancel();
        }
      }
    };

    dialog.addEventListener("cancel", handleCancelEvent);
    dialog.addEventListener("pointerdown", handlePointerDown);
    dialog.addEventListener("pointerup", handlePointerUp);

    return () => {
      dialog.removeEventListener("cancel", handleCancelEvent);
      dialog.removeEventListener("pointerdown", handlePointerDown);
      dialog.removeEventListener("pointerup", handlePointerUp);
    };
  }, [loading, onCancel]);

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className="dialog-content">
        <h2 id="confirm-dialog-title" className="dialog-title">
          {title}
        </h2>
        <p id="confirm-dialog-desc" className="dialog-message">
          {message}
        </p>

        <div className="dialog-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
            autoFocus
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn btn-${confirmVariant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <SpinnerIcon size={16} />}
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
}
