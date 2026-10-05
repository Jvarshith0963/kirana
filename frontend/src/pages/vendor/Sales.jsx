import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

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

function Sales() {
  const [period, setPeriod] = useState("daily");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest(`/vendor/sales?period=${period}`);
      setReport(response?.data || null);
    } catch (err) {
      console.error("Failed to load sales report:", err);
      setError(err.message || "Unable to load sales report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const bestSellerChartData = (report?.best_sellers || []).map((p) => ({
    product: p.name,
    sales: Number(p.units_sold),
  }));

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-semibold text-green-600">Vendor Panel</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-800">
              📈 Sales Dashboard
            </h1>
            <p className="mt-2 text-gray-500">
              Monitor sales performance and best-selling products.
            </p>
          </div>

          <div className="flex gap-2">
            {["daily", "weekly", "monthly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
                  period === p
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md">
            <p className="text-gray-500">Loading sales report...</p>
          </div>
        ) : report ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-md">
                <p className="text-sm text-gray-500">
                  Total Sales ({period})
                </p>
                <p className="mt-2 text-3xl font-bold text-green-700">
                  ₹{Number(report.total_sales).toFixed(2)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md">
                <p className="text-sm text-gray-500">Order Count</p>
                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {report.order_count}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-md">
                <p className="text-sm text-gray-500">Average Order Value</p>
                <p className="mt-2 text-3xl font-bold text-gray-800">
                  ₹{Number(report.average_order_value).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Best-Selling Products
                </h2>
                <p className="text-sm text-gray-500">
                  Highest units sold ({period})
                </p>
              </div>

              {bestSellerChartData.length === 0 ? (
                <p className="text-gray-500">No sales data for this period.</p>
              ) : (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bestSellerChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="product" angle={-15} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#16a34a" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Low-Selling Products
              </h2>

              {(report.low_sellers || []).length === 0 ? (
                <p className="text-gray-500">No data available.</p>
              ) : (
                <ul className="space-y-2">
                  {report.low_sellers.map((p) => (
                    <li
                      key={p.id}
                      className="flex justify-between rounded-lg bg-gray-50 px-4 py-3"
                    >
                      <span className="font-medium text-gray-700">{p.name}</span>
                      <span className="text-gray-500">
                        {p.units_sold} units sold
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default Sales;