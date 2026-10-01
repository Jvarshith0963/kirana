import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PAYMENT_METHODS = [
  {
    id: "upi",
    name: "UPI",
    description: "Google Pay, PhonePe, Paytm & more",
    icon: "📱",
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    description: "Visa, Mastercard, RuPay & more",
    icon: "💳",
  },
  {
    id: "netbanking",
    name: "Netbanking",
    description: "All major banks",
    icon: "🏦",
  },
  {
    id: "wallet",
    name: "Wallet",
    description: "Paytm, Mobikwik & more",
    icon: "👛",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: "💵",
  },
];

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!order) {
      const savedOrder = localStorage.getItem("kirana_last_order");

      if (savedOrder) {
        try {
          setOrder(JSON.parse(savedOrder));
        } catch {
          setError("Unable to load your order.");
        }
      }
    }
  }, [order]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handleCOD = () => {
    const updatedOrder = {
      ...order,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "COD",
      paymentId: null,
      orderStatus: "Confirmed",
    };

    localStorage.setItem(
      "kirana_last_order",
      JSON.stringify(updatedOrder)
    );

    navigate("/payment-success", {
      state: {
        order: updatedOrder,
        cod: true,
      },
    });
  };

  const handleOnlinePayment = async () => {
    setError("");
    setProcessing(true);

    try {
      const loaded = await loadRazorpay();

      if (!loaded) {
        throw new Error(
          "Razorpay Checkout could not be loaded. Please check your internet connection."
        );
      }

      /*
       * BACKEND INTEGRATION:
       *
       * Later Varshith will provide:
       *
       * POST /api/payments/create-order
       *
       * Response:
       * {
       *   order_id: "order_xxxxx",
       *   amount: 50000,
       *   currency: "INR"
       * }
       */

      const backendOrder = {
        id: `demo_order_${Date.now()}`,
        amount: Math.round(Number(order.total || 0) * 100),
        currency: "INR",
      };

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_demo",

        amount: backendOrder.amount,

        currency: backendOrder.currency,

        name: "Kirana Marketplace",

        description: "Kirana Marketplace Order",

        order_id:
          import.meta.env.VITE_RAZORPAY_DEMO_ORDER_ID ||
          backendOrder.id,

        handler: function (response) {
          const updatedOrder = {
            ...order,
            paymentMethod:
              PAYMENT_METHODS.find(
                (method) => method.id === selectedMethod
              )?.name || selectedMethod,
            paymentStatus: "Paid",
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            orderStatus: "Confirmed",
          };

          localStorage.setItem(
            "kirana_last_order",
            JSON.stringify(updatedOrder)
          );

          navigate("/payment-success", {
            state: {
              order: updatedOrder,
            },
          });
        },

        modal: {
          ondismiss: function () {
            setProcessing(false);
            setError(
              "Payment was cancelled. You can retry the payment."
            );
          },
        },

        theme: {
          color: "#16a34a",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);

        const failedOrder = {
          ...order,
          paymentMethod:
            PAYMENT_METHODS.find(
              (method) => method.id === selectedMethod
            )?.name || selectedMethod,
          paymentStatus: "Failed",
          paymentId: null,
          orderStatus: "Payment Failed",
          paymentError:
            response.error?.description ||
            "Payment failed. Please try again.",
        };

        localStorage.setItem(
          "kirana_last_order",
          JSON.stringify(failedOrder)
        );

        setProcessing(false);

        navigate("/payment-failure", {
          state: {
            order: failedOrder,
            error:
              response.error?.description ||
              "Payment failed. Please try again.",
          },
        });
      });

      razorpay.open();
    } catch (err) {
      console.error(err);

      setProcessing(false);

      setError(
        err.message ||
          "Something went wrong while starting the payment."
      );
    }
  };

  const handlePayment = () => {
    if (!order) {
      setError("Order information is missing.");
      return;
    }

    if (selectedMethod === "cod") {
      handleCOD();
      return;
    }

    handleOnlinePayment();
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-gray-800">
            Order Not Found
          </h1>

          <p className="mt-2 text-gray-600">
            We could not find the order you want to pay for.
          </p>

          <button
            onClick={() => navigate("/cart")}
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => navigate("/checkout")}
          className="mb-6 text-sm font-semibold text-green-700 hover:underline"
        >
          ← Back to Checkout
        </button>

        <h1 className="mb-6 text-3xl font-bold text-gray-800">
          Choose Payment Method
        </h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow">
              <h2 className="mb-5 text-xl font-bold text-gray-800">
                Payment Options
              </h2>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => {
                      setSelectedMethod(method.id);
                      setError("");
                    }}
                    className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition ${
                      selectedMethod === method.id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
                      {method.icon}
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-gray-800">
                        {method.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {method.description}
                      </p>
                    </div>

                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        selectedMethod === method.id
                          ? "border-green-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedMethod === method.id && (
                        <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing}
                className="mt-6 w-full rounded-xl bg-green-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing
                  ? "Opening Payment..."
                  : selectedMethod === "cod"
                  ? "Place Order"
                  : `Pay ₹${Number(order.total || 0).toFixed(2)}`}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-6 rounded-2xl bg-white p-6 shadow">
              <h2 className="mb-5 text-xl font-bold text-gray-800">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    ₹{Number(order.subtotal || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Delivery
                  </span>

                  <span className="font-semibold">
                    ₹{Number(order.deliveryCharge || 0).toFixed(2)}
                  </span>
                </div>

                {Number(order.discount || 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>

                    <span>
                      -₹{Number(order.discount).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>

                    <span className="text-green-700">
                      ₹{Number(order.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Selected payment method
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {
                    PAYMENT_METHODS.find(
                      (method) => method.id === selectedMethod
                    )?.name
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;