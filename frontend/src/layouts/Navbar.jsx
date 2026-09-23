import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { unreadCount } = useNotification();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-green-700"
        >
          🛒 Kirana Marketplace
        </Link>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">

          {/* Home */}
          <Link
            to="/"
            className="rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-700"
          >
            🏠 Home
          </Link>

          {/* My Orders */}
          <Link
            to="/orders"
            className="rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-700"
          >
            📦 My Orders
          </Link>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-700"
            aria-label="Notifications"
          >
            🔔

            {/* Unread Badge */}
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-700"
          >
            🛒 Cart
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            className="rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-700"
          >
            👤 Profile
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-700"
          >
            ❤️ Wishlist
          </Link>

          {/* Vendor */}
          <Link
            to="/vendor"
            className="rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-700"
          >
            🏪 Vendor
          </Link>

          {/* Admin */}
          <Link
            to="/admin"
            className="rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-700"
          >
            ⚙️ Admin
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-3 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            🚪 Logout
          </button>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;