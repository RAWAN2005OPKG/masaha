import React from 'react';
import { RiCloseLine, RiCalendarLine, RiTimeLine } from 'react-icons/ri';

const EditBookingModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-brand-600 p-6 flex justify-between items-center text-white">
            <h3 className="font-bold">تعديل الحجز</h3>
            <button onClick={onClose}><RiCloseLine size={24} /></button>
        </div>
        <div className="p-8 space-y-6">
            <div className="bg-warning/5 border border-warning/20 p-4 rounded-2xl">
                <p className="text-[10px] text-warning font-black uppercase mb-1">الحجز الحالي</p>
                <p className="text-sm font-bold text-slate-700">2024/12/10 — 09:00 ص</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">مقعد عادي • 8 ساعات</p>
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 pr-2 tracking-widest uppercase">التاريخ الجديد</label>
                <div className="relative">
                    <RiCalendarLine className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="2024/12/15" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pr-12 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-brand-500/5 transition-all" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 pr-2">من الساعة</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold appearance-none"><option>09:00</option></select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 pr-2">إلى الساعة</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm font-bold appearance-none"><option>17:00</option></select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 pr-2">نوع المقعد</label>
                <div className="grid grid-cols-2 gap-3">
                    {['مقعد عادي', 'مكتب خاص', 'غرفة اجتماع', 'مقعد هادئ'].map(s => (
                        <button key={s} className={`py-3 rounded-xl text-[11px] font-bold border transition-all ${s === 'مقعد عادي' ? 'bg-brand-50 border-brand-500 text-brand-600' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>{s}</button>
                    ))}
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-400 font-black py-4 rounded-2xl">إلغاء</button>
                <button className="flex-1 bg-brand-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-500/20">حفظ التعديلات</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditBookingModal;