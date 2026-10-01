import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Load notifications from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kirana_notifications");

      if (saved) {
        const parsedNotifications = JSON.parse(saved);

        if (Array.isArray(parsedNotifications)) {
          setNotifications(parsedNotifications);
        }
      }
    } catch (error) {
      console.error(
        "Unable to load notifications:",
        error
      );
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "kirana_notifications",
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error(
        "Unable to save notifications:",
        error
      );
    }
  }, [notifications]);

  // Add a new notification
  const addNotification = ({
    title,
    message,
    type = "info",
  }) => {
    const notification = {
      id: Date.now() + Math.random(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [
      notification,
      ...prev,
    ]);
  };

  // Mark one notification as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  // Delete one notification
  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter(
        (notification) =>
          notification.id !== id
      )
    );
  };

  // Delete all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Count unread notifications
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook
export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}

// Alias so Navbar can use either name
export const useNotification = useNotifications;