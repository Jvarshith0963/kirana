import { useEffect, useState } from "react";

const STORAGE_KEY = "kirana_admin_banners";

const initialBanners = [
  {
    id: 1,
    title: "Fresh Groceries Delivered",
    subtitle: "Get quality groceries at your doorstep.",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    buttonText: "Shop Now",
    link: "/products",
    active: true,
  },
  {
    id: 2,
    title: "Special Weekend Offers",
    subtitle: "Save more on your everyday essentials.",
    image:
      "https://images.unsplash.com/photo-1601598851547-4302969d4a7f?auto=format&fit=crop&w=1200&q=80",
    buttonText: "View Offers",
    link: "/products",
    active: true,
  },
];

export default function Banners() {
  const [banners, setBanners] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialBanners;
  });

  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    buttonText: "Shop Now",
    link: "/products",
    active: true,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
  }, [banners]);

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      image: "",
      buttonText: "Shop Now",
      link: "/products",
      active: true,
    });

    setEditingBanner(null);
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

    if (!form.title.trim() || !form.image.trim()) {
      alert("Please enter a title and image URL.");
      return;
    }

    if (editingBanner) {
      setBanners((prev) =>
        prev.map((banner) =>
          banner.id === editingBanner.id
            ? {
                ...banner,
                ...form,
              }
            : banner
        )
      );
    } else {
      const newBanner = {
        id: Date.now(),
        ...form,
      };

      setBanners((prev) => [newBanner, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);

    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      buttonText: banner.buttonText,
      link: banner.link,
      active: banner.active,
    });

    setShowForm(true);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this banner?"
    );

    if (!confirmed) return;

    setBanners((prev) => prev.filter((banner) => banner.id !== id));
  };

  const toggleBanner = (id) => {
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === id
          ? {
              ...banner,
              active: !banner.active,
            }
          : banner
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Banners & Offers
          </h1>

          <p className="text-gray-500 mt-1">
            Manage homepage promotional banners and offers.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBanner(null);
            setForm({
              title: "",
              subtitle: "",
              image: "",
              buttonText: "Shop Now",
              link: "/products",
              active: true,
            });
            setShowForm(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
        >
          + Add Banner
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {editingBanner ? "Edit Banner" : "Create Banner"}
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
                Banner Title *
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Fresh Groceries Delivered"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Subtitle
              </label>

              <input
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                placeholder="Quality groceries at your doorstep"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Image URL *
              </label>

              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/banner.jpg"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Button Text
              </label>

              <input
                name="buttonText"
                value={form.buttonText}
                onChange={handleChange}
                placeholder="Shop Now"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Button Link
              </label>

              <input
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="/products"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                  Publish this banner
                </span>
              </label>
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                {editingBanner ? "Update Banner" : "Create Banner"}
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

      {/* Banner Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="relative h-56">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    banner.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {banner.active ? "Published" : "Hidden"}
                </span>
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-800">
                {banner.title}
              </h3>

              <p className="text-gray-500 mt-2">
                {banner.subtitle}
              </p>

              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={() => handleEdit(banner)}
                  className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleBanner(banner.id)}
                  className="px-4 py-2 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                >
                  {banner.active ? "Hide" : "Publish"}
                </button>

                <button
                  onClick={() => handleDelete(banner.id)}
                  className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-500">
            No banners available. Click "Add Banner" to create one.
          </p>
        </div>
      )}
    </div>
  );
}