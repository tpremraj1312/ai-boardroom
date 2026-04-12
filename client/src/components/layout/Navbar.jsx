import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-board-border shadow-minimal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-board-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <span className="text-white font-semibold text-sm leading-none">
                  AI
                </span>
              </div>
              <span className="font-semibold text-lg tracking-tight text-board-heading">
                Boardroom
              </span>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/sessions"
                  className="text-sm font-medium text-board-textSecondary hover:text-board-heading transition-colors px-3 py-1.5 rounded-md hover:bg-board-bgSecondary"
                >
                  Dashboard
                </Link>

                <div className="h-5 w-px bg-board-border"></div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-medium text-board-heading leading-tight">
                      {user?.name}
                    </span>
                    <span className="text-[11px] text-board-textSecondary capitalize">
                      {user?.plan} Plan
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-board-border flex items-center justify-center text-board-primary text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <svg
                      className="w-4 h-4 mr-1.5 opacity-70"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-board-textSecondary hover:text-board-heading transition-colors"
                >
                  Login
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
