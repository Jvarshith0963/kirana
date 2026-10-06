import { useLocation, useNavigate } from "react-router-dom";

function PaymentFailure() {
  const navigate = useNavigate();
  const location = useLocation();

  let savedOrder = null;

  try {
    savedOrder = JSON.parse(
      localStorage.getItem("kirana_last_order") || "null"
    );
  } catch (err) {
    console.error(
      "Unable to read saved order:",
      err
    );
  }

  const order =
    location.state?.order || savedOrder;

  const errorMessage =
    location.state?.error ||
    order?.paymentError ||
    "Your payment could not be completed.";

  const backendOrderId =
    order?.backendOrderId ||
    order?.orders?.[0]?.id ||
    order?.orderId;

  const retryPayment = () => {
    if (!order) {
      navigate("/checkout");
      return;
    }

    navigate("/payment", {
      state: {
        order,
        retry: true,
      },
    });
  };

  return (
    <div className="min-h-screen bg-red-50 px-4 py-12">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
        {/* Failure Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl text-red-600">
          ✕
        </div>

        {/* Heading */}
        <h1 className="mt-5 text-3xl font-bold text-red-600">
          Payment Failed
        </h1>

        <p className="mt-3 text-gray-600">
          {errorMessage}
        </p>

        {order && (
          <div className="mt-6 rounded-xl bg-gray-50 p-5 text-left">
            {/* Order ID */}
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

              <span className="font-semibold text-red-600">
                Failed
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
                Amount
              </span>

              <span className="font-bold">
                ₹
                {Number(
                  order.total || 0
                ).toFixed(2)}
              </span>
            </div>

            {/* Multiple Orders */}
            {Array.isArray(order.orders) &&
              order.orders.length > 1 && (
                <div className="mt-5 border-t pt-4">
                  <p className="mb-3 font-semibold text-gray-800">
                    Orders Created
                  </p>

                  <div className="space-y-2">
                    {order.orders.map(
                      (item, index) => (
                        <div
                          key={
                            item.id || index
                          }
                          className="flex items-center justify-between rounded-lg bg-white p-3"
                        >
                          <span className="font-medium text-gray-700">
                            Order #{item.id}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/orders/${item.id}`
                              )
                            }
                            className="font-semibold text-green-700 hover:underline"
                          >
                            View
                          </button>
                        </div>
                      )
                    )}
                  </div>
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

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={retryPayment}
            className="w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            Retry Payment
          </button>

          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="w-full rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to Cart
          </button>

          {backendOrderId && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/orders/${backendOrderId}`
                )
              }
              className="w-full rounded-lg border border-green-600 px-5 py-3 font-semibold text-green-700 hover:bg-green-50"
            >
              View Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentFailure;