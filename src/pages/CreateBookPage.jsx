import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../context/useToast.js";
import BookForm from "../components/BookForm.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import { ArrowLeftIcon } from "../components/icons.jsx";

export default function CreateBookPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (bookData) => {
    try {
      setLoading(true);
      setError(null);
      const newBook = await api.books.create(bookData);
      toast.success(`"${newBook.title}" created successfully!`);
      // Redirect to the new book details page so they can view it or upload a cover
      navigate(`/books/${newBook.id}`);
    } catch (err) {
      setError(err.message || "Failed to create book. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container page-container-narrow">
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <Link to="/books" className="back-link">
          <ArrowLeftIcon size={16} />
          <span>Back to Library</span>
        </Link>
      </nav>

      <section className="form-card">
        <header className="form-header">
          <h1 className="form-title">Add New Book</h1>
          <p className="form-subtitle">
            Enter the details below to add a book to your personal collection.
          </p>
        </header>

        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            className="mb-4"
          />
        )}

        <BookForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/books")}
          submitLabel="Create Book"
          loading={loading}
        />
      </section>
    </div>
  );
}
