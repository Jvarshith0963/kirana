import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function OrderConfirmation() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("kirana_last_order");

    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow-md">
          <div className="mb-4 text-6xl">📦</div>

          <h1 className="text-2xl font-bold text-gray-800">
            No Order Found
          </h1>

          <p className="mt-2 text-gray-500">
            We couldn't find a recent order.
          </p>

          <button
            onClick={() => navigate("/products")}
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);

  return (
    <div className="min-h-screen bg-green-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Success Header */}
        <div className="rounded-2xl bg-white p-8 text-center shadow-md">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-5xl">
            ✓
          </div>

          <h1 className="mt-5 text-3xl font-bold text-green-700">
            Order Placed Successfully!
          </h1>

          <p className="mt-2 text-gray-600">
            Thank you for shopping with Kirana Marketplace.
          </p>

          <div className="mt-5 rounded-xl bg-green-50 p-4">
            <p className="text-sm text-gray-500">
              Order ID
            </p>

            <p className="mt-1 text-xl font-bold text-green-800">
              {order.orderId}
            </p>
          </div>
        </div>

        {/* Order Information */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">

          {/* Delivery Address */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              📍 Delivery Address
            </h2>

            <p className="font-semibold text-gray-800">
              {order.address?.name}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {order.address?.addressLine}
            </p>

            <p className="text-sm text-gray-600">
              {order.address?.city},{" "}
              {order.address?.state} -{" "}
              {order.address?.pincode}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              📞 {order.address?.phone}
            </p>
          </div>

          {/* Delivery Method */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              🚚 Delivery Details
            </h2>

            <p className="font-semibold text-gray-800">
              {order.deliveryOption?.name}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {order.deliveryOption?.description}
            </p>

            <p className="mt-3 text-sm text-gray-600">
              Ordered on:
            </p>

            <p className="text-sm font-medium text-gray-800">
              {orderDate.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Ordered Products */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              🛍️ Ordered Items
            </h2>

            <span className="text-sm text-gray-500">
              {order.items?.length || 0} item
              {order.items?.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-4">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <img
                  src={
                    item.image ||
                    "https://via.placeholder.com/100"
                  }
                  alt={item.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <p className="font-semibold text-green-700">
                  ₹
                  {(
                    Number(item.price || 0) *
                    Number(item.quantity || 1)
                  ).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment / Total Summary */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-5 text-lg font-bold text-gray-800">
            💰 Order Summary
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>
                ₹{Number(order.subtotal || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>
                {Number(order.deliveryCharge || 0) === 0
                  ? "FREE"
                  : `₹${Number(
                      order.deliveryCharge
                    ).toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>
                -₹{Number(order.discount || 0).toFixed(2)}
              </span>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total Paid</span>

                <span className="text-green-700">
                  ₹{Number(order.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate("/products")}
            className="flex-1 rounded-xl bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
          >
            Continue Shopping
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex-1 rounded-xl border border-gray-300 bg-white py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to Home
          </button>
        </div>

        {/* Temporary backend note */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Order confirmation is currently using temporary
          frontend data. This will be connected to the backend
          order API later.
        </p>
      </div>
    </div>
  );
}

export default OrderConfirmation;