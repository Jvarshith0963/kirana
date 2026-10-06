import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const POLL_INTERVAL_MS = 60000;

function getToken() {
  return localStorage.getItem("token");
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Notification request failed");
  }

  return data;
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    if (!getToken()) {
      setNotifications([]);
      return;
    }

    try {
      const response = await apiRequest("/notifications");
      const items = Array.isArray(response?.data) ? response.data : [];

      setNotifications(
        items.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          read: Boolean(n.is_read),
          createdAt: n.created_at,
        }))
      );
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }, []);

  // Load immediately on login/logout (user changes), poll only while logged in
  useEffect(() => {
    loadNotifications();

    if (!user) return undefined;

    const interval = setInterval(loadNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  const markAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Mark as read failed:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Mark all as read failed:", error);
    }
  };

  // Notifications are created by the backend. This keeps old callers from
  // crashing: it just re-syncs with the server.
  const addNotification = () => {
    loadNotifications();
  };

  // Backend has no delete endpoint yet, so these are local-only.
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loadNotifications,
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