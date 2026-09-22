import { useEffect, useState } from "react";

const emptyForm = {
  id: null,
  type: "Home",
  name: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  isDefault: false,
};

function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("kirana_addresses");

    if (saved) {
      setAddresses(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "kirana_addresses",
      JSON.stringify(addresses)
    );
  }, [addresses]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUseLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
      },
      () => {
        setError(
          "Unable to get your location. Please allow location access."
        );
      }
    );
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Please enter receiver name.";
    }

    if (!/^\d{10}$/.test(form.phone)) {
      return "Please enter a valid 10-digit phone number.";
    }

    if (!form.addressLine.trim()) {
      return "Please enter your address.";
    }

    if (!form.city.trim()) {
      return "Please enter city.";
    }

    if (!form.state.trim()) {
      return "Please enter state.";
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      return "Please enter a valid 6-digit pincode.";
    }

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    if (editingId) {
      setAddresses((prev) =>
        prev.map((address) =>
          address.id === editingId
            ? {
                ...form,
                id: editingId,
                isDefault:
                  form.isDefault ||
                  prev.filter((item) => item.id !== editingId)
                    .every((item) => !item.isDefault),
              }
            : form.isDefault
            ? { ...address, isDefault: false }
            : address
        )
      );
    } else {
      const newAddress = {
        ...form,
        id: Date.now(),
        isDefault:
          addresses.length === 0 || form.isDefault,
      };

      setAddresses((prev) =>
        newAddress.isDefault
          ? [
              ...prev.map((item) => ({
                ...item,
                isDefault: false,
              })),
              newAddress,
            ]
          : [...prev, newAddress]
      );
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (address) => {
    setForm(address);
    setEditingId(address.id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = (id) => {
    const addressToDelete = addresses.find(
      (address) => address.id === id
    );

    const remaining = addresses.filter(
      (address) => address.id !== id
    );

    if (addressToDelete?.isDefault && remaining.length > 0) {
      remaining[0].isDefault = true;
    }

    setAddresses(remaining);
  };

  const handleSetDefault = (id) => {
    setAddresses((prev) =>
      prev.map((address) => ({
        ...address,
        isDefault: address.id === id,
      }))
    );
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800">
              My Addresses
            </h1>

            <p className="mt-1 text-gray-600">
              Manage your delivery addresses
            </p>
          </div>

          <button
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
              setError("");
            }}
            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            + Add Address
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-5 text-xl font-bold text-gray-800">
              {editingId ? "Edit Address" : "Add New Address"}
            </h2>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Address Type */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address Type
                  </label>

                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Receiver Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit phone number"
                    maxLength="10"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    maxLength="6"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address
                  </label>

                  <textarea
                    name="addressLine"
                    value={form.addressLine}
                    onChange={handleChange}
                    rows="3"
                    placeholder="House no, street, landmark..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                  />
                </div>

                {/* Latitude */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Latitude
                  </label>

                  <input
                    type="text"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="Latitude"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Longitude
                  </label>

                  <input
                    type="text"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="Longitude"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {/* Location Button */}
              <button
                type="button"
                onClick={handleUseLocation}
                className="mt-4 rounded-lg border border-green-600 px-4 py-2 font-medium text-green-700 hover:bg-green-50"
              >
                📍 Use My Location
              </button>

              {/* Default */}
              <label className="mt-5 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                  className="h-4 w-4"
                />

                <span className="text-sm text-gray-700">
                  Set as default address
                </span>
              </label>

              {/* Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                >
                  {editingId ? "Update Address" : "Save Address"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md">
            <div className="mb-4 text-5xl">📍</div>

            <h2 className="text-xl font-bold text-gray-800">
              No addresses saved
            </h2>

            <p className="mt-2 text-gray-500">
              Add an address to make checkout faster.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-2xl bg-white p-5 shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {address.type === "Home"
                        ? "🏠"
                        : address.type === "Work"
                        ? "🏢"
                        : "📍"}
                    </span>

                    <div>
                      <h3 className="font-bold text-gray-800">
                        {address.type}
                      </h3>

                      {address.isDefault && (
                        <span className="text-xs font-semibold text-green-600">
                          Default Address
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800">
                    {address.name}
                  </p>

                  <p>📞 {address.phone}</p>

                  <p>{address.addressLine}</p>

                  <p>
                    {address.city}, {address.state} -{" "}
                    {address.pincode}
                  </p>

                  {(address.latitude || address.longitude) && (
                    <p className="text-xs text-gray-500">
                      📍 {address.latitude || "—"},{" "}
                      {address.longitude || "—"}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="rounded-lg border border-green-600 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(address.id)}
                    className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>

                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Addresses;