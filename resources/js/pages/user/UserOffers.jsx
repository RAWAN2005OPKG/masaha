import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RiPriceTag3Line, RiCalendarEventLine, RiGroupLine, RiLoader4Line, RiMapPin2Line, RiBuildingLine, RiBookmarkLine, RiBookmarkFill } from 'react-icons/ri';
import EventRegisterModal from '../../components/modals/EventRegisterModal';
import PageHeader from '../../components/layout/PageHeader';

const UserOffers = () => {
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [offers, setOffers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedEvents, setSavedEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('masaha_saved_events');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleSaveEvent = (id) => {
    setSavedEvents(prev => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter(eId => eId !== id) : [...prev, id];
      try {
        localStorage.setItem('masaha_saved_events', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/offers'),
      axios.get('/api/events'),
    ])
      .then(([offersRes, eventsRes]) => {
        if (Array.isArray(offersRes.data)) setOffers(offersRes.data);
        if (Array.isArray(eventsRes.data)) setEvents(eventsRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleOpenEvent = (ev) => {
    setSelectedEvent(ev);
    setIsEventOpen(true);
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700 pb-20">
      <PageHeader title="العروض والفعاليات" icon={<RiPriceTag3Line />} role="user" />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
          <RiLoader4Line className="animate-spin text-brand-500" size={32} />
          <span className="font-bold text-sm">جاري تحميل العروض والفعاليات...</span>
        </div>
      ) : (
        <>
          {/* Active Offers Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <RiPriceTag3Line className="text-brand-500" /> العروض النشطة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.length > 0 ? (
                offers.map((offer) => (
                  <div key={offer.id} className={`p-6 rounded-[32px] border ${offer.color || 'border-brand-500/20 bg-brand-500/5'} flex justify-between items-center group relative overflow-hidden`}>
                    <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 blur-3xl rounded-full"></div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-700">{offer.title}</h4>
                      
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1 text-brand-600 bg-white/90 px-2 py-0.5 rounded-lg border border-slate-100 shadow-xs">
                          <RiBuildingLine size={13} /> {offer.spaceName || 'كافة المساحات'}
                        </span>
                        {offer.spaceLocation && (
                          <span className="flex items-center gap-1 text-slate-500 bg-white/60 px-2 py-0.5 rounded-lg">
                            <RiMapPin2Line size={13} className="text-brand-500" /> {offer.spaceLocation}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-0.5">
                          <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded border border-slate-100 text-brand-500">{offer.code}</span>
                          <p className="text-[10px] text-slate-400 font-bold italic">ينتهي: {offer.date || offer.expiry}</p>
                      </div>
                    </div>
                    <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center font-black text-brand-500 shadow-sm shrink-0">
                      {offer.discount}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 font-bold col-span-2 text-center py-6">لا توجد عروض ترويجية نشطة حالياً</p>
              )}
            </div>
          </section>

          {/* Upcoming Events Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <RiCalendarEventLine className="text-brand-500" /> الفعاليات والورش القادمة
            </h2>
            <div className="space-y-6">
              {events.length > 0 ? (
                events.map((event) => {
                  const isFull = event.status === 'ممتلئة' || event.joined >= event.capacity;
                  return (
                    <div key={event.id} className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 space-y-6 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{event.title}</h3>
                          {event.description && (
                            <p className="text-xs text-slate-400 font-bold mt-1">{event.description}</p>
                          )}
                        </div>
                        <span className={`px-4 py-1 text-[10px] font-bold rounded-full ${isFull ? 'bg-red-50 text-red-400' : 'bg-brand-50 text-brand-500'}`}>
                          {isFull ? 'ممتلئة' : event.status}
                        </span>
                      </div>
                      
                      {/* Space Name, Location & Time */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                         <div className="flex items-center gap-1.5 text-brand-600 font-black">
                           <RiBuildingLine size={16} /> {event.spaceName || 'المساحة العامة'}
                         </div>
                         <div className="flex items-center gap-1.5 text-slate-500">
                           <RiMapPin2Line size={16} className="text-brand-500" /> {event.spaceLocation || 'غزة، المقر الرئيسي'}
                         </div>
                         <div className="flex items-center gap-2 text-slate-400 mr-auto">
                           <span>التاريخ: {event.date}</span>
                           <span>•</span>
                           <span>الوقت: {event.time}</span>
                         </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400 flex items-center gap-1">
                            <RiGroupLine /> {event.joined}/{event.capacity} مشترك
                          </span>
                          <span className="text-brand-500">{event.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-red-400' : 'bg-brand-500'}`}
                            style={{ width: `${event.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          disabled={isFull}
                          onClick={() => handleOpenEvent(event)}
                          className={`flex-1 py-4 rounded-2xl font-black transition-all ${
                            isFull
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 hover:scale-[1.01] cursor-pointer'
                          }`}
                        >
                          {isFull ? 'الطاقة الاستيعابية ممتلئة' : 'سجل الآن في الفعالية'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSaveEvent(event.id)}
                          className={`px-5 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                            savedEvents.includes(event.id)
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={savedEvents.includes(event.id) ? 'إلغاء حفظ الفعالية' : 'حفظ الفعالية'}
                        >
                          {savedEvents.includes(event.id) ? (
                            <>
                              <RiBookmarkFill className="text-amber-500 text-lg" />
                              <span className="hidden sm:inline text-xs font-black">محفوظة</span>
                            </>
                          ) : (
                            <>
                              <RiBookmarkLine className="text-slate-400 text-lg" />
                              <span className="hidden sm:inline text-xs font-bold">حفظ الفعالية</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 font-bold text-center py-6">لا توجد فعاليات قادمة حالياً</p>
              )}
            </div>
          </section>
        </>
      )}

      <EventRegisterModal
        isOpen={isEventOpen}
        onClose={() => setIsEventOpen(false)}
        event={selectedEvent}
        onSuccess={loadData}
      />
    </div>
  );
};

export default UserOffers;