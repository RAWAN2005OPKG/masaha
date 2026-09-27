import React, { useState } from 'react';
import axios from 'axios';
import { RiCloseLine, RiCalendarCheckLine, RiLoader4Line } from 'react-icons/ri';

const EventRegisterModal = ({ isOpen, onClose, event, onSuccess }) => {
  if (!isOpen || !event) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const remaining = Math.max(0, (event.capacity || 25) - (event.joined || 0));

  const handleRegister = () => {
    setLoading(true);
    axios.post(`/api/events/${event.id}/join`, {
      name,
      phone,
    })
      .then(res => {
        alert(res.data.message || 'تم التسجيل في الفعالية بنجاح!');
        if (onSuccess) onSuccess();
        onClose();
      })
      .catch(err => {
        console.error(err);
        alert(err.response?.data?.message || 'حدث خطأ أثناء التسجيل');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[48px] p-10 relative shadow-2xl space-y-8 animate-in slide-in-from-top-10 duration-500">
        <button onClick={onClose} className="absolute top-8 left-8 text-slate-300 hover:text-red-400 transition-colors">
          <RiCloseLine size={28} />
        </button>
        
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-brand-500/30">
                <RiCalendarCheckLine />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-800">التسجيل في الفعالية</h2>
                <p className="text-xs text-slate-400 font-bold mt-1">أدخل بياناتك لتأكيد حضورك</p>
            </div>
        </div>

        <div className="bg-brand-50/50 p-6 rounded-[32px] border border-brand-50 space-y-3">
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800">{event.title}</h4>
                <span className="text-[10px] font-black text-brand-500 bg-white px-2 py-0.5 rounded border border-brand-100">{event.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-white/80 p-2.5 rounded-xl border border-brand-100/50">
                <span>📍 {event.spaceName || 'المساحة العامة'} - {event.spaceLocation || 'غزة، المقر الرئيسي'}</span>
            </div>
            <div className="flex gap-4 text-[10px] text-slate-400 font-bold uppercase pt-1">
                <p>الوقت: {event.time}</p>
                <p>الأماكن المتبقية: {remaining} مقعد</p>
            </div>
        </div>

        <div className="space-y-5">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase pr-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: محمد أحمد"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 transition-all text-right"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase pr-2">رقم الهاتف / الواتس</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="059-000-0000"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 transition-all text-right"
                />
            </div>
        </div>

        <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-slate-100 text-slate-400 font-black py-4 rounded-3xl"
            >
              إلغاء
            </button>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="flex-1 bg-brand-500 text-white font-black py-4 rounded-3xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
            >
              {loading && <RiLoader4Line className="animate-spin" size={18} />}
              تأكيد التسجيل
            </button>
        </div>
      </div>
    </div>
  );
};

export default EventRegisterModal;