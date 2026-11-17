import { SpinnerIcon } from "./icons.jsx";

export default function LoadingState({
  type = "grid",
  count = 6,
  message = "Loading..."
}) {
  if (type === "spinner") {
    return (
      <div className="loading-spinner-container" role="status" aria-live="polite">
        <SpinnerIcon size={32} className="spinner-large" />
        <span className="loading-text">{message}</span>
      </div>
    );
  }

  if (type === "details") {
    return (
      <div className="skeleton-details" role="status" aria-busy="true" aria-label="Loading book details">
        <div className="skeleton skeleton-cover"></div>
        <div className="skeleton-details-content">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-subtitle"></div>
          <div className="skeleton-meta-row">
            <div className="skeleton skeleton-badge"></div>
            <div className="skeleton skeleton-badge"></div>
          </div>
          <div className="skeleton skeleton-paragraph"></div>
          <div className="skeleton skeleton-paragraph"></div>
        </div>
      </div>
    );
  }

  // Default "grid" skeleton
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div
      className="book-grid skeleton-grid"
      role="status"
      aria-busy="true"
      aria-label="Loading books"
    >
      {items.map((i) => (
        <div key={i} className="book-card skeleton-card">
          <div className="skeleton skeleton-card-image"></div>
          <div className="skeleton-card-body">
            <div className="skeleton skeleton-card-title"></div>
            <div className="skeleton skeleton-card-author"></div>
            <div className="skeleton skeleton-card-badges"></div>
            <div className="skeleton skeleton-card-actions"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
