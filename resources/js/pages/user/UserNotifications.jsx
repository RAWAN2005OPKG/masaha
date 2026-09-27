import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  RiNotification3Line, RiCheckboxCircleLine, RiInformationLine,
  RiErrorWarningLine, RiMailOpenLine, RiLoader4Line, RiAlertLine
} from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';

const UserNotifications = ({ role: propRole }) => {
  const [activeTab, setActiveTab] = useState('الكل');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detect role from URL path
  const pathname = window.location.pathname;
  const role = propRole || (pathname.startsWith('/owner') ? 'owner' : pathname.startsWith('/admin') ? 'admin' : 'user');

  const fetchNotifications = () => {
    setLoading(true);
    axios.get('/api/notifications')
      .then(res => {
        setNotifications(res.data.notifications || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleAsRead = async (id) => {
    try {
      await axios.post(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getStyleForType = (type) => {
    switch (type) {
      case 'emergency':
        return { icon: <RiAlertLine className="text-red-500" />, bg: 'bg-red-50' };
      case 'booking':
        return { icon: <RiCheckboxCircleLine className="text-emerald-500" />, bg: 'bg-emerald-50' };
      case 'offer':
      case 'promo':
        return { icon: <RiErrorWarningLine className="text-amber-500" />, bg: 'bg-amber-50' };
      default:
        return { icon: <RiInformationLine className="text-blue-500" />, bg: 'bg-blue-50' };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'غير مقروء') return !n.is_read;
    if (activeTab === 'إدارية') return n.type === 'system' || n.type === 'emergency';
    return true;
  });

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700 pb-20">
      <PageHeader title="الإشعارات" icon={<RiNotification3Line />} role={role} />

      <div className="flex justify-between items-center">
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
          {['الكل', 'غير مقروء', 'إدارية'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 text-[11px] font-black text-brand-600 bg-brand-50 px-4 py-2 rounded-xl hover:bg-brand-100 transition-colors cursor-pointer"
        >
          <RiMailOpenLine size={16} /> تحديد الكل كمقروء
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <RiLoader4Line className="animate-spin text-brand-500" size={40} />
            <p className="font-bold text-sm">جاري تحميل الإشعارات...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => {
            const style = getStyleForType(notif.type);
            const isRead = Boolean(notif.is_read);

            return (
              <div 
                key={notif.id}
                onClick={() => !isRead && markSingleAsRead(notif.id)}
                className={`
                  group relative bg-white p-5 md:p-6 rounded-[28px] border flex gap-4 md:gap-6 items-start transition-all hover:shadow-md cursor-pointer
                  ${!isRead ? 'border-brand-500' : 'border-slate-100'}
                `}
              >
                {/* Icon Container */}
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${style.bg}`}>
                  {style.icon}
                </div>

                {/* Text Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm md:text-base font-bold ${!isRead ? 'text-slate-900 font-black' : 'text-slate-600'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl font-medium">
                    {notif.desc}
                  </p>
                </div>

                {/* Unread Indicator Dot */}
                {!isRead && (
                  <div className="absolute top-6 left-6 w-2.5 h-2.5 bg-brand-500 rounded-full animate-pulse"></div>
                )}
              </div>
            );
          })
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