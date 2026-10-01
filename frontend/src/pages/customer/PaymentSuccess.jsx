import { useLocation, useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const order =
    location.state?.order ||
    JSON.parse(localStorage.getItem("kirana_last_order") || "null");

  return (
    <div className="min-h-screen bg-green-50 px-4 py-12">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
          ✓
        </div>

        <h1 className="mt-5 text-3xl font-bold text-green-700">
          Payment Successful!
        </h1>

        <p className="mt-2 text-gray-600">
          Your order has been confirmed successfully.
        </p>

        {order && (
          <div className="mt-6 rounded-xl bg-gray-50 p-5 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID</span>
              <span className="font-semibold">
                {order.orderId}
              </span>
            </div>

            <div className="mt-3 flex justify-between">
              <span className="text-gray-600">
                Payment Status
              </span>

              <span className="font-semibold text-green-600">
                {order.paymentStatus || "Paid"}
              </span>
            </div>

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

            <div className="mt-3 flex justify-between">
              <span className="text-gray-600">
                Amount Paid
              </span>

              <span className="font-bold text-green-700">
                ₹{Number(order.total || 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate("/")}
            className="flex-1 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
          >
            Continue Shopping
          </button>

          <button
            onClick={() => navigate("/order-details")}
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