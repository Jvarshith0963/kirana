
import { useEffect, useState } from "react";

const STORAGE_KEY = "kirana_admin_banners";

const INITIAL_BANNERS = [
  {
    id: 1,
    title: "Fresh Groceries Delivered",
    description: "Shop your daily essentials at great prices.",
    imageUrl: "",
    buttonText: "Shop Now",
    link: "/products",
    active: true,
  },
  {
    id: 2,
    title: "Special Offers",
    description: "Save more on your favourite products.",
    imageUrl: "",
    buttonText: "Explore Offers",
    link: "/products",
    active: true,
  },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  imageUrl: "",
  buttonText: "Shop Now",
  link: "/products",
  active: true,
};

function loadBanners() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_BANNERS;
    }
  } catch (error) {
    console.error("Failed to load banners:", error);
  }

  return INITIAL_BANNERS;
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

export default function Banners() {
  const [banners, setBanners] = useState(loadBanners);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [previewId, setPreviewId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
  }, [banners]);

  const activeCount = banners.filter((b) => b.active).length;

  const filteredBanners = banners.filter((banner) => {
    const query = search.toLowerCase();

    const matchesSearch =
      banner.title.toLowerCase().includes(query) ||
      banner.description.toLowerCase().includes(query);

    const matchesFilter =
      filter === "All" ||
      (filter === "Active" && banner.active) ||
      (filter === "Inactive" && !banner.active);

    return matchesSearch && matchesFilter;
  });

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setShowForm(true);
  }

  function openEditForm(banner) {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl || "",
      buttonText: banner.buttonText || "Shop Now",
      link: banner.link || "/products",
      active: banner.active,
    });
    setError("");
    setShowForm(true);
  }

  function saveBanner(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter a banner title.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter a banner description.");
      return;
    }

    if (
      form.imageUrl.trim() &&
      !/^https?:\/\//i.test(form.imageUrl.trim()) &&
      !form.imageUrl.startsWith("data:image/")
    ) {
      setError("Enter a valid image URL starting with http:// or https://.");
      return;
    }

    const bannerData = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      buttonText: form.buttonText.trim() || "Shop Now",
      link: form.link.trim() || "/products",
    };

    if (editingId !== null) {
      setBanners((prev) =>
        prev.map((banner) =>
          banner.id === editingId
            ? { ...banner, ...bannerData }
            : banner
        )
      );
    } else {
      setBanners((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...bannerData,
        },
      ]);
    }

    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  }

  function toggleBanner(id) {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === id
          ? { ...banner, active: !banner.active }
          : banner
      )
    );
  }

  function deleteBanner(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this banner?"
    );

    if (!confirmed) return;

    setBanners((prev) =>
      prev.filter((banner) => banner.id !== id)
    );

    if (previewId === id) {
      setPreviewId(null);
    }
  }

  function resetBanners() {
    const confirmed = window.confirm(
      "Reset banners to the original demo banners?"
    );

    if (!confirmed) return;

    setBanners(INITIAL_BANNERS);
    setSearch("");
    setFilter("All");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Banners & Offers
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage promotional banners displayed on your homepage.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            + Add Banner
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Banners" value={banners.length} />
          <StatCard label="Active Banners" value={activeCount} />
          <StatCard
            label="Inactive Banners"
            value={banners.length - activeCount}
          />
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search banners..."
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3"
          >
            <option value="All">All banners</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={resetBanners}
            className="rounded-lg border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-50"
          >
            Reset Demo Data
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              {editingId !== null ? "Edit Banner" : "Create Banner"}
            </h2>

            {error && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={saveBanner} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Banner Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  required
                  maxLength={100}
                  placeholder="Example: Big Grocery Sale"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  required
                  maxLength={300}
                  rows={3}
                  placeholder="Describe your promotion..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={updateField}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional. Paste a publicly accessible image URL.
                </p>
              </div>

              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Banner preview"
                  className="max-h-64 w-full rounded-lg object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  onLoad={(event) => {
                    event.currentTarget.style.display = "block";
                  }}
                />
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Button Text
                  </label>
                  <input
                    name="buttonText"
                    value={form.buttonText}
                    onChange={updateField}
                    maxLength={40}
                    placeholder="Shop Now"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Destination Link
                  </label>
                  <input
                    name="link"
                    value={form.link}
                    onChange={updateField}
                    placeholder="/products"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  name="active"
                  type="checkbox"
                  checked={form.active}
                  onChange={updateField}
                  className="h-4 w-4 accent-green-600"
                />
                Display this banner as active
              </label>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
                >
                  {editingId !== null ? "Save Changes" : "Create Banner"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setError("");
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-900">
              Homepage Banners
            </h2>
          </div>

          {filteredBanners.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-gray-700">
                No banners found.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Add a banner or change your search filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredBanners.map((banner) => (
                <div
                  key={banner.id}
                  className="overflow-hidden rounded-xl border border-gray-200"
                >
                  <div className="flex h-40 items-center justify-center overflow-hidden bg-gradient-to-r from-green-100 to-yellow-100">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="p-4 text-center">
                        <span className="text-4xl">🛒</span>
                        <p className="mt-2 font-bold text-green-800">
                          {banner.title}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900">
                        {banner.title}
                      </h3>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          banner.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {banner.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="min-h-10 text-sm text-gray-600">
                      {banner.description}
                    </p>

                    <p className="text-xs text-gray-500">
                      Button: {banner.buttonText}
                    </p>

                    <p className="break-all text-xs text-gray-500">
                      Link: {banner.link}
                    </p>

                    <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                      <button
                        onClick={() =>
                          setPreviewId(
                            previewId === banner.id ? null : banner.id
                          )
                        }
                        className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                      >
                        {previewId === banner.id ? "Hide Preview" : "Preview"}
                      </button>

                      <button
                        onClick={() => openEditForm(banner)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleBanner(banner.id)}
                        className="rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
                      >
                        {banner.active ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => deleteBanner(banner.id)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>

                    {previewId === banner.id && (
                      <div className="rounded-lg bg-gray-50 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Banner Preview
                        </p>

                        <h4 className="text-lg font-bold text-gray-900">
                          {banner.title}
                        </h4>

                        <p className="mt-2 text-sm text-gray-600">
                          {banner.description}
                        </p>

                        <span className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">
                          {banner.buttonText}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Demo mode: banners are stored in this browser's localStorage.
          They are not automatically synced with the backend or customer homepage.
        </p>
      </div>
    </div>
  );
}
