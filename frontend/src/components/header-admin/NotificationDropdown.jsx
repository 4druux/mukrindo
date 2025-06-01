"use client";
import { useState, useRef, useEffect } from "react";
import { X, MailCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { FaUser } from "react-icons/fa";
import { useNotifications } from "@/context/NotificationContext";
import AnimatedBell from "../animate-icon/AnimatedBell";
import { IoMdNotifications } from "react-icons/io";

export default function NotificationDropdown() {
  const router = useRouter();
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    loading,
    markAllAsRead,
    deleteAllNotifications,
    markAsRead,
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    const routes = {
      tradeIn: `/admin/layanan-produk?tab=tradeIn&id=${notification.requestId}&fromNotification=true`,
      buySell: `/admin/layanan-produk?tab=buySell&id=${notification.requestId}&fromNotification=true`,
      notifStock: `/admin/layanan-produk?tab=notifyMe&id=${notification.requestId}&fromNotification=true`,
    };

    router.push(routes[notification.type]);
    setIsOpen(false);
  };

  const hasUnreadNotifications = notifications?.some((n) => !n.isRead);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 border border-gray-200 cursor-pointer transition-colors duration-200"
        aria-label="Notifikasi"
        aria-expanded={isOpen}
      >
        {hasUnreadNotifications ? (
          <>
            <AnimatedBell size={20} color="#f97316" className="w-5 h-5" />
            <span className="absolute right-0 top-0 z-10 h-2 w-2 bg-orange-500 rounded-full">
              <span className="absolute -right-0.5 -top-0.5 z-10 h-3 w-3 bg-orange-500 rounded-full opacity-75 animate-ping"></span>
            </span>
          </>
        ) : (
          <IoMdNotifications size={20} className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute -right-10 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
            role="menu"
          >
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-md font-medium text-gray-700">Notifikasi</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Tutup notifikasi"
              >
                <X className="w-4 h-4 text-gray-600 cursor-pointer" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-8 bg-gray-200 rounded-full mb-2"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : notifications?.length === 0 ? (
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <MailCheck className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Tidak ada notifikasi</p>
                </div>
              ) : (
                <ul>
                  {notifications.map((notification) => {
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
                            : "bg-white hover:bg-blue-50"
                        }`}
                        role="menuitem"
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
                              <span className="text-xs font-semibold text-gray-700">
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
                              <div className="flex gap-1 text-xs text-gray-500 mt-1">
                                <FaUser />
                                <span>{customer}</span>
                              </div>
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

            {notifications?.length > 0 && (
              <div className="p-3 border-t border-gray-200 flex justify-between gap-2">
                <button
                  onClick={() => {
                    if (hasUnreadNotifications) {
                      markAllAsRead();
                    }
                    setIsOpen(false);
                  }}
                  disabled={!hasUnreadNotifications}
                  className={`flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    !hasUnreadNotifications
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                >
                  Tandai Semua Dibaca
                </button>
                <div className="border-l border-gray-200 h-6" />
                <button
                  onClick={() => {
                    deleteAllNotifications();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
