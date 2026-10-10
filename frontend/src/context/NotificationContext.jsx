import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const NotificationContext = createContext(null);
const STORAGE_KEY = "kirana_notifications";
const UPDATE_EVENT = "kirana-notifications-updated";

function readNotifications() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Unable to read notifications:", error);
    return [];
  }
}

function writeNotifications(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error("Unable to save notifications:", error);
    return false;
  }
}

function notifyOtherComponents() {
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(readNotifications);
  const [storageError, setStorageError] = useState("");

  const loadNotifications = useCallback(() => {
    setNotifications(readNotifications());
  }, []);

  const updateNotifications = useCallback((updater) => {
    const current = readNotifications();
    const updated =
      typeof updater === "function" ? updater(current) : updater;

    if (writeNotifications(updated)) {
      setNotifications(updated);
      setStorageError("");
      notifyOtherComponents();
    } else {
      setStorageError("Notifications could not be saved in browser storage.");
    }
  }, []);

  const addNotification = useCallback(
    (notification = {}) => {
      const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: notification.title || "New notification",
        message: notification.message || "",
        type: notification.type || "info",
        read: false,
        createdAt: new Date().toISOString(),
      };

      updateNotifications((current) => [item, ...current]);
      return item;
    },
    [updateNotifications]
  );

  const markAsRead = useCallback(
    (id) => {
      updateNotifications((current) =>
        current.map((item) =>
          String(item.id) === String(id) ? { ...item, read: true } : item
        )
      );
    },
    [updateNotifications]
  );

  const markAllAsRead = useCallback(() => {
    updateNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    );
  }, [updateNotifications]);

  const deleteNotification = useCallback(
    (id) => {
      updateNotifications((current) =>
        current.filter((item) => String(item.id) !== String(id))
      );
    },
    [updateNotifications]
  );

  const clearNotifications = useCallback(() => {
    updateNotifications([]);
  }, [updateNotifications]);

  useEffect(() => {
    const sync = () => loadNotifications();

    window.addEventListener("storage", sync);
    window.addEventListener(UPDATE_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(UPDATE_EVENT, sync);
    };
  }, [loadNotifications]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      storageError,
      loadNotifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearNotifications,
    }),
    [
      notifications,
      unreadCount,
      storageError,
      loadNotifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearNotifications,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}

export const useNotification = useNotifications;