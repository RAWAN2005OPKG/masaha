import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  RiBarChartBoxLine,
  RiCalendarCheckLine,
  RiMoneyDollarCircleLine,
  RiLineChartLine,
  RiBarChartGroupedLine,
  RiPieChartLine,
} from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

ChartJS.defaults.font.family = "'Cairo', sans-serif";
ChartJS.defaults.color = '#90A1B9';

const REVENUE_DATA = {
  labels: [],
  values: [],
};

const WEEKLY_BOOKINGS_DATA = {
  labels: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
  values: [0, 0, 0, 0, 0],
};

const SERVICES_USAGE_DATA = [];

const hexToRgba = (hex, alpha = 1) => {
  const parsed = hex.replace('#', '');
  const bigint = parseInt(
    parsed.length === 3 ? parsed.split('').map((c) => c + c).join('') : parsed,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getCssVar = (name, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

function StatCard({ label, value, subtitle, icon, tone }) {
  const toneClasses = {
    emerald: 'bg-emerald-50 text-emerald-500',
    sky: 'bg-sky-50 text-sky-500',
  };

  return (
    <div className="flex flex-1 items-center justify-between gap-4 rounded-3xl bg-white p-5 shadow-lg shadow-slate-200/60">
      <div className="flex flex-col items-end text-right">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
        <span className="text-2xl font-extrabold text-slate-800">{value}</span>
        {subtitle && <span className="text-[11px] font-medium text-slate-400">{subtitle}</span>}
      </div>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
        {icon}
      </span>
    </div>
  );
}

function RevenueChart({ labels, values }) {
  const primary = useMemo(() => getCssVar('--primary', '#009689'), []);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: primary,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: primary,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        tension: 0.4,
        fill: true,
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return hexToRgba(primary, 0.15);
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, hexToRgba(primary, 0.35));
          gradient.addColorStop(1, hexToRgba(primary, 0));
          return gradient;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        backgroundColor: '#0F172B',
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: {
        beginAtZero: true,
        grid: { color: '#F1F5F9' },
        ticks: { font: { size: 11 }, stepSize: 4000 },
      },
    },
  };

  return (
    <section className="w-full rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60">
      <h2 className="mb-6 flex items-center justify-start gap-2 text-base font-bold text-slate-800">
        <RiLineChartLine size={18} style={{ color: primary }} />
        الإيراد الشهري
      </h2>
      <div className="h-72 w-full">
        <Line data={data} options={options} />
      </div>
    </section>
  );
}

function WeeklyBookingsChart({ labels, values }) {
  const primary = useMemo(() => getCssVar('--primary', '#009689'), []);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: primary,
        borderRadius: 8,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        backgroundColor: '#0F172B',
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { beginAtZero: true, grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, stepSize: 15 } },
    },
  };

  return (
    <section className="flex-1 rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60">
      <h2 className="mb-6 flex items-center justify-start
       gap-2 text-base font-bold text-slate-800">
        <RiBarChartGroupedLine size={18} style={{ color: primary }} />
        الحجوزات الأسبوعية
     
      </h2>
      <div className="h-56 w-full">
        <Bar data={data} options={options} />
      </div>
    </section>
  );
}

function ServicesUsageChart({ items }) {
  const hasItems = items && items.length > 0;
  const data = {
    labels: (items || []).map((item) => item.label),
    datasets: [
      {
        data: (items || []).map((item) => item.value),
        backgroundColor: (items || []).map((item) => item.color),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        backgroundColor: '#0F172B',
        padding: 10,
        cornerRadius: 10,
      },
    },
  };

  return (
    <section className="flex-1 rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60">
      <h2 className="mb-6 flex items-center justify-start gap-2 text-base font-bold text-slate-800">
        <RiPieChartLine size={18} className="text-slate-400" />
        الخدمات الأكثر استخداماً
      </h2>

      {hasItems ? (
        <div className="flex items-center gap-6">
          <div className="h-40 w-40 shrink-0">
            <Pie data={data} options={options} />
          </div>

          <ul className="flex flex-1 flex-col gap-3">
            {items.map((item) => (
              <li key={item.label} className="flex items-center justify-between text-sm font-semibold text-slate-600">
                <span>{item.value}%</span>
                <span className="flex items-center gap-2">
                  {item.label}
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center text-xs font-bold text-slate-400">
          لا توجد خدمات محجوزة بعد
        </div>
      )}
    </section>
  );
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    monthRevenue: '0₪',
    monthBookings: '0',
    revenue_chart: REVENUE_DATA,
    weekly_bookings_chart: WEEKLY_BOOKINGS_DATA,
    services_usage: SERVICES_USAGE_DATA,
  });

  useEffect(() => {
    axios.get('/api/owner/reports')
      .then(res => {
        if (res.data) setData(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="التقارير والإحصائيات" icon={<RiBarChartBoxLine />} role="owner" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4">
        <div className="flex flex-col gap-5 md:flex-row">
          <StatCard
            label="إيراد الشهر"
            value={data.monthRevenue}
            subtitle="حسب الحجوزات الفعلية"
            icon={<RiMoneyDollarCircleLine size={22} />}
            tone="emerald"
          />
          <StatCard
            label="الحجوزات"
            value={data.monthBookings}
            subtitle="حجز هذا الشهر"
            icon={<RiCalendarCheckLine size={22} />}
            tone="sky"
          />
        </div>

        <RevenueChart
          labels={data.revenue_chart ? data.revenue_chart.labels : REVENUE_DATA.labels}
          values={data.revenue_chart ? data.revenue_chart.values : REVENUE_DATA.values}
        />

        <div className="flex flex-col gap-5 md:flex-row text-sm">
          <ServicesUsageChart items={data.services_usage || []} />
          <WeeklyBookingsChart
            labels={data.weekly_bookings_chart ? data.weekly_bookings_chart.labels : WEEKLY_BOOKINGS_DATA.labels}
            values={data.weekly_bookings_chart ? data.weekly_bookings_chart.values : WEEKLY_BOOKINGS_DATA.values}
          />
        </div>
      </div>
    </>
  );
}