import { createContext, useState, useContext } from "react";
import { api } from "../api/api";

// Create context
const NotificationContext = createContext();

// Custom hook for consuming context
export function useNotifications() {
  return useContext(NotificationContext);
}

// Provider component
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]); // Store notifications
  const [notificationsPagination, setNotificationsPagination] = useState({
    data: [],
    from: 0,
    rows: 10,
    totalPages: 1,
    currentPage: 1,
    showing: { current: 0, total: 0 },
  }); // Store notifications
  const [newNotificationsCount, setNewNotificationsCount] = useState(0); // Store unread notifications count
  const [newNotificationsCountByWorkSite, setNewNotificationsCountByWorkSite] =
    useState(0); // Store unread notifications count
  const [notificationLoading, setNotificationLoading] = useState(0); // Store unread notifications count

  // Function to mark a notification as read
  async function markAsRead(id) {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, is_read: true } : notif
      )
    );
  }
  async function markAllAsRead() {
    const response = await api.testSubmit(`All notifications marked as read`);
    return response; // Now this return will be returned from the async function
  }
  async function fetchNotification(
    controller,
    searchInput,
    currentPage,
    rows,
    is_read,
    workSiteFilter
  ) {
    try {
      const response = await api.getNotifications(
        `notification/pagination?search=${searchInput}&page=${currentPage}&rows=${rows}&work_siteUID=${
          workSiteFilter?.UID || ""
        }` + (is_read !== null ? `&is_read=${is_read}` : ""),
        { signal: controller }
      );
      console.log(response);

      setNotifications(response.data.all_notifications);
      setNotificationsPagination((prevState) => ({
        ...prevState,
        data: response.data.data,
        from: response.data.from || 0,
        totalPages: response.data.last_page,
        showing: { current: response.data.to, total: response.data.total },
      }));
      setNewNotificationsCount(response.data.new_notification_count);

      setNewNotificationsCountByWorkSite(
        response.data.new_notification_count_by_worksite
      );

      return response; // Now this return will be returned from the async function
    } catch (error) {
      console.log(error);
      throw error; // Re-throw the error to be handled in the calling function
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        notificationsPagination,
        setNotificationsPagination,
        newNotificationsCount,
        setNewNotificationsCount,
        newNotificationsCountByWorkSite,
        notificationLoading,
        setNotificationLoading,
        markAsRead,
        markAllAsRead,
        fetchNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
