
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProductManagement from "./Products";
import Coupons from "./Coupons";
import Banners from "./Banners";
import Analytics from "./Analytics";
import ReturnsRefunds from "./ReturnsRefunds";

const ADMIN_DATA_KEY = "kirana_admin_data";
const ADMIN_AUTH_KEY = "kirana_admin_authenticated";

const defaultData = {
  customers: [
    { id: 1, name: "Rahul Kumar", email: "rahul@example.com", status: "Active" },
    { id: 2, name: "Anil Kumar", email: "anil@example.com", status: "Active" },
    { id: 3, name: "Priya Sharma", email: "priya@example.com", status: "Blocked" },
  ],
  vendors: [
    { id: 101, name: "Priya Stores", email: "priya.stores@example.com", status: "Approved" },
    { id: 102, name: "Fresh Mart", email: "freshmart@example.com", status: "Pending" },
    { id: 103, name: "Daily Needs", email: "dailyneeds@example.com", status: "Suspended" },
  ],
  categories: [
    { id: 1, name: "Groceries", subcategories: ["Rice & Grains", "Flour", "Pulses"] },
    { id: 2, name: "Dairy", subcategories: ["Milk", "Butter", "Cheese"] },
    { id: 3, name: "Snacks", subcategories: ["Chips", "Biscuits", "Namkeen"] },
  ],
  brands: [
    { id: 1, name: "Aashirvaad" },
    { id: 2, name: "Amul" },
    { id: 3, name: "Tata" },
  ],
};

function loadAdminData() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_DATA_KEY));

    if (!saved || typeof saved !== "object") return defaultData;

    return {
      customers: Array.isArray(saved.customers) ? saved.customers : defaultData.customers,
      vendors: Array.isArray(saved.vendors) ? saved.vendors : defaultData.vendors,
      categories: Array.isArray(saved.categories) ? saved.categories : defaultData.categories,
      brands: Array.isArray(saved.brands) ? saved.brands : defaultData.brands,
    };
  } catch {
    return defaultData;
  }
}

