import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const STATUS_STEPS = [
  {
    id: "Placed",
    title: "Order Placed",
    icon: "📝",
  },
  {
    id: "Confirmed",
    title: "Confirmed",
    icon: "✓",
  },
  {
    id: "Processing",
    title: "Processing",
    icon: "⚙️",
  },
  {
    id: "Shipped",
    title: "Shipped",
    icon: "📦",
  },
  {
    id: "Out for Delivery",
    title: "Out for Delivery",
    icon: "🚚",
  },
  {
    id: "Delivered",
    title: "Delivered",
    icon: "🏠",
  },
];

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
      // Ignore invalid JSON.
    }
  }

  return null;
};

const getResponseData = (payload) => {
  if (payload?.data?.order) {
    return payload.data.order;
  }

  if (payload?.order) {
    return payload.order;
  }

  if (payload?.data) {
    return payload.data;
  }

  return payload;
};

const normalizeStatus = (status) => {
  const value = String(
    status || "pending"
  )
    .trim()
    .toLowerCase();

  switch (value) {
    case "pending":
      return "Placed";

    case "confirmed":
      return "Confirmed";

    case "processing":
      return "Processing";

    case "shipped":
      return "Shipped";

    case "out_for_delivery":
    case "out for delivery":
      return "Out for Delivery";

    case "delivered":
      return "Delivered";

    case "cancelled":
    case "canceled":
      return "Cancelled";

    case "payment failed":
    case "payment_failed":
      return "Payment Failed";
    case "preparing":
      return "Processing";

    default:
      return "Placed";
  }
};

const normalizePaymentStatus = (
  status
) => {
  const value = String(
    status || "pending"
  )
    .trim()
    .toLowerCase();

  switch (value) {
    case "paid":
    case "success":
      return "Paid";

    case "failed":
      return "Failed";

    case "refunded":
      return "Refunded";

    case "pending":
    default:
      return "Pending";
  }
};

const normalizeItem = (item) => {
  const price = Number(
    item?.price ??
      item?.unit_price ??
      item?.unitPrice ??
      0
  );

  const quantity = Number(
    item?.quantity || 1
  );

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

    quantity,

    price,

    subtotal:
      Number(
        item?.subtotal ??
          price * quantity
      ),
  };
};

const normalizeAddress = (
  address
) => {
  if (!address) {
    return null;
  }

  return {
    ...address,

    id: address.id,

    name:
      address.name ||
      address.receiver_name ||
      address.receiverName ||
      "",

    phone:
      address.phone ||
      address.phone_number ||
      "",

    addressLine:
      address.addressLine ||
      address.address_line1 ||
      "",

    addressLine2:
      address.addressLine2 ||
      address.address_line2 ||
      "",

    landmark:
      address.landmark || "",

    city:
      address.city || "",

    state:
      address.state || "",

    pincode:
      address.pincode ||
      address.postal_code ||
      "",
  };
};

const normalizeOrder = (
  rawOrder
) => {
  const items =
    Array.isArray(rawOrder?.items)
      ? rawOrder.items
      : Array.isArray(
          rawOrder?.order_items
        )
      ? rawOrder.order_items
      : [];

  const backendOrderId =
    rawOrder?.id ||
    rawOrder?.order_id ||
    rawOrder?.backendOrderId;

  return {
    ...rawOrder,

    id: backendOrderId,

    orderId: backendOrderId,

    backendOrderId,

    createdAt:
      rawOrder?.created_at ||
      rawOrder?.createdAt ||
      null,

    orderStatus: normalizeStatus(
      rawOrder?.status ||
        rawOrder?.order_status ||
        rawOrder?.orderStatus
    ),

    paymentStatus:
      normalizePaymentStatus(
        rawOrder?.payment_status ||
          rawOrder?.paymentStatus
      ),

    paymentMethod:
      rawOrder?.payment_method ||
      rawOrder?.paymentMethod ||
      null,

    subtotal: Number(
      rawOrder?.subtotal || 0
    ),

    deliveryCharge: Number(
      rawOrder?.delivery_fee ??
        rawOrder?.delivery_charge ??
        rawOrder?.deliveryCharge ??
        0
    ),

    discount: Number(
      rawOrder?.discount || 0
    ),

    total: Number(
      rawOrder?.total_amount ??
        rawOrder?.totalAmount ??
        rawOrder?.total ??
        0
    ),

    items: items.map(
      normalizeItem
    ),

    address: normalizeAddress(
      rawOrder?.address
    ),
  };
};

function OrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(
    location.state?.order || null
  );

  const [loading, setLoading] =
    useState(!location.state?.order);

  const [error, setError] =
    useState("");

  const loadOrder = async () => {
    if (!orderId) {
      setError(
        "Order ID is missing."
      );
      setLoading(false);
      return;
    }

    const token = getAccessToken();

    if (!token) {
      setError(
        "Please login to view your order."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `${API_URL}/my-orders/${orderId}`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
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
            "Unable to load order details."
        );
      }

      const backendOrder =
        getResponseData(data);

      if (
        !backendOrder ||
        (!backendOrder.id &&
          !backendOrder.order_id)
      ) {
        throw new Error(
          "Order details were not returned by the server."
        );
      }

      setOrder(
        normalizeOrder(
          backendOrder
        )
      );
    } catch (err) {
      console.error(
        "Unable to load order details:",
        err
      );

      setError(
        err.message ||
          "Unable to load order details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  // =================================
  // LOADING
  // =================================

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow">
          <div className="text-5xl">
            ⏳
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Loading Order...
          </h1>

          <p className="mt-2 text-gray-500">
            Please wait while we fetch your order details.
          </p>
        </div>
      </div>
    );
  }

  // =================================
  // ERROR / NOT FOUND
  // =================================

  if (!order || error) {
    return (
      <div className="min-h-screen bg-green-50 px-4 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 text-center shadow">
          <div className="text-5xl">
            📦
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            {error
              ? "Unable to Load Order"
              : "Order Not Found"}
          </h1>

          <p className="mt-2 text-gray-500">
            {error ||
              "We couldn't find this order."}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {error && (
              <button
                type="button"
                onClick={loadOrder}
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
              >
                Try Again
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                navigate("/orders")
              }
              className="rounded-lg border border-green-600 px-6 py-3 font-semibold text-green-700 hover:bg-green-50"
            >
              Back to My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus =
    order.orderStatus || "Placed";

  const currentIndex =
    STATUS_STEPS.findIndex(
      (step) =>
        step.id === currentStatus
    );

  const effectiveIndex =
    currentIndex >= 0
      ? currentIndex
      : 0;

  const isFailed =
    order.paymentStatus ===
      "Failed" ||
    currentStatus ===
      "Payment Failed";

  const isCancelled =
    currentStatus ===
    "Cancelled";

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* BACK */}
        <button
          type="button"
          onClick={() =>
            navigate("/orders")
          }
          className="mb-6 font-semibold text-green-700 hover:underline"
        >
          ← Back to My Orders
        </button>

        {/* HEADER */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Order ID
              </p>

              <h1 className="text-2xl font-bold text-gray-800">
                #
                {order.backendOrderId ||
                  order.orderId}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {order.createdAt
                  ? new Date(
                      order.createdAt
                    ).toLocaleString(
                      "en-IN"
                    )
                  : "Date unavailable"}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 px-4 py-3">
              <p className="text-xs text-gray-500">
                Order Status
              </p>

              <p
                className={`font-bold ${
                  isCancelled ||
                  isFailed
                    ? "text-red-600"
                    : "text-green-700"
                }`}
              >
                {currentStatus}
              </p>
            </div>
          </div>
        </div>

        {/* STATUS STEPPER */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-8 text-xl font-bold text-gray-800">
            Order Tracking
          </h2>

          {isFailed ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              <p className="font-bold">
                Payment Failed
              </p>

              <p className="mt-1 text-sm">
                Please retry the payment to continue with this order.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/payment",
                    {
                      state: {
                        order,
                        retry: true,
                      },
                    }
                  )
                }
                className="mt-4 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
              >
                Retry Payment
              </button>
            </div>
          ) : isCancelled ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              <p className="font-bold">
                Order Cancelled
              </p>

              <p className="mt-1 text-sm">
                This order has been cancelled.
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="hidden h-1 bg-gray-200 sm:absolute sm:left-[8%] sm:right-[8%] sm:top-6 sm:block" />

              <div
                className="hidden h-1 bg-green-500 sm:absolute sm:left-[8%] sm:top-6 sm:block"
                style={{
                  width:
                    effectiveIndex ===
                    0
                      ? "0%"
                      : `${Math.min(
                          (effectiveIndex /
                            (STATUS_STEPS.length -
                              1)) *
                            84,
                          84
                        )}%`,
                }}
              />

              <div className="grid gap-6 sm:grid-cols-6">
                {STATUS_STEPS.map(
                  (
                    step,
                    index
                  ) => {
                    const completed =
                      index <=
                      effectiveIndex;

                    return (
                      <div
                        key={
                          step.id
                        }
                        className="relative flex flex-col items-center text-center"
                      >
                        <div
                          className={`z-10 flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                            completed
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {
                            step.icon
                          }
                        </div>

                        <p
                          className={`mt-3 text-sm font-semibold ${
                            completed
                              ? "text-green-700"
                              : "text-gray-400"
                          }`}
                        >
                          {
                            step.title
                          }
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">
            {/* ITEMS */}
            <section className="rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-5 text-xl font-bold text-gray-800">
                Ordered Items
              </h2>

              {order.items?.length >
              0 ? (
                <div className="space-y-4">
                  {order.items.map(
                    (item, index) => (
                      <div
                        key={
                          item.id ||
                          item.productId ||
                          index
                        }
                        className="flex gap-4 border-b border-gray-100 pb-4 last:border-0"
                      >
                        {item.image ? (
                          <img
                            src={
                              item.image
                            }
                            alt={
                              item.name
                            }
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 text-3xl">
                            🛒
                          </div>
                        )}

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {
                              item.name
                            }
                          </h3>

                          <p className="text-sm text-gray-500">
                            Quantity:{" "}
                            {
                              item.quantity
                            }
                          </p>

                          <p className="mt-1 font-semibold text-green-700">
                            ₹
                            {Number(
                              item.price ||
                                0
                            ).toFixed(
                              2
                            )}
                          </p>
                        </div>

                        <p className="font-bold text-gray-800">
                          ₹
                          {Number(
                            item.subtotal ??
                              Number(
                                item.price ||
                                  0
                              ) *
                                Number(
                                  item.quantity ||
                                    1
                                )
                          ).toFixed(
                            2
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-500">
                  No item details available.
                </p>
              )}
            </section>

            {/* ADDRESS */}
            <section className="rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Delivery Address
              </h2>

              {order.address ? (
                <div className="rounded-xl bg-gray-50 p-4">
                  {order.address.name && (
                    <p className="font-semibold">
                      {
                        order.address
                          .name
                      }
                    </p>
                  )}

                  {order.address.phone && (
                    <p className="mt-1 text-sm text-gray-500">
                      📞{" "}
                      {
                        order.address
                          .phone
                      }
                    </p>
                  )}

                  {order.address.addressLine && (
                    <p className="mt-2 text-sm text-gray-600">
                      {
                        order.address
                          .addressLine
                      }
                    </p>
                  )}

                  {order.address.addressLine2 && (
                    <p className="text-sm text-gray-600">
                      {
                        order.address
                          .addressLine2
                      }
                    </p>
                  )}

                  {order.address.landmark && (
                    <p className="text-sm text-gray-600">
                      Landmark:{" "}
                      {
                        order.address
                          .landmark
                      }
                    </p>
                  )}

                  <p className="text-sm text-gray-600">
                    {
                      order.address
                        .city
                    }
                    ,{" "}
                    {
                      order.address
                        .state
                    }{" "}
                    -{" "}
                    {
                      order.address
                        .pincode
                    }
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">
                  Delivery address unavailable.
                </p>
              )}
            </section>
          </div>

          {/* RIGHT */}
          <div>
            <section className="sticky top-24 rounded-2xl bg-white p-6 shadow-md">
              <h2 className="mb-5 text-xl font-bold">
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span>
                    ₹
                    {Number(
                      order.subtotal ||
                        0
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Delivery
                  </span>

                  <span>
                    ₹
                    {Number(
                      order.deliveryCharge ||
                        0
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Discount
                  </span>

                  <span className="text-green-600">
                    -₹
                    {Number(
                      order.discount ||
                        0
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>
                      Total
                    </span>

                    <span className="text-green-700">
                      ₹
                      {Number(
                        order.total ||
                          0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PAYMENT */}
              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Payment Method
                </p>

                <p className="font-semibold">
                  {order.paymentMethod ||
                    "Pending"}
                </p>

                <p className="mt-2 text-xs text-gray-500">
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
                      : order.paymentStatus ===
                        "Refunded"
                      ? "text-purple-600"
                      : "text-yellow-600"
                  }`}
                >
                  {
                    order.paymentStatus
                  }
                </p>
              </div>

              {/* DELIVERY TYPE */}
              {order.delivery_type && (
                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">
                    Delivery Type
                  </p>

                  <p className="font-semibold capitalize">
                    {String(
                      order.delivery_type
                    ).replace(
                      /_/g,
                      " "
                    )}
                  </p>
                </div>
              )}

              {/* REFRESH */}
              <button
                type="button"
                onClick={
                  loadOrder
                }
                className="mt-5 w-full rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Refresh Order Status
              </button>

              {/* INVOICE */}
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/orders/${order.backendOrderId || order.orderId}/invoice`,
                    {
                      state: {
                        order,
                      },
                    }
                  )
                }
                className="mt-3 w-full rounded-lg border border-green-600 py-3 font-semibold text-green-700 hover:bg-green-50"
              >
                🧾 View Invoice
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;