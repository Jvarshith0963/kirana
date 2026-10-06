import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ADDRESS_META_KEY = "kirana_address_meta";

const emptyForm = {
  id: null,
  type: "Home",
  name: "",
  phone: "",
  addressLine: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  isDefault: false,
};

const getAccessToken = () => {
  const directKeys = [
    "accessToken",
    "access_token",
    "authToken",
    "token",
    "kirana_access_token",
  ];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  const objectKeys = [
    "user",
    "auth",
    "currentUser",
    "kirana_user",
  ];

  for (const key of objectKeys) {
    try {
      const value = JSON.parse(
        localStorage.getItem(key) || "null"
      );

      const token =
        value?.accessToken ||
        value?.access_token ||
        value?.token;

      if (token) {
        return token;
      }
    } catch {
      // Ignore invalid JSON in localStorage.
    }
  }

  return null;
};

const getStoredMetadata = () => {
  try {
    const saved = localStorage.getItem(
      ADDRESS_META_KEY
    );

    if (!saved) {
      return {};
    }

    const parsed = JSON.parse(saved);

    return parsed && typeof parsed === "object"
      ? parsed
      : {};
  } catch {
    return {};
  }
};

const saveStoredMetadata = (metadata) => {
  localStorage.setItem(
    ADDRESS_META_KEY,
    JSON.stringify(metadata)
  );
};

const getLegacyMetadata = () => {
  try {
    const saved = localStorage.getItem(
      "kirana_addresses"
    );

    if (!saved) {
      return {};
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return {};
    }

    return parsed.reduce((result, address) => {
      if (address?.id != null) {
        result[String(address.id)] = {
          type: address.type || "Home",
          name: address.name || "",
          phone: address.phone || "",
          latitude: address.latitude || "",
          longitude: address.longitude || "",
          addressLine2:
            address.addressLine2 || "",
          landmark: address.landmark || "",
        };
      }

      return result;
    }, {});
  } catch {
    return {};
  }
};

const extractAddressList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.addresses)) {
    return payload.data.addresses;
  }

  if (Array.isArray(payload?.addresses)) {
    return payload.addresses;
  }

  return [];
};

const extractSingleAddress = (payload) => {
  if (payload?.id != null) {
    return payload;
  }

  if (payload?.data?.id != null) {
    return payload.data;
  }

  if (payload?.address?.id != null) {
    return payload.address;
  }

  if (payload?.data?.address?.id != null) {
    return payload.data.address;
  }

  return null;
};

const getErrorMessage = async (response) => {
  try {
    const payload = await response.json();

    return (
      payload?.message ||
      payload?.error ||
      payload?.errors?.[0]?.message ||
      "Something went wrong. Please try again."
    );
  } catch {
    return "Something went wrong. Please try again.";
  }
};

const apiRequest = async (
  path,
  options = {}
) => {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      "Please login to manage your addresses."
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
};

