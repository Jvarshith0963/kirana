import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";


/* =================================
   VENDOR LOGIN VALIDATION
================================= */

const vendorLoginSchema = z.object({
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
   VENDOR LOGIN
================================= */

function VendorLogin() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(vendorLoginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });


  /* =================================
     LOGIN SUBMIT
  ================================= */

  const onSubmit = async (data) => {
    setServerError("");

    try {
      /*
       * TEMPORARY FRONTEND TEST LOGIN
       *
       * This will be replaced with Varshith's
       * actual vendor login API.
       */

      console.log("Vendor login data:", data);

      const testVendor = {
        id: 1001,
        name: "Test Vendor",
        email: data.email,
        phone: "9876543210",
        role: "vendor",
      };

      const testToken = "frontend-vendor-test-token";

      login(testVendor, testToken);

      navigate("/vendor");

    } catch (error) {
      console.error("Vendor login error:", error);

      setServerError(
        "Vendor login failed. Please try again."
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
              Vendor Login
            </h1>

            <p className="mt-2 text-gray-500">
              Login to manage your store
            </p>

          </div>


          {/* =================================
              SERVER ERROR
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
                placeholder="Enter vendor email"
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
                : "Login as Vendor"}
            </button>

          </form>


          {/* =================================
              CUSTOMER LOGIN
          ================================= */}

          <div className="mt-7 text-center">

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


          {/* =================================
              VENDOR REGISTER
          ================================= */}

          <div className="mt-5 border-t pt-5 text-center">

            <p className="text-gray-600">
              Don't have a vendor account?
            </p>

            <Link
              to="/vendor/register"
              className="font-semibold text-green-700 hover:text-green-900"
            >
              Register Your Store →
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default VendorLogin;