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
  const [addresses, setAddresses] = useState(() => {
    try {
      const savedAddresses =
        localStorage.getItem("kirana_addresses");

      return savedAddresses
        ? JSON.parse(savedAddresses)
        : [];
    } catch (error) {
      console.error("Error loading addresses:", error);
      return [];
    }
  });

  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [locationLoading, setLocationLoading] =
    useState(false);

  // ==========================================
  // SAVE ADDRESSES
  // ==========================================

  useEffect(() => {
    localStorage.setItem(
      "kirana_addresses",
      JSON.stringify(addresses)
    );
  }, [addresses]);

  // ==========================================
  // FORM CHANGE
  // ==========================================

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  }

  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  function handleAddAddress() {
    setForm({
      ...emptyForm,
      isDefault: addresses.length === 0,
    });

    setEditingId(null);
    setShowForm(true);
    setError("");
  }

  // ==========================================
  // EDIT ADDRESS
  // ==========================================

  function handleEdit(address) {
    setForm(address);
    setEditingId(address.id);
    setShowForm(true);
    setError("");
  }

  // ==========================================
  // CANCEL FORM
  // ==========================================

  function handleCancel() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  // ==========================================
  // VALIDATE FORM
  // ==========================================

  function validateForm() {
    if (!form.name.trim()) {
      return "Please enter the receiver name.";
    }

    if (!form.phone.trim()) {
      return "Please enter a phone number.";
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      return "Please enter a valid 10-digit phone number.";
    }

    if (!form.addressLine.trim()) {
      return "Please enter your address.";
    }

    if (!form.city.trim()) {
      return "Please enter your city.";
    }

    if (!form.state.trim()) {
      return "Please enter your state.";
    }

    if (!/^[0-9]{6}$/.test(form.pincode)) {
      return "Please enter a valid 6-digit pincode.";
    }

    return "";
  }

  // ==========================================
  // SAVE ADDRESS
  // ==========================================

  function handleSaveAddress(e) {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const addressId =
      editingId || Date.now();

    const newAddress = {
      ...form,
      id: addressId,
      latitude: form.latitude
        ? Number(form.latitude)
        : "",
      longitude: form.longitude
        ? Number(form.longitude)
        : "",
    };

    setAddresses((currentAddresses) => {
      let updatedAddresses;

      if (editingId) {
        updatedAddresses = currentAddresses.map(
          (address) =>
            address.id === editingId
              ? newAddress
              : address
        );
      } else {
        updatedAddresses = [
          ...currentAddresses,
          newAddress,
        ];
      }

      // If this address is default,
      // remove default from all others.
      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(
          (address) => ({
            ...address,
            isDefault:
              address.id === newAddress.id,
          })
        );
      }

      // Always keep one default address.
      if (
        updatedAddresses.length > 0 &&
        !updatedAddresses.some(
          (address) => address.isDefault
        )
      ) {
        updatedAddresses[0] = {
          ...updatedAddresses[0],
          isDefault: true,
        };
      }

      return updatedAddresses;
    });

    handleCancel();
  }

  // ==========================================
  // DELETE ADDRESS
  // ==========================================

  function handleDelete(addressId) {
    const addressToDelete = addresses.find(
      (address) => address.id === addressId
    );

    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) {
      return;
    }

    setAddresses((currentAddresses) => {
      let updatedAddresses =
        currentAddresses.filter(
          (address) => address.id !== addressId
        );

      // If default address was deleted,
      // make the first remaining address default.
      if (
        addressToDelete?.isDefault &&
        updatedAddresses.length > 0
      ) {
        updatedAddresses =
          updatedAddresses.map(
            (address, index) => ({
              ...address,
              isDefault: index === 0,
            })
          );
      }

      return updatedAddresses;
    });
  }

  // ==========================================
  // SET DEFAULT
  // ==========================================

  function handleSetDefault(addressId) {
    setAddresses((currentAddresses) =>
      currentAddresses.map((address) => ({
        ...address,
        isDefault: address.id === addressId,
      }))
    );
  }

  // ==========================================
  // USE MY LOCATION
  // ==========================================

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));

        setLocationLoading(false);
      },
      () => {
        setError(
          "Unable to detect your location. Please enter latitude and longitude manually."
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  // ==========================================
  // ADDRESS FORM
  // ==========================================

  if (showForm) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-8 sm:px-6 lg:px-10">

        <div className="mx-auto max-w-3xl">

          <button
            type="button"
            onClick={handleCancel}
            className="mb-5 text-sm font-semibold text-green-700 hover:text-green-900"
          >
            ← Back to Addresses
          </button>

          <div className="rounded-2xl bg-white p-6 shadow-md sm:p-8">

            <div className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
                Address Book
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                {editingId
                  ? "Edit Address"
                  : "Add New Address"}
              </h1>
            </div>

            <form
              onSubmit={handleSaveAddress}
              className="space-y-5"
            >

              {/* Address Type */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Address Type
                </label>

                <div className="flex flex-wrap gap-2">
                  {["Home", "Work", "Other"].map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            type,
                          }))
                        }
                        className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                          form.type === type
                            ? "bg-green-600 text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-green-50"
                        }`}
                      >
                        {type === "Home"
                          ? "🏠"
                          : type === "Work"
                          ? "💼"
                          : "📍"}{" "}
                        {type}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Name */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Receiver Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter receiver name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Phone */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Phone Number
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Address */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Address
                </label>

                <textarea
                  name="addressLine"
                  value={form.addressLine}
                  onChange={handleChange}
                  rows={3}
                  placeholder="House / Flat / Street / Landmark"
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* City + State */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    City
                  </label>

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    State
                  </label>

                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

              </div>

              {/* Pincode */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Pincode
                </label>

                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  maxLength={6}
                  placeholder="6-digit pincode"
                  inputMode="numeric"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Location */}

              <div className="rounded-xl border border-green-200 bg-green-50 p-4">

                <div className="mb-3 flex items-center justify-between gap-3">

                  <div>
                    <h3 className="font-bold text-gray-800">
                      📍 Location
                    </h3>

                    <p className="text-xs text-gray-500">
                      Add coordinates for delivery location
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleUseLocation}
                    disabled={locationLoading}
                    className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {locationLoading
                      ? "Detecting..."
                      : "Use My Location"}
                  </button>

                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-gray-600">
                      Latitude
                    </label>

                    <input
                      name="latitude"
                      value={form.latitude}
                      onChange={handleChange}
                      placeholder="e.g. 17.385044"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-gray-600">
                      Longitude
                    </label>

                    <input
                      name="longitude"
                      value={form.longitude}
                      onChange={handleChange}
                      placeholder="e.g. 78.486671"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
                    />
                  </div>

                </div>

              </div>

              {/* Default */}

              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                  className="h-4 w-4 accent-green-600"
                />

                <span className="text-sm font-medium text-gray-700">
                  Set as default address
                </span>

              </label>

              {/* Error */}

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  ⚠️ {error}
                </div>
              )}

              {/* Buttons */}

              <div className="flex flex-col gap-3 pt-3 sm:flex-row">

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-green-600 py-3 font-bold text-white transition hover:bg-green-700"
                >
                  {editingId
                    ? "Update Address"
                    : "Save Address"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 rounded-xl border border-gray-300 bg-white py-3 font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ADDRESS LIST
  // ==========================================

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8 sm:px-6 lg:px-10">

      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-green-600">
              Delivery
            </p>

            <h1 className="mt-1 text-3xl font-bold text-gray-900 sm:text-4xl">
              My Addresses
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your delivery addresses
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddAddress}
            className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-green-700"
          >
            + Add Address
          </button>

        </div>


        {/* Empty State */}

        {addresses.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-md">

            <div className="mb-5 text-7xl">
              🏠
            </div>

            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              No addresses saved
            </h2>

            <p className="mx-auto mb-6 max-w-md text-gray-500">
              Add your delivery address so you can
              quickly place orders.
            </p>

            <button
              type="button"
              onClick={handleAddAddress}
              className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
            >
              Add Your First Address
            </button>

          </div>
        ) : (

          /* Address Cards */

          <div className="grid gap-5 md:grid-cols-2">

            {addresses.map((address) => (

              <div
                key={address.id}
                className={`rounded-2xl bg-white p-6 shadow-md ${
                  address.isDefault
                    ? "ring-2 ring-green-500"
                    : ""
                }`}
              >

                {/* Card Header */}

                <div className="mb-4 flex items-start justify-between gap-3">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-xl">
                      {address.type === "Home"
                        ? "🏠"
                        : address.type === "Work"
                        ? "💼"
                        : "📍"}
                    </div>

                    <div>

                      <h2 className="font-bold text-gray-800">
                        {address.type}
                      </h2>

                      {address.isDefault && (
                        <span className="text-xs font-bold text-green-600">
                          Default Address
                        </span>
                      )}

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(address)
                    }
                    className="text-sm font-semibold text-green-600 hover:text-green-800"
                  >
                    Edit
                  </button>

                </div>


                {/* Address Details */}

                <div className="space-y-1 text-sm text-gray-600">

                  <p className="font-semibold text-gray-800">
                    {address.name}
                  </p>

                  <p>
                    {address.phone}
                  </p>

                  <p className="pt-1">
                    {address.addressLine}
                  </p>

                  <p>
                    {address.city},{" "}
                    {address.state} -{" "}
                    {address.pincode}
                  </p>

                </div>


                {/* Coordinates */}

                {(address.latitude ||
                  address.longitude) && (
                  <div className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    📍 {address.latitude},{" "}
                    {address.longitude}
                  </div>
                )}


                {/* Actions */}

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t pt-4">

                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSetDefault(address.id)
                      }
                      className="text-sm font-semibold text-green-600 hover:text-green-800"
                    >
                      Set as Default
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(address.id)
                    }
                    className="text-sm font-semibold text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>

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