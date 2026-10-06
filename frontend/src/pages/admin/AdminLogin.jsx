import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "admin@kirana.com";
const ADMIN_PASSWORD = "admin123";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const enteredEmail = email.trim();
    const enteredPassword = password.trim();

    if (
      enteredEmail === ADMIN_EMAIL &&
      enteredPassword === ADMIN_PASSWORD
    ) {
      localStorage.setItem(
        "kirana_admin_session",
        JSON.stringify({
          email: enteredEmail,
          role: "admin",
          loggedIn: true,
        })
      );

      navigate("/admin");
    } else {
      setError("Invalid admin email or password.");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-green-600 text-white rounded-2xl flex items-center justify-center text-3xl">
            🛒
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mt-4">
            Kirana Marketplace
          </h1>

          <p className="text-gray-500 mt-2">
            Admin Panel Login
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Login as Admin
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm">
          <p className="font-semibold text-gray-700 mb-2">
            Demo Credentials
          </p>

          <p className="text-gray-600">
            Email:{" "}
            <span className="font-medium">
              admin@kirana.com
            </span>
          </p>

          <p className="text-gray-600">
            Password:{" "}
            <span className="font-medium">
              admin123
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}