import { useState } from 'react';
import { RiArrowRightLine, RiWifiLine, RiFlashlightLine, RiUserStarLine, RiCheckLine, RiStarFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import BookingModal from '../../components/modals/BookingModal';

const SpaceDetails = () => {
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4">
      {/* Header & Back Button */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-brand-500 font-bold text-sm">
          <RiArrowRightLine /> العودة للمساحات
        </button>
        <div className="bg-[#009689] p-2 rounded-lg text-white"><RiUserStarLine /></div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-64 bg-gradient-to-br from-[#0D9488] to-[#0F766E] rounded-[32px] p-8 text-white flex flex-col justify-end overflow-hidden shadow-xl">
        <div className="absolute top-8 left-8 text-3xl font-black">15₪ <small className="text-sm font-normal opacity-70">/ساعة</small></div>
        <div className="relative z-10 space-y-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold">غزة</span>
            <h1 className="text-3xl font-bold">مساحة الإبداع</h1>
            <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 bg-warning/20 text-warning px-2 py-1 rounded-md"><RiStarFill /> 4.8</span>
                <span className="bg-white/10 px-2 py-1 rounded-md">12 مقعد متاح</span>
            </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <RiWifiLine />, label: 'الإنترنت', val: '100 Mbps' },
          { icon: <RiFlashlightLine />, label: 'الكهرباء', val: '24/7' },
          { icon: <RiUserStarLine />, label: 'المقاعد', val: '40 مقعد' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center gap-2 shadow-sm">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-500 text-xl">{item.icon}</div>
            <p className="text-[10px] text-slate-400 font-bold">{item.label}</p>
            <p className="font-bold text-slate-800">{item.val}</p>
          </div>
        ))}
      </div>

      {/* Services Section */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 space-y-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 underline decoration-brand-500 underline-offset-8">🚀 الخدمات المتوفرة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['قهوة مجانية', 'طباعة', 'خزانة', 'قاعة اجتماعات'].map((s) => (
                <div key={s} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center border border-slate-100 group hover:border-brand-500 transition-all">
                    <span className="text-sm font-bold text-slate-600">{s}</span>
                    <RiCheckLine className="text-brand-500" />
                </div>
            ))}
        </div>
      </div>

      {/* Occupancy Indicator */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 space-y-4">
         <div className="flex justify-between items-end">
            <span className="text-slate-400 text-xs font-bold uppercase">نسبة الإشغال الحالية</span>
            <span className="text-[var(--primary)] font-black text-xl">70%</span>
         </div>
         <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="bg-[var(--primary)] h-full w-[70%] rounded-full shadow-[0_0_15px_rgba(0,150,137,0.4)]"></div>
         </div>
         <p className="text-[10px] text-[var(--primary)] font-bold">12 مقعد متاح من أصل 40</p>
      </div>

      {/* Rating & Action */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[var(--primary)] flex items-center gap-2">⭐ تقييم المساحة</h3>
            <span className="text-brand-500 font-bold">4.9 <small className="text-[var(--primary)]">(30)</small></span>
          </div>
          <textarea placeholder="اكتب تعليقك (اختياري)..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 h-24"></textarea>
          <div className="flex gap-4">
            <button className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl">إلغاء</button>
            <button className="flex-1  bg-[var(--primary)] text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-500/20">إرسال التقييم</button>
          </div>
      </div>

    
      <button 
        onClick={() => setIsBookingOpen(true)}
        className=" w-full bottom-6   bg-[var(--primary)] text-white font-black py-5 rounded-3xl shadow-2xl z-40 hover:scale-105 transition-transform"
      >
        احجز الآن
      </button>

      {/* Booking Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </div>
  );
};

export default SpaceDetails;