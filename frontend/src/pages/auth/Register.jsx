import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";

// ================================
// Registration Validation Schema
// ================================

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must contain at least 2 characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),

    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"),

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

// ================================
// Register Component
// ================================

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // ================================
  // Form Submit
  // ================================

 const onSubmit = async (data) => {
  setServerError("");
  setSuccessMessage("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: "customer",
          phone: data.phone,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Registration failed"
      );
    }

    setSuccessMessage(
      "Account created successfully! Please login."
    );

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  } catch (error) {
    console.error("Registration error:", error);

    setServerError(
      error.message ||
        "Registration failed. Please try again."
    );
  }
};

  return (
    <div className="min-h-screen bg-green-50 px-4 py-10">
      <div className="mx-auto max-w-md">

        {/* ================================
            Registration Card
        ================================= */}

        <div className="rounded-2xl bg-white p-8 shadow-lg">

          {/* Header */}
          <div className="mb-8 text-center">

            <div className="mb-3 text-5xl">
              🛒
            </div>

            <h1 className="text-3xl font-bold text-green-700">
              Create Your Account
            </h1>

            <p className="mt-2 text-gray-500">
              Join Kirana Marketplace today
            </p>

          </div>

          {/* ================================
              Server Error
          ================================= */}

          {serverError && (
            <div className="mb-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* ================================
              Success Message
          ================================= */}

          {successMessage && (
            <div className="mb-5 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {/* ================================
              Registration Form
          ================================= */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >

            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block font-medium text-gray-700"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                {...register("name")}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 ${
                  errors.name
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

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

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block font-medium text-gray-700"
              >
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                maxLength="10"
                placeholder="Enter 10-digit phone number"
                {...register("phone")}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 ${
                  errors.phone
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
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
                placeholder="Create a password"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block font-medium text-gray-700"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 ${
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

            {/* Register Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          {/* ================================
              Login Link
          ================================= */}

          <p className="mt-7 text-center text-gray-600">
            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-green-700 hover:text-green-900"
            >
              Login
            </Link>
          </p>

          {/* ================================
              Vendor Registration
          ================================= */}

          <div className="mt-5 border-t pt-5 text-center">

            <Link
              to="/vendor/register"
              className="text-sm font-medium text-gray-600 hover:text-green-700"
            >
              Are you a vendor? Register your store →
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;