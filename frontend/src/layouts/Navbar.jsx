import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        <div className="flex items-center gap-3">

          {/* Home */}
          <Link
            to="/"
            className="rounded-lg px-4 py-2 font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-700"
          >
            🏠 Home
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="rounded-lg px-4 py-2 font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-700"
          >
            🛒 Cart
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            className="rounded-lg px-4 py-2 font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-700"
          >
            👤 Profile
          </Link>

          {/* Vendor */}
          <Link
            to="/vendor"
            className="rounded-lg px-4 py-2 font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-700"
          >
            🏪 Vendor
          </Link>

          {/* Admin */}
          <Link
            to="/admin"
            className="rounded-lg px-4 py-2 font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-700"
          >
            ⚙️ Admin
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            🚪 Logout
          </button>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;