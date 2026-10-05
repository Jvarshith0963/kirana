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

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
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

function getStatus(stock) {
  if (stock <= 0) {
    return { label: "Out of Stock", className: "bg-red-100 text-red-700" };
  }
  if (stock <= 10) {
    return { label: "Low Stock", className: "bg-yellow-100 text-yellow-700" };
  }
  return { label: "Available", className: "bg-green-100 text-green-700" };
}

function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [localStock, setLocalStock] = useState({});

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/vendor/products");
      setProducts(response?.data || []);
    } catch (err) {
      console.error("Failed to load inventory:", err);
      setError(err.message || "Unable to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleStockChange = (id, value) => {
    setLocalStock((prev) => ({ ...prev, [id]: value }));
  };

  const handleStockSave = async (id) => {
    const value = localStock[id];
    if (value === undefined) return;

    const stock = Math.max(0, Number(value) || 0);

    setSavingId(id);
    setError("");
    try {
      await apiRequest(`/vendor/products/${id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ stock_quantity: stock }),
      });
      await loadProducts();
      setLocalStock((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      setError(err.message || "Unable to update stock.");
    } finally {
      setSavingId(null);
    }
  };

  const lowStockCount = products.filter((p) => {
    const stock = Number(p.stock_quantity);
    return stock > 0 && stock <= 10;
  }).length;

  const outOfStockCount = products.filter(
    (p) => Number(p.stock_quantity) <= 0
  ).length;

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="font-semibold text-green-600">Vendor Panel</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-800">
            📋 Inventory Management
          </h1>
          <p className="mt-2 text-gray-500">
            Monitor stock levels and update inventory.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-md">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="mt-2 text-3xl font-bold text-gray-800">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <p className="text-sm text-gray-500">Low Stock</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {lowStockCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <p className="text-sm text-gray-500">Out of Stock</p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {outOfStockCount}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-md">
          {loading ? (
            <p className="p-8 text-center text-gray-500">
              Loading inventory...
            </p>
          ) : products.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No products yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Update</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => {
                    const stock = Number(product.stock_quantity) || 0;
                    const status = getStatus(stock);
                    const editingValue = localStock[product.id] ?? stock;

                    return (
                      <tr
                        key={product.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-gray-800">
                            {product.name}
                          </p>
                        </td>

                        <td className="px-6 py-5 text-gray-600">
                          {product.sku}
                        </td>

                        <td className="px-6 py-5 font-semibold text-green-700">
                          ₹{product.price}
                        </td>

                        <td className="px-6 py-5">
                          <span className="font-bold text-gray-800">
                            {stock}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={editingValue}
                              onChange={(e) =>
                                handleStockChange(product.id, e.target.value)
                              }
                              className="w-24 rounded-lg border px-3 py-2 outline-none focus:border-green-500"
                            />

                            <button
                              onClick={() => handleStockSave(product.id)}
                              disabled={savingId === product.id}
                              className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                            >
                              {savingId === product.id ? "..." : "Save"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inventory;