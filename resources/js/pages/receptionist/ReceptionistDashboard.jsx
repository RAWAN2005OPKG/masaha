import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  RiCustomerService2Line,
  RiCalendarCheckLine,
  RiTimeLine,
  RiLogoutBoxRLine,
  RiUserAddLine,
  RiAddLine,
  RiSubtractLine,
  RiCheckboxCircleLine,
  RiGroupLine,
  RiLoader4Line,
} from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';

const MAX_SESSION_HOURS = 8;

const hoursLabel = (h) =>
  h === 1 ? 'ساعة' : h === 2 ? 'ساعتان' : h <= 10 ? 'ساعات' : 'ساعة';

function OccupancyCard({ occupied, capacity }) {
  const RADIUS = 40;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const safeCapacity = capacity > 0 ? capacity : 40;
  const percentage = Math.min(Math.round((occupied / safeCapacity) * 100), 100);
  const strokeDashoffset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;
  const available = Math.max(safeCapacity - occupied, 0);

  return (
    <div dir="rtl" className="bg-white rounded-[32px] p-6 shadow-md border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex flex-col text-right space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping"></span>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">مباشر ولحظي</span>
        </div>
        <h2 className="text-2xl font-black text-slate-800">حالة الإشغال الحالي</h2>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-4xl font-black text-slate-800">{occupied}</span>
          <span className="text-sm font-bold text-slate-400">من أصل {safeCapacity} مقعد</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
            <RiGroupLine size={15} /> {occupied} مشغول
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <RiCheckboxCircleLine size={15} /> {available} متاح الآن
          </span>
        </div>
      </div>

      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90">
          {/* Subtle background track */}
          <circle
            cx={50}
            cy={50}
            r={RADIUS}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={10}
          />
          {/* Vibrant colorful progress stroke */}
          <circle
            cx={50}
            cy={50}
            r={RADIUS}
            fill="none"
            stroke="#0D9488"
            strokeWidth={10}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-800 leading-tight">
            {percentage}%
          </span>
          <span className="text-[10px] font-bold text-slate-400">إشغال</span>
        </div>
      </div>
    </div>
  );
}
// الحاضرين
function AttendeeRow({ index, attendee, onCheckOut }) {
  const progress = Math.min((attendee.hours / MAX_SESSION_HOURS) * 100, 100);

  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-slate-50 last:border-b-0">
      <div className="shrink-0 w-8 h-8 rounded-full bg-slate-300 text-[var(--receptionist-primary)] text-md font-semibold flex items-center justify-center">
        {index + 1}
      </div>
    

      <div className="flex-1 min-w-0 text-right">
        <p className=" font-semibold text-slate-800 truncate">{attendee.name}</p>
        <div className="flex items-center justify-end gap-2 text-xs text-slate-400 mt-1 flex-wrap">
          <span>{attendee.seat}</span>
          <span className="flex items-center gap-1">
            {attendee.hours} {hoursLabel(attendee.hours)} <RiTimeLine size={12} />
          </span>
          <span>دخل {attendee.checkInTime}</span>
        </div>
      </div>

      <div className="hidden sm:flex flex-col items-center gap-1 shrink-0 w-14">
        <span className="text-[11px] text-slate-400">{attendee.hours}س</span>
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--receptionist-primary)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

    
      <button
        onClick={() => onCheckOut(attendee.id)}
        className="shrink-0 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl px-4 py-2 transition"
      >
        تسجيل خروج
      </button>
    </div>
  );
}

function AttendeesList({ attendees, onCheckOut }) {
  return (
    <div className="bg-white shadow rounded-3xl p-6 glass-effect">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 text-xl">
       <RiGroupLine className="text-[var(--receptionist-primary)]" />    الحاضرون الآن 
        </h2>
        <span className="text-md font-semibold bg-green-50 text-green-600 border border-green-600 rounded-full px-3 py-1">
          {attendees.length} أشخاص
        </span>
        
      </div>

      {attendees.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">لا يوجد حاضرون حالياً</p>
      ) : (
        <div className="flex flex-col">
          {attendees.map((a, i) => (
            <AttendeeRow key={a.id} index={i} attendee={a} onCheckOut={onCheckOut} />
          ))}
        </div>
      )}
    </div>
  );
}
  // تسجيل زائر جديد 
