import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import BooksPage from "./pages/BooksPage.jsx";
import CreateBookPage from "./pages/CreateBookPage.jsx";
import EditBookPage from "./pages/EditBookPage.jsx";
import BookDetailsPage from "./pages/BookDetailsPage.jsx";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Navigate to="/books" replace />} />
                  <Route path="/books" element={<BooksPage />} />
                  <Route path="/books/new" element={<CreateBookPage />} />
                  <Route path="/books/:id" element={<BookDetailsPage />} />
                  <Route path="/books/:id/edit" element={<EditBookPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/books" replace />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
