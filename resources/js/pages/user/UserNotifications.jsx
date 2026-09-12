import React, { useState } from 'react';
import { 
  RiNotification3Line, 
  RiCheckboxCircleLine, 
  RiInformationLine, 
  RiErrorWarningLine, 
  RiMailOpenLine,
  RiDeleteBin7Line
} from 'react-icons/ri';

const UserNotifications = () => {
  const [activeTab, setActiveTab] = useState('الكل');

  // بيانات وهمية للإشعارات
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'تم تأكيد حجزك بنجاح',
      desc: 'تم تأكيد حجزك في "مساحة الإبداع" ليوم غد الساعة 09:00 ص. نتمنى لك وقتاً ممتعاً.',
      time: 'منذ دقيقتين',
      isRead: false,
      icon: <RiCheckboxCircleLine className="text-emerald-500" />,
      bg: 'bg-emerald-50'
    },
    {
      id: 2,
      type: 'system',
      title: 'تحديث في سياسة الخصوصية',
      desc: 'قمنا بتحديث شروط الاستخدام وسياسة الخصوصية الخاصة بالمنصة، يرجى الاطلاع عليها.',
      time: 'منذ ساعتين',
      isRead: false,
      icon: <RiInformationLine className="text-blue-500" />,
      bg: 'bg-blue-50'
    },
    {
      id: 3,
      type: 'offer',
      title: 'عرض جديد بانتظارك! 🔥',
      desc: 'احصل على خصم 50% عند حجز مكتب خاص لمدة تزيد عن 5 ساعات. استخدم الكود: OFF50.',
      time: 'منذ يوم',
      isRead: true,
      icon: <RiErrorWarningLine className="text-amber-500" />,
      bg: 'bg-amber-50'
    },
    {
      id: 4,
      type: 'booking',
      title: 'تذكير بموعد انتهاء الحجز',
      desc: 'سينتهي حجزك الحالي في "مساحة الريادة" خلال 15 دقيقة من الآن.',
      time: 'منذ يومين',
      isRead: true,
      icon: <RiNotification3Line className="text-brand-500" />,
      bg: 'bg-brand-50'
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">الإشعارات</h1>
          <p className="text-xs text-slate-400 font-bold mt-1">ابقَ على اطلاع بكل ما هو جديد في مساحتك</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="flex items-center gap-2 text-[11px] font-black text-brand-600 bg-brand-50 px-4 py-2 rounded-xl hover:bg-brand-100 transition-colors"
        >
          <RiMailOpenLine size={16} />
          تحديد الكل كمقروء
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {['الكل', 'غير مقروء', 'إدارية'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              className={`
                group relative bg-white p-5 md:p-6 rounded-[28px] border border-slate-100 flex gap-4 md:gap-6 items-start transition-all hover:shadow-md
                ${!notif.isRead ? 'border-r-4 border-r-brand-500' : ''}
              `}
            >
              {/* Icon Container */}
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${notif.bg}`}>
                {notif.icon}
              </div>

              {/* Text Content */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h3 className={`text-sm md:text-base font-bold ${!notif.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                  {notif.desc}
                </p>
                
                {/* Action Buttons (Show on Hover) */}
                <div className="flex gap-4 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="text-[10px] font-black text-brand-500 hover:underline">عرض التفاصيل</button>
                   <button className="text-[10px] font-black text-red-400 hover:underline flex items-center gap-1">
                     <RiDeleteBin7Line /> حذف
                   </button>
                </div>
              </div>

              {/* Unread Indicator Dot */}
              {!notif.isRead && (
                <div className="absolute top-6 left-6 w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
              <RiNotification3Line size={40} />
            </div>
            <p className="text-slate-400 font-bold">لا توجد إشعارات حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserNotifications;