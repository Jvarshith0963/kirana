import {
  createContext,
  useContext,
  useState,
} from "react";

const ToastContext =
  createContext(null);

export function ToastProvider({
  children,
}) {
  const [toasts, setToasts] =
    useState([]);

  const showToast = (
    message,
    type = "success"
  ) => {
    const id = Date.now();

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.filter(
          (toast) =>
            toast.id !== id
        )
      );
    }, 3000);
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
      }}
    >
      {children}

      <div className="fixed right-4 top-20 z-[9999] space-y-3">

        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[280px] rounded-xl px-5 py-4 text-sm font-semibold text-white shadow-lg ${
              toast.type === "success"
                ? "bg-green-600"
                : toast.type === "error"
                ? "bg-red-600"
                : toast.type === "warning"
                ? "bg-yellow-500"
                : "bg-blue-600"
            }`}
          >
            {toast.type === "success"
              ? "✓ "
              : ""}
            {toast.message}
          </div>
        ))}

      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(
    ToastContext
  );
}