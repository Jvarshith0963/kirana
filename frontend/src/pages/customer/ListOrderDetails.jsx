import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const STORAGE_KEY = "kirana_list_orders";

export default function ListOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [viewerPhoto, setViewerPhoto] = useState(null);

  useEffect(() => {
    const orders = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    const found = orders.find(
      (item) => String(item.id) === String(orderId)
    );

    setOrder(found || null);
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-green-50 p-8 text-center">
        <h1 className="text-xl font-bold">
          List order not found
        </h1>
      </div>
    );
  }

  const steps = [
    "Submitted",
    "Reviewing",
    "Priced",
    "Confirmed",
    "Delivered",
  ];

  const currentIndex = steps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate("/orders")}
          className="mb-4 font-semibold text-green-700"
        >
          ← My Orders
        </button>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex flex-col justify-between gap-3 sm:flex-row">
            <div>
              <p className="text-sm text-green-600">
                Handwritten List Order
              </p>

              <h1 className="text-2xl font-bold">
                {order.id}
              </h1>

              <p className="text-gray-500">
                {order.storeName}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm text-gray-500">
                Delivery Slot
              </p>

              <p className="font-bold text-green-700">
                {order.deliverySlot}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="mt-8 overflow-x-auto">
            <div className="flex min-w-[700px] items-center">
              {steps.map((step, index) => {
                const done = currentIndex >= index;

                return (
                  <div
                    key={step}
                    className="flex flex-1 items-center"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                          done
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {done ? "✓" : index + 1}
                      </div>

                      <span className="mt-2 text-xs font-semibold">
                        {step}
                      </span>
                    </div>

                    {index < steps.length - 1 && (
                      <div
                        className={`mx-2 h-1 flex-1 ${
                          currentIndex > index
                            ? "bg-green-600"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photos */}
          <div className="mt-8">
            <h2 className="text-lg font-bold">
              Uploaded List
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {order.photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setViewerPhoto(photo.url)}
                  className="overflow-hidden rounded-xl border"
                >
                  <img
                    src={photo.url}
                    alt="Handwritten list"
                    className="h-44 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          {order.note && (
            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="font-semibold">Your Note</p>
              <p className="mt-1 text-sm text-gray-600">
                {order.note}
              </p>
            </div>
          )}

          {/* Items */}
          {order.items?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold">
                Priced Items
              </h2>

              <div className="mt-4 divide-y rounded-xl border">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <p className="font-semibold">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>

                      {item.status !== "Available" && (
                        <span className="text-xs font-semibold text-orange-600">
                          {item.status}
                        </span>
                      )}
                    </div>

                    <p className="font-bold">
                      ₹
                      {(
                        Number(item.price || 0) *
                        Number(item.quantity || 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between rounded-xl bg-green-50 p-4">
                <span className="font-bold">
                  Total
                </span>

                <span className="text-xl font-bold text-green-700">
                  ₹{Number(order.total).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Confirmation */}
          {order.status === "Priced" && (
            <button
              onClick={() =>
                navigate(`/list-orders/${order.id}/confirm`)
              }
              className="mt-6 w-full rounded-xl bg-green-600 py-3 font-bold text-white"
            >
              Review & Confirm Order
            </button>
          )}
        </div>
      </div>

      {/* Photo Viewer */}
      {viewerPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setViewerPhoto(null)}
        >
          <img
            src={viewerPhoto}
            alt="Full handwritten list"
            className="max-h-[90vh] max-w-full object-contain"
          />

          <button
            onClick={() => setViewerPhoto(null)}
            className="absolute right-5 top-5 rounded-full bg-white px-4 py-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}