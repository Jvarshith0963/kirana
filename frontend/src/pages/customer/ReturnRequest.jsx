import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const RETURN_STORAGE_KEY = "kirana_returns";

const returnReasons = [
  "Damaged product",
  "Wrong product delivered",
  "Product quality issue",
  "Expired product",
  "Missing product",
  "Product not as described",
  "Other",
];

function ReturnRequest() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [refundMethod, setRefundMethod] = useState("Original Payment Method");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load order
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("kirana_orders");
      const lastOrder = localStorage.getItem("kirana_last_order");

      let foundOrder = null;

      if (savedOrders) {
        const orders = JSON.parse(savedOrders);

        if (Array.isArray(orders)) {
          foundOrder = orders.find(
            (item) =>
              String(item.orderId) === String(orderId) ||
              String(item.id) === String(orderId)
          );
        }
      }

      if (!foundOrder && lastOrder) {
        const parsedLastOrder = JSON.parse(lastOrder);

        if (
          String(parsedLastOrder.orderId) === String(orderId)
        ) {
          foundOrder = parsedLastOrder;
        }
      }

      if (!foundOrder) {
        setError("We could not find this order.");
        return;
      }

      setOrder(foundOrder);
    } catch (err) {
      console.error("Unable to load order:", err);

      setError(
        "Unable to load the order. Please try again."
      );
    }
  }, [orderId]);

  const toggleItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!order) {
      setError("Order information is unavailable.");
      return;
    }

    if (selectedItems.length === 0) {
      setError("Please select at least one product.");
      return;
    }

    if (!reason) {
      setError("Please select a return reason.");
      return;
    }

    if (description.trim().length < 5) {
      setError(
        "Please provide a little more information about the issue."
      );
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const savedReturns =
        localStorage.getItem(RETURN_STORAGE_KEY);

      const existingReturns = savedReturns
        ? JSON.parse(savedReturns)
        : [];

      const selectedProducts = (order.items || []).filter(
        (item) =>
          selectedItems.includes(String(item.id))
      );

      const returnId =
        "RET" +
        Date.now().toString().slice(-8);

      const returnRequest = {
        returnId,
        orderId: order.orderId || order.id,
        items: selectedProducts,
        reason,
        description,
        refundMethod,
        refundAmount: selectedProducts.reduce(
          (total, item) =>
            total +
            Number(item.price || 0) *
              Number(item.quantity || 1),
          0
        ),
        status: "Requested",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        RETURN_STORAGE_KEY,
        JSON.stringify([
          returnRequest,
          ...existingReturns,
        ])
      );

      setSuccess(
        "Your return request has been submitted successfully."
      );

      setTimeout(() => {
        navigate(
          `/orders/${order.orderId}/return-status`
        );
      }, 800);
    } catch (err) {
      console.error(
        "Return request submission failed:",
        err
      );

      setError(
        "Something went wrong while submitting your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!order && !error) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-md">
          <div
            className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600"
            aria-label="Loading"
          />

          <p className="text-gray-600">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-10">
        <div
          className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-md"
          role="alert"
        >
          <div className="mb-4 text-5xl">⚠️</div>

          <h1 className="text-2xl font-bold text-gray-800">
            Order not found
          </h1>

          <p className="mt-2 text-gray-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate(`/orders/${order.orderId}`)
            }
            className="mb-4 text-sm font-semibold text-green-700 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
          >
            ← Back to Order
          </button>

          <h1 className="text-3xl font-bold text-gray-800">
            Request Return / Refund
          </h1>

          <p className="mt-1 text-gray-600">
            Order #{order.orderId}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <p className="font-semibold">
              Unable to submit request
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"
          >
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6"
        >
          {/* Products */}
          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800">
              Select Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select the products you want to return.
            </p>

            <div className="mt-5 space-y-3">
              {(order.items || []).map((item, index) => {
                const itemId = String(
                  item.id ?? index
                );

                const selected =
                  selectedItems.includes(itemId);

                return (
                  <label
                    key={itemId}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition focus-within:ring-2 focus-within:ring-green-500 ${
                      selected
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={itemId}
                      checked={selected}
                      onChange={() =>
                        toggleItem(itemId)
                      }
                      className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />

                    <img
                      src={
                        item.image ||
                        "https://via.placeholder.com/80"
                      }
                      alt={item.name || "Order product"}
                      className="h-16 w-16 rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {item.name || "Product"}
                      </p>

                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity || 1}
                      </p>

                      <p className="font-semibold text-green-700">
                        ₹{item.price || 0}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Reason */}
          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800">
              Return Reason
            </h2>

            <div className="mt-5">
              <label
                htmlFor="return-reason"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Why are you returning this product?
              </label>

              <select
                id="return-reason"
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">
                  Select a reason
                </option>

                {returnReasons.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              <label
                htmlFor="return-description"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Explain the issue
              </label>

              <textarea
                id="return-description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows={5}
                placeholder="Please describe what happened..."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />

              <p className="mt-1 text-xs text-gray-500">
                Minimum 5 characters.
              </p>
            </div>
          </section>

          {/* Refund Method */}
          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-800">
              Refund Method
            </h2>

            <div className="mt-5 space-y-3">
              {[
                "Original Payment Method",
                "Store Credit",
              ].map((method) => (
                <label
                  key={method}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-green-300 focus-within:ring-2 focus-within:ring-green-500"
                >
                  <input
                    type="radio"
                    name="refundMethod"
                    value={method}
                    checked={refundMethod === method}
                    onChange={(e) =>
                      setRefundMethod(e.target.value)
                    }
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />

                  <span className="font-medium text-gray-700">
                    {method}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Submit */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="font-semibold text-gray-800">
                  Ready to submit?
                </p>

                <p className="text-sm text-gray-500">
                  You can track the request status after submission.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Return Request"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReturnRequest;