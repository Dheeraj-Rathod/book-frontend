import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import {
  BookOpenIcon,
  PlusIcon,
  LogOutIcon,
  UserIcon,
  CloseIcon
} from "./icons.jsx";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/books" className="brand-link" onClick={closeMobileMenu}>
            <div className="brand-icon-wrap" aria-hidden="true">
              <BookOpenIcon size={22} className="brand-icon" />
            </div>
            <span className="brand-text">BookShelf</span>
          </Link>
        </div>

        {isAuthenticated && (
          <>
            <button
              type="button"
              className="navbar-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="navbar-menu"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <CloseIcon size={22} />
              ) : (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>

            <nav
              id="navbar-menu"
              className={`navbar-nav ${mobileMenuOpen ? "nav-open" : ""}`}
              aria-label="Main navigation"
            >
              <div className="nav-links">
                <NavLink
                  to="/books"
                  end
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "nav-link-active" : ""}`
                  }
                  onClick={closeMobileMenu}
                >
                  Books
                </NavLink>

                <Link
                  to="/books/new"
                  className="btn btn-primary btn-sm nav-cta"
                  onClick={closeMobileMenu}
                >
                  <PlusIcon size={16} />
                  Add Book
                </Link>
              </div>

              <div className="nav-user-section">
                {user?.email && (
                  <div className="user-badge" title={`Signed in as ${user.email}`}>
                    <UserIcon size={15} className="user-badge-icon" />
                    <span className="user-email">{user.email}</span>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-outline btn-sm logout-btn"
                  onClick={handleLogout}
                  title="Log out of your account"
                >
                  <LogOutIcon size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
