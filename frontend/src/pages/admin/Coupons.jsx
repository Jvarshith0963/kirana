import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "kirana_admin_coupons";

const INITIAL_COUPONS = [
  {
    id: 1,
    code: "WELCOME10",
    type: "Percentage",
    discount: 10,
    minOrder: 299,
    usageLimit: 100,
    used: 24,
    expiry: "2027-03-31",
    status: "Active",
    description: "Welcome discount for new customers",
  },
  {
    id: 2,
    code: "SAVE50",
    type: "Fixed amount",
    discount: 50,
    minOrder: 499,
    usageLimit: 80,
    used: 37,
    expiry: "2027-01-31",
    status: "Active",
    description: "Save on eligible orders",
  },
];

const EMPTY_FORM = {
  code: "",
  type: "Percentage",
  discount: "",
  minOrder: "0",
  usageLimit: "0",
  expiry: "",
  status: "Active",
  description: "",
};

function loadCoupons() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  } catch {
    return INITIAL_COUPONS;
  }
}

function getStatus(coupon) {
  const today = new Date().toISOString().slice(0, 10);

  if (coupon.expiry < today) return "Expired";
  if (coupon.usageLimit > 0 && coupon.used >= coupon.usageLimit) {
    return "Used up";
  }

  return coupon.status;
}

function Badge({ status }) {
  const colors = {
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-gray-100 text-gray-600",
    Expired: "bg-red-100 text-red-700",
    "Used up": "bg-amber-100 text-amber-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        colors[status] || colors.Inactive
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
          {icon}
        </span>
      </div>
    </div>
  );
}

