import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ORDER_KEY = "kirana_list_orders";
const PRODUCT_KEY = "kirana_vendor_products";

const fallbackCatalog = [
  {
    id: 1,
    name: "Rice 5kg",
    brand: "India Gate",
    price: 420,
  },
  {
    id: 2,
    name: "Toor Dal 1kg",
    brand: "Tata Sampann",
    price: 165,
  },
  {
    id: 3,
    name: "Aashirvaad Atta 5kg",
    brand: "Aashirvaad",
    price: 290,
  },
  {
    id: 4,
    name: "Sugar 1kg",
    brand: "Madhur",
    price: 48,
  },
  {
    id: 5,
    name: "Sunflower Oil 1L",
    brand: "Fortune",
    price: 145,
  },
  {
    id: 6,
    name: "Milk 1L",
    brand: "Heritage",
    price: 65,
  },
];

export default function ListOrderTranscription() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [catalog, setCatalog] = useState([]);

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Available");
  const [substitution, setSubstitution] = useState("");

  const [items, setItems] = useState([]);

  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    const orders = JSON.parse(
      localStorage.getItem(ORDER_KEY) || "[]"
    );

    const found = orders.find(
      (item) => String(item.id) === String(orderId)
    );

    setOrder(found || null);
    setItems(found?.items || []);

    const savedProducts = JSON.parse(
      localStorage.getItem(PRODUCT_KEY) || "[]"
    );

    setCatalog(
      savedProducts.length ? savedProducts : fallbackCatalog
    );
  }, [orderId]);

  const suggestions = useMemo(() => {
    const search = itemName.trim().toLowerCase();

    if (!search) return [];

    return catalog
      .filter(
        (item) =>
          item.name?.toLowerCase().includes(search) ||
          item.brand?.toLowerCase().includes(search)
      )
      .slice(0, 5);
  }, [catalog, itemName]);

  const selectSuggestion = (product) => {
    setItemName(product.name);
    setPrice(product.price || "");
  };

  const addItem = () => {
    if (!itemName.trim()) {
      alert("Enter an item name.");
      return;
    }

    if (Number(quantity) <= 0) {
      alert("Quantity must be at least 1.");
      return;
    }

    const newItem = {
      id: `ITEM-${Date.now()}`,
      name: itemName.trim(),
      quantity: Number(quantity),
      price: Number(price || 0),
      status,
      substitution:
        status === "Substituted"
          ? substitution.trim()
          : "",
    };

    setItems((previous) => [...previous, newItem]);

    setItemName("");
    setQuantity(1);
    setPrice("");
    setStatus("Available");
    setSubstitution("");
  };

  const updateItem = (id, field, value) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const total = items.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const savePricedDraft = () => {
    if (!items.length) {
      alert("Add at least one item before saving.");
      return;
    }

    const orders = JSON.parse(
      localStorage.getItem(ORDER_KEY) || "[]"
    );

    const updated = orders.map((item) =>
      String(item.id) === String(orderId)
        ? {
            ...item,
            items,
            total,
            status: "Priced",
            unreadForVendor: false,
            customerUnread: true,
            pricedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : item
    );

    localStorage.setItem(
      ORDER_KEY,
      JSON.stringify(updated)
    );

    alert("Priced draft saved for customer.");

    navigate("/vendor/list-orders");
  };

  if (!order) {
    return (
      <div className="p-8 text-center">
        List order not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate("/vendor/list-orders")}
          className="mb-4 font-semibold text-green-700"
        >
          ← List Orders
        </button>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Left - handwritten photos */}
          <div className="rounded-2xl bg-white p-5 shadow">
            <h2 className="text-xl font-bold">
              Handwritten List
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {order.id}
            </p>

            <div className="mt-5 space-y-4">
              {order.photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setViewer(photo.url)}
                  className="block w-full overflow-hidden rounded-xl border"
                >
                  <img
                    src={photo.url}
                    alt="Handwritten shopping list"
                    className="max-h-[500px] w-full object-contain"
                  />
                </button>
              ))}
            </div>

            {order.note && (
              <div className="mt-5 rounded-xl bg-yellow-50 p-4">
                <p className="font-semibold text-yellow-800">
                  Customer Note
                </p>

                <p className="mt-1 text-sm text-yellow-700">
                  {order.note}
                </p>
              </div>
            )}

            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-400">
                Delivery
              </p>

              <p className="font-semibold">
                {order.deliverySlot}
              </p>

              <p className="mt-3 text-xs text-gray-400">
                Address
              </p>

              <p className="text-sm">
                {order.address?.addressLine},{" "}
                {order.address?.city},{" "}
                {order.address?.state} -{" "}
                {order.address?.pincode}
              </p>
            </div>
          </div>

          {/* Right - transcription */}
          <div className="rounded-2xl bg-white p-5 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  Transcribe List
                </h1>

                <p className="text-sm text-gray-500">
                  Convert handwritten items into a priced draft.
                </p>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                {items.length} Items
              </span>
            </div>

            {/* Add item */}
            <div className="mt-6 rounded-2xl border bg-gray-50 p-5">
              <h2 className="font-bold">
                Add Item
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="relative md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold">
                    Item Name
                  </label>

                  <input
                    value={itemName}
                    onChange={(e) =>
                      setItemName(e.target.value)
                    }
                    placeholder="Type item name..."
                    className="w-full rounded-xl border p-3 outline-none focus:border-green-500"
                  />

                  {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border bg-white shadow-lg">
                      {suggestions.map((product) => (
                        <button
                          key={product.id}
                          onClick={() =>
                            selectSuggestion(product)
                          }
                          className="flex w-full items-center justify-between border-b p-3 text-left last:border-0 hover:bg-green-50"
                        >
                          <span>
                            <span className="block font-semibold">
                              {product.name}
                            </span>

                            {product.brand && (
                              <span className="text-xs text-gray-500">
                                {product.brand}
                              </span>
                            )}
                          </span>

                          <span className="font-semibold">
                            ₹{product.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value)
                    }
                    className="w-full rounded-xl border p-3"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value)
                    }
                    placeholder="₹"
                    className="w-full rounded-xl border p-3"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Availability
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                    className="w-full rounded-xl border p-3"
                  >
                    <option value="Available">
                      Available
                    </option>

                    <option value="Unavailable">
                      Unavailable
                    </option>

                    <option value="Substituted">
                      Substituted
                    </option>
                  </select>
                </div>

                {status === "Substituted" && (
                  <div>
                    <label className="mb-1 block text-sm font-semibold">
                      Substitute Item
                    </label>

                    <input
                      value={substitution}
                      onChange={(e) =>
                        setSubstitution(e.target.value)
                      }
                      placeholder="Example: Tata Salt"
                      className="w-full rounded-xl border p-3"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={addItem}
                className="mt-4 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white"
              >
                + Add Item
              </button>
            </div>

            {/* Items */}
            <div className="mt-6">
              <h2 className="font-bold">
                Transcribed Items
              </h2>

              <div className="mt-3 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border p-4"
                  >
                    <div className="grid gap-3 md:grid-cols-[1fr_100px_130px_150px_auto] md:items-center">
                      <input
                        value={item.name}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "name",
                            e.target.value
                          )
                        }
                        className="rounded-lg border p-2"
                      />

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                        className="rounded-lg border p-2"
                      />

                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "price",
                            Number(e.target.value)
                          )
                        }
                        className="rounded-lg border p-2"
                      />

                      <select
                        value={item.status}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "status",
                            e.target.value
                          )
                        }
                        className="rounded-lg border p-2"
                      >
                        <option value="Available">
                          Available
                        </option>

                        <option value="Unavailable">
                          Unavailable
                        </option>

                        <option value="Substituted">
                          Substituted
                        </option>
                      </select>

                      <button
                        onClick={() =>
                          removeItem(item.id)
                        }
                        className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    {item.status === "Substituted" && (
                      <input
                        value={item.substitution || ""}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "substitution",
                            e.target.value
                          )
                        }
                        placeholder="Substitute item"
                        className="mt-3 w-full rounded-lg border p-2"
                      />
                    )}

                    <div className="mt-3 text-right font-bold text-green-700">
                      ₹
                      {(
                        Number(item.price || 0) *
                        Number(item.quantity || 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-gray-900 p-5 text-white">
              <span className="font-semibold">
                Draft Total
              </span>

              <span className="text-2xl font-bold">
                ₹{total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={savePricedDraft}
              className="mt-5 w-full rounded-xl bg-green-600 py-4 font-bold text-white hover:bg-green-700"
            >
              Save Priced Draft for Customer
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen viewer */}
      {viewer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setViewer(null)}
        >
          <img
            src={viewer}
            alt="Handwritten list"
            className="max-h-[95vh] max-w-[95vw] object-contain"
          />

          <button
            onClick={() => setViewer(null)}
            className="absolute right-5 top-5 rounded-full bg-white px-4 py-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}