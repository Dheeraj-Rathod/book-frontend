import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/useAuth.js";
import { useToast } from "../context/useToast.js";
import BookGrid from "../components/BookGrid.jsx";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import {
  PlusIcon,
  SearchIcon,
  CloseIcon,
  BookOpenIcon
} from "../components/icons.jsx";

export default function BooksPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created_desc");

  // Delete dialog state
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.books.list();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api.books
      .list()
      .then((data) => {
        if (isMounted) {
          setBooks(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load books. Please try again.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEditBook = (book) => {
    navigate(`/books/${book.id}/edit`);
  };

  const handleDeletePrompt = (book) => {
    setBookToDelete(book);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;

    try {
      setDeleting(true);
      await api.books.delete(bookToDelete.id);
      setBooks((prev) => prev.filter((b) => b.id !== bookToDelete.id));
      toast.success(`"${bookToDelete.title}" was deleted.`);
      setBookToDelete(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete book.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered & Sorted books
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Filter by search query (title, author, or ISBN)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.isbn?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "title_asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title_desc":
          return (b.title || "").localeCompare(a.title || "");
        case "author_asc":
          return (a.author || "").localeCompare(b.author || "");
        case "author_desc":
          return (b.author || "").localeCompare(a.author || "");
        case "year_desc":
          return (b.published_year || 0) - (a.published_year || 0);
        case "year_asc":
          return (a.published_year || 0) - (b.published_year || 0);
        case "created_asc":
          return (a.id || 0) - (b.id || 0);
        case "created_desc":
        default:
          return (b.id || 0) - (a.id || 0);
      }
    });

    return result;
  }, [books, searchQuery, sortBy]);

  const totalBookCount = books.length;
  const filteredCount = filteredAndSortedBooks.length;

  return (
    <div className="page-container">
      {/* Header Banner */}
      <section className="dashboard-header">
        <div className="dashboard-title-group">
          <div className="title-row">
            <h1 className="page-title">My Library</h1>
            <span className="badge badge-count" title="Total books in library">
              {totalBookCount} {totalBookCount === 1 ? "book" : "books"}
            </span>
          </div>
          <p className="page-description">
            {user?.email ? `Welcome back, ${user.email}. ` : ""}
            Manage, organize, and explore your book collection.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <Link to="/books/new" className="btn btn-primary">
            <PlusIcon size={18} />
            <span>Add Book</span>
          </Link>
        </div>
      </section>

      {/* Search and Sort Toolbar */}
      <section className="toolbar-section" aria-label="Book filters and controls">
        <div className="search-box">
          <label htmlFor="books-search-input" className="sr-only">
            Search books
          </label>
          <SearchIcon size={18} className="search-icon" />
          <input
            id="books-search-input"
            type="search"
            className="search-input"
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        <div className="filter-controls">
          <label htmlFor="books-sort-select" className="filter-label">
            Sort by:
          </label>
          <select
            id="books-sort-select"
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="created_desc">Recently Added</option>
            <option value="created_asc">Oldest Added</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="author_asc">Author (A-Z)</option>
            <option value="author_desc">Author (Z-A)</option>
            <option value="year_desc">Year (Newest)</option>
            <option value="year_asc">Year (Oldest)</option>
          </select>
        </div>
      </section>

      {/* Search results active indicator */}
      {searchQuery.trim() && (
        <div className="search-feedback-bar">
          <span>
            Found <strong>{filteredCount}</strong> {filteredCount === 1 ? "book" : "books"} matching "
            <em>{searchQuery}</em>"
          </span>
          <button
            type="button"
            className="btn-link"
            onClick={() => setSearchQuery("")}
          >
            Reset search
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchBooks}
          onDismiss={() => setError(null)}
          className="my-4"
        />
      )}

      {/* Main Content Area */}
      {loading ? (
        <LoadingState type="grid" count={6} />
      ) : totalBookCount === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title="Your library is currently empty"
          description="You haven't added any books yet. Start building your collection right now!"
          actionLabel="Add Your First Book"
          onAction={() => navigate("/books/new")}
        />
      ) : filteredCount === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No matching books found"
          description={`No books matched your search for "${searchQuery}". Try a different search term or reset filters.`}
          actionLabel="Clear Search Filter"
          onAction={() => setSearchQuery("")}
        />
      ) : (
        <BookGrid
          books={filteredAndSortedBooks}
          onEdit={handleEditBook}
          onDelete={handleDeletePrompt}
        />
      )}

      {/* Delete Book Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(bookToDelete)}
        title="Delete Book"
        message={
          bookToDelete
            ? `Are you sure you want to delete "${bookToDelete.title}"? This will permanently remove the book and any associated cover image.`
            : ""
        }
        confirmText="Delete Book"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setBookToDelete(null)}
      />
    </div>
  );
}
