import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RiDashboardLine, RiUserLine, RiBuildingLine, RiCalendarLine, RiLineChartLine, RiShieldUserLine } from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0); 
  const [usersGrowth, setUsersGrowth] = useState(0);

  useEffect(() => {
    // Fetch real stats
    window.axios.get('/api/admin/dashboard-stats').then(res => {
      setTotalUsers(res.data.total_users);
      setUsersGrowth(res.data.users_growth);
    }).catch(err => console.log(err));
  }, []);

  const stats = [
    { label: 'إجمالي المستخدمين', value: totalUsers, change: `${usersGrowth >= 0 ? '+' : ''} ${usersGrowth}% هذا الشهر`, icon: <RiUserLine />, color: 'bg-emerald-500', link: '/admin-dashboard/users' },
    { label: 'الحجوزات النشطة', value: '84', change: 'الآن لحظة بلحظة', icon: <RiCalendarLine />, color: 'bg-blue-500' },
    { label: 'المساحات المفتوحة', value: '3/4', change: 'مساحة نشطة', icon: <RiBuildingLine />, color: 'bg-amber-500' },
    { label: 'إيراد الشهر', value: '₪85,400', change: '+ 23% عن السابق', icon: <RiLineChartLine />, color: 'bg-violet-500' },
  ];

  return (
    <div className="space-y-10 font-['Cairo']">

      <PageHeader
        title="لوحة التحكم العامة"
        icon={<RiDashboardLine />}
        role="admin"
        roleIcon={<RiShieldUserLine size={20} />}
      />

      {/* Stats Cards */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => {
          const CardContent = (
            <div className="bg-white px-6 py-4 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between gap-5 transition-transform hover:-translate-y-1 hover:shadow-md h-full">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h3 className="text-2xl font-black text-slate-800">{s.value}</h3>
                <p className="text-[9px] text-slate-400 font-bold mt-1">{s.change}</p>
              </div>
              <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                {s.icon}
              </div>
            </div>
          );

          return s.link ? (
            <Link to={s.link} key={i} className="block h-full">
              {CardContent}
            </Link>
          ) : (
            <div key={i} className="block h-full">
              {CardContent}
            </div>
          );
        })}
      </div>

      {/* Important Notifications */}
      <section className="bg-white rounded-[40px] border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-800 flex items-center gap-2">الإشعارات المهمة</h3>
        </div>
        <div className="divide-y divide-slate-50">
            {[
                { text: 'مساحة الريادة وصلت لطاقتها القصوى (48/50)', time: 'منذ 15 دقيقة', color: 'bg-amber-500' },
                { text: 'مستخدم جديد انضم للمنصة: محمد أبو عمر', time: 'منذ 30 دقيقة', color: 'bg-blue-500' },
                { text: 'انتهت مدة العرض بنجاح MONTHLY40 - 100 استخدام', time: 'منذ ساعتين', color: 'bg-emerald-500' },
            ].map((n, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${n.color}`}></div>
                        <p className="text-sm font-bold text-slate-700">{n.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">{n.time}</span>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;