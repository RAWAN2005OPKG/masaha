import { useState, useEffect } from "react";
import axios from "axios";
import {
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiImageLine,
  RiCloseLine,
  RiCheckLine,
  RiLoader4Line,
} from "react-icons/ri";
import WifiActivationModal from '../../components/modals/WifiActivationModal';
import PageHeader from '../../components/layout/PageHeader';

const PROCESSED_STYLES = {
  confirmed: {
    label: "تم التأكيد",
    className:
      "bg-[var(--receptionist-primary)]/10 text-[var(--receptionist-primary)]",
  },
  rejected: {
    label: "مرفوض",
    className: "bg-red-50 text-red-500",
  },
  completed: {
    label: "منتهية",
    className: "bg-slate-100 text-slate-500",
  },
};

function ReceiptThumb({ url, alt }) {
  return (
    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-300 bg-slate-800">
      {url ? (
        <img src={url} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-slate-500">
          <RiImageLine className="text-lg" />
        </div>
      )}
    </div>
  );
}

function PaymentNotificationCard({ notification, onConfirm, onReject, onView }) {
  const [activeNotification, setActiveNotification] = useState(null);

  // Normalize data for WifiActivationModal
  const modalData = {
    ...notification,
    userName: notification.customerName,
    price: `${notification.amount}₪`,
  };

  return (
    <article className="rounded-3xl border-2 border-amber-200 bg-white p-4 shadow-sm shadow-amber-100/60 sm:p-5">
      <div className="mb-4 flex justify-between gap-4">
        <div className="flex gap-3">
          <ReceiptThumb
            url={notification.receiptUrl}
            alt={`إيصال ${notification.customerName}`}
          />
          <div className="text-right">
            <h3 className="text-base font-bold text-slate-800">
              {notification.customerName}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {notification.spaceName} • {notification.seatType}
            </p>
            <p className="mt-1 flex items-center justify-end gap-1.5 text-sm text-slate-400">
              <span>
                {notification.date} — {notification.time}
              </span>
              <RiCalendarLine className="text-base" />
            </p>
          </div>
        </div>
        <p className="text-lg font-bold text-[var(--receptionist-primary)]">
          {notification.amount}₪
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveNotification(modalData)} 
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
        >
          تأكيد وتفعيل
          <RiCheckboxCircleLine className="text-lg" />
        </button>

        {notification.receiptUrl ? (
          <a
            href={notification.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            عرض الإشعار
            <RiImageLine className="text-lg" />
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-400 cursor-not-allowed"
          >
            لا يوجد إشعار
          </button>
        )}

        <button
          type="button"
          onClick={() => onReject(notification.id)}
          aria-label="رفض الإشعار"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg text-red-500 transition-colors hover:bg-red-100 cursor-pointer"
        >
          <RiCloseLine />
        </button>
      </div>

      <WifiActivationModal
        isOpen={!!activeNotification}
        onClose={() => setActiveNotification(null)}
        notification={activeNotification}
        onConfirm={(id, credentials) => {
          onConfirm(id, credentials);     
          setActiveNotification(null);
        }}
      />
    </article>
  );
}

function ProcessedRow({ notification }) {
  const style = PROCESSED_STYLES[notification.status] || PROCESSED_STYLES.completed;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4">
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${style.className}`}
      >
        {style.label}
      </span>

      <div className="text-right">
        <p className="text-sm font-bold text-slate-800">
          {notification.customerName}
        </p>
        <p className="text-xs text-slate-400">
          {notification.amount}₪ • {notification.date}
        </p>
      </div>
    </div>
  );
}

export default function PaymentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    axios.get('/api/receptionist/bookings')
      .then(res => {
        setNotifications(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const pending = notifications.filter((n) => n.status === "pending");
  const processed = notifications.filter((n) => n.status !== "pending");

  const handleConfirm = async (id, credentials) => {
    try {
      await axios.post(`/api/receptionist/bookings/${id}/confirm`, credentials);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تأكيد الحجز');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا الإشعار؟')) return;
    try {
      await axios.post(`/api/receptionist/bookings/${id}/reject`);
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء رفض الإشعار');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-20">      
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="text-right">
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              إشعارات الدفع
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              مراجعة إشعارات التحويل وتأكيد الحجوزات
            </p>
          </div>

          <span className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {pending.length} بانتظار المراجعة
          </span>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <RiLoader4Line className="animate-spin text-[var(--receptionist-primary)]" size={40} />
            <p className="font-bold text-sm">جاري تحميل إشعارات الدفع...</p>
          </div>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                بانتظار المراجعة ({pending.length})
              </h2>

              {pending.length > 0 ? (
                <div className="space-y-4">
                  {pending.map((notification) => (
                    <PaymentNotificationCard
                      key={notification.id}
                      notification={notification}
                      onConfirm={handleConfirm}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
                  <RiCheckLine className="text-2xl text-[var(--receptionist-primary)]" />
                  <p className="text-sm text-slate-400">
                    تمت مراجعة كل الإشعارات
                  </p>
                </div>
              )}
            </section>

            {processed.length > 0 && (
              <section>
                <h2 className="mb-3 text-right text-sm font-bold text-slate-500">
                  تمت المراجعة ({processed.length})
                </h2>
                <div className="space-y-3">
                  {processed.map((notification) => (
                    <ProcessedRow key={notification.id} notification={notification} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}