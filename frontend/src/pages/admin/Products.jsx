
import { useEffect, useMemo, useState } from "react";

const PRODUCT_KEY = "kirana_admin_products";
const ADMIN_DATA_KEY = "kirana_admin_data";

const demoProducts = [
  {
    id: 1,
    name: "Premium Basmati Rice",
    price: 180,
    stock: 45,
    category: "Groceries",
    brand: "Tata",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500",
    description: "Premium long-grain rice for everyday meals.",
  },
  {
    id: 2,
    name: "Whole Wheat Atta",
    price: 260,
    stock: 30,
    category: "Groceries",
    brand: "Aashirvaad",
    image: "https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=500",
    description: "Whole wheat flour for soft homemade rotis.",
  },
  {
    id: 3,
    name: "Amul Butter",
    price: 58,
    stock: 12,
    category: "Dairy",
    brand: "Amul",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500",
    description: "Creamy butter for breakfast and cooking.",
  },
  {
    id: 4,
    name: "Classic Potato Chips",
    price: 20,
    stock: 0,
    category: "Snacks",
    brand: "Other",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500",
    description: "Crunchy potato chips for snack time.",
  },
];

const emptyForm = {
  name: "",
  price: "",
  stock: "",
  category: "",
  brand: "",
  image: "",
  description: "",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const panelClass =
  "rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-900/[0.03]";

function loadProducts() {
  try {
    const saved = localStorage.getItem(PRODUCT_KEY);
    return saved ? JSON.parse(saved) : demoProducts;
  } catch {
    return demoProducts;
  }
}

function loadOptions() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_DATA_KEY) || "{}");
    return {
      categories: (saved.categories || []).map((item) => item.name),
      brands: (saved.brands || []).map((item) => item.name),
    };
  } catch {
    return { categories: [], brands: [] };
  }
}

function ProductBadge({ stock }) {
  const style =
    stock === 0
      ? "bg-red-50 text-red-700"
      : stock <= 10
        ? "bg-amber-50 text-amber-700"
        : "bg-emerald-50 text-emerald-700";

  const label =
    stock === 0 ? "Out of stock" : stock <= 10 ? "Low stock" : "In stock";

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${style}`}>
      {label}
    </span>
  );
}

function ActionButton({ children, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
        danger
          ? "bg-red-50 text-red-700 hover:bg-red-100"
          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      }`}
    >
      {children}
    </button>
  );
}

