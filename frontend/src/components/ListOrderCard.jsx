import { useNavigate } from "react-router-dom";

const steps = [
  "Submitted",
  "Reviewing",
  "Priced",
  "Confirmed",
  "Delivered",
];

export default function ListOrderCard({ order }) {
  const navigate = useNavigate();

  const currentIndex = steps.indexOf(order.status);

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row">
        <div>
          <p className="text-xs font-semibold uppercase text-green-600">
            Handwritten List Order
          </p>

          <h3 className="mt-1 font-bold text-gray-900">
            {order.id}
          </h3>

          <p className="text-sm text-gray-500">
            {order.storeName}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm text-gray-500">
            Delivery
          </p>

          <p className="font-semibold text-gray-800">
            {order.deliverySlot}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mt-6 overflow-x-auto">
        <div className="flex min-w-[650px] items-center">
          {steps.map((step, index) => {
            const completed =
              currentIndex >= index;

            return (
              <div
                key={step}
                className="flex flex-1 items-center"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                      completed
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {completed ? "✓" : index + 1}
                  </div>

                  <span
                    className={`mt-2 text-xs font-medium ${
                      completed
                        ? "text-green-700"
                        : "text-gray-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-1 flex-1 ${
                      currentIndex > index
                        ? "bg-green-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Draft available */}
      {order.status === "Priced" && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="font-semibold text-green-800">
            Your list has been priced!
          </p>

          <p className="mt-1 text-sm text-green-700">
            Review the items and confirm your order.
          </p>

          <button
            onClick={() =>
              navigate(`/list-orders/${order.id}/confirm`)
            }
            className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Review & Confirm
          </button>
        </div>
      )}

      {/* Total */}
      {order.total > 0 && (
        <div className="mt-5 flex items-center justify-between border-t pt-4">
          <span className="font-semibold text-gray-700">
            Current Total
          </span>

          <span className="text-xl font-bold text-green-700">
            ₹{Number(order.total).toFixed(2)}
          </span>
        </div>
      )}

      <button
        onClick={() =>
          navigate(`/list-orders/${order.id}`)
        }
        className="mt-4 w-full rounded-xl border border-green-600 py-2.5 font-semibold text-green-700 hover:bg-green-50"
      >
        View List Order
      </button>
    </div>
  );
}