function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAddresses = async () => {
    setLoading(true);

    try {
      const payload = await apiRequest(
        "/addresses"
      );

      const backendAddresses =
        extractAddressList(payload);

      const metadata = {
        ...getLegacyMetadata(),
        ...getStoredMetadata(),
      };

      const mappedAddresses =
        backendAddresses.map((address) => {
          const meta =
            metadata[String(address.id)] || {};

          return {
            id: address.id,

            type:
              meta.type || "Home",

            name:
              meta.name || "",

            phone:
              meta.phone || "",

            addressLine:
              address.address_line1 || "",

            addressLine2:
              address.address_line2 || "",

            landmark:
              address.landmark || "",

            city:
              address.city || "",

            state:
              address.state || "",

            pincode:
              address.pincode || "",

            latitude:
              meta.latitude || "",

            longitude:
              meta.longitude || "",

            isDefault:
              Boolean(address.is_default),
          };
        });

      setAddresses(mappedAddresses);
      setError("");

      return mappedAddresses;
    } catch (err) {
      console.error(
        "Unable to load addresses:",
        err
      );

      setAddresses([]);

      setError(
        err.message ||
          "Unable to load your saved addresses."
      );

      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleUseLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,

          latitude:
            position.coords.latitude.toFixed(
              6
            ),

          longitude:
            position.coords.longitude.toFixed(
              6
            ),
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSaving(true);

    try {
      const otherAddresses =
        addresses.filter(
          (address) =>
            address.id !== editingId
        );

      const hasOtherDefault =
        otherAddresses.some(
          (address) =>
            address.isDefault
        );

      const isDefault = editingId
        ? form.isDefault ||
          !hasOtherDefault
        : addresses.length === 0 ||
          form.isDefault;

      const payload = {
        address_line1:
          form.addressLine.trim(),

        address_line2:
          form.addressLine2?.trim() ||
          null,

        city:
          form.city.trim(),

        state:
          form.state.trim(),

        pincode:
          form.pincode.trim(),

        landmark:
          form.landmark?.trim() ||
          null,

        is_default:
          isDefault,
      };

      let response;

      if (editingId) {
        response = await apiRequest(
          `/addresses/${editingId}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await apiRequest(
          "/addresses",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      }

      const backendAddress =
        extractSingleAddress(response);

      const refreshedAddresses =
        await loadAddresses();

      const savedAddressId =
        backendAddress?.id ??
        editingId ??
        refreshedAddresses.find(
          (address) =>
            address.addressLine ===
              payload.address_line1 &&
            address.city ===
              payload.city &&
            address.pincode ===
              payload.pincode
        )?.id;

      if (savedAddressId != null) {
        const metadata =
          getStoredMetadata();

        metadata[
          String(savedAddressId)
        ] = {
          ...(metadata[
            String(savedAddressId)
          ] || {}),

          type: form.type,
          name: form.name.trim(),
          phone: form.phone.trim(),
          latitude: form.latitude,
          longitude: form.longitude,
          addressLine2:
            form.addressLine2?.trim() ||
            "",
          landmark:
            form.landmark?.trim() ||
            "",
        };

        saveStoredMetadata(metadata);
      }

      await loadAddresses();

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error(
        "Unable to save address:",
        err
      );

      setError(
        err.message ||
          "Unable to save the address."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setForm({
      ...emptyForm,
      ...address,
    });

    setEditingId(address.id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    const addressToDelete =
      addresses.find(
        (address) =>
          address.id === id
      );

    if (!addressToDelete) {
      return;
    }

    const wasDefault =
      addressToDelete.isDefault;

    setError("");

    try {
      await apiRequest(
        `/addresses/${id}`,
        {
          method: "DELETE",
        }
      );

      const refreshedAddresses =
        await loadAddresses();

      if (
        wasDefault &&
        refreshedAddresses.length > 0 &&
        !refreshedAddresses.some(
          (address) =>
            address.isDefault
        )
      ) {
        await apiRequest(
          `/addresses/${refreshedAddresses[0].id}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              is_default: true,
            }),
          }
        );

        await loadAddresses();
      }

      const metadata =
        getStoredMetadata();

      delete metadata[String(id)];

      saveStoredMetadata(metadata);

      if (editingId === id) {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
      }
    } catch (err) {
      console.error(
        "Unable to delete address:",
        err
      );

      setError(
        err.message ||
          "Unable to delete the address."
      );
    }
  };

  const handleSetDefault = async (id) => {
    setError("");

    try {
      await apiRequest(
        `/addresses/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            is_default: true,
          }),
        }
      );

      await loadAddresses();
    } catch (err) {
      console.error(
        "Unable to set default address:",
        err
      );

      setError(
        err.message ||
          "Unable to set the default address."
      );
    }
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

        {/* Error */}
        {error && !showForm && (
          <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-5 text-xl font-bold text-gray-800">
              {editingId
                ? "Edit Address"
                : "Add New Address"}
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
                    <option value="Home">
                      Home
                    </option>

                    <option value="Work">
                      Work
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* Receiver Name */}
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

                {/* Address Line 2 */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address Line 2
                  </label>

                  <input
                    type="text"
                    name="addressLine2"
                    value={
                      form.addressLine2
                    }
                    onChange={handleChange}
                    placeholder="Apartment, floor, etc."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500"
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Landmark
                  </label>

                  <input
                    type="text"
                    name="landmark"
                    value={form.landmark}
                    onChange={handleChange}
                    placeholder="Nearby landmark"
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

              {/* Location */}
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
                  disabled={saving}
                  className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Address"
                    : "Save Address"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md">
            <div className="mb-4 text-4xl">
              ⏳
            </div>

            <h2 className="text-xl font-bold text-gray-800">
              Loading addresses...
            </h2>

            <p className="mt-2 text-gray-500">
              Please wait while we load your saved addresses.
            </p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-md">
            <div className="mb-4 text-5xl">
              📍
            </div>

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
                      {address.type ===
                      "Home"
                        ? "🏠"
                        : address.type ===
                          "Work"
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

                  <p>
                    📞 {address.phone}
                  </p>

                  <p>
                    {address.addressLine}
                  </p>

                  {address.addressLine2 && (
                    <p>
                      {address.addressLine2}
                    </p>
                  )}

                  {address.landmark && (
                    <p>
                      Landmark:{" "}
                      {address.landmark}
                    </p>
                  )}

                  <p>
                    {address.city},{" "}
                    {address.state} -{" "}
                    {address.pincode}
                  </p>

                  {(address.latitude ||
                    address.longitude) && (
                    <p className="text-xs text-gray-500">
                      📍{" "}
                      {address.latitude ||
                        "—"}
                      ,{" "}
                      {address.longitude ||
                        "—"}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(address)
                    }
                    className="rounded-lg border border-green-600 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(
                        address.id
                      )
                    }
                    className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>

                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSetDefault(
                          address.id
                        )
                      }
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