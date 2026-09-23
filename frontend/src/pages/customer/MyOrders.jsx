import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    try {
      const savedOrders =
        localStorage.getItem("kirana_orders");

      let parsedOrders = [];

      if (savedOrders) {
        parsedOrders = JSON.parse(savedOrders);
      }

      // Get the latest order created during checkout
      const lastOrder = localStorage.getItem(
        "kirana_last_order"
      );

      if (lastOrder) {
        const parsedLastOrder =
          JSON.parse(lastOrder);

        // Add it if it is not already present
        const alreadyExists = parsedOrders.some(
          (order) =>
            order.orderId ===
            parsedLastOrder.orderId
        );

        if (!alreadyExists) {
          parsedOrders = [
            parsedLastOrder,
            ...parsedOrders,
          ];

          localStorage.setItem(
            "kirana_orders",
            JSON.stringify(parsedOrders)
          );
        }
      }

      // Latest orders first
      parsedOrders.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );

      setOrders(parsedOrders);
    } catch (error) {
      console.error(
        "Unable to load orders:",
        error
      );

      setOrders([]);
    }
  };

  const getStatus = (order) => {
    if (order.paymentStatus === "Failed") {
      return "Payment Failed";
    }

    if (order.orderStatus) {
      return order.orderStatus;
    }

    if (order.paymentStatus === "Paid") {
      return "Confirmed";
    }

    return "Pending";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Out for Delivery":
        return "bg-blue-100 text-blue-700";

      case "Shipped":
        return "bg-purple-100 text-purple-700";

      case "Confirmed":
        return "bg-emerald-100 text-emerald-700";

      case "Payment Pending":
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Payment Failed":
      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleViewOrder = (order) => {
    navigate(
      `/orders/${order.orderId}`,
      {
        state: {
          order,
        },
      }
    );
  };

  // =================================
  // EMPTY ORDERS
  // =================================

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-12">

        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-10 text-center shadow-md">

          <div className="mb-5 text-6xl">
            📦
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            No Orders Yet
          </h1>

          <p className="mt-3 text-gray-500">
            You haven't placed any orders yet.
            Start shopping to see your orders here.
          </p>

          <button
            onClick={() =>
              navigate("/products")
            }
            className="mt-6 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            Start Shopping
          </button>

        </div>

      </div>
    );
  }

  // =================================
  // ORDERS LIST
  // =================================

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-green-800">
            My Orders
          </h1>

          <p className="mt-1 text-gray-600">
            Track and manage your orders
          </p>

        </div>

        {/* ORDERS */}

        <div className="space-y-5">

          {orders.map((order) => {

            const status =
              getStatus(order);

            const firstItem =
              order.items?.[0];

            const itemCount =
              order.items?.reduce(
                (total, item) =>
                  total +
                  Number(
                    item.quantity || 1
                  ),
                0
              ) || 0;

            return (
              <div
                key={order.orderId}
                className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg"
              >

                {/* TOP */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="font-bold text-gray-800">
                      {order.orderId}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Placed on{" "}
                      {formatDate(
                        order.createdAt
                      )}
                    </p>

                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                      status
                    )}`}
                  >
                    {status}
                  </span>

                </div>

                {/* DIVIDER */}

                <div className="my-5 border-t" />

                {/* ORDER CONTENT */}

                <div className="flex flex-col gap-5 sm:flex-row">

                  {/* PRODUCT IMAGE */}

                  {firstItem?.image ? (
                    <img
                      src={firstItem.image}
                      alt={
                        firstItem.name ||
                        "Product"
                      }
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-100 text-4xl">
                      🛒
                    </div>
                  )}

                  {/* DETAILS */}

                  <div className="flex-1">

                    <h2 className="font-bold text-gray-800">
                      {firstItem?.name ||
                        "Kirana Marketplace Order"}
                    </h2>

                    {order.items &&
                      order.items.length >
                        1 && (
                        <p className="mt-1 text-sm text-gray-500">
                          +{" "}
                          {order.items.length -
                            1}{" "}
                          more product
                          {order.items.length -
                            1 !==
                          1
                            ? "s"
                            : ""}
                        </p>
                      )}

                    <p className="mt-2 text-sm text-gray-500">
                      {itemCount} item
                      {itemCount !== 1
                        ? "s"
                        : ""}
                    </p>

                    <p className="mt-2 font-semibold text-green-700">
                      ₹
                      {Number(
                        order.total || 0
                      ).toFixed(2)}
                    </p>

                  </div>

                  {/* ACTION */}

                  <div className="flex items-center">

                    <button
                      onClick={() =>
                        handleViewOrder(
                          order
                        )
                      }
                      className="w-full rounded-lg border border-green-600 px-5 py-3 font-semibold text-green-700 transition hover:bg-green-50 sm:w-auto"
                    >
                      View Details
                    </button>

                  </div>

                </div>

                {/* PAYMENT STATUS */}

                <div className="mt-5 flex flex-col gap-2 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-xs text-gray-500">
                      Payment
                    </p>

                    <p className="font-semibold text-gray-800">
                      {order.paymentMethod ||
                        "Not selected"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Payment Status
                    </p>

                    <p
                      className={`font-semibold ${
                        order.paymentStatus ===
                        "Paid"
                          ? "text-green-600"
                          : order.paymentStatus ===
                            "Failed"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.paymentStatus ||
                        "Pending"}
                    </p>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}

export default MyOrders;