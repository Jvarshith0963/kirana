import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";


/* =================================
   API HELPERS
================================= */

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function postJson(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let result = {};

  try {
    result = await response.json();
  } catch {
    /* response was not JSON */
  }

  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }

  return result;
}

const getErrorMessage = (error, fallback) =>
  error instanceof TypeError
    ? "Cannot reach the server. Is the backend running?"
    : error.message || fallback;


/* =================================
   PHONE VALIDATION
================================= */

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^[6-9]\d{9}$/,
      "Please enter a valid 10-digit phone number"
    ),
});


/* =================================
   OTP VALIDATION
================================= */

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must contain 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});


/* =================================
   OTP LOGIN
================================= */

function OtpLogin() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  /* Phone Form */

  const {
    register: registerPhone,
    handleSubmit: handlePhoneSubmit,
    formState: {
      errors: phoneErrors,
      isSubmitting: isSendingOtp,
    },
  } = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });


  /* OTP Form */

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: {
      errors: otpErrors,
      isSubmitting: isVerifyingOtp,
    },
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });


  /* =================================
     SEND OTP
  ================================= */

  const sendOtp = async (data) => {
    setServerError("");
    setSuccessMessage("");

    try {
      const result = await postJson("/auth/otp/request", {
        phone: data.phone,
      });

      // Only returned by the backend outside production
      if (result.devOtp) {
        console.log("DEV OTP:", result.devOtp);
      }

      setPhone(data.phone);

      setSuccessMessage(`OTP sent to ${data.phone}`);

      setStep(2);

    } catch (error) {
      console.error("Send OTP error:", error);

      setServerError(
        getErrorMessage(
          error,
          "Unable to send OTP. Please try again."
        )
      );
    }
  };


  /* =================================
     VERIFY OTP
  ================================= */

  const verifyOtp = async (data) => {
    setServerError("");
    setSuccessMessage("");

    try {
      const result = await postJson("/auth/otp/verify", {
        phone,
        otp: data.otp,
      });

      // result = { token, user }
      login(result.user, result.token);

      setSuccessMessage("OTP verified successfully!");

      setTimeout(() => {
        navigate("/");
      }, 800);

    } catch (error) {
      console.error("OTP verification error:", error);

      setServerError(
        getErrorMessage(
          error,
          "OTP verification failed. Please try again."
        )
      );
    }
  };


  /* =================================
     RESEND OTP
  ================================= */

  const resendOtp = async () => {
    setServerError("");
    setSuccessMessage("");
    setIsResending(true);

    try {
      const result = await postJson("/auth/otp/request", {
        phone,
      });

      if (result.devOtp) {
        console.log("DEV OTP:", result.devOtp);
      }

      setSuccessMessage(`New OTP sent to ${phone}`);

    } catch (error) {
      console.error("Resend OTP error:", error);

      setServerError(
        getErrorMessage(error, "Unable to resend OTP.")
      );
    } finally {
      setIsResending(false);
    }
  };


  /* =================================
     BACK TO PHONE
  ================================= */

  const changePhone = () => {
    setStep(1);
    setServerError("");
    setSuccessMessage("");
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
              📱
            </div>

            <h1 className="text-3xl font-bold text-green-700">
              Login with OTP
            </h1>

            <p className="mt-2 text-gray-500">
              {step === 1
                ? "Enter your mobile number to continue"
                : "Enter the OTP sent to your mobile"}
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
              STEP 1 - PHONE
          ================================= */}

          {step === 1 && (
            <form
              onSubmit={handlePhoneSubmit(sendOtp)}
              className="space-y-5"
            >

              <div>

                <label
                  htmlFor="phone"
                  className="mb-2 block font-medium text-gray-700"
                >
                  Mobile Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  maxLength="10"
                  placeholder="Enter 10-digit mobile number"
                  {...registerPhone("phone")}
                  className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 ${
                    phoneErrors.phone
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />

                {phoneErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {phoneErrors.phone.message}
                  </p>
                )}

              </div>


              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingOtp
                  ? "Sending OTP..."
                  : "Send OTP"}
              </button>

            </form>
          )}


          {/* =================================
              STEP 2 - OTP
          ================================= */}

          {step === 2 && (
            <form
              onSubmit={handleOtpSubmit(verifyOtp)}
              className="space-y-5"
            >

              <div>

                <label
                  htmlFor="otp"
                  className="mb-2 block font-medium text-gray-700"
                >
                  Enter OTP
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="Enter 6-digit OTP"
                  {...registerOtp("otp")}
                  className={`w-full rounded-lg border px-4 py-3 text-center text-xl tracking-widest outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 ${
                    otpErrors.otp
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />

                {otpErrors.otp && (
                  <p className="mt-1 text-sm text-red-600">
                    {otpErrors.otp.message}
                  </p>
                )}

              </div>


              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isVerifyingOtp
                  ? "Verifying..."
                  : "Verify OTP"}
              </button>


              {/* Resend */}

              <div className="text-center">

                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={isResending}
                  className="font-semibold text-green-700 hover:text-green-900 disabled:opacity-60"
                >
                  {isResending ? "Sending..." : "Resend OTP"}
                </button>

              </div>


              {/* Change Number */}

              <div className="text-center">

                <button
                  type="button"
                  onClick={changePhone}
                  className="text-sm text-gray-500 hover:text-green-700"
                >
                  ← Change mobile number
                </button>

              </div>

            </form>
          )}


          {/* =================================
              BACK TO LOGIN
          ================================= */}

          <div className="mt-7 border-t pt-5 text-center">

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

export default OtpLogin;