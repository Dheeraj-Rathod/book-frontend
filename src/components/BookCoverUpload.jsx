import { useState, useRef } from "react";
import { api } from "../api/client.js";
import { useToast } from "../context/useToast.js";
import ConfirmDialog from "./ConfirmDialog.jsx";
import {
  UploadIcon,
  TrashIcon,
  ImageIcon,
  SpinnerIcon,
  CloseIcon
} from "./icons.jsx";

export default function BookCoverUpload({
  bookId,
  currentCoverUrl,
  onCoverUpdated,
  disabled = false
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFileChange = (file) => {
    if (!file) return;

    // Validate that it's an image
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP, or SVG).");
      return;
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size exceeds 5MB limit. Please choose a smaller image.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading || deleting) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !uploading && !deleting) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !bookId) return;

    try {
      setUploading(true);
      setError(null);
      const updatedBook = await api.books.uploadCover(bookId, selectedFile);
      toast.success("Cover image uploaded successfully!");
      const newUrl = updatedBook?.cover_image_url || previewUrl;
      clearSelection();
      if (onCoverUpdated) {
        onCoverUpdated(newUrl, updatedBook);
      }
    } catch (err) {
      const msg = err.message || "Failed to upload cover image.";
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCover = async () => {
    if (!bookId) return;

    try {
      setDeleting(true);
      setError(null);
      await api.books.deleteCover(bookId);
      toast.success("Cover image removed successfully.");
      clearSelection();
      setShowDeleteConfirm(false);
      if (onCoverUpdated) {
        onCoverUpdated(null);
      }
    } catch (err) {
      const msg = err.message || "Failed to remove cover image.";
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const displayUrl = previewUrl || currentCoverUrl;

  return (
    <div className="book-cover-upload-section">
      <h3 className="section-subtitle">Book Cover</h3>

      {error && (
        <div className="alert alert-danger" role="alert">
          <span>{error}</span>
        </div>
      )}

      <div className="cover-upload-layout">
        <div className="cover-preview-box">
          {displayUrl ? (
            <div className="cover-preview-image-wrap">
              <img
                src={displayUrl}
                alt="Book cover preview"
                className="cover-preview-img"
              />
              {previewUrl && (
                <span className="cover-preview-badge">Pending upload</span>
              )}
            </div>
          ) : (
            <div className="cover-preview-placeholder">
              <ImageIcon size={48} className="placeholder-icon" />
              <span>No cover image</span>
            </div>
          )}
        </div>

        <div className="cover-upload-controls">
          <div
            className={`dropzone ${dragOver ? "dropzone-active" : ""} ${
              disabled || uploading || deleting ? "dropzone-disabled" : ""
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => {
              if (!disabled && !uploading && !deleting) {
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={disabled || uploading || deleting ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="Upload book cover image"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              onChange={handleInputChange}
              className="sr-only"
              disabled={disabled || uploading || deleting}
            />
            <UploadIcon size={28} className="dropzone-icon" />
            <p className="dropzone-text">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <p className="dropzone-hint">PNG, JPG, WEBP, or SVG up to 5MB</p>
          </div>

          {selectedFile && (
            <div className="selected-file-bar">
              <span className="file-name" title={selectedFile.name}>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
              </span>
              <div className="file-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleUpload}
                  disabled={uploading || disabled}
                >
                  {uploading ? <SpinnerIcon size={14} /> : <UploadIcon size={14} />}
                  Upload Cover
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={clearSelection}
                  disabled={uploading}
                  aria-label="Cancel selection"
                >
                  <CloseIcon size={16} />
                </button>
              </div>
            </div>
          )}

          {!selectedFile && currentCoverUrl && (
            <div className="existing-cover-actions">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting || disabled}
              >
                <TrashIcon size={14} />
                Remove Cover Image
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Remove Cover Image"
        message="Are you sure you want to remove the cover image for this book? This action cannot be undone."
        confirmText="Remove Cover"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleDeleteCover}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
