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

const emptyForm = {
  name: "",
  sku: "",
  price: "",
  stock_quantity: "",
  unit: "piece",
  description: "",
  discount_percent: 0,
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest("/vendor/products");
      setProducts(response?.data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImageIfNeeded = async (productId) => {
    if (!imageFile) return;

    const formData = new FormData();
    formData.append("image", imageFile);

    const token = getToken();
    const response = await fetch(`${API_URL}/products/${productId}/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Image upload failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.sku.trim() || !form.price || form.stock_quantity === "") {
      setError("Please fill all required fields.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        stock_quantity: Number(form.stock_quantity),
        unit: form.unit,
        description: form.description.trim(),
        discount_percent: Number(form.discount_percent || 0),
      };

      let productId = editingId;

      if (editingId) {
        await apiRequest(`/vendor/products/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        const created = await apiRequest("/vendor/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        productId = created?.data?.id;
      }

      if (productId) {
        await uploadImageIfNeeded(productId);
      }

      await loadProducts();
      resetForm();
    } catch (err) {
      console.error("Save product failed:", err);
      setError(err.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock_quantity: product.stock_quantity,
      unit: product.unit,
      description: product.description || "",
      discount_percent: product.discount_percent || 0,
    });
    setImageFile(null);
    setImagePreview(product.image_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await apiRequest(`/vendor/products/${id}`, { method: "DELETE" });
      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    }
  };

  const toggleProduct = async (id) => {
    try {
      await apiRequest(`/vendor/products/${id}/toggle`, { method: "PATCH" });
      await loadProducts();
    } catch (err) {
      setError(err.message || "Unable to toggle product.");
    }
  };

  const getFinalPrice = (product) => {
    const price = Number(product.price);
    const discount = Number(product.discount_percent || 0);
    return Math.round(price - (price * discount) / 100);
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="font-semibold text-green-600">Vendor Panel</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-800">
            📦 Product Management
          </h1>
          <p className="mt-2 text-gray-500">
            Add, edit and manage your store products.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {editingId ? "✏️ Edit Product" : "➕ Add Product"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Product Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Example: Fortune Sunflower Oil"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                SKU *
              </label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="Example: OIL-001"
                disabled={Boolean(editingId)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Price *
              </label>
              <input
                type="number"
                min="0"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="₹0"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Stock *
              </label>
              <input
                type="number"
                min="0"
                name="stock_quantity"
                value={form.stock_quantity}
                onChange={handleChange}
                placeholder="Available quantity"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Unit
              </label>
              <input
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="piece, kg, litre..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                name="discount_percent"
                value={form.discount_percent}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="2"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Product Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm"
            />

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="h-32 w-32 rounded-xl object-cover shadow"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
          </button>
        </form>

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Your Products</h2>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              {products.length} Products
            </span>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500">No products yet.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className="relative">
                    <img
                      src={product.image_url || "https://via.placeholder.com/500"}
                      alt={product.name}
                      className="h-48 w-full object-cover"
                    />

                    {Number(product.discount_percent) > 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                        {product.discount_percent}% OFF
                      </span>
                    )}

                    {!product.is_available && (
                      <span className="absolute right-3 top-3 rounded-full bg-gray-700 px-3 py-1 text-xs font-bold text-white">
                        Hidden
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="font-bold text-green-700">
                        ₹{getFinalPrice(product)}
                      </span>

                      {Number(product.discount_percent) > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      Stock: <span className="font-semibold">{product.stock_quantity}</span>
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => editProduct(product)}
                        className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => toggleProduct(product.id)}
                        className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        {product.is_available ? "Hide" : "Show"}
                      </button>

                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;