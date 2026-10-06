import { useLocation, useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  let storedOrder = null;

  try {
    storedOrder = JSON.parse(
      localStorage.getItem("kirana_last_order") || "null"
    );
  } catch (err) {
    console.error("Unable to read saved order:", err);
  }

  const order = location.state?.order || storedOrder;

  const backendOrderId =
    order?.backendOrderId ||
    order?.orders?.[0]?.id ||
    order?.orderId;

  const orders = Array.isArray(order?.orders)
    ? order.orders
    : [];

  return (
    <div className="min-h-screen bg-green-50 px-4 py-12">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-700">
          ✓
        </div>

        {/* Heading */}
        <h1 className="mt-5 text-3xl font-bold text-green-700">
          Payment Successful!
        </h1>

        <p className="mt-2 text-gray-600">
          Your order has been confirmed successfully.
        </p>

        {order && (
          <div className="mt-6 rounded-xl bg-gray-50 p-5 text-left">
            {/* Main Order ID */}
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">
                Order ID
              </span>

              <span className="break-all text-right font-semibold">
                {backendOrderId
                  ? `#${backendOrderId}`
                  : "N/A"}
              </span>
            </div>

            {/* Payment Status */}
            <div className="mt-3 flex justify-between gap-4">
              <span className="text-gray-600">
                Payment Status
              </span>

              <span className="font-semibold text-green-600">
                {order.paymentStatus || "Paid"}
              </span>
            </div>

            {/* Payment Method */}
            {order.paymentMethod && (
              <div className="mt-3 flex justify-between gap-4">
                <span className="text-gray-600">
                  Payment Method
                </span>

                <span className="text-right font-semibold">
                  {order.paymentMethod}
                </span>
              </div>
            )}

            {/* Payment ID */}
            {order.paymentId && (
              <div className="mt-3 flex justify-between gap-4">
                <span className="text-gray-600">
                  Payment ID
                </span>

                <span className="break-all text-right text-sm font-semibold">
                  {order.paymentId}
                </span>
              </div>
            )}

            {/* Amount */}
            <div className="mt-3 flex justify-between gap-4">
              <span className="text-gray-600">
                Amount Paid
              </span>

              <span className="font-bold text-green-700">
                ₹{Number(order.total || 0).toFixed(2)}
              </span>
            </div>

            {/* Multiple Store Orders */}
            {orders.length > 1 && (
              <div className="mt-5 border-t pt-4">
                <p className="mb-3 font-semibold text-gray-800">
                  Orders Created
                </p>

                <div className="space-y-2">
                  {orders.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center justify-between rounded-lg bg-white p-3"
                    >
                      <span className="font-medium text-gray-700">
                        Order #{item.id}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/orders/${item.id}`)
                        }
                        className="font-semibold text-green-700 hover:underline"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Address */}
            {order.address && (
              <div className="mt-5 border-t pt-4">
                <p className="mb-2 font-semibold text-gray-800">
                  Delivery Address
                </p>

                {order.address.name && (
                  <p className="text-sm text-gray-700">
                    {order.address.name}
                  </p>
                )}

                {order.address.addressLine && (
                  <p className="text-sm text-gray-600">
                    {order.address.addressLine}
                  </p>
                )}

                {(order.address.addressLine2 ||
                  order.address.landmark) && (
                  <p className="text-sm text-gray-600">
                    {order.address.addressLine2 ||
                      order.address.landmark}
                  </p>
                )}

                {order.address.city && (
                  <p className="text-sm text-gray-600">
                    {order.address.city},{" "}
                    {order.address.state} -{" "}
                    {order.address.pincode}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {!order && (
          <div className="mt-6 rounded-xl bg-gray-50 p-5">
            <p className="text-gray-600">
              Order information is not available.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            Continue Shopping
          </button>

          <button
            type="button"
            onClick={() => {
              if (backendOrderId) {
                navigate(`/orders/${backendOrderId}`);
              } else {
                navigate("/orders");
              }
            }}
            className="flex-1 rounded-lg border border-green-600 px-5 py-3 font-semibold text-green-700 hover:bg-green-50"
          >
            View Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;