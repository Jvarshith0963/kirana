import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const STORAGE_KEY = "kirana_list_orders";

export default function ListOrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  useEffect(() => {
    const orders = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    setOrder(
      orders.find(
        (item) => String(item.id) === String(orderId)
      ) || null
    );
  }, [orderId]);

  const confirmOrder = () => {
    const orders = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    const updated = orders.map((item) => {
      if (String(item.id) !== String(orderId)) {
        return item;
      }

      return {
        ...item,
        status: "Confirmed",
        orderStatus: "Confirmed",
        customerUnread: false,
        confirmedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    navigate(`/list-orders/${orderId}`);
  };

  if (!order) {
    return (
      <div className="p-8 text-center">
        List order not found.
      </div>
    );
  }

  if (order.status !== "Priced") {
    return (
      <div className="min-h-screen bg-green-50 p-8">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-xl font-bold">
            This order is not ready for confirmation.
          </h1>

          <button
            onClick={() =>
              navigate(`/list-orders/${orderId}`)
            }
            className="mt-5 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white"
          >
            View Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">
            Review Your List Order
          </h1>

          <p className="mt-1 text-gray-500">
            The vendor has priced your handwritten list.
            Please review it before confirming.
          </p>

          <div className="mt-6 rounded-xl bg-green-50 p-4">
            <p className="font-semibold">
              {order.storeName}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              Delivery: {order.deliverySlot}
            </p>
          </div>

          <div className="mt-6 divide-y rounded-xl border">
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

                  <span
                    className={`text-xs font-semibold ${
                      item.status === "Unavailable"
                        ? "text-red-600"
                        : item.status === "Substituted"
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {item.status}
                  </span>

                  {item.substitution && (
                    <p className="mt-1 text-xs text-orange-600">
                      Substitute: {item.substitution}
                    </p>
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

          <div className="mt-5 flex justify-between rounded-xl bg-gray-900 p-5 text-white">
            <span className="font-semibold">
              Final Total
            </span>

            <span className="text-xl font-bold">
              ₹{Number(order.total).toFixed(2)}
            </span>
          </div>

          <button
            onClick={confirmOrder}
            className="mt-6 w-full rounded-xl bg-green-600 py-4 font-bold text-white hover:bg-green-700"
          >
            Confirm List Order
          </button>

          <button
            onClick={() =>
              navigate(`/list-orders/${orderId}`)
            }
            className="mt-3 w-full rounded-xl border border-gray-300 py-3 font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}