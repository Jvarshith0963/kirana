import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">

        {/* Profile Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-5xl">
              👤
            </div>

            <h1 className="text-3xl font-bold text-green-700">
              My Profile
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your account information
            </p>
          </div>

          {/* User Information */}
          <div className="space-y-4">

            {/* Name */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Full Name
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-800">
                {user?.name || "Not available"}
              </p>
            </div>

            {/* Email */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Email Address
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-800">
                {user?.email || "Not available"}
              </p>
            </div>

            {/* Phone */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Phone Number
              </p>

              <p className="mt-1 text-lg font-semibold text-gray-800">
                {user?.phone || "Not available"}
              </p>
            </div>

            {/* Role */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Account Type
              </p>

              <p className="mt-1 text-lg font-semibold capitalize text-gray-800">
                {user?.role || "Customer"}
              </p>
            </div>

          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <Link
              to="/"
              className="flex-1 rounded-lg border border-green-600 py-3 text-center font-semibold text-green-700 transition hover:bg-green-50"
            >
              ← Back to Home
            </Link>

            <button
              onClick={handleLogout}
              className="flex-1 rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              🚪 Logout
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;