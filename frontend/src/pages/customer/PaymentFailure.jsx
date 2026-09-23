import { useLocation, useNavigate } from "react-router-dom";

function PaymentFailure() {
  const navigate = useNavigate();
  const location = useLocation();

  const order =
    location.state?.order ||
    JSON.parse(localStorage.getItem("kirana_last_order") || "null");

  const errorMessage =
    location.state?.error ||
    order?.paymentError ||
    "Your payment could not be completed.";

  const retryPayment = () => {
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
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl text-red-600">
          ✕
        </div>

        <h1 className="mt-5 text-3xl font-bold text-red-600">
          Payment Failed
        </h1>

        <p className="mt-3 text-gray-600">
          {errorMessage}
        </p>

        {order && (
          <div className="mt-6 rounded-xl bg-gray-50 p-5 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Order ID
              </span>

              <span className="font-semibold">
                {order.orderId}
              </span>
            </div>

            <div className="mt-3 flex justify-between">
              <span className="text-gray-600">
                Payment Status
              </span>

              <span className="font-semibold text-red-600">
                Failed
              </span>
            </div>

            <div className="mt-3 flex justify-between">
              <span className="text-gray-600">
                Amount
              </span>

              <span className="font-bold">
                ₹{Number(order.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            onClick={retryPayment}
            className="w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            Retry Payment
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="w-full rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailure;