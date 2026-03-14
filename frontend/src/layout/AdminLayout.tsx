import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const base = "px-4 py-2 text-sm font-medium rounded-md transition";
  const active = "bg-purple-800 text-white";
  const inactive = "text-gray-600 hover:bg-gray-100";

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="p-6">
      <div className="tab-area mb-4 flex justify-between items-center">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-md w-fit">
          <button
            onClick={() => navigate("/dashboard")}
            className={`${base} ${location.pathname === "/dashboard" ? active : inactive
              }`}
          >
            Dashboard
          </button>
          <button
            disabled={user?.role === "artist"}
            onClick={() => navigate("/artist")}
            className={`${base} ${location.pathname === "/artist" ? active : inactive
              }`}
          >
            Artist
          </button>

          <button
            disabled={user?.role === "artist" || user?.role === "artist_manager"}
            onClick={() => navigate("/users")}
            className={`${base} ${location.pathname === "/users" ? active : inactive
              }`}
          >
            Users
          </button>
        </div>
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-700 font-bold rounded-full border-2 border-white shadow-sm hover:ring-2 hover:ring-purple-300 transition-all cursor-pointer uppercase"
          >
            {user?.first_name?.[0] || 'U'}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-2 border-b border-gray-50">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user ? `${user.first_name} ${user.last_name}` : 'Guest User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'No email'}</p>
              </div>

              <button
                onClick={() => { setIsProfileOpen(false); navigate("/profile"); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default AdminLayout;