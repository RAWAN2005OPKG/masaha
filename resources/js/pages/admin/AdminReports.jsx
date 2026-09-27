import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RiBarChartBoxLine, RiPieChartLine, RiLineChartLine, RiBuildingFill, RiShieldUserLine, RiLoader4Line } from 'react-icons/ri';
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

const revenueChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10, weight: 700 }, color: '#94A3B8' } },
    y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10, weight: 700 }, color: '#94A3B8' } },
  },
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
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    total_revenue: '₪0',
    total_bookings: '0',
    peak_hours: 'لا توجد بيانات بعد',
    monthly_events: '0',
    revenue_data: [],
    services_data: [],
    weekly_data: [],
  });

  useEffect(() => {
    axios.get('/api/admin/reports')
      .then(res => {
        if (res.data) setData(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const revenueChartData = {
    labels: (data.revenue_data || []).map((d) => d.month),
    datasets: [
      {
        label: 'الإيراد',
        data: (data.revenue_data || []).map((d) => d.revenue),
        borderColor: '#0D9488',
        backgroundColor: '#0D9488',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#0D9488',
        pointHoverRadius: 6,
      },
    ],
  };

  const servicesChartData = {
    labels: (data.services_data || []).map((d) => d.name),
    datasets: [
      {
        data: (data.services_data || []).map((d) => d.value),
        backgroundColor: (data.services_data || []).map((d) => d.color),
        borderWidth: 0,
      },
    ],
  };

  const weeklyChartData = {
    labels: (data.weekly_data || []).map((d) => d.day),
    datasets: [
      {
        label: 'الحضور',
        data: (data.weekly_data || []).map((d) => d.value),
        backgroundColor: '#0EA5E9',
        borderRadius: 10,
        barThickness: 40,
      },
    ],
  };

  return (
    <div className="space-y-8 pb-10 font-['Cairo'] animate-in fade-in duration-500">
      <PageHeader
        title="التقارير والإحصائيات العامة"
        icon={<RiBarChartBoxLine />}
        role="admin"
        roleIcon={<RiShieldUserLine size={20} />}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
          <RiLoader4Line className="animate-spin text-emerald-600" size={36} />
          <p className="font-bold text-sm">جاري تحميل التقارير والإحصائيات...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'إجمالي الإيراد', val: data.total_revenue, icon: <RiLineChartLine />, color: 'bg-emerald-500' },
              { label: 'إجمالي الحجوزات', val: data.total_bookings, icon: <RiBarChartBoxLine />, color: 'bg-blue-500' },
              { label: 'ذروة الحضور', val: data.peak_hours, icon: <RiPieChartLine />, color: 'bg-amber-500' },
              { label: 'فعاليات الشهر', val: data.monthly_events, icon: <RiBuildingFill />, color: 'bg-violet-600' },
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
              <div className="h-64 flex items-center justify-center">
                {data.services_data && data.services_data.length > 0 ? (
                  <Pie data={servicesChartData} options={servicesChartOptions} />
                ) : (
                  <p className="text-xs text-slate-400 font-bold">لا توجد حجوزات مسجلة للخدمات بعد</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-black text-slate-700">مقارنة الحجوزات والحضور الأسبوعي</h3>
            <div className="h-72" dir="ltr">
              <Bar data={weeklyChartData} options={weeklyChartOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReports;