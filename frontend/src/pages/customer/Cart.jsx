import { useCart } from "../../context/CartContext"

function Cart() {
  const { cartItems, removeFromCart } = useCart()

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <div className="min-h-screen bg-green-50 px-10 py-10">

      {/* Heading */}
      <h1 className="mb-8 text-4xl font-bold text-green-700">
        🛒 Your Cart
      </h1>

      {cartItems.length === 0 ? (

        /* Empty Cart */
        <div className="rounded-xl bg-white p-10 text-center shadow-md">

          <div className="mb-4 text-6xl">
            🛒
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            Your cart is empty
          </h2>

          <p className="mt-2 text-gray-500">
            Add some products to your cart to see them here.
          </p>

        </div>

      ) : (

        /* Cart with Products */
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Cart Items */}
          <div className="space-y-5 lg:col-span-2">

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl bg-white p-6 shadow-md"
              >

                {/* Product Information */}
                <div className="flex items-center gap-5">

                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-green-100 text-5xl">
                    {item.icon}
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {item.name}
                    </h2>

                    <p className="mt-2 text-gray-500">
                      ₹{item.price} × {item.quantity}
                    </p>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="mt-2 text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                </div>

                {/* Item Total */}
                <p className="text-xl font-bold text-green-600">
                  ₹{item.price * item.quantity}
                </p>

              </div>
            ))}

          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-xl bg-white p-6 shadow-md">

            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Order Summary
            </h2>

            <div className="flex justify-between border-b pb-4">
              <span className="text-gray-600">
                Subtotal
              </span>

              <span className="font-semibold">
                ₹{total}
              </span>
            </div>

            <div className="mt-4 flex justify-between border-b pb-4">
              <span className="text-gray-600">
                Delivery
              </span>

              <span className="font-semibold text-green-600">
                FREE
              </span>
            </div>

            <div className="mt-5 flex justify-between">
              <span className="text-xl font-bold">
                Total
              </span>

              <span className="text-xl font-bold text-green-600">
                ₹{total}
              </span>
            </div>

            <button className="mt-6 w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700">
              Proceed to Checkout
            </button>

          </div>

        </div>

      )}

    </div>
  )
}

export default Cart