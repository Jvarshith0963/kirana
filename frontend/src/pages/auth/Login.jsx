import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

/* =================================
   LOGIN VALIDATION
================================= */

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

/* =================================
   LOGIN PAGE
================================= */

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [serverError, setServerError] = useState("");

  /* =================================
     FORM
  ================================= */

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  /* =================================
     FRONTEND TEST LOGIN
  ================================= */

  const onSubmit = async (data) => {
    setServerError("");

    try {
      /*
        Temporary frontend-only login.

        This allows Hasini to develop and test
        the frontend without running Varshith's backend.

        Later Varshith can replace this with
        the real backend API.
      */

      const testUser = {
        id: 1,
        name: "Test Customer",
        email: data.email,
        phone: "9876543210",
        role: "customer",
      };

      const testToken = "frontend-test-jwt-token";

      login(testUser, testToken);

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      setServerError(
        "Login failed. Please try again."
      );
    }
  };

  /* =================================
     GOOGLE LOGIN
  ================================= */

  const handleGoogleLogin = async (credentialResponse) => {
    /*
      Google backend integration will be done later
      by connecting this to Varshith's API.
    */

    console.log(
      "Google credential received:",
      credentialResponse
    );

    setServerError(
      "Google login will be connected to the backend."
    );
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-10">

      <div className="mx-auto max-w-md">

        <div className="rounded-2xl bg-white p-8 shadow-lg">

          {/* =================================
              HEADER
          ================================= */}

          <div className="mb-8 text-center">

            <div className="mb-3 text-5xl">
              🛒
            </div>

            <h1 className="text-3xl font-bold text-green-700">
              Welcome Back
            </h1>

            <p className="mt-2 text-gray-500">
              Login to your Kirana Marketplace account
            </p>

          </div>

          {/* =================================
              ERROR MESSAGE
          ================================= */}

          {serverError && (
            <div className="mb-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* =================================
              LOGIN FORM
          ================================= */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >

            {/* Email */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 block font-medium text-gray-700"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}

            </div>

            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 ${
                  errors.password
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}

            </div>

            {/* Forgot Password */}

            <div className="text-right">

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-green-700 hover:text-green-900"
              >
                Forgot Password?
              </Link>

            </div>

            {/* Login Button */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          {/* =================================
              DIVIDER
          ================================= */}

          <div className="my-7 flex items-center gap-3">

            <div className="h-px flex-1 bg-gray-200"></div>

            <span className="text-sm text-gray-400">
              OR
            </span>

            <div className="h-px flex-1 bg-gray-200"></div>

          </div>

          {/* =================================
              OTP LOGIN
          ================================= */}

          <button
            type="button"
            onClick={() => navigate("/otp-login")}
            className="w-full rounded-lg border border-green-600 py-3 font-semibold text-green-700 transition hover:bg-green-50"
          >
            📱 Login with OTP
          </button>

          {/* =================================
              GOOGLE LOGIN
          ================================= */}

          <div className="mt-3 flex justify-center">

            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.error("Google Login Failed");

                setServerError(
                  "Google login failed. Please try again."
                );
              }}
            />

          </div>

          {/* =================================
              CREATE ACCOUNT
          ================================= */}

          <p className="mt-7 text-center text-gray-600">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-green-700 hover:text-green-900"
            >
              Create Account
            </Link>

          </p>

          {/* =================================
              VENDOR LOGIN
          ================================= */}

          <div className="mt-5 border-t pt-5 text-center">

            <Link
              to="/vendor/login"
              className="text-sm font-medium text-gray-600 hover:text-green-700"
            >
              🏪 Are you a vendor? Login here →
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;