import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

function getSavedOrder() {
  try {
    return JSON.parse(localStorage.getItem("kirana_last_order") || "null");
  } catch {
    return null;
  }
}

function Invoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: paramOrderId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  const savedOrder = location.state?.order || getSavedOrder();

  const orderId =
    paramOrderId ||
    savedOrder?.backendOrderId ||
    savedOrder?.orderId ||
    savedOrder?.id;

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;

    async function fetchInvoice() {
      setLoading(true);
      setError("");
      setPdfUrl("");

      if (!orderId) {
        setError("No order specified.");
        setLoading(false);
        return;
      }

      const token = getToken();
      if (!token) {
        setError("Please login to view this invoice.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/orders/${orderId}/invoice`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.message || "Unable to load invoice.");
        }

        const blob = await response.blob();
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        objectUrl = URL.createObjectURL(pdfBlob);

        if (!cancelled) {
          setPdfUrl(objectUrl);
        }
      } catch (err) {
        console.error("Invoice fetch failed:", err);
        if (!cancelled) {
          setError(err.message || "Unable to load invoice.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchInvoice();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [orderId]);

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => navigate("/orders")}
            className="font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to My Orders
          </button>

          {pdfUrl && (
            <a
              href={pdfUrl}
              download={`invoice-${orderId}.pdf`}
              className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700"
            >
              ⬇ Download PDF
            </a>
          )}
        </div>

        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-md">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
            <h1 className="text-2xl font-bold text-gray-800">
              Preparing your invoice...
            </h1>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-md">
            <div className="mb-4 text-5xl">📄</div>
            <h1 className="text-2xl font-bold text-gray-800">
              Unable to Load Invoice
            </h1>
            <p className="mt-2 text-gray-500">{error}</p>
          </div>
        )}

        {!loading && !error && pdfUrl && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-md">
            <iframe
              title={`Invoice ${orderId}`}
              src={pdfUrl}
              className="h-[80vh] w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Invoice;