import { useState, useCallback } from "react";
import { CheckIcon, AlertCircleIcon, CloseIcon } from "../components/icons.jsx";
import { ToastContext } from "./toastContextInstance.js";

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (msg, duration) => addToast(msg, "success", duration),
    [addToast]
  );
  const error = useCallback(
    (msg, duration) => addToast(msg, "error", duration),
    [addToast]
  );
  const info = useCallback(
    (msg, duration) => addToast(msg, "info", duration),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-item toast-${toast.type}`}
            role="status"
          >
            <span className="toast-icon">
              {toast.type === "success" && <CheckIcon size={18} />}
              {toast.type === "error" && <AlertCircleIcon size={18} />}
              {toast.type === "info" && <AlertCircleIcon size={18} />}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export { ToastProvider };
