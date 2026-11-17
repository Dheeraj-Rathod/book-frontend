import { AlertCircleIcon, CloseIcon } from "./icons.jsx";

export default function ErrorMessage({ message, onRetry, onDismiss, className = "" }) {
  if (!message) return null;

  return (
    <div className={`error-banner ${className}`} role="alert" aria-live="assertive">
      <div className="error-banner-content">
        <AlertCircleIcon className="error-banner-icon" size={20} />
        <div className="error-banner-text">
          <p>{message}</p>
        </div>
      </div>
      <div className="error-banner-actions">
        {onRetry && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="btn-icon"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