function CheckInForm({ occupied, capacity, onCheckIn }) {
  const [name, setName] = useState('');
  const [hours, setHours] = useState(2);

  const isFull = occupied >= capacity;
  const isDisabled = name.trim() === '' || isFull;

  const handleSubmit = () => {
    if (isDisabled) return;
    onCheckIn({ name: name.trim(), hours });
    setName('');
    setHours(2);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const available = Math.max(capacity - occupied, 0);

  return (
    <div className="bg-white shadow rounded-3xl overflow-hidden glass-effect">
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 px-6 py-5 flex items-center gap-3.5 text-white shadow-sm">
        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
          <RiUserAddLine className="text-white text-xl" />
        </div>
        <div>
          <p className="text-white font-black text-base drop-shadow-sm">تسجيل زائر جديد</p>
          <p className="text-teal-100 text-xs mt-0.5 font-bold">{available} مقعد متاح حالياً</p>
        </div>
      </div>

      {/* الجسم */}
      <div className="p-6 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">اسم الزائر</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="أدخل اسم الزائر (مثال: محمد خالد)"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm text-right outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition font-medium"
          />
        </div>

        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">تحديد عدد الساعات:</span>
            <span className="text-xs font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200">
              {hoursLabel(hours)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setHours((h) => Math.max(1, Number(h) - 1))}
              className="w-11 h-11 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-black flex items-center justify-center transition cursor-pointer"
            >
              <RiSubtractLine size={18} />
            </button>
            <div className="flex-1">
              <input
                type="number"
                min="1"
                max="24"
                value={hours}
                onChange={(e) => setHours(Math.max(1, Math.min(24, parseInt(e.target.value) || 1)))}
                className="w-full text-center text-2xl font-black text-slate-800 bg-white border border-slate-200 rounded-xl py-2 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setHours((h) => Math.min(24, Number(h) + 1))}
              className="w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center transition cursor-pointer shadow-sm"
            >
              <RiAddLine size={18} />
            </button>
          </div>

          {/* Quick hour selector buttons */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {[1, 2, 3, 4, 8].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHours(h)}
                className={`py-2 text-xs font-bold rounded-xl transition border cursor-pointer ${
                  hours === h
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-black'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {h} {h === 1 ? 'ساعة' : h === 2 ? 'ساعتان' : 'ساعات'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isDisabled}
          className={`w-full rounded-2xl py-4 text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
            isDisabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:scale-[1.01]'
          }`}
        >
          <RiUserAddLine className="text-xl" />
          {isFull ? 'لا توجد مقاعد متاحة' : 'تسجيل وتحديث العداد'}
        </button>

<div className="w-full mt-4">
  <div className="flex justify-between items-center text-xs mb-1.5">
    <span className="text-slate-400 font-medium">الطاقة الاستيعابية</span>
    <span className="text-[#0095D9] font-bold text-sm">{occupied}/{capacity}</span>
  </div>
  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden" dir="ltr">
    <div
      className="h-full rounded-full bg-[#0095D9]"
      style={{ width: `${Math.min((occupied / capacity) * 100, 100)}%` }}
    />
  </div>
</div>
      </div>
    </div>
  );
}


const ReceptionistDashboard = () => {
  const [stats, setStats] = useState({
    capacity: 40,
    occupied: 0,
    available: 40,
    percentage: 0,
    attendees: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    axios.get('/api/receptionist/dashboard-stats')
      .then(res => {
        setStats(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCheckOut = async (id) => {
    try {
      await axios.post(`/api/receptionist/check-out/${id}`);
      fetchStats();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تسجيل خروج الزائر');
    }
  };

  const handleCheckIn = async ({ name, hours }) => {
    try {
      await axios.post('/api/receptionist/check-in', { name, hours });
      fetchStats();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تسجيل وصول الزائر');
    }
  };

  const capacity = stats.capacity || 40;
  const occupied = stats.occupied || 0;
  const attendees = stats.attendees || [];

  return (
    <div className="space-y-10 pb-20">
      <PageHeader title="لوحة تحكم الاستقبال" icon={<RiCustomerService2Line />} role="receptionist" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <RiLoader4Line className="animate-spin text-[var(--receptionist-primary)]" size={40} />
          <p className="font-bold text-sm">جاري تحميل بيانات لوحة الاستقبال...</p>
        </div>
      ) : (
        <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 lg:col-span-3">
            <OccupancyCard occupied={occupied} capacity={capacity} />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <AttendeesList attendees={attendees} onCheckOut={handleCheckOut} />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <CheckInForm occupied={occupied} capacity={capacity} onCheckIn={handleCheckIn} />
          </div>
        </main>
      )}
    </div>
  );
};

export default ReceptionistDashboard;