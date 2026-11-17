import { useState } from "react";
import { SpinnerIcon } from "./icons.jsx";

const MAX_PUBLISHED_YEAR = new Date().getFullYear() + 10;

export default function BookForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = "Save Book",
  loading = false
}) {
  const [formData, setFormData] = useState(() => ({
    title: initialData.title || "",
    author: initialData.author || "",
    description: initialData.description || "",
    isbn: initialData.isbn || "",
    published_year: initialData.published_year ?? ""
  }));

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (dataToValidate = formData) => {
    const errs = {};
    if (!dataToValidate.title?.trim()) {
      errs.title = "Title is required";
    }

    if (!dataToValidate.author?.trim()) {
      errs.author = "Author is required";
    }

    if (
      dataToValidate.published_year !== "" &&
      dataToValidate.published_year !== null &&
      dataToValidate.published_year !== undefined
    ) {
      const year = Number(dataToValidate.published_year);
      if (isNaN(year) || year < 0 || year > MAX_PUBLISHED_YEAR) {
        errs.published_year = `Please enter a valid year between 0 and ${MAX_PUBLISHED_YEAR}`;
      }
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextData = {
      ...formData,
      [name]: value
    };
    setFormData(nextData);

    if (touched[name]) {
      const validationErrors = validate(nextData);
      setErrors((prev) => ({
        ...prev,
        [name]: validationErrors[name]
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const validationErrors = validate();
    setErrors((prev) => ({
      ...prev,
      [name]: validationErrors[name]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      title: true,
      author: true,
      published_year: true,
      isbn: true,
      description: true
    });

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(`book-${firstErrorField}`)?.focus();
      return;
    }

    const payload = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      description: formData.description.trim() || null,
      isbn: formData.isbn.trim() || null,
      published_year:
        formData.published_year !== "" && formData.published_year !== null
          ? parseInt(formData.published_year, 10)
          : null
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <form className="book-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="book-title" className="form-label required">
          Title
        </label>
        <input
          id="book-title"
          name="title"
          type="text"
          className={`form-input ${touched.title && errors.title ? "input-error" : ""}`}
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. Clean Code"
          required
          autoFocus
          aria-invalid={Boolean(touched.title && errors.title)}
          aria-describedby={touched.title && errors.title ? "book-title-error" : undefined}
          disabled={loading}
        />
        {touched.title && errors.title && (
          <p id="book-title-error" className="field-error" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="book-author" className="form-label required">
          Author
        </label>
        <input
          id="book-author"
          name="author"
          type="text"
          className={`form-input ${touched.author && errors.author ? "input-error" : ""}`}
          value={formData.author}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. Robert C. Martin"
          required
          aria-invalid={Boolean(touched.author && errors.author)}
          aria-describedby={touched.author && errors.author ? "book-author-error" : undefined}
          disabled={loading}
        />
        {touched.author && errors.author && (
          <p id="book-author-error" className="field-error" role="alert">
            {errors.author}
          </p>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="book-published_year" className="form-label">
            Published Year
          </label>
          <input
            id="book-published_year"
            name="published_year"
            type="number"
            min="0"
            max={MAX_PUBLISHED_YEAR}
            className={`form-input ${
              touched.published_year && errors.published_year ? "input-error" : ""
            }`}
            value={formData.published_year}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 2008"
            aria-invalid={Boolean(touched.published_year && errors.published_year)}
            aria-describedby={
              touched.published_year && errors.published_year
                ? "book-published_year-error"
                : undefined
            }
            disabled={loading}
          />
          {touched.published_year && errors.published_year && (
            <p id="book-published_year-error" className="field-error" role="alert">
              {errors.published_year}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="book-isbn" className="form-label">
            ISBN
          </label>
          <input
            id="book-isbn"
            name="isbn"
            type="text"
            className="form-input"
            value={formData.isbn}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. 9780132350884"
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="book-description" className="form-label">
          Description
        </label>
        <textarea
          id="book-description"
          name="description"
          rows={4}
          className="form-textarea"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Brief summary or notes about the book..."
          disabled={loading}
        />
      </div>

      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading && <SpinnerIcon size={16} />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
