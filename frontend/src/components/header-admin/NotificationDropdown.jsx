"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Trash2, MailCheck } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as localeID } from "date-fns/locale";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await axios.delete("http://localhost:5000/api/notifications");
      setNotifications([]);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((n) =>
          axios.patch(`http://localhost:5000/api/notifications/${n._id}/read`)
        )
      );

      setNotifications(
        notifications.map((n) => ({
          ...n,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    const routes = {
      tradeIn: `/admin/layanan-produk?tab=tradeIn&id=${notification.requestId}&fromNotification=true`,
      buySell: `/admin/layanan-produk?tab=buySell&id=${notification.requestId}&fromNotification=true`,
      notifStock: `/admin/layanan-produk?tab=notifyMe&id=${notification.requestId}&fromNotification=true`,
    };

    router.push(routes[notification.type]);
    setIsOpen(false);
  };

  const markAsRead = async (id, e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }

    try {
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 border border-gray-200 cursor-pointer transition-colors duration-200"
      >
        <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
        {notifications.some((n) => !n.isRead) && (
          <span className="absolute right-0 top-0 z-10 h-2 w-2 bg-orange-500 rounded-full">
            <span className="absolute -right-0.5 -top-0.5 z-10 h-3 w-3 bg-orange-500 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-md  font-medium text-gray-700">Notifikasi</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600 cursor-pointer" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <MailCheck className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                </div>
              ) : (
                <ul>
                  {notifications.map((notification) => {
                    // Tambahkan fallback untuk data yang tidak lengkap
                    const preview = notification.preview || {};
                    const model = preview.model || "Tidak ada info mobil";
                    const customer = preview.customer || "";

                    return (
                      <li
                        key={notification._id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors ${
                          notification.isRead
                            ? "bg-gray-50 hover:bg-blue-50"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`flex-shrink-0 w-2 rounded-full ${
                              notification.isRead
                                ? "bg-gray-300"
                                : "bg-orange-500"
                            }`}
                          ></div>

                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="text-xs font-semibold text-gray-800">
                                {notification.type === "tradeIn"
                                  ? "🔄 Permintaan Tukar Tambah"
                                  : notification.type === "buySell"
                                  ? "💰 Permintaan Jual Mobil"
                                  : "🔔 Permintaan Stok"}
                              </span>
                              {!notification.isRead && (
                                <span className="inline-block w-2 h-2 bg-orange-500 animate-pulse rounded-full"></span>
                              )}
                            </div>

                            <p className="text-xs mt-1 text-gray-600">
                              {model}
                            </p>

                            {customer && (
                              <p className="text-xs text-gray-500 mt-1">
                                👤 {customer}
                              </p>
                            )}

                            <p className="text-xs text-gray-400 mt-2">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                {
                                  addSuffix: true,
                                  locale: localeID,
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 flex justify-between gap-2">
                <button
                  onClick={markAllAsRead}
                  disabled={notifications.every((n) => n.isRead)}
                  className={`flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    notifications.every((n) => n.isRead)
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                >
                  Tandai Semua Dibaca
                </button>
                <button
                  onClick={deleteAllNotifications}
                  className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hapus Semua
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
