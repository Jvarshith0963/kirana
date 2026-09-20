import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

function ForgotPassword() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");
    setSuccessMessage("");

    try {
      // TEMPORARY FRONTEND TEST
      // This will be replaced with Varshith's backend API later.

      console.log("Forgot password request:", data);

      setSuccessMessage(
        "If an account exists with this email, a password reset link will be sent."
      );
    } catch (error) {
      console.error("Forgot password error:", error);
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-3 text-5xl">🔐</div>

            <h1 className="text-3xl font-bold text-green-700">
              Forgot Password?
            </h1>

            <p className="mt-2 text-gray-500">
              Enter your email address and we'll help you reset your password.
            </p>
          </div>

          {/* Error Message */}
          {serverError && (
            <div className="mb-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-5 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {/* Form */}
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
                placeholder="Enter your registered email"
                {...register("email")}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition
                  focus:border-green-500 focus:ring-2 focus:ring-green-100
                  ${
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-7 text-center">
            <Link
              to="/login"
              className="font-semibold text-green-700 hover:text-green-900"
            >
              ← Back to Login
            </Link>
          </div>

          {/* Register */}
          <p className="mt-5 text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-green-700 hover:text-green-900"
            >
              Create Account
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;