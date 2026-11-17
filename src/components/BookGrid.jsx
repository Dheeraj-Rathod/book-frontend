import BookCard from "./BookCard.jsx";

export default function BookGrid({ books = [], onEdit, onDelete }) {
  return (
    <div className="book-grid" role="region" aria-label="Books list">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
