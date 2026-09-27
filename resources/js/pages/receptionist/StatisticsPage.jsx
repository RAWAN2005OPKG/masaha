import { useState, useEffect } from "react";
import axios from "axios";
import {
  RiStarSmileLine,
  RiLineChartLine,
  RiCalendarCheckLine,
  RiLoader4Line,
} from "react-icons/ri";

const DEFAULT_PEAK_HOURS = [
  { id: "p1", range: "8ص - 10ص", percent: 0, color: "#3B82F6" },
  { id: "p2", range: "10ص - 12م", percent: 0, color: "#14B8A6" },
  { id: "p3", range: "12م - 4م", percent: 0, color: "#EF4444" },
  { id: "p4", range: "4م - 6م", percent: 0, color: "#F59E0B" },
  { id: "p5", range: "6م - 8م", percent: 0, color: "#A855F7" },
];

const DEFAULT_WEEKLY = [
  { id: "sun", label: "الأحد", value: 0 },
  { id: "mon", label: "الاثنين", value: 0 },
  { id: "tue", label: "الثلاثاء", value: 0 },
  { id: "wed", label: "الأربعاء", value: 0 },
  { id: "thu", label: "الخميس", value: 0 },
];

const CHART_MAX = 60;
const CHART_STEPS = [60, 45, 30, 15, 0];
const CHART_HEIGHT = 160;

function SummaryCard({ card }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/50">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg text-white ${card.iconBg}`}
      >
        {card.icon}
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400">{card.label}</p>
        <p className="text-xl font-bold text-slate-800">{card.value}</p>
        <p className="mt-0.5 text-xs text-slate-400">{card.subtext}</p>
      </div>
    </div>
  );
}

function PeakHoursCard({ items }) {
  const peakList = items && items.length > 0 ? items : DEFAULT_PEAK_HOURS;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/50">
      <h2 className="mb-5 text-right text-base font-bold text-slate-800">
        توزيع أوقات الذروة
      </h2>

      <div className="space-y-4">
        {peakList.map((row) => (
          <div key={row.id}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-bold" style={{ color: row.color }}>
                {row.percent}%
              </span>
              <span className="text-slate-400">{row.range}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${row.percent}%`, backgroundColor: row.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyAttendanceCard({ items }) {
  const weekList = items && items.length > 0 ? items : DEFAULT_WEEKLY;
  const maxVal = Math.max(10, ...weekList.map(d => Number(d.value) || 0));
  const steps = [maxVal, Math.round(maxVal * 0.75), Math.round(maxVal * 0.5), Math.round(maxVal * 0.25), 0];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/50">
      <h2 className="mb-5 text-right text-base font-bold text-slate-800">
        الحضور الأسبوعي
      </h2>

      <div className="relative" style={{ height: CHART_HEIGHT }}>
        <div className="absolute inset-0 flex flex-col justify-between">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-6 text-left text-xs text-slate-300">
                {step}
              </span>
              <span className="h-px flex-1 bg-slate-100" />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex items-end justify-between gap-3 pl-8">
          {weekList.map((day) => (
            <div key={day.id} className="flex h-full flex-1 flex-col items-center justify-end gap-2 group relative">
              <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {day.value}
              </span>
              <div
                className="w-full max-w-[32px] rounded-t-md bg-teal-500 transition-all duration-700"
                style={{ height: `${Math.min(100, Math.max(8, ((day.value || 0) / maxVal) * 100))}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-end justify-between gap-3 pl-8">
        {weekList.map((day) => (
          <span key={day.id} className="flex-1 text-center text-xs text-slate-400 font-bold">
            {day.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today_bookings: '0',
    delta_text: 'جاري التحميل...',
    satisfaction: '0%',
    avg_stay: '0 ساعة',
    weekly_attendance: DEFAULT_WEEKLY,
    peak_hours: DEFAULT_PEAK_HOURS,
  });

  useEffect(() => {
    axios.get('/api/receptionist/statistics')
      .then(res => {
        if (res.data) setStats(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const summaryCards = [
    {
      id: "today-bookings",
      label: "حجوزات اليوم",
      value: stats.today_bookings,
      subtext: stats.delta_text,
      icon: <RiCalendarCheckLine />,
      iconBg: "bg-teal-600",
    },
    {
      id: "satisfaction",
      label: "رضا العملاء",
      value: stats.satisfaction,
      subtext: "أعلى من الشهر الماضي",
      icon: <RiStarSmileLine />,
      iconBg: "bg-violet-500",
    },
    {
      id: "avg-stay",
      label: "متوسط الإقامة",
      value: stats.avg_stay,
      subtext: "لكل زائر",
      icon: <RiLineChartLine />,
      iconBg: "bg-sky-500",
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
          الإحصائيات المباشرة
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
            <RiLoader4Line className="animate-spin text-teal-600" size={32} />
            <span className="font-bold text-sm">جاري تحميل الإحصائيات...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {summaryCards.map((card) => (
                <SummaryCard key={card.id} card={card} />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <WeeklyAttendanceCard items={stats.weekly_attendance} />
              <PeakHoursCard items={stats.peak_hours} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}