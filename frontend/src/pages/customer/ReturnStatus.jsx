import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const RETURN_STORAGE_KEY = "kirana_returns";

const steps = [
  "Requested",
  "Approved",
  "Picked Up",
  "Refunded",
];

function ReturnStatus() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [returnRequest, setReturnRequest] =
    useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(RETURN_STORAGE_KEY);

      if (!saved) {
        setError("No return request found.");
        return;
      }

      const returns = JSON.parse(saved);

      const found = returns.find(
        (item) =>
          String(item.orderId) === String(orderId)
      );

      if (!found) {
        setError("No return request found for this order.");
        return;
      }

      setReturnRequest(found);
    } catch (err) {
      console.error(
        "Unable to load return request:",
        err
      );

      setError(
        "Unable to load return status."
      );
    }
  }, [orderId]);

  const getStepIndex = (status) => {
    if (status === "Rejected") {
      return -1;
    }

    return steps.indexOf(status);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-10">
        <div
          className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-md"
          role="alert"
        >
          <div className="mb-4 text-5xl">⚠️</div>

          <h1 className="text-2xl font-bold text-gray-800">
            Return request unavailable
          </h1>

          <p className="mt-2 text-gray-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!returnRequest) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-md">
          <div
            className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600"
            aria-label="Loading return status"
          />

          <p className="text-gray-600">
            Loading return status...
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = getStepIndex(
    returnRequest.status
  );

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">

        <button
          type="button"
          onClick={() =>
            navigate(`/orders/${orderId}`)
          }
          className="mb-5 rounded text-sm font-semibold text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          ← Back to Order
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Return Status
          </h1>

          <p className="mt-1 text-gray-600">
            Return #{returnRequest.returnId}
          </p>
        </div>

        {/* Rejected */}
        {returnRequest.status === "Rejected" ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-white p-6 shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">❌</div>

              <div>
                <h2 className="text-xl font-bold text-red-700">
                  Return Request Rejected
                </h2>

                <p className="mt-2 text-gray-600">
                  Unfortunately, your return request
                  was not approved.
                </p>

                <p className="mt-3 font-semibold text-gray-800">
                  Reason: {returnRequest.reason}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800">
              Return Progress
            </h2>

            <div
              className="mt-8"
              aria-label="Return request progress"
            >
              {steps.map((step, index) => {
                const completed =
                  index <= currentIndex;

                const current =
                  index === currentIndex;

                return (
                  <div
                    key={step}
                    className="relative flex gap-4 pb-8 last:pb-0"
                  >
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute left-4 top-9 h-full w-0.5 ${
                          index < currentIndex
                            ? "bg-green-600"
                            : "bg-gray-200"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        completed
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                      aria-hidden="true"
                    >
                      {completed ? "✓" : index + 1}
                    </div>

                    <div>
                      <p
                        className={`font-semibold ${
                          completed
                            ? "text-green-700"
                            : "text-gray-500"
                        }`}
                      >
                        {step}
                      </p>

                      {current && (
                        <p className="mt-1 text-sm text-gray-500">
                          Current status
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Request Details */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800">
              Request Details
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Order
                </span>

                <span className="font-semibold">
                  #{returnRequest.orderId}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Reason
                </span>

                <span className="font-semibold text-right">
                  {returnRequest.reason}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Refund Method
                </span>

                <span className="font-semibold text-right">
                  {returnRequest.refundMethod}
                </span>
              </div>

              <div className="flex justify-between gap-4 border-t pt-3">
                <span className="font-semibold">
                  Refund Amount
                </span>

                <span className="font-bold text-green-700">
                  ₹
                  {Number(
                    returnRequest.refundAmount || 0
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800">
              Returned Products
            </h2>

            <div className="mt-5 space-y-3">
              {(returnRequest.items || []).map(
                (item, index) => (
                  <div
                    key={item.id ?? index}
                    className="flex items-center gap-3 border-b pb-3 last:border-0"
                  >
                    <img
                      src={
                        item.image ||
                        "https://via.placeholder.com/60"
                      }
                      alt={
                        item.name ||
                        "Returned product"
                      }
                      className="h-12 w-12 rounded-lg object-cover"
                    />

                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity || 1}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        </div>

        {/* Description */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800">
            Issue Description
          </h2>

          <p className="mt-3 text-gray-600">
            {returnRequest.description}
          </p>
        </section>
      </div>
    </div>
  );
}

export default ReturnStatus;