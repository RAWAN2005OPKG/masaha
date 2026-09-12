import React, { useState } from 'react';
import { RiPriceTag3Line, RiCalendarEventLine, RiGroupLine } from 'react-icons/ri';
import EventRegisterModal from '../../components/modals/EventRegisterModal';

const UserOffers = () => {
  const [isEventOpen, setIsEventOpen] = useState(false);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Active Offers Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <RiPriceTag3Line className="text-brand-500" /> العروض النشطة
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {[
            { title: 'خصم 30% على الحجوزات الأسبوعية', code: 'WEEK30', date: '2024/12/31', color: 'border-brand-500/20 bg-brand-500/5', discount: '-30%' },
            { title: 'ساعة مجانية مع كل حجز 4 ساعات', code: 'FREE1H', date: '2024/12/15', color: 'border-warning/20 bg-warning/5', discount: 'FREE' }
          ].map((offer, i) => (
            <div key={i} className={`p-6 rounded-[32px] border ${offer.color} flex justify-between items-center group relative overflow-hidden`}>
              <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 blur-3xl rounded-full"></div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-700">{offer.title}</h4>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded border border-slate-100 text-brand-500">{offer.code}</span>
                    <p className="text-[10px] text-slate-400 font-bold italic">ينتهي: {offer.date}</p>
                </div>
              </div>
              <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center font-black text-brand-500 shadow-sm">{offer.discount}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <RiCalendarEventLine className="text-brand-500" /> الفعاليات القادمة
        </h2>
        <div className="space-y-6">
          {[
            { title: 'ورشة تطوير الويب', date: '2024/12/25', time: '10:00 ص', capacity: '18/25', progress: 72, status: 'قادمة' },
            { title: 'جلسة ريادة الأعمال', date: '2024/12/22', time: '02:00 م', capacity: '30/30', progress: 100, status: 'ممتلئة' }
          ].map((event, i) => (
            <div key={i} className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 space-y-6 shadow-sm">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-slate-800">{event.title}</h3>
                <span className={`px-4 py-1 text-[10px] font-bold rounded-full ${event.status === 'ممتلئة' ? 'bg-red-50 text-red-400' : 'bg-brand-50 text-brand-500'}`}>{event.status}</span>
              </div>
              
              <div className="flex gap-6 text-xs text-slate-400 font-bold">
                 <p>{event.date}</p>
                 <p>{event.time}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400 flex items-center gap-1"><RiGroupLine /> {event.capacity} مشترك</span>
                  <span className="text-brand-500">{event.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${event.status === 'ممتلئة' ? 'bg-red-400' : 'bg-brand-500'}`} style={{ width: `${event.progress}%` }}></div>
                </div>
              </div>

              <button 
                disabled={event.status === 'ممتلئة'}
                onClick={() => setIsEventOpen(true)}
                className={`w-full py-4 rounded-2xl font-black transition-all ${
                  event.status === 'ممتلئة' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:scale-[1.01]'
                }`}
              >
                {event.status === 'ممتلئة' ? 'الطاقة ممتلئة' : 'سجل الآن'}
              </button>
            </div>
          ))}
        </div>
      </section>
      <EventRegisterModal isOpen={isEventOpen} onClose={() => setIsEventOpen(false)} />
    </div>
  );
};

export default UserOffers;