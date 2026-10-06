import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const getAccessToken = () => {
  const directKeys = [
    "accessToken",
    "access_token",
    "authToken",
    "token",
    "kirana_access_token",
  ];

  for (const key of directKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  const objectKeys = [
    "user",
    "auth",
    "currentUser",
    "kirana_user",
  ];

  for (const key of objectKeys) {
    try {
      const value = JSON.parse(
        localStorage.getItem(key) || "null"
      );

      const token =
        value?.accessToken ||
        value?.access_token ||
        value?.token;

      if (token) {
        return token;
      }
    } catch {
      // Ignore invalid localStorage JSON.
    }
  }

  return null;
};

const extractOrders = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.orders)) {
    return payload.orders;
  }

  if (Array.isArray(payload?.data?.orders)) {
    return payload.data.orders;
  }

  return [];
};

const normalizeItem = (item) => {
  return {
    ...item,

    id:
      item?.id ||
      item?.order_item_id ||
      item?.product_id,

    productId:
      item?.product_id ||
      item?.productId,

    name:
      item?.name ||
      item?.product_name ||
      item?.productName ||
      "Product",

    image:
      item?.image ||
      item?.image_url ||
      item?.product_image ||
      item?.productImage ||
      "",

    quantity:
      Number(item?.quantity || 1),

    price:
      Number(
        item?.price ||
        item?.unit_price ||
        item?.unitPrice ||
        0
      ),

    subtotal:
      Number(
        item?.subtotal ||
        (
          Number(
            item?.price ||
            item?.unit_price ||
            0
          ) *
          Number(item?.quantity || 1)
        )
      ),
  };
};

const normalizeOrder = (order) => {
  const orderItems =
    Array.isArray(order?.items)
      ? order.items
      : Array.isArray(order?.order_items)
      ? order.order_items
      : [];

  const normalizedItems =
    orderItems.map(normalizeItem);

  const backendId =
    order?.id ||
    order?.order_id ||
    order?.backendOrderId;

  const totalAmount =
    Number(
      order?.total_amount ??
      order?.totalAmount ??
      order?.total ??
      0
    );

  const paymentStatusRaw =
    order?.payment_status ??
    order?.paymentStatus ??
    "pending";

  const orderStatusRaw =
    order?.status ??
    order?.order_status ??
    order?.orderStatus ??
    "pending";

  return {
    ...order,

    id: backendId,

    orderId: backendId
      ? String(backendId)
      : "N/A",

    backendOrderId: backendId,

    createdAt:
      order?.created_at ||
      order?.createdAt ||
      null,

    total: totalAmount,

    totalAmount,

    paymentStatus:
      String(paymentStatusRaw).toLowerCase(),

    orderStatus:
      String(orderStatusRaw).toLowerCase(),

    paymentMethod:
      order?.payment_method ||
      order?.paymentMethod ||
      null,

    items: normalizedItems,
  };
};

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getAccessToken();

      if (!token) {
        throw new Error(
          "Please login to view your orders."
        );
      }

      const response = await fetch(
        `${API_URL}/my-orders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to load your orders."
        );
      }

      const backendOrders =
        extractOrders(data);

      const normalizedOrders =
        backendOrders
          .map(normalizeOrder)
          .sort(
            (a, b) =>
              new Date(
                b.createdAt || 0
              ) -
              new Date(
                a.createdAt || 0
              )
          );

      setOrders(normalizedOrders);
    } catch (err) {
      console.error(
        "Unable to load orders:",
        err
      );

      setOrders([]);

      setError(
        err.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatus = (order) => {
    const orderStatus =
      String(
        order?.orderStatus || ""
      ).toLowerCase();

    const paymentStatus =
      String(
        order?.paymentStatus || ""
      ).toLowerCase();

    if (
      orderStatus === "cancelled"
    ) {
      return "Cancelled";
    }

    if (
      paymentStatus === "failed"
    ) {
      return "Payment Failed";
    }

    if (
      orderStatus === "delivered"
    ) {
      return "Delivered";
    }

    if (
      orderStatus ===
        "out_for_delivery" ||
      orderStatus ===
        "out for delivery"
    ) {
      return "Out for Delivery";
    }

    if (
      orderStatus === "processing"
    ) {
      return "Processing";
    }

    if (
      orderStatus === "confirmed"
    ) {
      return "Confirmed";
    }

    if (
      orderStatus === "pending"
    ) {
      if (
        paymentStatus === "pending"
      ) {
        return "Payment Pending";
      }

      return "Pending";
    }

    if (
      paymentStatus === "paid"
    ) {
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

      case "Processing":
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

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleViewOrder = (order) => {
    const orderId =
      order?.backendOrderId ||
      order?.id ||
      order?.orderId;

    if (!orderId) {
      setError(
        "Unable to open this order."
      );

      return;
    }

    navigate(
      `/orders/${orderId}`,
      {
        state: {
          order,
        },
      }
    );
  };

  // =================================
  // LOADING
  // =================================

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-10 text-center shadow-md">
          <div className="mb-5 text-5xl">
            ⏳
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Loading your orders...
          </h1>

          <p className="mt-2 text-gray-500">
            Please wait while we fetch your orders.
          </p>
        </div>
      </div>
    );
  }

  // =================================
  // ERROR + EMPTY ORDERS
  // =================================

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-10 text-center shadow-md">
          <div className="mb-5 text-6xl">
            📦
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            {error
              ? "Unable to Load Orders"
              : "No Orders Yet"}
          </h1>

          <p className="mt-3 text-gray-500">
            {error ||
              "You haven't placed any orders yet. Start shopping to see your orders here."}
          </p>

          {error && (
            <button
              type="button"
              onClick={loadOrders}
              className="mt-6 mr-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              Try Again
            </button>
          )}

          <button
            type="button"
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800">
              My Orders
            </h1>

            <p className="mt-1 text-gray-600">
              Track and manage your orders
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="rounded-lg border border-green-600 px-5 py-3 font-semibold text-green-700 hover:bg-green-50 disabled:opacity-60"
          >
            Refresh Orders
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            <span>⚠️</span>

            <div>
              <p className="font-semibold">
                Orders Error
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

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
                key={
                  order.backendOrderId ||
                  order.orderId
                }
                className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg"
              >
                {/* TOP */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <p className="font-bold text-gray-800">
                      #
                      {order.backendOrderId ||
                        order.orderId}
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
                          +
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
                      type="button"
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
                        String(
                          order.paymentStatus
                        ).toLowerCase() ===
                        "paid"
                          ? "text-green-600"
                          : String(
                              order.paymentStatus
                            ).toLowerCase() ===
                            "failed"
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