import { useState, useEffect } from "react";
import axios from "axios";
import {
  RiNotification3Line,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiWalletLine,
  RiCloseCircleLine,
  RiAlarmLine,
  RiCloseLine,
  RiAlertLine,
  RiLoader4Line,
} from "react-icons/ri";

const TYPE_STYLES = {
  "new-booking": { icon: <RiCalendarLine />, iconBg: "bg-blue-500" },
  booking: { icon: <RiCalendarLine />, iconBg: "bg-blue-500" },
  "check-in": { icon: <RiCheckboxCircleLine />, iconBg: "bg-[var(--receptionist-primary)]" },
  payment: { icon: <RiWalletLine />, iconBg: "bg-amber-500" },
  emergency: { icon: <RiAlertLine />, iconBg: "bg-red-500" },
  cancelled: { icon: <RiCloseCircleLine />, iconBg: "bg-red-500" },
  reminder: { icon: <RiAlarmLine />, iconBg: "bg-violet-500" },
  system: { icon: <RiNotification3Line />, iconBg: "bg-teal-500" },
};

function NotificationRow({ notification, onDismiss }) {
  const style = TYPE_STYLES[notification.type] || TYPE_STYLES.system;

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 transition-colors ${
        notification.unread
          ? "border-[var(--receptionist-primary)]/20 bg-[var(--receptionist-primary)]/[0.03]"
          : "border-slate-100 bg-white"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base text-white ${style.iconBg}`}
      >
        {style.icon}
      </div>

      <div className="flex-1 text-right">
        <h3 className="text-sm font-bold text-slate-800">{notification.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-500 font-medium">
          {notification.desc || notification.description}
        </p>
        <p className="mt-2 text-xs text-slate-400 font-bold">{notification.time}</p>
      </div>

      <div className="flex w-4 shrink-0 flex-col items-center gap-2 pt-1">
        {notification.unread && (
          <span className="h-2 w-2 rounded-full bg-[var(--receptionist-primary)]" />
        )}
        <button
          type="button"
          onClick={() => onDismiss(notification.id)}
          aria-label="إغلاق الإشعار"
          className="text-slate-300 transition-colors hover:text-slate-500 cursor-pointer"
        >
          <RiCloseLine className="text-sm" />
        </button>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    axios.get('/api/notifications')
      .then(res => {
        setNotifications(res.data.notifications || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleDismiss = async (id) => {
    try {
      await axios.post(`/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, unread: false, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="mx-auto w-full p-4 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              الإشعارات
            </h1>
            <p className="mt-1 text-sm text-slate-400 font-bold">
              {unreadCount} إشعارات غير مقروءة
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="whitespace-nowrap text-sm font-semibold text-[var(--receptionist-primary)] hover:underline cursor-pointer"
            >
              تعليم الكل كمقروء
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <RiLoader4Line className="animate-spin text-[var(--receptionist-primary)]" size={40} />
            <p className="font-bold text-sm">جاري تحميل الإشعارات...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-400 font-bold">لا توجد إشعارات حاليًا</p>
          </div>
        )}
      </div>
    </div>
  );
}