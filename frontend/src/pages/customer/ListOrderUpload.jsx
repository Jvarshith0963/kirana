
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const STORAGE_KEY = "kirana_list_orders";
const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function readOrders() {
  try {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("kirana-list-orders-updated"));
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read this image."));

    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function ListOrderUpload() {
  const { id: storeId } = useParams();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState([]);
  const [note, setNote] = useState("");
  const [address, setAddress] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        if (photo.previewUrl) URL.revokeObjectURL(photo.previewUrl);
      });
    };
  }, [photos]);

  function handlePhotoChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    setError("");

    if (photos.length + selectedFiles.length > MAX_PHOTOS) {
      setError(`You can upload a maximum of ${MAX_PHOTOS} photos.`);
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      setError("Please select image files only.");
      return;
    }

    const oversizedFile = selectedFiles.find(
      (file) => file.size > MAX_FILE_SIZE
    );

    if (oversizedFile) {
      setError(
        `Each image must be 5 MB or smaller. "${oversizedFile.name}" is too large.`
      );
      return;
    }

    const newPhotos = selectedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
    }));

    setPhotos((current) => [...current, ...newPhotos]);
  }

  function removePhoto(photoId) {
    setPhotos((current) => {
      const photoToRemove = current.find((photo) => photo.id === photoId);

      if (photoToRemove?.previewUrl) {
        URL.revokeObjectURL(photoToRemove.previewUrl);
      }

      return current.filter((photo) => photo.id !== photoId);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (photos.length === 0) {
      setError("Please upload at least one photo of your shopping list.");
      return;
    }

    if (!address.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    if (!deliverySlot) {
      setError("Please select a preferred delivery slot.");
      return;
    }

    setSubmitting(true);

    try {
      const savedPhotos = await Promise.all(
        photos.map(async (photo) => ({
          name: photo.name,
          size: photo.size,
          dataUrl: await readFileAsDataUrl(photo.file),
        }))
      );

      const orderId = `LIST-${Date.now()}`;

      const newOrder = {
        id: orderId,
        storeId: storeId || "",
        storeName: `Store ${storeId || ""}`.trim(),
        photos: savedPhotos,
        note: note.trim(),
        address: address.trim(),
        deliverySlot,
        status: "Submitted",
        unread: true,
        items: [],
        total: 0,
        createdAt: new Date().toISOString(),
      };

      const orders = readOrders();
      saveOrders([newOrder, ...orders]);

      navigate("/orders", {
        state: { message: "Your handwritten list has been submitted." },
      });
    } catch {
      setError(
        "Unable to save your list. Your images may be too large for browser storage. Try fewer or smaller photos."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/orders"
          className="text-sm font-semibold text-green-700 hover:underline"
        >
          ← Back to My Orders
        </Link>

        <div className="mt-5">
          <p className="text-sm font-semibold text-green-700">
            Kirana Marketplace
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Upload Your Shopping List
          </h1>
          <p className="mt-2 text-gray-600">
            Take a clear photo of your handwritten list. The store can review
            your items and provide prices.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <section>
            <h2 className="text-lg font-bold text-gray-900">
              1. Add List Photos
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload up to {MAX_PHOTOS} images. JPG, PNG, and other browser
              supported image formats are accepted.
            </p>

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center hover:border-green-500 hover:bg-green-50">
              <span className="text-3xl" aria-hidden="true">
                📷
              </span>
              <span className="mt-3 font-semibold text-gray-800">
                Choose shopping list photos
              </span>
              <span className="mt-1 text-sm text-gray-500">
                Maximum 5 MB per image
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="sr-only"
              />
            </label>

            {photos.length > 0 && (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="overflow-hidden rounded-xl border border-gray-200"
                  >
                    <img
                      src={photo.previewUrl}
                      alt={`Preview of ${photo.name}`}
                      className="h-48 w-full bg-gray-100 object-contain"
                    />

                    <div className="p-3">
                      <p className="break-all text-sm font-medium text-gray-800">
                        {photo.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatBytes(photo.size)}
                      </p>

                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="mt-3 text-sm font-semibold text-red-600 hover:underline"
                      >
                        Remove photo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-3 text-sm text-gray-500">
              {photos.length} of {MAX_PHOTOS} photos selected
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900">
              2. Delivery Details
            </h2>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Delivery Address
              </span>
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                rows={3}
                required
                placeholder="Enter your complete delivery address"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Preferred Delivery Slot
              </span>
              <select
                value={deliverySlot}
                onChange={(event) => setDeliverySlot(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Select a delivery slot</option>
                <option value="Morning (8 AM - 12 PM)">
                  Morning (8 AM - 12 PM)
                </option>
                <option value="Afternoon (12 PM - 4 PM)">
                  Afternoon (12 PM - 4 PM)
                </option>
                <option value="Evening (4 PM - 8 PM)">
                  Evening (4 PM - 8 PM)
                </option>
              </select>
            </label>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900">
              3. Additional Notes
            </h2>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Notes (Optional)
              </span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                placeholder="Mention preferred brands, quantities, or substitutions."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>
          </section>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              to="/orders"
              className="rounded-lg border border-gray-300 px-5 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting List..." : "Submit Shopping List"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-xs text-gray-500">
          This frontend version stores list details in this browser. It is
          intended for development and testing, not cross-device order
          synchronization.
        </p>
      </div>
    </main>
  );
}
