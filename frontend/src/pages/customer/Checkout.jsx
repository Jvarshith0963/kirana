
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

function Checkout() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [error, setError] = useState("");

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const delivery = subtotal === 0 || subtotal >= 500 ? 0 : 40;
  const total = subtotal + delivery;

  const handlePlaceOrder = (event) => {
    event.preventDefault();
    setError("");

    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add products first.");
      return;
    }

    if (!address.trim() || !phone.trim()) {
      setError("Please enter your delivery address and phone number.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    const order = {
      id: `ORD-${Date.now()}`,
      items: cartItems,
      subtotal,
      delivery,
      total,
      address: address.trim(),
      phone: phone.trim(),
      paymentMethod,
      paymentStatus:
        paymentMethod === "COD" ? "Pay on delivery" : "Pending",
      status: "Order Placed",
      createdAt: new Date().toISOString(),
    };

    try {
      const previousOrders = JSON.parse(
        localStorage.getItem("kirana_orders") || "[]"
      );

      const orders = Array.isArray(previousOrders)
        ? previousOrders
        : [];

      localStorage.setItem(
        "kirana_orders",
        JSON.stringify([order, ...orders])
      );

      clearCart();
      navigate(`/order-success/${order.id}`, {
        state: { order },
      });
    } catch {
      setError("Unable to save the order. Please try again.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Your cart is empty
        </h1>
        <p className="mt-2 text-gray-600">
          Add products before proceeding to checkout.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800">
          Checkout
        </h1>
        <p className="mt-2 text-gray-500">
          Enter your delivery details and choose a payment method.
        </p>

        <form
          onSubmit={handlePlaceOrder}
          className="mt-8 grid gap-8 md:grid-cols-3"
        >
          <div className="space-y-6 md:col-span-2">
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800">
                Delivery Details
              </h2>

              <label className="mt-5 block text-sm font-medium text-gray-700">
                Delivery Address
              </label>
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                rows={3}
                required
                placeholder="House number, street, area, city, PIN code"
                className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-600"
              />

              <label className="mt-4 block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-green-600"
              />
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800">
                Payment Method
              </h2>

              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:border-green-600">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Cash on Delivery
                    </p>
                    <p className="text-sm text-gray-500">
                      Pay when your order arrives.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:border-green-600">
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === "UPI"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      UPI
                    </p>
                    <p className="text-sm text-gray-500">
                      Demo option only; no real payment is processed.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:border-green-600">
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      Credit / Debit Card
                    </p>
                    <p className="text-sm text-gray-500">
                      Demo option only; no real payment is processed.
                    </p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800">
              Order Summary
            </h2>

            <div className="mt-5 space-y-3">
              {cartItems.map((item, index) => (
                <div
                  key={item.productId || item.id || index}
                  className="flex justify-between gap-3 text-sm"
                >
                  <span className="text-gray-600">
                    {item.name || item.title} × {item.quantity || 1}
                  </span>
                  <span className="font-medium">
                    ₹
                    {(
                      Number(item.price || 0) *
                      Number(item.quantity || 1)
                    ).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="border-t pt-3">
                <div className="flex justify-between py-2 text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-2 text-gray-600">
                  <span>Delivery</span>
                  <span>
                    {delivery === 0 ? "FREE" : `₹${delivery}`}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-4 text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
            >
              Place Order · ₹{total.toFixed(2)}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Demo checkout · No online payment is processed
            </p>

            <Link
              to="/cart"
              className="mt-4 block text-center text-sm font-medium text-green-700 hover:underline"
            >
              ← Back to Cart
            </Link>
          </aside>
        </form>
      </div>
    </div>
  );
}

export default Checkout;