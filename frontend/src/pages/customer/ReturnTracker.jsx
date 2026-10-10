import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "kirana_admin_returns";

function getStatusStyle(status) {
  switch (status?.toLowerCase()) {
    case "approved":
      return "bg-blue-100 text-blue-800";
    case "refunded":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

export default function ReturnTracker() {
  const [returns, setReturns] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    function loadReturns() {
      try {
        const savedReturns = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]"
        );

        setReturns(Array.isArray(savedReturns) ? savedReturns : []);
        setError("");
      } catch {
        setError("Unable to load your return requests. Please refresh the page.");
      }
    }

    loadReturns();

    window.addEventListener("storage", loadReturns);
    window.addEventListener("kirana-list-orders-updated", loadReturns);

    return () => {
      window.removeEventListener("storage", loadReturns);
      window.removeEventListener("kirana-list-orders-updated", loadReturns);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="text-sm font-semibold text-green-700 hover:underline
                     focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          ← Back to Home
        </Link>

        <header className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900">
            My Returns & Refunds
          </h1>
          <p className="mt-2 text-gray-600">
            Track the status of your return requests.
          </p>
        </header>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}

        {!error && returns.length === 0 && (
          <section className="mt-8 rounded-xl border border-gray-200 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              No return requests yet
            </h2>
            <p className="mt-2 text-gray-600">
              When you request a return, its status will appear here.
            </p>
            <Link
              to="/products"
              className="mt-5 inline-block rounded-lg bg-green-700 px-5 py-3
                         font-semibold text-white hover:bg-green-800
                         focus:outline-none focus:ring-2 focus:ring-green-600
                         focus:ring-offset-2"
            >
              Browse Products
            </Link>
          </section>
        )}

        <div className="mt-6 space-y-4">
          {returns.map((item, index) => (
            <article
              key={item.id || `${item.orderId}-${index}`}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Return Request {item.id || `#${index + 1}`}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Order ID: {item.orderId || "Not specified"}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-sm
                    font-semibold ${getStatusStyle(item.status)}`}
                >
                  {item.status || "Pending"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Return reason</p>
                  <p className="font-medium text-gray-800">
                    {item.reason || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Requested on</p>
                  <p className="font-medium text-gray-800">
                    {item.requestedAt
                      ? new Date(item.requestedAt).toLocaleDateString()
                      : "Date unavailable"}
                  </p>
                </div>
              </div>

              {item.details && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500">Additional details</p>
                  <p className="mt-1 break-words text-gray-800">
                    {item.details}
                  </p>
                </div>
              )}

              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600">
                  {item.status?.toLowerCase() === "refunded"
                    ? "Your refund has been marked as processed."
                    : item.status?.toLowerCase() === "approved"
                    ? "Your return request has been approved."
                    : item.status?.toLowerCase() === "rejected"
                    ? "This return request was rejected. Contact support if you need help."
                    : "Your request is awaiting review."}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
