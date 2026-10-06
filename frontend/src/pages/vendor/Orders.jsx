import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

// Your backend's real status pipeline — must move one step at a time.
const NEXT_STATUS = {
  confirmed: "preparing",
  preparing: "out_for_delivery",
  out_for_delivery: "delivered",
};

const NEXT_STATUS_LABEL = {
  confirmed: "Mark Preparing",
  preparing: "Mark Out for Delivery",
  out_for_delivery: "Mark Delivered",
};

function formatStatus(status) {
  return status
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function getStatusClass(status) {
  const classes = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-purple-100 text-purple-700",
    out_for_delivery: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return classes[status] || "bg-gray-100 text-gray-700";
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actioningId, setActioningId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const response = await apiRequest(`/vendor/orders${query}`);
      setOrders(response?.data || []);
    } catch (err) {
      console.error("Failed to load vendor orders:", err);
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleAccept = async (id) => {
    setActioningId(id);
    try {
      await apiRequest(`/vendor/orders/${id}/accept`, { method: "PATCH" });
      await loadOrders();
    } catch (err) {
      setError(err.message || "Unable to accept order.");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this order?")) return;

    setActioningId(id);
    try {
      await apiRequest(`/vendor/orders/${id}/reject`, { method: "PATCH" });
      await loadOrders();
    } catch (err) {
      setError(err.message || "Unable to reject order.");
    } finally {
      setActioningId(null);
    }
  };

  const handleAdvanceStatus = async (id, currentStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;

    setActioningId(id);
    try {
      await apiRequest(`/vendor/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      await loadOrders();
    } catch (err) {
      setError(err.message || "Unable to update order status.");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-semibold text-green-600">Vendor Panel</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-800">
              🛍️ Order Management
            </h1>
            <p className="mt-2 text-gray-500">
              Accept, reject and update customer orders.
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md">
            <div className="mb-4 text-5xl">⏳</div>
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md">
            <div className="mb-4 text-5xl">📭</div>
            <h2 className="text-xl font-bold text-gray-800">No orders found</h2>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl bg-white p-6 shadow-md">
                <div className="flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <h2 className="text-xl font-bold text-gray-800">#{order.id}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${getStatusClass(order.status)}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="grid gap-5 py-5 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500">Delivery Type</p>
                    <p className="mt-1 font-medium capitalize text-gray-700">
                      {String(order.delivery_type || "standard").replace(/_/g, " ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className="mt-1 font-medium capitalize text-gray-700">
                      {order.payment_status}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Order Total</p>
                    <p className="mt-1 text-xl font-bold text-green-700">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleAccept(order.id)}
                        disabled={actioningId === order.id}
                        className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        ✓ Accept Order
                      </button>

                      <button
                        onClick={() => handleReject(order.id)}
                        disabled={actioningId === order.id}
                        className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}

                  {NEXT_STATUS[order.status] && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, order.status)}
                      disabled={actioningId === order.id}
                      className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
                    >
                      {NEXT_STATUS_LABEL[order.status]}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;