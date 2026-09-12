import React from 'react';
import { RiCloseLine, RiCalendarCheckLine } from 'react-icons/ri';

const EventRegisterModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[48px] p-10 relative shadow-2xl space-y-8 animate-in slide-in-from-top-10 duration-500">
        <button onClick={onClose} className="absolute top-8 left-8 text-slate-300 hover:text-red-400 transition-colors"><RiCloseLine size={28} /></button>
        
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-brand-500/30">
                <RiCalendarCheckLine />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-800">التسجيل في الفعالية</h2>
                <p className="text-xs text-slate-400 font-bold mt-1">أدخل بياناتك للتأكيد</p>
            </div>
        </div>

        <div className="bg-brand-50/50 p-6 rounded-[32px] border border-brand-50 space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-700">ورشة تطوير الويب</h4>
                <span className="text-[10px] font-black text-brand-500">2024/12/25</span>
            </div>
            <div className="flex gap-4 text-[10px] text-slate-400 font-bold uppercase">
                <p>الوقت: 10:00 ص</p>
                <p>الأماكن المتبقية: 7 مكان</p>
            </div>
        </div>

        <div className="space-y-5">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase pr-2">الاسم الكامل</label>
                <input type="text" placeholder="مثال: محمد أحمد" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 transition-all" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase pr-2">رقم الواتس</label>
                <input type="tel" placeholder="059-000-0000" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 transition-all" />
            </div>
        </div>

        <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-400 font-black py-4 rounded-3xl">إلغاء</button>
            <button className="flex-1 bg-brand-500 text-white font-black py-4 rounded-3xl shadow-lg shadow-brand-500/20">تأكيد التسجيل</button>
        </div>
      </div>
    </div>
  );
};

export default EventRegisterModal;