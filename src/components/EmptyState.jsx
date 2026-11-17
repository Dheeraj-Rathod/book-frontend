import { BookOpenIcon } from "./icons.jsx";

export default function EmptyState({
  icon: Icon = BookOpenIcon,
  title = "No books found",
  description = "Get started by adding your first book to your library.",
  actionLabel,
  onAction,
  className = ""
}) {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon-wrap" aria-hidden="true">
        <Icon size={44} className="empty-state-icon" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="btn btn-primary empty-state-btn"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
