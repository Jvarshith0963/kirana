import { useLocation, useNavigate } from "react-router-dom";

function Invoice() {
  const navigate = useNavigate();
  const location = useLocation();

  const order =
    location.state?.order ||
    JSON.parse(
      localStorage.getItem(
        "kirana_last_order"
      ) || "null"
    );

  if (!order) {
    return (
      <div className="min-h-screen bg-green-50 p-10 text-center">
        <h1 className="text-2xl font-bold">
          Invoice Not Found
        </h1>

        <button
          onClick={() =>
            navigate("/orders")
          }
          className="mt-5 rounded-lg bg-green-600 px-6 py-3 text-white"
        >
          My Orders
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">

      <div className="mx-auto max-w-4xl">

        <div className="mb-5 flex justify-between print:hidden">

          <button
            onClick={() =>
              navigate(-1)
            }
            className="font-semibold text-green-700"
          >
            ← Back
          </button>

          <button
            onClick={handlePrint}
            className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white"
          >
            🖨️ Print / Save PDF
          </button>

        </div>

        <div className="bg-white p-8 shadow print:shadow-none">

          <div className="flex flex-col justify-between gap-5 border-b pb-6 sm:flex-row">

            <div>
              <h1 className="text-3xl font-bold text-green-700">
                Kirana Marketplace
              </h1>

              <p className="mt-1 text-gray-500">
                Grocery & Daily Essentials
              </p>
            </div>

            <div className="sm:text-right">
              <h2 className="text-2xl font-bold">
                INVOICE
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Order ID: {order.orderId}
              </p>

              <p className="text-sm text-gray-500">
                {order.createdAt
                  ? new Date(
                      order.createdAt
                    ).toLocaleDateString(
                      "en-IN"
                    )
                  : ""}
              </p>
            </div>

          </div>

          {/* ADDRESS */}

          <div className="grid gap-6 border-b py-6 sm:grid-cols-2">

            <div>
              <p className="mb-2 text-sm font-semibold text-gray-500">
                BILL TO
              </p>

              <p className="font-semibold">
                {order.address?.name}
              </p>

              <p className="text-sm text-gray-600">
                {order.address?.addressLine}
              </p>

              <p className="text-sm text-gray-600">
                {order.address?.city},{" "}
                {order.address?.state} -{" "}
                {order.address?.pincode}
              </p>

              <p className="text-sm text-gray-600">
                Phone: {order.address?.phone}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-gray-500">
                PAYMENT
              </p>

              <p className="text-sm">
                Method:{" "}
                <strong>
                  {order.paymentMethod ||
                    "Pending"}
                </strong>
              </p>

              <p className="text-sm">
                Status:{" "}
                <strong className="text-green-600">
                  {order.paymentStatus ||
                    "Pending"}
                </strong>
              </p>
            </div>

          </div>

          {/* ITEMS */}

          <div className="py-6">

            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="pb-3">
                    Product
                  </th>

                  <th className="pb-3 text-center">
                    Qty
                  </th>

                  <th className="pb-3 text-right">
                    Price
                  </th>

                  <th className="pb-3 text-right">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>

                {order.items?.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="border-b"
                    >
                      <td className="py-4">
                        {item.name}
                      </td>

                      <td className="py-4 text-center">
                        {item.quantity}
                      </td>

                      <td className="py-4 text-right">
                        ₹
                        {Number(
                          item.price || 0
                        ).toFixed(2)}
                      </td>

                      <td className="py-4 text-right">
                        ₹
                        {(
                          Number(
                            item.price || 0
                          ) *
                          Number(
                            item.quantity || 1
                          )
                        ).toFixed(2)}
                      </td>
                    </tr>
                  )
                )}

              </tbody>
            </table>

          </div>

          {/* TOTAL */}

          <div className="ml-auto max-w-sm space-y-3 border-t pt-5">

            <div className="flex justify-between">
              <span>Subtotal</span>

              <span>
                ₹
                {Number(
                  order.subtotal || 0
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Delivery</span>

              <span>
                ₹
                {Number(
                  order.deliveryCharge || 0
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>

              <span className="text-green-600">
                -₹
                {Number(
                  order.discount || 0
                ).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3 text-xl font-bold">
              <span>Total</span>

              <span className="text-green-700">
                ₹
                {Number(
                  order.total || 0
                ).toFixed(2)}
              </span>
            </div>

          </div>

          <div className="mt-10 border-t pt-5 text-center text-sm text-gray-500">
            Thank you for shopping with Kirana Marketplace!
          </div>

        </div>

      </div>
    </div>
  );
}

export default Invoice;