function StatusBadge({ status }) {
  const styles = {
    Active: "bg-green-100 text-green-700",
    Approved: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-700",
    Blocked: "bg-red-100 text-red-700",
    Suspended: "bg-red-100 text-red-700",
    Rejected: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
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
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [page, setPage] = useState("Overview");
  const [data, setData] = useState(loadAdminData);
  const [search, setSearch] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [brandName, setBrandName] = useState("");

  useEffect(() => {
    localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(data));
  }, [data]);

  const navItems = [
    { key: "Overview", label: "Overview", icon: "📊" },
    { key: "Customers", label: "Customers", icon: "👥" },
    { key: "Vendors", label: "Vendors", icon: "🏪" },
    { key: "Approvals", label: "Vendor approvals", icon: "✅" },
    { key: "Products", label: "Products", icon: "🛍️" },
    { key: "Coupons", label: "Coupons", icon: "🎟️" },
    { key: "Banners", label: "Banners & Offers", icon: "🖼️" },
    { key: "Analytics", label: "Analytics", icon: "📈" },
    { key: "ReturnsRefunds", label: "Returns & Refunds", icon: "↩️" },
    { key: "Categories", label: "Categories", icon: "🗂️" },
    { key: "Brands", label: "Brands", icon: "🏷️" },
  ];

  const updateCustomers = (customers) =>
    setData((current) => ({ ...current, customers }));

  const updateVendors = (vendors) =>
    setData((current) => ({ ...current, vendors }));

  const filteredCustomers = useMemo(() => {
    const term = search.toLowerCase();

    return data.customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term)
    );
  }, [data.customers, search]);

  const filteredVendors = useMemo(() => {
    const term = search.toLowerCase();

    return data.vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(term) ||
        vendor.email.toLowerCase().includes(term)
    );
  }, [data.vendors, search]);

  const pendingVendors = data.vendors.filter(
    (vendor) => vendor.status === "Pending"
  );

  const toggleCustomer = (customerId) => {
    updateCustomers(
      data.customers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              status: customer.status === "Blocked" ? "Active" : "Blocked",
            }
          : customer
      )
    );
  };

  const updateVendorStatus = (vendorId, status) => {
    updateVendors(
      data.vendors.map((vendor) =>
        vendor.id === vendorId ? { ...vendor, status } : vendor
      )
    );
  };

  const addCategory = (event) => {
    event.preventDefault();
    const name = categoryName.trim();

    if (!name) return;

    if (
      data.categories.some(
        (category) => category.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      alert("This category already exists.");
      return;
    }

    setData((current) => ({
      ...current,
      categories: [
        ...current.categories,
        { id: Date.now(), name, subcategories: [] },
      ],
    }));

    setCategoryName("");
  };

  const addSubcategory = (event) => {
    event.preventDefault();
    const name = subcategoryName.trim();

    if (!name || !selectedCategory) {
      alert("Select a category and enter a subcategory name.");
      return;
    }

    const category = data.categories.find(
      (item) => item.id === Number(selectedCategory)
    );

    if (
      category?.subcategories.some(
        (item) => item.toLowerCase() === name.toLowerCase()
      )
    ) {
      alert("This subcategory already exists.");
      return;
    }

    setData((current) => ({
      ...current,
      categories: current.categories.map((item) =>
        item.id === Number(selectedCategory)
          ? { ...item, subcategories: [...item.subcategories, name] }
          : item
      ),
    }));

    setSubcategoryName("");
  };

  const deleteCategory = (categoryId) => {
    if (!window.confirm("Delete this category and its subcategories?")) return;

    setData((current) => ({
      ...current,
      categories: current.categories.filter(
        (category) => category.id !== categoryId
      ),
    }));

    if (Number(selectedCategory) === categoryId) {
      setSelectedCategory("");
    }
  };

  const deleteSubcategory = (categoryId, subcategory) => {
    setData((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              subcategories: category.subcategories.filter(
                (item) => item !== subcategory
              ),
            }
          : category
      ),
    }));
  };

  const addBrand = (event) => {
    event.preventDefault();
    const name = brandName.trim();

    if (!name) return;

    if (
      data.brands.some(
        (brand) => brand.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      alert("This brand already exists.");
      return;
    }

    setData((current) => ({
      ...current,
      brands: [...current.brands, { id: Date.now(), name }],
    }));

    setBrandName("");
  };

  const deleteBrand = (brandId) => {
    if (!window.confirm("Delete this brand?")) return;

    setData((current) => ({
      ...current,
      brands: current.brands.filter((brand) => brand.id !== brandId),
    }));
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard overview
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your Kirana Marketplace from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Customers"
          value={data.customers.length}
          subtitle="Registered customers"
          icon="👥"
        />
        <StatCard
          title="Vendors"
          value={data.vendors.length}
          subtitle="All registered vendors"
          icon="🏪"
        />
        <StatCard
          title="Pending approvals"
          value={pendingVendors.length}
          subtitle="Vendors awaiting review"
          icon="⏳"
        />
        <StatCard
          title="Categories"
          value={data.categories.length}
          subtitle="Product categories"
          icon="🗂️"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Pending vendor approvals
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Review vendors before approving them.
              </p>
            </div>
            <button
              onClick={() => setPage("Approvals")}
              className="rounded-lg bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
            >
              View all
            </button>
          </div>

          {pendingVendors.length === 0 ? (
            <p className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
              No vendors are waiting for approval.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-gray-100">
              {pendingVendors.slice(0, 4).map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{vendor.name}</p>
                    <p className="text-sm text-gray-500">{vendor.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateVendorStatus(vendor.id, "Approved")
                      }
                      className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        updateVendorStatus(vendor.id, "Rejected")
                      }
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">Quick actions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your marketplace.
          </p>

          <div className="mt-5 space-y-3">
            {[
              ["🛍️", "Manage products", "Products"],
              ["🎟️", "Manage coupons", "Coupons"],
              ["🖼️", "Manage banners", "Banners"],
              ["📈", "View analytics", "Analytics"],
              ["↩️", "Returns & refunds", "ReturnsRefunds"],
              ["🗂️", "Manage categories", "Categories"],
              ["🏷️", "Manage brands", "Brands"],
              ["👥", "Manage customers", "Customers"],
            ].map(([icon, label, key]) => (
              <button
                key={key}
                onClick={() => setPage(key)}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left hover:border-green-200 hover:bg-green-50"
              >
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-semibold text-gray-700">
                  {label}
                </span>
                <span className="ml-auto text-gray-400">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">
          Marketplace snapshot
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Approved vendors</p>
            <p className="mt-2 text-2xl font-bold">
              {data.vendors.filter((v) => v.status === "Approved").length}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Blocked customers</p>
            <p className="mt-2 text-2xl font-bold">
              {data.customers.filter((c) => c.status === "Blocked").length}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Brands</p>
            <p className="mt-2 text-2xl font-bold">{data.brands.length}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Customer management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Search customers and block or unblock their demo accounts.
        </p>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by customer name or email..."
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 sm:max-w-md"
      />

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-5 py-4 font-semibold">{customer.name}</td>
                <td className="px-5 py-4 text-gray-500">{customer.email}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={customer.status} />
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggleCustomer(customer.id)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    {customer.status === "Blocked" ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredCustomers.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-gray-500"
                >
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVendors = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Vendor management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review vendor accounts and manage their status.
        </p>
      </div>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by vendor name or email..."
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 sm:max-w-md"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{vendor.name}</h3>
                <p className="mt-1 break-all text-sm text-gray-500">
                  {vendor.email}
                </p>
              </div>
              <StatusBadge status={vendor.status} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {vendor.status !== "Approved" && (
                <button
                  onClick={() => updateVendorStatus(vendor.id, "Approved")}
                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  Approve vendor
                </button>
              )}

              {vendor.status !== "Suspended" && (
                <button
                  onClick={() => updateVendorStatus(vendor.id, "Suspended")}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                >
                  Suspend
                </button>
              )}

              {vendor.status === "Suspended" && (
                <button
                  onClick={() => updateVendorStatus(vendor.id, "Approved")}
                  className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700"
                >
                  Reactivate
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredVendors.length === 0 && (
          <p className="text-sm text-gray-500">No vendors found.</p>
        )}
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Vendor approvals</h2>
        <p className="mt-1 text-sm text-gray-500">
          Approve or reject vendors waiting for review.
        </p>
      </div>

      {pendingVendors.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <div className="text-4xl">🎉</div>
          <h3 className="mt-3 font-bold">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no pending vendor applications.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {pendingVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{vendor.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{vendor.email}</p>
                </div>
                <StatusBadge status={vendor.status} />
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => updateVendorStatus(vendor.id, "Approved")}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateVendorStatus(vendor.id, "Rejected")}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Category management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create categories and manage their subcategories.
        </p>
      </div>

      <form
        onSubmit={addCategory}
        className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 sm:flex-row"
      >
        <input
          value={categoryName}
          onChange={(event) => setCategoryName(event.target.value)}
          placeholder="New category name"
          required
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3"
        />
        <button className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white">
          + Add category
        </button>
      </form>

      <form
        onSubmit={addSubcategory}
        className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 sm:flex-row"
      >
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          required
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3"
        >
          <option value="">Select category</option>
          {data.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          value={subcategoryName}
          onChange={(event) => setSubcategoryName(event.target.value)}
          placeholder="Subcategory name"
          required
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3"
        />

        <button className="rounded-xl border border-green-600 px-5 py-3 font-semibold text-green-700">
          + Add subcategory
        </button>
      </form>

      <div className="grid gap-4 lg:grid-cols-2">
        {data.categories.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold">{category.name}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {category.subcategories.length} subcategories
                </p>
              </div>
              <button
                onClick={() => deleteCategory(category.id)}
                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
              >
                Delete
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {category.subcategories.map((subcategory) => (
                <span
                  key={subcategory}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-xs"
                >
                  {subcategory}
                  <button
                    aria-label={`Delete ${subcategory}`}
                    onClick={() =>
                      deleteSubcategory(category.id, subcategory)
                    }
                    className="font-bold text-gray-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}

              {category.subcategories.length === 0 && (
                <p className="text-sm text-gray-400">No subcategories yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBrands = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Brand management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add or remove brands available in your marketplace.
        </p>
      </div>

      <form
        onSubmit={addBrand}
        className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 sm:flex-row"
      >
        <input
          value={brandName}
          onChange={(event) => setBrandName(event.target.value)}
          placeholder="Enter brand name"
          required
          className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3"
        />
        <button className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white">
          + Add brand
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.brands.map((brand) => (
          <div
            key={brand.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-lg">
                🏷️
              </div>
              <span className="font-semibold">{brand.name}</span>
            </div>
            <button
              onClick={() => deleteBrand(brand.id)}
              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const pageContent = {
    Overview: renderOverview,
    Customers: renderCustomers,
    Vendors: renderVendors,
    Approvals: renderApprovals,
    Products: () => <ProductManagement />,
    Coupons: () => <Coupons />,
    Banners: () => <Banners />,
    Analytics: () => <Analytics />,
    ReturnsRefunds: () => <ReturnsRefunds />,
    Categories: renderCategories,
    Brands: renderBrands,
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    navigate("/admin/login");
  };

  const currentContent = pageContent[page] || renderOverview;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 md:flex">
      <aside className="flex w-full flex-col bg-white md:fixed md:inset-y-0 md:w-64 md:border-r md:border-gray-200">
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-600 text-xl text-white">
            🛒
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">Kirana</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-3 md:flex-1 md:flex-col md:overflow-y-auto">
          <p className="hidden px-3 pb-2 pt-3 text-xs font-bold uppercase tracking-wider text-gray-400 md:block">
            Workspace
          </p>

          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setPage(item.key);
                setSearch("");
              }}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition md:w-full ${
                page === item.key
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>

              {item.key === "Approvals" && pendingVendors.length > 0 && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
                    page === item.key
                      ? "bg-white text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {pendingVendors.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="hidden border-t border-gray-100 p-4 md:block">
          <div className="mb-3 rounded-xl bg-green-50 p-3">
            <p className="text-sm font-bold text-green-800">Admin account</p>
            <p className="mt-1 text-xs text-green-700">Marketplace manager</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            ↪ Log out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 md:ml-64 md:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Kirana Marketplace / Admin
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-gray-900">
              {page === "Overview"
                ? "Welcome back, Admin 👋"
                : navItems.find((item) => item.key === page)?.label || page}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-gray-800">Administrator</p>
              <p className="text-xs text-gray-500">Demo dashboard</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
              A
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 md:hidden"
            >
              Logout
            </button>
          </div>
        </header>

        {currentContent()}

        <p className="mt-8 text-center text-xs text-gray-400">
          Kirana Marketplace Admin · Frontend demo data is saved in this browser.
        </p>
      </main>
    </div>
  );
}
