import { useEffect, useState } from "react";

const STORAGE_KEY = "kirana_vendor_products";

const initialProducts = [
  {
    id: 1,
    name: "India Gate Basmati Rice",
    category: "Rice & Grains",
    brand: "India Gate",
    price: 650,
    stock: 42,
    discount: 5,
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80",
    active: true,
  },
  {
    id: 2,
    name: "Aashirvaad Atta 5kg",
    category: "Flour",
    brand: "Aashirvaad",
    price: 280,
    stock: 8,
    discount: 10,
    image:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80",
    active: true,
  },
  {
    id: 3,
    name: "Tata Salt 1kg",
    category: "Staples",
    brand: "Tata",
    price: 30,
    stock: 0,
    discount: 0,
    image:
      "https://images.unsplash.com/photo-1518110925495-5fe2c3c0b6b0?auto=format&fit=crop&w=500&q=80",
    active: false,
  },
];

function Products() {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    stock: "",
    discount: 0,
    image: "",
    active: true,
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(products)
    );
  }, [products]);

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      brand: "",
      price: "",
      stock: "",
      discount: 0,
      image: "",
      active: true,
    });

    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.category.trim() ||
      !form.price ||
      form.stock === ""
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const productData = {
      ...form,
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      discount: Number(form.discount || 0),
    };

    if (editingId) {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === editingId
            ? {
                ...product,
                ...productData,
              }
            : product
        )
      );
    } else {
      setProducts((prev) => [
        {
          id: Date.now(),
          ...productData,
        },
        ...prev,
      ]);
    }

    resetForm();
  };

  const editProduct = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name,
      category: product.category,
      brand: product.brand || "",
      price: product.price,
      stock: product.stock,
      discount: product.discount || 0,
      image: product.image || "",
      active: product.active !== false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteProduct = (id) => {
    if (!window.confirm("Delete this product?")) return;

    setProducts((prev) =>
      prev.filter((product) => product.id !== id)
    );
  };

  const toggleProduct = (id) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              active: !product.active,
            }
          : product
      )
    );
  };

  const getFinalPrice = (product) => {
    return Math.round(
      product.price -
        (product.price * product.discount) / 100
    );
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="font-semibold text-green-600">
            Vendor Panel
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-800">
            📦 Product Management
          </h1>

          <p className="mt-2 text-gray-500">
            Add, edit and manage your store products.
          </p>
        </div>

        {/* Product Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl bg-white p-6 shadow-md"
        >
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

            {/* Product Name */}
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

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category *
              </label>

              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Example: Cooking Oil"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Brand
              </label>

              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Example: Fortune"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            {/* Price */}
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

            {/* Stock */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Stock *
              </label>

              <input
                type="number"
                min="0"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="Available quantity"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Discount (%)
              </label>

              <input
                type="number"
                min="0"
                max="100"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* Image */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Product Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm"
            />

            {form.image && (
              <div className="mt-4">
                <img
                  src={form.image}
                  alt="Product preview"
                  className="h-32 w-32 rounded-xl object-cover shadow"
                />
              </div>
            )}
          </div>

          {/* Active */}
          <label className="mt-5 flex items-center gap-3">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
              className="h-4 w-4"
            />

            <span className="font-medium text-gray-700">
              Product is active and visible to customers
            </span>
          </label>

          <button
            type="submit"
            className="mt-6 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow hover:bg-green-700"
          >
            {editingId ? "Update Product" : "Add Product"}
          </button>
        </form>

        {/* Product List */}
        <div className="rounded-2xl bg-white p-6 shadow-md">

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Your Products
            </h2>

            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              {products.length} Products
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="relative">
                  <img
                    src={
                      product.image ||
                      "https://via.placeholder.com/500"
                    }
                    alt={product.name}
                    className="h-48 w-full object-cover"
                  />

                  {product.discount > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase text-green-600">
                    {product.category}
                  </p>

                  <h3 className="mt-1 font-bold text-gray-800">
                    {product.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {product.brand}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="font-bold text-green-700">
                      ₹{getFinalPrice(product)}
                    </span>

                    {product.discount > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{product.price}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    Stock:{" "}
                    <span className="font-semibold">
                      {product.stock}
                    </span>
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
                      {product.active ? "Hide" : "Show"}
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
        </div>

      </div>
    </div>
  );
}

export default Products;