import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function apiRequest(endpoint) {
  const token = getToken();
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

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

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [dashboardRes, ordersRes] = await Promise.all([
          apiRequest("/vendor/dashboard"),
          apiRequest("/vendor/orders?limit=5"),
        ]);

        setSummary(dashboardRes?.data || null);
        setRecentOrders((ordersRes?.data || []).slice(0, 5));
      } catch (err) {
        console.error("Failed to load vendor dashboard:", err);
        setError(err.message || "Unable to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = summary
    ? [
        {
          title: "Today's Sales",
          value: `₹${Number(summary.todays_sales).toFixed(2)}`,
          icon: "💰",
          color: "bg-green-100 text-green-700",
        },
        {
          title: "Today's Orders",
          value: summary.todays_order_count,
          icon: "🛍️",
          color: "bg-blue-100 text-blue-700",
        },
        {
          title: "Total Products",
          value: summary.total_products,
          icon: "📦",
          color: "bg-purple-100 text-purple-700",
        },
        {
          title: "Low Stock",
          value: summary.low_stock_products,
          icon: "⚠️",
          color: "bg-yellow-100 text-yellow-700",
        },
        {
          title: "Pending Orders",
          value: summary.pending_orders,
          icon: "⏳",
          color: "bg-orange-100 text-orange-700",
        },
      ]
    : [];

  function formatStatus(status) {
    return status
      .split("_")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
  }

  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-purple-100 text-purple-700",
    out_for_delivery: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-semibold text-green-600">Vendor Panel</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-800">
              🏪 Vendor Dashboard
            </h1>
            <p className="mt-2 text-gray-500">
              Manage your products, inventory, orders and sales.
            </p>
          </div>

          <Link
            to="/vendor/products"
            className="rounded-xl bg-green-600 px-5 py-3 text-center font-semibold text-white shadow transition hover:bg-green-700"
          >
            + Add Product
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md">
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="rounded-2xl bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${stat.color}`}
                    >
                      {stat.icon}
                    </div>
                  </div>

                  <p className="mt-5 text-sm text-gray-500">{stat.title}</p>
                  <h2 className="mt-1 text-2xl font-bold text-gray-800">
                    {stat.value}
                  </h2>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-5 text-xl font-bold text-gray-800">
                Quick Actions
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  to="/vendor/products"
                  className="rounded-xl border border-green-100 bg-green-50 p-5 transition hover:bg-green-100"
                >
                  <div className="text-3xl">📦</div>
                  <h3 className="mt-3 font-bold text-gray-800">
                    Manage Products
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add, edit and manage products.
                  </p>
                </Link>

                <Link
                  to="/vendor/inventory"
                  className="rounded-xl border border-blue-100 bg-blue-50 p-5 transition hover:bg-blue-100"
                >
                  <div className="text-3xl">📋</div>
                  <h3 className="mt-3 font-bold text-gray-800">Inventory</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Monitor stock levels.
                  </p>
                </Link>

                <Link
                  to="/vendor/orders"
                  className="rounded-xl border border-orange-100 bg-orange-50 p-5 transition hover:bg-orange-100"
                >
                  <div className="text-3xl">🛍️</div>
                  <h3 className="mt-3 font-bold text-gray-800">
                    Manage Orders
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Accept and update orders.
                  </p>
                </Link>

                <Link
                  to="/vendor/sales"
                  className="rounded-xl border border-purple-100 bg-purple-50 p-5 transition hover:bg-purple-100"
                >
                  <div className="text-3xl">📈</div>
                  <h3 className="mt-3 font-bold text-gray-800">
                    Sales Analytics
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    View sales and best sellers.
                  </p>
                </Link>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Recent Orders
                </h2>

                <Link
                  to="/vendor/orders"
                  className="font-semibold text-green-600 hover:text-green-700"
                >
                  View All →
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <p className="text-gray-500">No orders yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b text-left text-sm text-gray-500">
                        <th className="px-4 py-3">Order</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-4 py-4 font-semibold text-gray-800">
                            #{order.id}
                          </td>

                          <td className="px-4 py-4 font-semibold text-green-700">
                            ₹{Number(order.total_amount).toFixed(2)}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                statusClasses[order.status] ||
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {formatStatus(order.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;