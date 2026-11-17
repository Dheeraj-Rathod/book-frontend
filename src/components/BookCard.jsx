import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookIcon,
  CalendarIcon,
  HashIcon,
  EditIcon,
  TrashIcon,
  UserIcon
} from "./icons.jsx";

export default function BookCard({ book, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false);

  const { id, title, author, isbn, published_year, cover_image_url } = book;

  return (
    <article className="book-card" aria-labelledby={`book-card-title-${id}`}>
      <div className="book-card-cover-wrap">
        <Link
          to={`/books/${id}`}
          className="book-card-cover-link"
          tabIndex={-1}
          aria-hidden="true"
        >
          {cover_image_url && !imgError ? (
            <img
              src={cover_image_url}
              alt={`Cover of ${title}`}
              className="book-card-cover-img"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="book-card-placeholder">
              <BookIcon size={44} className="placeholder-book-icon" />
              <span className="placeholder-text">{title}</span>
            </div>
          )}
        </Link>
      </div>

      <div className="book-card-body">
        <div className="book-card-header">
          <h3 id={`book-card-title-${id}`} className="book-card-title">
            <Link to={`/books/${id}`} className="book-title-link">
              {title}
            </Link>
          </h3>
          <p className="book-card-author">
            <UserIcon size={14} className="inline-icon" />
            <span>{author}</span>
          </p>
        </div>

        <div className="book-card-meta">
          {published_year ? (
            <span className="meta-badge" title="Published Year">
              <CalendarIcon size={13} className="meta-icon" />
              {published_year}
            </span>
          ) : null}

          {isbn ? (
            <span className="meta-badge" title={`ISBN: ${isbn}`}>
              <HashIcon size={13} className="meta-icon" />
              {isbn}
            </span>
          ) : null}
        </div>

        <div className="book-card-actions">
          <Link
            to={`/books/${id}`}
            className="btn btn-sm btn-outline"
            aria-label={`View details for ${title}`}
          >
            Details
          </Link>

          <Link
            to={`/books/${id}/edit`}
            className="btn btn-sm btn-outline"
            aria-label={`Edit ${title}`}
            onClick={(e) => {
              if (onEdit) {
                e.preventDefault();
                onEdit(book);
              }
            }}
          >
            <EditIcon size={14} />
            Edit
          </Link>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete && onDelete(book)}
            aria-label={`Delete ${title}`}
          >
            <TrashIcon size={14} />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
