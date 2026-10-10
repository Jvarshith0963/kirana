
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    // Frontend demo authentication only.
    if (
      email.trim().toLowerCase() === "admin@kirana.com" &&
      password === "Admin@123"
    ) {
      localStorage.setItem("kirana_admin_authenticated", "true");
      navigate("/admin", { replace: true });
    } else {
      setError("Invalid admin email or password. Please try again.");
      setLoading(false);
    }
  };

  const useDemoCredentials = () => {
    setEmail("admin@kirana.com");
    setPassword("Admin@123");
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#f4f7f2] p-3 sm:p-6 lg:p-10">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-7xl overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-green-950/10 sm:min-h-[calc(100vh-48px)] lg:grid-cols-2">
        {/* LEFT: BRAND PANEL */}
        <section className="relative flex min-h-[270px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#123d2c] via-[#176342] to-[#23834e] p-7 text-white sm:p-10 lg:min-h-full lg:p-14">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-12 h-52 w-52 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-lime-300/10 blur-2xl" />

          <Link to="/" className="relative z-10 flex w-fit items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg">
              🛒
            </div>
            <div>
              <p className="text-xl font-extrabold tracking-tight">
                Kirana<span className="text-lime-300">.</span>
              </p>
              <p className="text-xs tracking-[0.2em] text-green-100">
                MARKETPLACE
              </p>
            </div>
          </Link>

          <div className="relative z-10 my-10 max-w-lg">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-green-50 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-lime-300" />
              Your marketplace, in control
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Smarter shopping.
              <span className="mt-2 block text-lime-300">
                Better business.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-green-50/85 sm:text-lg">
              Manage customers, support local vendors, organize products, and
              keep your entire marketplace running smoothly.
            </p>

            {/* Decorative grocery illustration using emoji */}
            <div className="mt-8 flex max-w-md items-center justify-between rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-5">
              <div className="flex gap-2 text-3xl sm:gap-3 sm:text-4xl">
                <span>🥬</span>
                <span>🍎</span>
                <span>🥕</span>
                <span>🥑</span>
              </div>
              <div className="text-right">
                <p className="font-bold">Fresh & local</p>
                <p className="mt-1 text-xs text-green-100">
                  Connecting communities
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-3 text-xs text-green-100/80">
            <span>© {new Date().getFullYear()} Kirana Marketplace</span>
            <span className="flex items-center gap-2">
              <span>✦</span> Built for local businesses
            </span>
          </div>
        </section>

        {/* RIGHT: LOGIN FORM */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl">
                🔐
              </div>

              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-green-700">
                ADMIN PORTAL
              </p>

              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Welcome back!
              </h2>

              <p className="mt-3 leading-6 text-gray-500">
                Sign in to manage your marketplace and keep everything running
                smoothly.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <span className="text-lg">!</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Admin email
                </label>

                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 transition focus-within:border-green-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-600/10">
                  <span className="pl-4 text-lg text-gray-400">✉</span>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    placeholder="admin@kirana.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="w-full bg-transparent px-3 py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="admin-password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                  <span className="text-xs text-gray-400">
                    Admin access
                  </span>
                </div>

                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 transition focus-within:border-green-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-600/10">
                  <span className="pl-4 text-lg text-gray-400">●</span>
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full bg-transparent px-3 py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="mr-3 rounded-lg px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-700 to-green-600 px-5 py-4 font-bold text-white shadow-lg shadow-green-700/20 transition hover:-translate-y-0.5 hover:from-green-800 hover:to-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign in to dashboard"}
                {!loading && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Demo access
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="rounded-2xl border border-green-100 bg-green-50/70 p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    Try the admin demo
                  </p>
                  <p className="mt-2 break-all text-sm text-gray-600">
                    <span className="font-medium">Email:</span>{" "}
                    admin@kirana.com
                  </p>
                  <p className="mt-1 break-all text-sm text-gray-600">
                    <span className="font-medium">Password:</span> Admin@123
                  </p>
                  <button
                    type="button"
                    onClick={useDemoCredentials}
                    className="mt-3 text-sm font-bold text-green-800 underline decoration-green-300 underline-offset-4 hover:text-green-950"
                  >
                    Fill demo credentials
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-7 text-center">
              <Link
                to="/"
                className="text-sm font-semibold text-gray-500 transition hover:text-green-700"
              >
                <span className="mr-2">←</span>
                Back to customer store
              </Link>
            </div>

            <p className="mt-8 text-center text-xs leading-5 text-gray-400">
              Demo authentication is for development only. Use secure
              server-side authentication before deploying publicly.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
