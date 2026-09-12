import React, { useState } from 'react';
import {
  RiSendPlaneFill, RiInformationFill, RiSpam2Fill,
  RiCheckboxCircleFill, RiNotification3Line,
  RiCloseCircleFill, RiShieldUserLine ,
} from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';

const notifications = [
  { title: 'مساحة الريادة وصلت للطاقة القصوى', type: 'تحذير', icon: <RiSpam2Fill />,        color: 'bg-amber-50 text-amber-500',   time: 'منذ 15 دقيقة', read: false },
  { title: 'مستخدم جديد: محمد أبو عمر',         type: 'معلومة', icon: <RiInformationFill />,  color: 'bg-blue-50 text-blue-500',     time: 'منذ 30 دقيقة', read: false },
  { title: 'انتهاء اشتراك: سلمى النجار',         type: 'خطأ',    icon: <RiCloseCircleFill />,  color: 'bg-red-50 text-red-500',       time: 'منذ يومين',    read: true  },
  { title: 'تقرير الشهر جاهز',                   type: 'نجاح',   icon: <RiCheckboxCircleFill />,color: 'bg-emerald-50 text-emerald-500',time: 'منذ يوم',     read: true  },
];

const AdminNotifications = () => {
  const [items, setItems]         = useState(notifications);
  const [showForm, setShowForm]   = useState(false);
  const unreadCount               = items.filter(n => !n.read).length;

  const markAllRead = () => setItems(items.map(n => ({ ...n, read: true })));

  return (
    <div className="space-y-6 pb-20">
    <PageHeader
        title="إدارة الإشعارات"
        icon={<RiNotification3Line />}
        role="admin"
        roleIcon={<RiShieldUserLine size={20} />}
      />
      <div className="flex items-center justify-between">  
          <div className='ms-4'>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-400 font-bold mt-0.5">{unreadCount} إشعار غير مقروء</p>
            )}
          </div>
       
        <div className="flex items-center gap-3">
          <button
            onClick={markAllRead}
            className="text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors"
          >
            تعليم الكل
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-gradient-to-l from-[#9810FA] to-[#59168B] text-white text-sm font-black px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-200 hover:opacity-90 transition-opacity"
          >
            <RiSendPlaneFill size={16} /> إرسال إشعار
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm space-y-5">
          <h3 className="text-violet-600 font-black text-sm flex items-center gap-2">📢 إرسال إشعار جماعي</h3>

          <div className="flex gap-2 flex-wrap">
            {['جميع المستخدمين', 'أصحاب المساحات', 'موظفو الاستقبال'].map((cat, i) => (
              <button
                key={cat}
                className={`px-5 py-2 rounded-xl text-xs font-black border transition-all ${
                  i === 0
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200'
                    : 'bg-white border-slate-100 text-slate-400 hover:border-violet-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <textarea
            rows="4"
            placeholder="اكتب نص الإشعار هنا..."
            className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/10 resize-none"
          />

          <div className="flex gap-3">
            <button className="flex-1 bg-violet-600 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-violet-200">
              إرسال الآن <RiSendPlaneFill />
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="w-28 bg-slate-100 text-slate-400 font-bold py-3.5 rounded-2xl hover:bg-slate-200 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((n, i) => (
          <div
            key={i}
            className={`bg-white p-5 rounded-3xl border transition-all shadow-sm flex items-center justify-between
              ${!n.read ? 'border-r-4 border-r-violet-500 border-slate-100' : 'border-slate-100'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${n.color}`}>
                {n.icon}
              </div>
              <div className="space-y-0.5">
                <h4 className={`text-sm font-black ${!n.read ? 'text-slate-800' : 'text-slate-600'}`}>
                  {n.title}
                </h4>
                <div className="flex gap-3 text-[10px] font-bold text-slate-400">
                  <span>{n.time}</span>
                  <span className={n.color.split(' ')[1]}>{n.type}</span>
                </div>
              </div>
            </div>

            {!n.read && (
              <div className="w-2 h-2 bg-violet-500 rounded-full shrink-0 animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNotifications;
