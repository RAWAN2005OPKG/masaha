import { useState, useEffect } from "react";
import axios from "axios";
import {
  RiInformationLine,
  RiCalendarLine,
  RiTimeLine,
  RiArrowRightUpLine,
  RiLoader4Line,
} from "react-icons/ri";

const STATUS_STYLES = {
  current: {
    label: "حالية",
    className:
      "bg-[var(--receptionist-primary)]/10 text-[var(--receptionist-primary)]",
  },
  upcoming: {
    label: "قادمة",
    className: "bg-amber-50 text-amber-600",
  },
  finished: {
    label: "منتهية",
    className: "bg-slate-100 text-slate-500",
  },
};

const hoursLabel = (h) => {
  if (h === 1) return "ساعة واحدة";
  if (h === 2) return "ساعتان";
  if (h <= 10) return `${h} ساعات`;
  return `${h} ساعة`;
};

function InfoBox({ icon, label, value, highlighted = false }) {
  return (
    <div
      className={`rounded-2xl border p-4 text-left transition-colors ${
        highlighted
          ? "border-[var(--receptionist-primary)]/25 bg-[var(--receptionist-primary)]/5"
          : "border-slate-100 bg-slate-50/70"
      }`}
    >
      <div className="mb-2 flex items-center justify-start gap-1.5 text-slate-400">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p
        className={`text-sm font-bold ${
          highlighted ? "text-[var(--receptionist-primary)]" : "text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function BookingCard({ booking }) {
  const status = STATUS_STYLES[booking.status] ?? STATUS_STYLES.finished;

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
      <header className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[var(--receptionist-primary)] to-[var(--receptionist-secondary)] text-xl text-white">
            <RiInformationLine />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-800">
              {booking.customerName}
            </h3>
            <p className="text-sm text-slate-400">{booking.seatType}</p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoBox
          icon={<RiCalendarLine />}
          label="تاريخ البدء"
          value={`${booking.startDate} — ${booking.startTime}`}
        />
        <InfoBox
          icon={<RiCalendarLine />}
          label="تاريخ الانتهاء"
          value={`${booking.endDate} — ${booking.endTime}`}
        />
        <InfoBox
          icon={<RiTimeLine />}
          label="مدة الإقامة"
          value={hoursLabel(booking.durationHours)}
        />
        <InfoBox
          icon={<RiArrowRightUpLine />}
          label="المبلغ المدفوع"
          value={`${booking.paidAmount} ₪`}
          highlighted
        />
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 text-left">
        <p className="mb-3 text-xs font-medium text-slate-400">
          الخدمات المطلوبة
        </p>

        {booking.services.length > 0 ? (
          <ul className="flex flex-wrap justify-start gap-2">
            {booking.services.map((service) => (
              <li
                key={service}
                className="rounded-full bg-[var(--receptionist-primary)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--receptionist-primary)]"
              >
                {service}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">لا توجد خدمات مطلوبة</p>
        )}
      </div>
    </article>
  );
}

export default function BookingDetails() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/receptionist/bookings')
      .then(res => {
        // Map backend statuses to style keys: 'confirmed' -> 'current', 'completed' -> 'finished', 'pending' -> 'upcoming'
        const mapped = res.data.map(b => {
          let stKey = 'current';
          if (b.status === 'pending') stKey = 'upcoming';
          if (b.status === 'completed' || b.status === 'finished') stKey = 'finished';
          return {
            ...b,
            status: stKey,
          };
        });
        setBookings(mapped);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div dir="" className="min-h-screen p-4 sm:p-6 pb-20">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            تفاصيل الحجوزات
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            تفاصيل الحجوزات والخدمات المطلوبة
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <RiLoader4Line className="animate-spin text-[var(--receptionist-primary)]" size={40} />
            <p className="font-bold text-sm">جاري تحميل تفاصيل الحجوزات...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="text-sm text-slate-400">
              لا توجد حجوزات لعرضها حاليًا
            </p>
          </div>
        )}
      </div>
    </div>
  );
}