import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../context/useToast.js";
import BookCoverUpload from "../components/BookCoverUpload.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import {
  ArrowLeftIcon,
  EditIcon,
  TrashIcon,
  BookIcon,
  CalendarIcon,
  HashIcon,
  UserIcon
} from "../components/icons.jsx";

export default function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [coverImgError, setCoverImgError] = useState(false);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null);
      setCoverImgError(false);
      const data = await api.books.get(id);
      setBook(data);
    } catch (err) {
      setError(err.message || "Failed to load book details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api.books
      .get(id)
      .then((data) => {
        if (isMounted) {
          setBook(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load book details.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.books.delete(id);
      toast.success(`"${book?.title}" deleted successfully.`);
      navigate("/books", { replace: true });
    } catch (err) {
      toast.error(err.message || "Failed to delete book.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCoverUpdated = (newCoverUrl, updatedBook) => {
    setCoverImgError(false);
    if (updatedBook) {
      setBook(updatedBook);
    } else {
      setBook((prev) => (prev ? { ...prev, cover_image_url: newCoverUrl } : null));
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingState type="details" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="page-container">
        <ErrorMessage
          message={error || "Book not found"}
          onRetry={fetchBook}
        />
        <div className="mt-4">
          <Link to="/books" className="btn btn-secondary">
            <ArrowLeftIcon size={16} />
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const formattedCreated = book.created_at
    ? new Date(book.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : null;

  const formattedUpdated = book.updated_at
    ? new Date(book.updated_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : null;

  return (
    <div className="page-container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <Link to="/books" className="back-link">
          <ArrowLeftIcon size={16} />
          <span>Back to Library</span>
        </Link>
      </nav>

      {/* Main Details Grid */}
      <div className="book-details-layout">
        {/* Left Column: Cover & Upload */}
        <div className="book-details-sidebar">
          <div className="book-details-cover-container">
            {book.cover_image_url && !coverImgError ? (
              <img
                src={book.cover_image_url}
                alt={`Cover of ${book.title}`}
                className="book-details-cover-img"
                onError={() => setCoverImgError(true)}
              />
            ) : (
              <div className="book-details-cover-placeholder">
                <BookIcon size={64} className="placeholder-icon" />
                <span className="placeholder-title">{book.title}</span>
                <span className="placeholder-author">{book.author}</span>
              </div>
            )}
          </div>

          <div className="book-details-cover-manager">
            <BookCoverUpload
              bookId={book.id}
              currentCoverUrl={book.cover_image_url}
              onCoverUpdated={handleCoverUpdated}
            />
          </div>
        </div>

        {/* Right Column: Book Info & Actions */}
        <div className="book-details-content">
          <div className="details-header-row">
            <div>
              <h1 className="details-title">{book.title}</h1>
              <p className="details-author">
                <UserIcon size={18} className="inline-icon" />
                <span>By {book.author}</span>
              </p>
            </div>

            <div className="details-action-buttons">
              <Link
                to={`/books/${book.id}/edit`}
                className="btn btn-outline"
                aria-label={`Edit ${book.title}`}
              >
                <EditIcon size={16} />
                <span>Edit</span>
              </Link>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label={`Delete ${book.title}`}
              >
                <TrashIcon size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Badges / Metadata row */}
          <div className="details-meta-row">
            {book.published_year ? (
              <span className="meta-badge-large" title="Published Year">
                <CalendarIcon size={16} className="meta-icon" />
                <span>Published in {book.published_year}</span>
              </span>
            ) : null}

            {book.isbn ? (
              <span className="meta-badge-large" title="ISBN">
                <HashIcon size={16} className="meta-icon" />
                <span>ISBN: {book.isbn}</span>
              </span>
            ) : null}
          </div>

          {/* Description Section */}
          <section className="details-section" aria-labelledby="desc-heading">
            <h2 id="desc-heading" className="details-section-heading">
              About This Book
            </h2>
            {book.description ? (
              <div className="details-description">
                <p>{book.description}</p>
              </div>
            ) : (
              <p className="text-muted italic">
                No description has been provided for this book yet. Click "Edit" to add one.
              </p>
            )}
          </section>

          {/* Timestamps */}
          <div className="details-timestamps">
            {formattedCreated && (
              <span>Added to library on {formattedCreated}</span>
            )}
            {formattedUpdated && formattedUpdated !== formattedCreated && (
              <span>Last updated on {formattedUpdated}</span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Book Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Book"
        message={`Are you sure you want to delete "${book.title}"? This will permanently remove the book and any associated cover image.`}
        confirmText="Delete Book"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
