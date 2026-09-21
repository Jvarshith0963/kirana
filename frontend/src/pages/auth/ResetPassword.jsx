import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";


/* =================================
   PASSWORD VALIDATION
================================= */

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must contain at least 6 characters"),

    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


/* =================================
   RESET PASSWORD PAGE
================================= */

function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  // Token will normally come from the backend reset link.
  const token = searchParams.get("token");

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });


  /* =================================
     SUBMIT RESET PASSWORD
  ================================= */

 const onSubmit = async (data) => {
  setServerError("");
  setSuccessMessage("");

  try {
    const token = new URLSearchParams(
      window.location.search
    ).get("token");

    if (!token) {
      throw new Error("Invalid or missing reset token");
    }

    const response = await fetch(
      "http://localhost:5000/api/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: data.password,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Password reset failed"
      );
    }

    setSuccessMessage(
      result.message ||
        "Password reset successfully. Please login."
    );

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  } catch (error) {
    console.error("Reset password error:", error);

    setServerError(
      error.message ||
        "Password reset failed. Please try again."
    );
  }
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
              🔑
            </div>

            <h1 className="text-3xl font-bold text-green-700">
              Reset Password
            </h1>

            <p className="mt-2 text-gray-500">
              Create a new password for your account.
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
              SUCCESS MESSAGE
          ================================= */}

          {successMessage && (
            <div className="mb-5 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}


          {/* =================================
              FORM
          ================================= */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >

            {/* Password */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block font-medium text-gray-700"
              >
                New Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter new password"
                {...register("password")}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition
                  focus:border-green-500 focus:ring-2 focus:ring-green-100
                  ${
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


            {/* Confirm Password */}

            <div>

              <label
                htmlFor="confirmPassword"
                className="mb-2 block font-medium text-gray-700"
              >
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition
                  focus:border-green-500 focus:ring-2 focus:ring-green-100
                  ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
              />

              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}

            </div>


            {/* Submit */}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Resetting..."
                : "Reset Password"}
            </button>

          </form>


          {/* =================================
              BACK TO LOGIN
          ================================= */}

          <div className="mt-7 text-center">

            <Link
              to="/login"
              className="font-semibold text-green-700 hover:text-green-900"
            >
              ← Back to Login
            </Link>

          </div>


          {/* =================================
              REGISTER
          ================================= */}

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

export default ResetPassword;