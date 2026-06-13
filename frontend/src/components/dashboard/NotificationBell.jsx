import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useSocket } from "../../hooks/useSocket";
import { notificationService } from "../../services/notification.service";
import NotificationDropdown from "./NotificationDropdown";

export const NotificationBell = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  // 1. Fetch notifications on mount
  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      const data = res?.data || res;
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notifications:", error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 2. Setup WebSockets listener for real-time notification pushes
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      if (!notification) return;
      
      // Prepend the new notification and increment unread count
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket]);

  // 3. Click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 4. Mark single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      // Optmistically update UI state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Dispatch to database
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error("Error marking notification read:", error.message);
      // Re-fetch to synchronize state on error
      fetchNotifications();
    }
  };

  // 5. Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      // Optimistically update UI state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);

      // Dispatch to database
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error("Error marking all notifications read:", error.message);
      fetchNotifications();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        className="
          relative
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          bg-white
          text-slate-650
          transition
          hover:bg-slate-105
          hover:text-slate-900
          focus:outline-none
          dark:border-[#2a2a2a]
          dark:bg-[#1f1f1f]
          dark:text-gray-350
          dark:hover:bg-[#262626]
          dark:hover:text-white
          cursor-pointer
          hover:scale-105
          active:scale-95
        "
      >
        <Bell size={18} />
        
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#1f1f1f]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Render dropdown menu if toggle is open */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      )}
    </div>
  );
};

export default NotificationBell;
