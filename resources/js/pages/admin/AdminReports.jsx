import React from 'react';
import { RiBarChartBoxLine, RiPieChartLine, RiLineChartLine, RiBuildingFill, RiShieldUserLine } from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const revenueData = [
  { month: 'يونيو', revenue: 8300 },
  { month: 'أغسطس', revenue: 9300 },
  { month: 'سبتمبر', revenue: 10300 },
  { month: 'أكتوبر', revenue: 11700 },
  { month: 'نوفمبر', revenue: 13000 },
  { month: 'ديسمبر', revenue: 14600 },
];

const servicesData = [
  { name: 'واي فاي', value: 35, color: '#14B8A6' },
  { name: 'قاعة اجتماع', value: 25, color: '#22D3EE' },
  { name: 'أخرى', value: 8, color: '#EC4899' },
];

const weeklyData = [
  { day: 'الأحد', value: 32 },
  { day: 'الإثنين', value: 45 },
  { day: 'الثلاثاء', value: 38 },
  { day: 'الأربعاء', value: 52 },
  { day: 'الخميس', value: 48 },
];

const revenueChartData = {
  labels: revenueData.map((d) => d.month),
  datasets: [
    {
      label: 'الإيراد',
      data: revenueData.map((d) => d.revenue),
      borderColor: '#0D9488',
      backgroundColor: '#0D9488',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#0D9488',
      pointHoverRadius: 6,
    },
  ],
};

const revenueChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10, weight: 700 }, color: '#94A3B8' } },
    y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10, weight: 700 }, color: '#94A3B8' } },
  },
};

const servicesChartData = {
  labels: servicesData.map((d) => d.name),
  datasets: [
    {
      data: servicesData.map((d) => d.value),
      backgroundColor: servicesData.map((d) => d.color),
      borderWidth: 0,
    },
  ],
};

const servicesChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { size: 11, weight: 700 }, padding: 16 },
    },
  },
};

const weeklyChartData = {
  labels: weeklyData.map((d) => d.day),
  datasets: [
    {
      label: 'الحضور',
      data: weeklyData.map((d) => d.value),
      backgroundColor: '#0EA5E9',
      borderRadius: 10,
      barThickness: 40,
    },
  ],
};

const weeklyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11, weight: 700 }, color: '#334155' } },
    y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10, weight: 700 }, color: '#94A3B8' } },
  },
};

const AdminReports = () => {
  return (
    <div className="space-y-8 pb-10 font-['Cairo'] animate-in fade-in duration-500">

      <PageHeader
        title="التقارير والإحصائيات العامة"
        icon={<RiBarChartBoxLine />}
        role="admin"
        roleIcon={<RiShieldUserLine size={20} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي الإيراد', val: '₪472,000', icon: <RiLineChartLine />, color: 'bg-emerald-500' },
          { label: 'إجمالي الحجوزات', val: '8,426', icon: <RiBarChartBoxLine />, color: 'bg-blue-500' },
          { label: 'ذروة الحضور', val: '11ص - 2م', icon: <RiPieChartLine />, color: 'bg-amber-500' },
          { label: 'فعاليات الشهر', val: '23', icon: <RiBuildingFill />, color: 'bg-violet-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[35px] border border-slate-100 flex items-center justify-between gap-5 shadow-sm hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <h4 className="text-xl font-black text-slate-800">{s.val}</h4>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${s.color} text-white flex items-center justify-center text-2xl shadow-lg shadow-inherit/20`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-black text-slate-700">نمو الإيراد الشهري</h3>
          <div className="h-64" dir="ltr">
            <Line data={revenueChartData} options={revenueChartOptions} />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-black text-slate-700">الخدمات الأكثر طلباً</h3>
          <div className="h-64">
            <Pie data={servicesChartData} options={servicesChartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm space-y-6">
        <h3 className="font-black text-slate-700">مقارنة الحجوزات والحضور الأسبوعي</h3>
        <div className="h-72" dir="ltr">
          <Bar data={weeklyChartData} options={weeklyChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AdminReports;