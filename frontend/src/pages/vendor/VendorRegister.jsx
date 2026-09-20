import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";


/* =================================
   VENDOR REGISTER VALIDATION
================================= */

const vendorRegisterSchema = z
  .object({
    name: z
      .string()
      .min(1, "Vendor name is required")
      .min(2, "Vendor name must contain at least 2 characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),

    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit phone number"
      ),

    storeName: z
      .string()
      .min(1, "Store name is required")
      .min(2, "Store name must contain at least 2 characters"),

    address: z
      .string()
      .min(1, "Store address is required")
      .min(5, "Please enter a complete store address"),

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
   VENDOR REGISTER
================================= */

function VendorRegister() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(vendorRegisterSchema),

    defaultValues: {
      name: "",
      email: "",
      phone: "",
      storeName: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });


  /* =================================
     REGISTER SUBMIT
  ================================= */

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
          role: "vendor",
          phone: data.phone,
          storeName: data.storeName,
          address: data.address,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Vendor registration failed"
      );
    }

    setSuccessMessage(
      "Vendor account created successfully! Please login."
    );

    setTimeout(() => {
      navigate("/vendor/login");
    }, 1000);
  } catch (error) {
    console.error("Vendor registration error:", error);

    setServerError(
      error.message ||
        "Vendor registration failed. Please try again."
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
              🏪
            </div>

            <h1 className="text-3xl font-bold text-green-700">
              Vendor Registration
            </h1>

            <p className="mt-2 text-gray-500">
              Create your store account
            </p>

          </div>


          {/* =================================
              ERROR
          ================================= */}

          {serverError && (
            <div className="mb-5 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}


          {/* =================================
              SUCCESS
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

            {/* Vendor Name */}

            <div>
              <label
                htmlFor="name"
                className="mb-2 block font-medium text-gray-700"
              >
                Vendor Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter your name"
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
                placeholder="Enter vendor email"
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


            {/* Store Name */}

            <div>
              <label
                htmlFor="storeName"
                className="mb-2 block font-medium text-gray-700"
              >
                Store Name
              </label>

              <input
                id="storeName"
                type="text"
                placeholder="Enter your store name"
                {...register("storeName")}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 ${
                  errors.storeName
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {errors.storeName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.storeName.message}
                </p>
              )}
            </div>


            {/* Store Address */}

            <div>
              <label
                htmlFor="address"
                className="mb-2 block font-medium text-gray-700"
              >
                Store Address
              </label>

              <textarea
                id="address"
                rows="3"
                placeholder="Enter your complete store address"
                {...register("address")}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 ${
                  errors.address
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              {errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.message}
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
                ? "Creating Store..."
                : "Create Vendor Account"}
            </button>

          </form>


          {/* =================================
              VENDOR LOGIN
          ================================= */}

          <p className="mt-7 text-center text-gray-600">
            Already have a vendor account?{" "}

            <Link
              to="/vendor/login"
              className="font-semibold text-green-700 hover:text-green-900"
            >
              Vendor Login
            </Link>
          </p>


          {/* =================================
              CUSTOMER LOGIN
          ================================= */}

          <div className="mt-5 border-t pt-5 text-center">

            <p className="text-gray-600">
              Are you a customer?
            </p>

            <Link
              to="/login"
              className="font-semibold text-green-700 hover:text-green-900"
            >
              Login as Customer
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default VendorRegister;