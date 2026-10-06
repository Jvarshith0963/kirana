import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const STORAGE_KEY = "kirana_list_orders";
const ADDRESS_KEY = "kirana_addresses";

const deliverySlots = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "4:00 PM - 6:00 PM",
  "6:00 PM - 8:00 PM",
];

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

export default function ListOrderUpload() {
  const navigate = useNavigate();
  const { id: storeId } = useParams();

  const [photos, setPhotos] = useState([]);
  const [note, setNote] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [deliverySlot, setDeliverySlot] = useState(deliverySlots[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem(ADDRESS_KEY) || "[]"
    );

    setAddresses(saved);

    const defaultAddress =
      saved.find((address) => address.isDefault) || saved[0];

    if (defaultAddress) {
      setSelectedAddressId(String(defaultAddress.id));
    }
  }, []);

  const handlePhotos = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    const remaining = Math.max(0, 6 - photos.length);

    const selected = imageFiles.slice(0, remaining);

    const converted = await Promise.all(
      selected.map(async (file) => ({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        url: await readFileAsDataURL(file),
      }))
    );

    setPhotos((previous) => [...previous, ...converted]);

    event.target.value = "";
  };

  const removePhoto = (photoId) => {
    setPhotos((previous) =>
      previous.filter((photo) => photo.id !== photoId)
    );
  };

  const selectedAddress = addresses.find(
    (address) => String(address.id) === String(selectedAddressId)
  );

  const submitListOrder = () => {
    if (!photos.length) {
      alert("Please upload at least one handwritten list photo.");
      return;
    }

    if (!selectedAddress) {
      alert("Please select a delivery address.");
      return;
    }

    if (!deliverySlot) {
      alert("Please select a delivery slot.");
      return;
    }

    setLoading(true);

    const newOrder = {
      id: `LIST-${Date.now()}`,
      type: "LIST_ORDER",

      storeId: storeId || "1",
      storeName: "Sri Lakshmi Kirana Store",

      photos,

      note: note.trim(),

      address: selectedAddress,

      deliverySlot,

      status: "Submitted",

      items: [],

      total: 0,

      unreadForVendor: true,
      unreadForCustomer: false,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingOrders = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([newOrder, ...existingOrders])
    );

    setTimeout(() => {
      setLoading(false);

      navigate(`/list-orders/${newOrder.id}`, {
        state: { order: newOrder },
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm font-semibold text-green-700"
        >
          ← Back
        </button>

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Upload Handwritten List
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Upload a clear photo of your shopping list and we'll
              prepare it for you.
            </p>
          </div>

          {/* Upload */}
          <div className="rounded-xl border-2 border-dashed border-green-300 bg-green-50 p-6 text-center">
            <div className="mb-3 text-4xl">📷</div>

            <h2 className="font-semibold text-gray-800">
              Add your handwritten list
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              You can upload up to 6 photos.
            </p>

            <label className="mt-5 inline-flex cursor-pointer items-center rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700">
              📸 Camera / Gallery

              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={handlePhotos}
              />
            </label>
          </div>

          {/* Photo previews */}
          {photos.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">
                  Uploaded Photos
                </h2>

                <span className="text-sm text-gray-500">
                  {photos.length}/6
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative overflow-hidden rounded-xl border bg-gray-50"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="h-40 w-full object-cover"
                    />

                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          <div className="mt-6">
            <label className="mb-2 block font-semibold text-gray-800">
              Additional Note
              <span className="font-normal text-gray-400">
                {" "}
                (Optional)
              </span>
            </label>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Example: Please buy the freshest vegetables. If a brand is unavailable, suggest another one."
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-green-500"
            />
          </div>

          {/* Address */}
          <div className="mt-6">
            <label className="mb-2 block font-semibold text-gray-800">
              Delivery Address
            </label>

            {addresses.length === 0 ? (
              <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  No saved address found.
                </p>

                <button
                  onClick={() => navigate("/addresses")}
                  className="mt-2 font-semibold text-green-700"
                >
                  Add Address →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`block cursor-pointer rounded-xl border p-4 ${
                      String(selectedAddressId) === String(address.id)
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex gap-3">
                      <input
                        type="radio"
                        name="address"
                        checked={
                          String(selectedAddressId) ===
                          String(address.id)
                        }
                        onChange={() =>
                          setSelectedAddressId(String(address.id))
                        }
                      />

                      <div>
                        <p className="font-semibold">
                          {address.type} - {address.name}
                        </p>

                        <p className="text-sm text-gray-600">
                          {address.addressLine}, {address.city},{" "}
                          {address.state} - {address.pincode}
                        </p>

                        <p className="text-sm text-gray-500">
                          {address.phone}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Slot */}
          <div className="mt-6">
            <label className="mb-2 block font-semibold text-gray-800">
              Delivery Slot
            </label>

            <select
              value={deliverySlot}
              onChange={(e) => setDeliverySlot(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-green-500"
            >
              {deliverySlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            onClick={submitListOrder}
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-green-600 py-4 font-bold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {loading
              ? "Submitting List..."
              : "Submit Handwritten List"}
          </button>
        </div>
      </div>
    </div>
  );
}