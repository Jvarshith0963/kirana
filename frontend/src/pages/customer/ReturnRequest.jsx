import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const STORAGE_KEY = "kirana_admin_returns";

export default function ReturnRequest() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validate the required reason field.
    if (!reason.trim()) {
      setError("Please select a reason for your return.");
      document.getElementById("return-reason")?.focus();
      return;
    }

    // Prevent duplicate submissions.
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const existing = savedData ? JSON.parse(savedData) : [];

      if (!Array.isArray(existing)) {
        throw new Error("Invalid saved return data.");
      }

      const request = {
        id: `RET${Date.now()}`,
        orderId: orderId || "ORDER-UNKNOWN",
        reason,
        details: details.trim(),
        status: "Pending",
        requestedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([request, ...existing])
      );

      setSuccess(true);
    } catch (err) {
      console.error("Return request submission failed:", err);
      setError(
        "We couldn't save your return request. Please check your browser storage and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <section
          className="rounded-xl border bg-white p-6 text-center shadow-sm"
          role="status"
          aria-live="polite"
        >
          <div className="mb-3 text-4xl text-green-700" aria-hidden="true">
            ✓
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Return request submitted
          </h1>

          <p className="mt-3 text-gray-700">
            Your request has been saved with Pending status.
          </p>

          <button
            type="button"
            onClick={() => navigate("/my-returns")}
            className="mt-5 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
          >
            Track my return
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Request a Return or Refund
        </h1>

        <p className="mt-2 text-gray-700">
          Order ID: {orderId || "Not provided"}
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="return-reason"
              className="mb-2 block font-semibold text-gray-900"
            >
              Reason for return <span aria-hidden="true">*</span>
            </label>

            <select
              id="return-reason"
              name="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              required
              aria-required="true"
              aria-invalid={Boolean(error && !reason)}
              aria-describedby={error ? "return-error" : undefined}
              className="w-full rounded-lg border border-gray-400 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
            >
              <option value="">Select a reason</option>
              <option value="Damaged product">Damaged product</option>
              <option value="Wrong item delivered">
                Wrong item delivered
              </option>
              <option value="Missing items">Missing items</option>
              <option value="Expired product">Expired product</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="return-details"
              className="mb-2 block font-semibold text-gray-900"
            >
              Additional details
            </label>

            <textarea
              id="return-details"
              name="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Describe the issue (optional)"
              aria-describedby="details-help"
              className="w-full rounded-lg border border-gray-400 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700"
            />

            <p id="details-help" className="mt-1 text-sm text-gray-600">
              Maximum 500 characters.
            </p>

            <p className="mt-1 text-right text-sm text-gray-500">
              {details.length}/500
            </p>
          </div>

          {error && (
            <p
              id="return-error"
              role="alert"
              aria-live="assertive"
              className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
            >
              {isSubmitting ? "Submitting..." : "Submit request"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-500 px-5 py-3 font-semibold text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
