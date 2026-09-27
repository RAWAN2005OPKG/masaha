import { useState, useEffect } from "react";
import axios from "axios";
import {
  RiCalendarCheckLine,
  RiBriefcase4Line,
  RiLineChartLine,
  RiStarFill,
  RiPulseLine,
  RiStore2Line,
  RiLoader4Line,
} from "react-icons/ri";
import PageHeader from '../../components/layout/PageHeader';

const arNum = (n) => Number(n).toLocaleString("ar-EG");

const STATUS_STYLES = {
  active: { label: "حالية", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  upcoming: { label: "قادمة", cls: "bg-sky-50 text-sky-600 border-sky-200" },
  done: { label: "منتهية", cls: "bg-slate-50 text-slate-500 border-slate-200" },
};

function StatCard({ icon, iconBg, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="min-w-0">
          <p className="text-[11px] text-slate-500 font-medium">{label}</p>
          <div className="mt-0.5 text-2xl font-black text-slate-800 leading-tight">
            {value}
          </div>
        </div>
        <div
          className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-white text-xl ${iconBg}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-[10px] text-slate-400 font-bold">{sub}</p>
    </div>
  );
}

function BookingRow({ booking }) {
  const { name, seat, hours, price, status } = booking;
  const st = STATUS_STYLES[status] || STATUS_STYLES.active;

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-t border-slate-100">
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          {seat} • {hours} ساعات
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="text-sm font-black text-[var(--primary)]">
          {price}₪
        </span>
        <span
          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${st.cls}`}
        >
          {st.label}
        </span>
      </div>
    </div>
  );
}

const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    spaceName: 'مساحة العمل',
    todayBookings: 0,
    bookingsDelta: 0,
    occupied: 0,
    capacity: 40,
    revenue: 0,
    avgPerHour: 20,
    rating: 4.8,
    reviewsCount: 30,
    recentBookings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/owner/dashboard-stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const s = stats;
  const occupancyPercent = s.capacity > 0 ? Math.round((s.occupied / s.capacity) * 100) : 0;

  return (
    <div dir="rtl" className="space-y-6 pb-20">
      <PageHeader title={`لوحة تحكم المساحة (${s.spaceName || 'مساحة العمل'})`} icon={<RiStore2Line />} role="owner"/>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <RiLoader4Line className="animate-spin text-[var(--owner-primary,var(--primary))]" size={40} />
          <p className="font-bold text-sm">جاري تحميل إحصائيات المساحة...</p>
        </div>
      ) : (
        <>
          {/* الإحصائيات */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<RiCalendarCheckLine />}
              iconBg="bg-teal-500"
              label="حجوزات اليوم"
              value={arNum(s.todayBookings)}
              sub={`+${arNum(s.bookingsDelta)}٪ عن أمس`}
            />
            <StatCard
              icon={<RiBriefcase4Line />}
              iconBg="bg-sky-500"
              label="مشغول/متاح"
              value={`${arNum(s.occupied)}/${arNum(s.capacity)}`}
              sub={`${arNum(occupancyPercent)}٪ إشغال`}
            />
            <StatCard
              icon={<RiLineChartLine />}
              iconBg="bg-orange-500"
              label="إيراد اليوم"
              value={`${arNum(s.revenue)}₪`}
              sub={`سعر الساعة ${arNum(s.avgPerHour)}₪`}
            />
            <StatCard
              icon={<RiStarFill />}
              iconBg="bg-purple-500"
              label="تقييم المساحة"
              value={
                <span className="flex items-center gap-1">
                  <RiStarFill size={18} className="text-yellow-400" />
                  {arNum(s.rating)}
                </span>
              }
              sub={`من ${arNum(s.reviewsCount)} تقييم`}
            />
          </div>

          {/* آخر الحجوزات */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-sm font-bold text-slate-800">آخر الحجوزات الجديدة</h2>
              <span className="flex items-center gap-1 text-[13px] text-[var(--primary)] font-bold">
                يتحدث تلقائياً
                <RiPulseLine size={15} />
              </span>
            </div>

            {s.recentBookings && s.recentBookings.length > 0 ? (
              s.recentBookings.map((b) => <BookingRow key={b.id} booking={b} />)
            ) : (
              <p className="px-5 py-10 text-center text-xs text-slate-400 border-t border-slate-100 font-bold">
                لا توجد حجوزات مسجلة اليوم حتى الآن
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;