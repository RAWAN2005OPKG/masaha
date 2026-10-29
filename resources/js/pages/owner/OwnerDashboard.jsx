import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  RiCalendarCheckLine,
  RiBriefcase4Line,
  RiLineChartLine,
  RiStarFill,
  RiPulseLine,
  RiStore2Line,
  RiLoader4Line,
  RiTimeLine,
  RiAlertLine,
  RiLockPasswordLine,
  RiLogoutBoxRLine,
  RiCustomerService2Line,
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
  const navigate = useNavigate();
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
  const [subBlock, setSubBlock] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  useEffect(() => {
    axios.get('/api/owner/dashboard-stats')
      .then(res => setStats(res.data))
      .catch(err => {
        console.error(err);
        if (err.response?.status === 403 && err.response?.data?.error) {
          setSubBlock(err.response.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <RiLoader4Line className="animate-spin text-[var(--owner-primary,var(--primary))]" size={40} />
        <p className="font-bold text-sm">جاري تحميل إحصائيات المساحة...</p>
      </div>
    );
  }

  // Subscription Pending Screen
  if (subBlock && subBlock.error === 'subscription_pending') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center space-y-6">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-md border border-blue-100">
          <RiTimeLine />
        </div>
        <div className="space-y-3">
          <span className="bg-blue-100 text-blue-700 text-xs font-black px-4 py-1.5 rounded-full">
            طلبك قيد المراجعة قريباً
          </span>
          <h2 className="text-2xl font-black text-slate-800">
            لم يحن موعد اشتراكك بعد
          </h2>
          <p className="text-sm text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
            {subBlock.message || 'موعد بدء اشتراكك محدد في تاريخ قادم. سيتم فتح لوحة التحكم وتفعيل كافة الصلاحيات تلقائياً فور حلول هذا الموعد.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm max-w-md mx-auto space-y-3">
          <p className="text-xs font-bold text-slate-400">تاريخ بدء الاشتراك المحدد</p>
          <p className="text-xl font-black text-blue-600 font-mono">{subBlock.start_date || 'قريباً'}</p>
          <p className="text-[11px] text-slate-400 font-medium">تظهر مساحتك للمستخدمين بحالة (قريباً) حتى بدء الاشتراك.</p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleLogout}
            className="bg-slate-800 text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-slate-900 transition flex items-center gap-2 cursor-pointer shadow-md"
          >
            <RiLogoutBoxRLine /> تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  // Subscription Expired Screen
  if (subBlock && subBlock.error === 'subscription_expired') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-md border border-amber-100">
          <RiAlertLine />
        </div>
        <div className="space-y-3">
          <span className="bg-amber-100 text-amber-800 text-xs font-black px-4 py-1.5 rounded-full">
            انتهت صلاحية الاشتراك
          </span>
          <h2 className="text-2xl font-black text-slate-800">
            تم إيقاف الوصول إلى لوحة التحكم
          </h2>
          <p className="text-sm text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
            {subBlock.message || 'انتهت فترة اشتراكك في المنصة. لقد تم إخفاء المساحة من صفحة المستخدمين وتعليق الوصول لحين تجديد الاشتراك مع إدارة الموقع.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm max-w-md mx-auto space-y-3">
          <p className="text-xs font-bold text-slate-400">تاريخ انتهاء الاشتراك</p>
          <p className="text-xl font-black text-amber-600 font-mono">{subBlock.end_date || 'منتهي'}</p>
          <p className="text-[11px] text-slate-400 font-medium">يرجى التواصل مع إدارة مساحة لتجديد الاشتراك واستعادة الوصول الكامل فوراً.</p>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="https://wa.me/970590000000"
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-600 text-white px-7 py-3 rounded-2xl font-black text-xs hover:bg-emerald-700 transition flex items-center gap-2 cursor-pointer shadow-md"
          >
            <RiCustomerService2Line size={16} /> تواصل مع الإدارة للتجديد
          </a>
          <button
            onClick={handleLogout}
            className="bg-white text-slate-600 border border-slate-200 px-7 py-3 rounded-2xl font-black text-xs hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer"
          >
            <RiLogoutBoxRLine /> تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  const s = stats;
  const occupancyPercent = s.capacity > 0 ? Math.round((s.occupied / s.capacity) * 100) : 0;

  return (
    <div dir="rtl" className="space-y-6 pb-20">
      <PageHeader title={`لوحة تحكم المساحة (${s.spaceName || 'مساحة العمل'})`} icon={<RiStore2Line />} role="owner"/>

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
    </div>
  );
};

export default OwnerDashboard;