export default function ProductManagement() {
  const [products, setProducts] = useState(loadProducts);
  const [options, setOptions] = useState(loadOptions);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    const refreshOptions = () => setOptions(loadOptions());
    window.addEventListener("storage", refreshOptions);
    return () => window.removeEventListener("storage", refreshOptions);
  }, []);

  const categories = useMemo(
    () => [...new Set([...options.categories, ...products.map((p) => p.category).filter(Boolean)])],
    [options.categories, products]
  );

  const brands = useMemo(
    () => [...new Set([...options.brands, ...products.map((p) => p.brand).filter(Boolean)])],
    [options.brands, products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        `${product.name} ${product.brand} ${product.category}`
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        categoryFilter === "All" || product.category === categoryFilter;

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "In stock" && Number(product.stock) > 10) ||
        (stockFilter === "Low stock" &&
          Number(product.stock) > 0 &&
          Number(product.stock) <= 10) ||
        (stockFilter === "Out of stock" && Number(product.stock) === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const totalValue = products.reduce(
    (sum, product) =>
      sum + Number(product.price || 0) * Number(product.stock || 0),
    0
  );

  const lowStock = products.filter(
    (product) => Number(product.stock) > 0 && Number(product.stock) <= 10
  ).length;

  const outOfStock = products.filter(
    (product) => Number(product.stock) === 0
  ).length;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setShowForm(true);
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      brand: product.brand,
      image: product.image || "",
      description: product.description || "",
    });
    setMessage("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim() || !form.category || !form.brand) {
      setMessage("Please complete all required fields.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setMessage("Enter a valid price greater than zero.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setMessage("Stock must be a whole number of zero or more.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      price,
      stock,
      category: form.category,
      brand: form.brand,
      image: form.image.trim(),
      description: form.description.trim(),
    };

    if (editingId !== null) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingId ? { ...product, ...productData } : product
        )
      );
      setMessage("Product updated successfully.");
    } else {
      setProducts((current) => [
        { id: Date.now(), ...productData },
        ...current,
      ]);
      setMessage("Product added successfully.");
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    setProducts((current) =>
      current.filter((item) => item.id !== product.id)
    );

    if (editingId === product.id) cancelForm();
    setMessage("Product deleted.");
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">
            Inventory control
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Product management
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Add products, manage pricing, and keep track of inventory.
          </p>
        </div>

        <button
          onClick={startAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-800/10 transition hover:-translate-y-0.5 hover:bg-emerald-800"
        >
          <span className="text-lg">+</span> Add product
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total products",
            value: products.length,
            icon: "▦",
            color: "bg-blue-50 text-blue-700",
            detail: "Products in catalog",
          },
          {
            label: "Inventory units",
            value: products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
            icon: "▣",
            color: "bg-emerald-50 text-emerald-700",
            detail: "Units currently in stock",
          },
          {
            label: "Low stock",
            value: lowStock,
            icon: "◷",
            color: "bg-amber-50 text-amber-700",
            detail: "Products need restocking",
          },
          {
            label: "Out of stock",
            value: outOfStock,
            icon: "!",
            color: "bg-rose-50 text-rose-700",
            detail: "Products unavailable",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${panelClass} p-5 transition hover:-translate-y-1 hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${stat.color}`}>
                {stat.icon}
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">
              {stat.value}
            </p>
            <p className="mt-2 text-xs text-gray-500">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Add/edit form */}
      {showForm && (
        <section className={`${panelClass} overflow-hidden`}>
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4 sm:px-6">
            <div>
              <h3 className="font-extrabold text-gray-900">
                {editingId !== null ? "Edit product" : "Add a new product"}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Fields marked with * are required.
              </p>
            </div>
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-lg px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-200"
            >
              ✕ Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            {message && (
              <div role="alert" className="rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800">
                {message}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Product name *
                </label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Premium Basmati Rice"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Price (₹) *
                </label>
                <input
                  className={inputClass}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder="e.g. 180"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Stock quantity *
                </label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => updateField("stock", e.target.value)}
                  placeholder="e.g. 50"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Category *
                </label>
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                  {!categories.length && (
                    <option value="Groceries">Groceries</option>
                  )}
                </select>
                {!categories.length && (
                  <p className="mt-1 text-xs text-gray-400">
                    Add more categories in Category Management.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Brand *
                </label>
                <select
                  className={inputClass}
                  value={form.brand}
                  onChange={(e) => updateField("brand", e.target.value)}
                  required
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                  {!brands.length && (
                    <option value="Other">Other</option>
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Product image URL
                </label>
                <input
                  className={inputClass}
                  type="url"
                  value={form.image}
                  onChange={(e) => updateField("image", e.target.value)}
                  placeholder="https://example.com/product.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Description
                </label>
                <textarea
                  className={`${inputClass} min-h-24 resize-y`}
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe this product..."
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelForm}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
              >
                {editingId !== null ? "Save changes" : "Create product"}
              </button>
            </div>
          </form>
        </section>
      )}

      {message && !showForm && (
        <div role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {message}
        </div>
      )}

      {/* Inventory value */}
      <div className="flex flex-col justify-between gap-2 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold text-emerald-900">Estimated inventory value</p>
          <p className="mt-1 text-xs text-emerald-800/70">Based on current product prices and stock quantities.</p>
        </div>
        <p className="text-2xl font-extrabold text-emerald-800">
          ₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Search and filters */}
      <section className={`${panelClass} overflow-hidden`}>
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:p-5 lg:flex-row">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
              ⌕
            </span>
            <input
              className={`${inputClass} pl-10`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, brand, or category..."
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
            <select
              className={inputClass}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="All">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              className={inputClass}
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              aria-label="Filter by stock status"
            >
              <option value="All">All stock statuses</option>
              <option value="In stock">In stock</option>
              <option value="Low stock">Low stock</option>
              <option value="Out of stock">Out of stock</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <h3 className="font-extrabold text-gray-900">Product inventory</h3>
          <span className="text-xs font-semibold text-gray-500">
            {filteredProducts.length} of {products.length} products
          </span>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
              <tr>
                {["Product", "Category / Brand", "Price", "Stock", "Status", "Actions"].map((item) => (
                  <th key={item} className="px-5 py-4 font-bold">{item}</th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="transition hover:bg-gray-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-xl border border-gray-100 bg-gray-50 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl">🛍️</div>
                      )}
                      <div className="max-w-52">
                        <p className="font-bold text-gray-800">{product.name}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-gray-400">{product.description || "No description"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-700">{product.category}</p>
                    <p className="mt-1 text-xs text-gray-500">{product.brand}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-extrabold text-gray-900">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-700">{product.stock} units</td>
                  <td className="px-5 py-4"><ProductBadge stock={Number(product.stock)} /></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <ActionButton onClick={() => startEdit(product)}>Edit</ActionButton>
                      <ActionButton danger onClick={() => deleteProduct(product)}>Delete</ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile product cards */}
        <div className="divide-y divide-gray-100 md:hidden">
          {filteredProducts.map((product) => (
            <div key={product.id} className="p-4">
              <div className="flex gap-3">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-20 w-20 shrink-0 rounded-xl border border-gray-100 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl">🛍️</div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900">{product.name}</h4>
                  <p className="mt-1 text-xs text-gray-500">{product.category} · {product.brand}</p>
                  <p className="mt-2 text-lg font-extrabold text-emerald-800">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>
                  <div className="mt-2"><ProductBadge stock={Number(product.stock)} /></div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500">{product.stock} units in stock</span>
                <div className="flex gap-2">
                  <ActionButton onClick={() => startEdit(product)}>Edit</ActionButton>
                  <ActionButton danger onClick={() => deleteProduct(product)}>Delete</ActionButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">🛍️</div>
            <h3 className="font-extrabold text-gray-900">No products found</h3>
            <p className="mt-2 text-sm text-gray-500">Try another search or change your filters.</p>
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("All");
                setStockFilter("All");
              }}
              className="mt-4 text-sm font-bold text-emerald-700 hover:text-emerald-900"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <p className="text-center text-xs leading-5 text-gray-400">
        Demo product data is saved in this browser only. Product images use external image URLs.
      </p>
    </div>
  );
}
