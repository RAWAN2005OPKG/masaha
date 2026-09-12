import { RiAddLine, RiSubtractLine, RiUploadCloud2Line, RiCloseLine } from 'react-icons/ri';
import { useState } from 'react';

const BookingModal = ({ isOpen, onClose }) => {
  const [hours, setHours] = useState(4);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] p-8 relative shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 left-6 text-slate-300 hover:text-danger"><RiCloseLine size={24} /></button>
        
        <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800">احجز مقعدك</h2>
            <p className="text-xs text-slate-400 font-bold mt-1">مساحة الريادة • 20₪/ساعة</p>
        </div>

        {/* Hours Counter */}
        <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-2">🕒 عدد الساعات</label>
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <button onClick={() => setHours(h => h + 1)} className="w-12 h-12 bg-brand-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><RiAddLine size={24} /></button>
                <div className="text-center">
                    <span className="text-3xl font-black text-slate-800">{hours}</span>
                    <p className="text-[10px] text-brand-500 font-bold">ساعات</p>
                </div>
                <button onClick={() => setHours(h => Math.max(1, h - 1))} className="w-12 h-12 bg-white border border-brand-500 text-brand-500 rounded-2xl flex items-center justify-center shadow-sm"><RiSubtractLine size={24} /></button>
            </div>
        </div>

        {/* Seat Type */}
        <div className="space-y-4">
            <label className="text-xs font-bold text-slate-400 flex items-center gap-2">🪑 نوع المقعد</label>
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <button className="w-10 h-10 bg-brand-500 text-white rounded-xl flex items-center justify-center shadow-md">›</button>
                <span className="font-bold text-slate-700">مقعد عادي</span>
                <button className="w-10 h-10 bg-brand-500 text-white rounded-xl flex items-center justify-center shadow-md">‹</button>
            </div>
        </div>

        {/* Payment Info & Upload */}
        <div className="space-y-4">
            <div className="bg-brand-500/5 p-4 rounded-3xl border border-brand-500/20">
                <p className="text-[10px] text-brand-500 leading-relaxed font-bold">يرجى التحويل إلى بنك فلسطين: 1234 5678 9012 0000<br/>أو جوال باي: 0591234567 • المبلغ المطلوب: {hours * 20}₪</p>
            </div>
            <div className="border-2 border-dashed border-brand-500/20 bg-slate-50 rounded-3xl p-8 flex flex-col items-center gap-3 group cursor-pointer hover:bg-white transition-all">
                <div className="w-12 h-12 bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><RiUploadCloud2Line size={24} /></div>
                <p className="text-[10px] font-black text-slate-500">ارفع صورة إشعار التحويل</p>
                <span className="text-[8px] text-slate-300">PNG, JPG, PDF — الحد الأقصى 5MB</span>
            </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-50 p-4 rounded-2xl text-[10px] space-y-1">
            <div className="flex justify-between font-bold text-slate-400"><span>المساحة</span><span>مساحة الريادة</span></div>
            <div className="flex justify-between font-bold text-slate-800"><span>الإجمالي</span><span className="text-brand-500 text-base">{hours * 20}₪</span></div>
        </div>

        <button className="w-full bg-brand-500 text-white font-black py-5 rounded-3xl shadow-xl shadow-brand-500/30">تأكيد الحجز</button>
      </div>
    </div>
  );
};

export default BookingModal;