import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../context/useToast.js";
import BookForm from "../components/BookForm.jsx";
import BookCoverUpload from "../components/BookCoverUpload.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { ArrowLeftIcon } from "../components/icons.jsx";

export default function EditBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.books.get(id);
      setBook(data);
    } catch (err) {
      setError(err.message || "Failed to load book.");
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
          setError(err.message || "Failed to load book.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSubmit = async (updatedFields) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await api.books.update(id, updatedFields);
      setBook(updated);
      toast.success("Book details updated successfully!");
      navigate(`/books/${id}`);
    } catch (err) {
      setError(err.message || "Failed to update book.");
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpdated = (newCoverUrl, updatedBook) => {
    if (updatedBook) {
      setBook(updatedBook);
    } else {
      setBook((prev) => (prev ? { ...prev, cover_image_url: newCoverUrl } : null));
    }
  };

  if (loading) {
    return (
      <div className="page-container page-container-narrow">
        <LoadingState type="spinner" message="Loading book details..." />
      </div>
    );
  }

  if (!book && error) {
    return (
      <div className="page-container page-container-narrow">
        <ErrorMessage message={error} onRetry={fetchBook} />
        <Link to="/books" className="btn btn-secondary mt-4">
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container page-container-narrow">
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <Link to={`/books/${id}`} className="back-link">
          <ArrowLeftIcon size={16} />
          <span>Back to Book Details</span>
        </Link>
      </nav>

      <section className="form-card">
        <header className="form-header">
          <h1 className="form-title">Edit Book</h1>
          <p className="form-subtitle">Update information for "{book?.title}"</p>
        </header>

        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            className="mb-4"
          />
        )}

        <BookForm
          key={book?.id}
          initialData={book}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/books/${id}`)}
          submitLabel="Save Changes"
          loading={saving}
        />

        <hr className="divider" />

        <BookCoverUpload
          bookId={id}
          currentCoverUrl={book?.cover_image_url}
          onCoverUpdated={handleCoverUpdated}
          disabled={saving}
        />
      </section>
    </div>
  );
}
