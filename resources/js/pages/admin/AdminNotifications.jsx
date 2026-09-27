import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  RiSendPlaneFill, RiInformationFill, RiSpam2Fill,
  RiCheckboxCircleFill, RiNotification3Line,
  RiCloseCircleFill, RiShieldUserLine, RiLoader4Line,
  RiAlertLine
} from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';

const ROLE_OPTIONS = [
  { label: 'جميع المستخدمين', value: 'all' },
  { label: 'المستخدمون فقط', value: 'user' },
  { label: 'أصحاب المساحات', value: 'owner' },
  { label: 'موظفو الاستقبال', value: 'receptionist' },
];

const AdminNotifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [notifText, setNotifText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchNotifications = () => {
    setLoading(true);
    axios.get('/api/notifications')
      .then(res => {
        setItems(res.data.notifications || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = items.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read');
      setItems(prev => prev.map(n => ({ ...n, is_read: true, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBroadcast = async () => {
    if (!notifText.trim()) {
      alert('يرجى كتابة نص الإشعار أولاً');
      return;
    }

    setSending(true);
    try {
      await axios.post('/api/notifications/send', {
        title: 'إشعار من الإدارة العامة',
        desc: notifText.trim(),
        target_role: selectedRole,
        type: 'system',
      });
      alert('تم إرسال الإشعار بنجاح');
      setNotifText('');
      setShowForm(false);
      fetchNotifications();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء إرسال الإشعار');
    } finally {
      setSending(false);
    }
  };

  const getStyleForType = (type) => {
    switch (type) {
      case 'emergency':
        return { icon: <RiAlertLine />, color: 'bg-red-50 text-red-500', label: 'طوارئ' };
      case 'payment':
        return { icon: <RiCheckboxCircleFill />, color: 'bg-amber-50 text-amber-500', label: 'دفع' };
      case 'booking':
        return { icon: <RiCheckboxCircleFill />, color: 'bg-emerald-50 text-emerald-500', label: 'حجز' };
      default:
        return { icon: <RiInformationFill />, color: 'bg-violet-50 text-violet-500', label: 'إداري' };
    }
  };

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
            className="text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors cursor-pointer"
          >
            تعليم الكل
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-gradient-to-l from-[#9810FA] to-[#59168B] text-white text-sm font-black px-5 py-2.5 rounded-2xl shadow-lg shadow-violet-200 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RiSendPlaneFill size={16} /> إرسال إشعار
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm space-y-5 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-violet-600 font-black text-sm flex items-center gap-2">📢 إرسال إشعار جماعي</h3>

          <div className="flex gap-2 flex-wrap">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedRole(opt.value)}
                className={`px-5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  selectedRole === opt.value
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200'
                    : 'bg-white border-slate-100 text-slate-400 hover:border-violet-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <textarea
            rows="4"
            value={notifText}
            onChange={(e) => setNotifText(e.target.value)}
            placeholder="اكتب نص الإشعار هنا..."
            className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/10 resize-none text-slate-800"
          />

          <div className="flex gap-3">
            <button
              onClick={handleSendBroadcast}
              disabled={sending}
              className="flex-1 bg-violet-600 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-violet-200 hover:bg-violet-700 cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <>
                  <RiLoader4Line className="animate-spin text-lg" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <span>إرسال الآن</span>
                  <RiSendPlaneFill />
                </>
              )}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="w-28 bg-slate-100 text-slate-400 font-bold py-3.5 rounded-2xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <RiLoader4Line className="animate-spin text-violet-600" size={40} />
          <p className="font-bold text-sm">جاري تحميل الإشعارات...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((n) => {
            const st = getStyleForType(n.type);
            const isRead = Boolean(n.is_read);

            return (
              <div
                key={n.id}
                className={`bg-white p-5 rounded-3xl border transition-all shadow-sm flex items-center justify-between
                  ${!isRead ? 'border-r-4 border-r-violet-500 border-slate-100' : 'border-slate-100'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${st.color}`}>
                    {st.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className={`text-sm font-black ${!isRead ? 'text-slate-800' : 'text-slate-600'}`}>
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{n.desc}</p>
                    <div className="flex gap-3 text-[10px] font-bold text-slate-400 pt-1">
                      <span>{n.time}</span>
                      <span className={st.color.split(' ')[1]}>{st.label}</span>
                    </div>
                  </div>
                </div>

                {!isRead && (
                  <div className="w-2.5 h-2.5 bg-violet-500 rounded-full shrink-0 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-400">لا توجد إشعارات حالياً</p>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