export default function Coupons() {
  const [coupons, setCoupons] = useState(loadCoupons);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
    } catch {
      setError("Unable to save. Browser storage may be full.");
    }
  }, [coupons]);

  const filteredCoupons = useMemo(() => {
    const term = search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSearch =
        coupon.code.toLowerCase().includes(term) ||
        (coupon.description || "").toLowerCase().includes(term);

      const matchesStatus =
        filter === "All" || getStatus(coupon) === filter;

      return matchesSearch && matchesStatus;
    });
  }, [coupons, search, filter]);

  const activeCount = coupons.filter(
    (coupon) => getStatus(coupon) === "Active"
  ).length;

  const expiredCount = coupons.filter(
    (coupon) => getStatus(coupon) === "Expired"
  ).length;

  const totalUses = coupons.reduce(
    (total, coupon) => total + Number(coupon.used || 0),
    0
  );

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setShowForm(true);
  }

  function openEdit(coupon) {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      type: coupon.type,
      discount: String(coupon.discount),
      minOrder: String(coupon.minOrder ?? 0),
      usageLimit: String(coupon.usageLimit ?? 0),
      expiry: coupon.expiry,
      status: coupon.status === "Active" ? "Active" : "Inactive",
      description: coupon.description || "",
    });
    setError("");
    setShowForm(true);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const code = form.code.trim().toUpperCase().replace(/\s+/g, "");
    const discount = Number(form.discount);
    const minOrder = Number(form.minOrder || 0);
    const usageLimit = Number(form.usageLimit || 0);
    const today = new Date().toISOString().slice(0, 10);

    if (!code) {
      setError("Enter a coupon code.");
      return;
    }

    if (
      coupons.some(
        (coupon) =>
          coupon.code.toLowerCase() === code.toLowerCase() &&
          coupon.id !== editingId
      )
    ) {
      setError("This coupon code already exists.");
      return;
    }

    if (!Number.isFinite(discount) || discount <= 0) {
      setError("Discount must be greater than zero.");
      return;
    }

    if (form.type === "Percentage" && discount > 100) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    if (!form.expiry || form.expiry < today) {
      setError("Choose today or a future expiry date.");
      return;
    }

    if (minOrder < 0 || usageLimit < 0) {
      setError("Values cannot be negative.");
      return;
    }

    const existing = coupons.find((coupon) => coupon.id === editingId);

    const newCoupon = {
      id: editingId ?? Date.now(),
      code,
      type: form.type,
      discount,
      minOrder,
      usageLimit,
      used: existing?.used || 0,
      expiry: form.expiry,
      status: form.status,
      description: form.description.trim(),
    };

    setCoupons((current) =>
      editingId
        ? current.map((coupon) =>
            coupon.id === editingId ? newCoupon : coupon
          )
        : [newCoupon, ...current]
    );

    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  }

  function deleteCoupon(coupon) {
    if (window.confirm(`Delete coupon ${coupon.code}?`)) {
      setCoupons((current) =>
        current.filter((item) => item.id !== coupon.id)
      );
    }
  }

  function toggleStatus(coupon) {
    const status = getStatus(coupon);

    if (status === "Expired" || status === "Used up") {
      window.alert("Expired or fully used coupons cannot be activated.");
      return;
    }

    setCoupons((current) =>
      current.map((item) =>
        item.id === coupon.id
          ? {
              ...item,
              status: item.status === "Active" ? "Inactive" : "Active",
            }
          : item
      )
    );
  }

  function discountText(coupon) {
    return coupon.type === "Percentage"
      ? `${coupon.discount}% off`
      : `₹${coupon.discount} off`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Coupon management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage promotional discount codes.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
        >
          + Create coupon
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total coupons"
          value={coupons.length}
          subtitle="Coupons in catalog"
          icon="🎟️"
        />
        <StatCard
          title="Active coupons"
          value={activeCount}
          subtitle="Currently available"
          icon="✅"
        />
        <StatCard
          title="Expired coupons"
          value={expiredCount}
          subtitle="Past expiry date"
          icon="⌛"
        />
        <StatCard
          title="Total redemptions"
          value={totalUses}
          subtitle="Demo usage count"
          icon="📊"
        />
      </div>

      {error && !showForm && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Coupon inventory
            </h3>
            <p className="text-sm text-gray-500">
              Showing {filteredCoupons.length} of {coupons.length} coupons
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search coupons..."
              className="rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-green-500"
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5"
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Expired</option>
              <option>Used up</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Coupon</th>
                <th className="px-5 py-4">Discount</th>
                <th className="px-5 py-4">Minimum order</th>
                <th className="px-5 py-4">Usage</th>
                <th className="px-5 py-4">Expiry</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-900">{coupon.code}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {coupon.description || "No description"}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-green-700">
                    {discountText(coupon)}
                  </td>
                  <td className="px-5 py-4">
                    ₹{Number(coupon.minOrder).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-4">
                    {coupon.used} / {coupon.usageLimit || "Unlimited"}
                  </td>
                  <td className="px-5 py-4">{coupon.expiry}</td>
                  <td className="px-5 py-4">
                    <Badge status={getStatus(coupon)} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-3 font-semibold">
                      <button
                        type="button"
                        onClick={() => openEdit(coupon)}
                        className="text-green-700 hover:text-green-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(coupon)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {coupon.status === "Active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCoupon(coupon)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCoupons.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No coupons found. Try another search or create a coupon.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-gray-400">
        Demo mode: coupon data is saved in this browser only.
      </p>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit coupon" : "Create a coupon"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Fill in the coupon details below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-gray-700">
                  Coupon code *
                  <input
                    required
                    maxLength={24}
                    value={form.code}
                    onChange={(event) =>
                      updateField("code", event.target.value.toUpperCase())
                    }
                    placeholder="SAVE20"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 uppercase"
                  />
                </label>

                <label className="text-sm font-semibold text-gray-700">
                  Discount type *
                  <select
                    value={form.type}
                    onChange={(event) => updateField("type", event.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5"
                  >
                    <option>Percentage</option>
                    <option>Fixed amount</option>
                  </select>
                </label>

                <label className="text-sm font-semibold text-gray-700">
                  Discount value *
                  <input
                    required
                    type="number"
                    min="0.01"
                    max={form.type === "Percentage" ? 100 : undefined}
                    step="0.01"
                    value={form.discount}
                    onChange={(event) =>
                      updateField("discount", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  />
                </label>

                <label className="text-sm font-semibold text-gray-700">
                  Minimum order value (₹)
                  <input
                    type="number"
                    min="0"
                    value={form.minOrder}
                    onChange={(event) =>
                      updateField("minOrder", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  />
                </label>

                <label className="text-sm font-semibold text-gray-700">
                  Usage limit
                  <input
                    type="number"
                    min="0"
                    value={form.usageLimit}
                    onChange={(event) =>
                      updateField("usageLimit", event.target.value)
                    }
                    placeholder="0 = unlimited"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  />
                </label>

                <label className="text-sm font-semibold text-gray-700">
                  Expiry date *
                  <input
                    required
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.expiry}
                    onChange={(event) =>
                      updateField("expiry", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  />
                </label>

                <label className="text-sm font-semibold text-gray-700">
                  Status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField("status", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </label>

                <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                  Description
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Describe this offer"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700"
                >
                  {editingId ? "Save changes" : "Create coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}