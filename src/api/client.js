const API_BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  (typeof process !== "undefined" &&
    process.env &&
    process.env.VITE_API_BASE_URL) ||
  "http://localhost:3000/api/v1";

const memoryStore = {};

function getStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (key) => memoryStore[key] ?? null,
    setItem: (key, val) => {
      memoryStore[key] = String(val);
    },
    removeItem: (key) => {
      delete memoryStore[key];
    }
  };
}

export function getToken() {
  return getStorage().getItem("token");
}

export function setToken(token) {
  if (token) {
    getStorage().setItem("token", token);
  } else {
    getStorage().removeItem("token");
  }
}

export function clearToken() {
  getStorage().removeItem("token");
}

function extractErrorMessage(data, fallback = "Request failed") {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.error && typeof data.error === "string") return data.error;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.join(", ");
  }
  if (data.errors && typeof data.errors === "object") {
    return Object.entries(data.errors)
      .map(([field, msgs]) => {
        const text = Array.isArray(msgs) ? msgs.join(", ") : msgs;
        return `${field} ${text}`;
      })
      .join(", ");
  }
  if (data.message && typeof data.message === "string") return data.message;
  if (data.exception && typeof data.exception === "string") {
    return data.exception.replace(/^#<[^:]+:\s*/, "").replace(/>$/, "");
  }
  return fallback;
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  let body = options.body;
  if (body && !isFormData && typeof body === "object") {
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body
  });

  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      const pathname = window.location.pathname;
      if (pathname !== "/login" && pathname !== "/register") {
        window.location.href = "/login";
      }
    }
    const errData = await response.json().catch(() => null);
    const message = extractErrorMessage(errData, "Unauthorized. Please log in again.");
    const err = new Error(message);
    err.status = 401;
    throw err;
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = extractErrorMessage(
      data,
      `Request failed with status ${response.status}`
    );
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    register: (userData) =>
      apiRequest("/auth/register", {
        method: "POST",
        body: { user: userData }
      }),
    login: (userData) =>
      apiRequest("/auth/login", {
        method: "POST",
        body: { user: userData }
      }),
    me: () =>
      apiRequest("/auth/me", {
        method: "GET"
      })
  },
  books: {
    list: () =>
      apiRequest("/books", {
        method: "GET"
      }),
    get: (id) =>
      apiRequest(`/books/${id}`, {
        method: "GET"
      }),
    create: (bookData) =>
      apiRequest("/books", {
        method: "POST",
        body: { book: bookData }
      }),
    update: (id, bookData) =>
      apiRequest(`/books/${id}`, {
        method: "PATCH",
        body: { book: bookData }
      }),
    delete: (id) =>
      apiRequest(`/books/${id}`, {
        method: "DELETE"
      }),
    uploadCover: (id, file) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest(`/books/${id}/cover_image`, {
        method: "POST",
        body: formData
      });
    },
    deleteCover: (id) =>
      apiRequest(`/books/${id}/cover_image`, {
        method: "DELETE"
      })
  }
};

export default api;
