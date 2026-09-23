import { useNotifications } from "../../context/NotificationContext";

function Notifications() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  } = useNotifications();

  return (
    <div className="min-h-screen bg-green-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-green-800">
              Notifications
            </h1>

            <p className="mt-1 text-gray-600">
              {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex gap-2">

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
              >
                Mark All Read
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Clear All
              </button>
            )}

          </div>

        </div>

        {notifications.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow">
            <div className="text-5xl">
              🔔
            </div>

            <h2 className="mt-4 text-xl font-bold">
              No Notifications
            </h2>

            <p className="mt-2 text-gray-500">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-3">

            {notifications.map(
              (notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border bg-white p-5 shadow-sm ${
                    !notification.read
                      ? "border-green-300 bg-green-50/40"
                      : "border-gray-200"
                  }`}
                >

                  <div className="flex gap-4">

                    <div className="text-2xl">
                      {notification.type ===
                      "success"
                        ? "✅"
                        : notification.type ===
                          "warning"
                        ? "⚠️"
                        : "🔔"}
                    </div>

                    <div className="flex-1">

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <h2 className="font-bold text-gray-800">
                            {notification.title}
                          </h2>

                          <p className="mt-1 text-sm text-gray-600">
                            {notification.message}
                          </p>
                        </div>

                        {!notification.read && (
                          <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
                        )}

                      </div>

                      <div className="mt-3 flex gap-3">

                        {!notification.read && (
                          <button
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                            className="text-sm font-semibold text-green-700 hover:underline"
                          >
                            Mark as read
                          </button>
                        )}

                        <button
                          onClick={() =>
                            deleteNotification(
                              notification.id
                            )
                          }
                          className="text-sm font-semibold text-red-600 hover:underline"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default Notifications;