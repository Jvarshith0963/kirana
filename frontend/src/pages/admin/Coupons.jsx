import { useEffect, useState } from "react";

const STORAGE_KEY = "kirana_admin_coupons";

const initialCoupons = [
  {
    id: 1,
    code: "KIRANA10",
    description: "10% off on your order",
    type: "Percentage",
    value: 10,
    minOrder: 300,
    maxDiscount: 100,
    expiry: "2026-12-31",
    usageLimit: 100,
    active: true,
  },
  {
    id: 2,
    code: "SAVE50",
    description: "Flat ₹50 discount",
    type: "Fixed",
    value: 50,
    minOrder: 500,
    maxDiscount: 50,
    expiry: "2026-11-30",
    usageLimit: 200,
    active: true,
  },
];

export default function Coupons() {
  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialCoupons;
  });

  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    code: "",
    description: "",
    type: "Percentage",
    value: "",
    minOrder: "",
    maxDiscount: "",
    expiry: "",
    usageLimit: "",
    active: true,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
  }, [coupons]);

  const resetForm = () => {
    setForm({
      code: "",
      description: "",
      type: "Percentage",
      value: "",
      minOrder: "",
      maxDiscount: "",
      expiry: "",
      usageLimit: "",
      active: true,
    });

    setEditingCoupon(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.code.trim() || !form.value || !form.expiry) {
      alert("Please fill all required fields.");
      return;
    }

    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((coupon) =>
          coupon.id === editingCoupon.id
            ? {
                ...coupon,
                ...form,
                code: form.code.toUpperCase(),
                value: Number(form.value),
                minOrder: Number(form.minOrder || 0),
                maxDiscount: Number(form.maxDiscount || 0),
                usageLimit: Number(form.usageLimit || 0),
              }
            : coupon
        )
      );
    } else {
      const newCoupon = {
        id: Date.now(),
        ...form,
        code: form.code.toUpperCase(),
        value: Number(form.value),
        minOrder: Number(form.minOrder || 0),
        maxDiscount: Number(form.maxDiscount || 0),
        usageLimit: Number(form.usageLimit || 0),
      };

      setCoupons((prev) => [newCoupon, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      maxDiscount: coupon.maxDiscount,
      expiry: coupon.expiry,
      usageLimit: coupon.usageLimit,
      active: coupon.active,
    });

    setShowForm(true);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmed) return;

    setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
  };

  const toggleCoupon = (id) => {
    setCoupons((prev) =>
      prev.map((coupon) =>
        coupon.id === id
          ? { ...coupon, active: !coupon.active }
          : coupon
      )
    );
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const query = search.toLowerCase();

    return (
      coupon.code.toLowerCase().includes(query) ||
      coupon.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Coupon Management
          </h1>

          <p className="text-gray-500 mt-1">
            Create, edit and manage promotional coupons.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCoupon(null);
            setForm({
              code: "",
              description: "",
              type: "Percentage",
              value: "",
              minOrder: "",
              maxDiscount: "",
              expiry: "",
              usageLimit: "",
              active: true,
            });
            setShowForm(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
        >
          + Create Coupon
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <input
          type="text"
          placeholder="Search coupon code or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {editingCoupon ? "Edit Coupon" : "Create Coupon"}
            </h2>

            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-800 text-xl"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                Coupon Code *
              </label>

              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="KIRANA20"
                className="w-full border rounded-lg px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>

              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="20% off on grocery orders"
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Discount Type
              </label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              >
                <option value="Percentage">Percentage</option>
                <option value="Fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Discount Value *
              </label>

              <input
                type="number"
                name="value"
                value={form.value}
                onChange={handleChange}
                placeholder="10"
                className="w-full border rounded-lg px-4 py-3"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Order
              </label>

              <input
                type="number"
                name="minOrder"
                value={form.minOrder}
                onChange={handleChange}
                placeholder="300"
                className="w-full border rounded-lg px-4 py-3"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Maximum Discount
              </label>

              <input
                type="number"
                name="maxDiscount"
                value={form.maxDiscount}
                onChange={handleChange}
                placeholder="100"
                className="w-full border rounded-lg px-4 py-3"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Expiry Date *
              </label>

              <input
                type="date"
                name="expiry"
                value={form.expiry}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Usage Limit
              </label>

              <input
                type="number"
                name="usageLimit"
                value={form.usageLimit}
                onChange={handleChange}
                placeholder="100"
                className="w-full border rounded-lg px-4 py-3"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="w-5 h-5"
                />

                <span className="font-medium">
                  Coupon is active
                </span>
              </label>
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                {editingCoupon ? "Update Coupon" : "Create Coupon"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="border border-gray-300 px-6 py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            All Coupons
          </h2>
        </div>

        {filteredCoupons.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No coupons found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-4">Code</th>
                  <th className="text-left px-5 py-4">Discount</th>
                  <th className="text-left px-5 py-4">Min Order</th>
                  <th className="text-left px-5 py-4">Expiry</th>
                  <th className="text-left px-5 py-4">Usage Limit</th>
                  <th className="text-left px-5 py-4">Status</th>
                  <th className="text-left px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCoupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-green-700">
                        {coupon.code}
                      </div>

                      <div className="text-sm text-gray-500">
                        {coupon.description}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {coupon.type === "Percentage"
                        ? `${coupon.value}%`
                        : `₹${coupon.value}`}
                    </td>

                    <td className="px-5 py-4">
                      ₹{coupon.minOrder}
                    </td>

                    <td className="px-5 py-4">
                      {coupon.expiry}
                    </td>

                    <td className="px-5 py-4">
                      {coupon.usageLimit || "Unlimited"}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleCoupon(coupon.id)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          coupon.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {coupon.active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}