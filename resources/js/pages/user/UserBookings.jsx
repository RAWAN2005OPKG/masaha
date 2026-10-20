import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  RiTimeLine, 
  RiArmchairLine, 
  RiMoneyDollarCircleLine, 
  RiEditLine, 
  RiCloseCircleLine, 
  RiCalendarCheckLine,
  RiWifiLine,
  RiLoader4Line,
  RiStarFill
} from 'react-icons/ri';
import EditBookingModal from '../../components/modals/EditBookingModal';
import PageHeader from '../../components/layout/PageHeader';

const UserBookings = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('الكل');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    axios.get('/api/user/bookings')
      .then(res => {
        setBookings(res.data);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const STATUS_BY_FILTER = {
    'الكل': null,
    'حالية': 'حالية',
    'قادمة': 'قادمة',
    'بانتظار التأكيد': 'بانتظار التأكيد',
    'منتهية': 'منتهية',
  };

  const filteredBookings = bookings.filter((b) => {
    const targetStatus = STATUS_BY_FILTER[filter];
    return targetStatus === null || b.status === targetStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <PageHeader title="حجوزاتي" icon={<RiCalendarCheckLine />} role="user" />

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          {['الكل', 'حالية', 'قادمة', 'بانتظار التأكيد', 'منتهية'].map(f => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all mx-1 cursor-pointer ${
                filter === f ? 'bg-[var(--primary)] text-white shadow-sm' : 'bg-transparent text-slate-500 hover:bg-white/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/dashboard/explore')}
          className="bg-[#009689] text-white px-5 py-2.5 rounded-2xl font-black text-xs hover:bg-[#008577] transition-all cursor-pointer shadow-sm flex items-center gap-2"
        >
          <span>+ حجز مساحة جديدة</span>
        </button>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <RiLoader4Line className="animate-spin text-[var(--primary)]" size={40} />
            <p className="font-bold text-sm">جاري تحميل الحجوزات...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
            <p className="text-sm font-bold text-slate-500">لا توجد حجوزات بهذه الحالة حالياً</p>
            <p className="text-xs text-slate-400">يمكنك استكشاف المساحات المتوفرة وحجز مقعدك بكل سهولة.</p>
            <button
              onClick={() => navigate('/dashboard/explore')}
              className="bg-[#009689] text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-[#008577] transition-all cursor-pointer shadow-md shadow-[#009689]/20 inline-flex items-center gap-2"
            >
              استكشف المساحات المتوفرة الآن
            </button>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-all space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{booking.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">{booking.date}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${
                  booking.status === 'حالية' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 
                  booking.status === 'بانتظار التأكيد' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  booking.status === 'قادمة' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-50 text-slate-400 border border-slate-200'
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                  <RiTimeLine className="text-[var(--primary)] text-xl" />
                  <div><p className="text-[10px] text-slate-400 font-bold">المدة</p><p className="text-sm font-bold">{booking.time}</p></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                  <RiArmchairLine className="text-[var(--primary)] text-xl" />
                  <div><p className="text-[10px] text-slate-400 font-bold">النوع</p><p className="text-sm font-bold">{booking.seat}</p></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                  <RiMoneyDollarCircleLine className="text-[var(--primary)] text-xl" />
                  <div><p className="text-[10px] text-slate-400 font-bold">السعر</p><p className="text-sm font-bold">{booking.price}</p></div>
                </div>
              </div>

              {/* Wifi Credentials Card if confirmed */}
              {booking.wifi_username && booking.wifi_password && (
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0">
                      <RiWifiLine size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-800">بيانات شبكة الإنترنت (الواي فاي)</p>
                      <p className="text-[11px] text-emerald-600 font-bold mt-0.5">تم تفعيل وصولك بنجاح</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-emerald-100 text-xs font-black text-slate-700">
                    <span>مستخدم: <strong className="text-emerald-700 font-mono">{booking.wifi_username}</strong></span>
                    <span>•</span>
                    <span>كلمة المرور: <strong className="text-emerald-700 font-mono">{booking.wifi_password}</strong></span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                {booking.space_id && (
                  <button 
                    type="button"
                    onClick={() => navigate(`/dashboard/explore/${booking.space_id}#rate-space`)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-amber-200"
                  >
                    <RiStarFill className="text-amber-500" /> تقييم هذه المساحة
                  </button>
                )}

                {(booking.status === 'حالية' || booking.status === 'قادمة') && (
                  <div className="flex items-center gap-2 mr-auto">
                    <button 
                      onClick={() => setIsEditOpen(true)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RiEditLine /> تعديل الحجز
                    </button>
                    <button className="border border-red-100 text-red-400 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 hover:bg-red-50 transition cursor-pointer">
                      <RiCloseCircleLine /> إلغاء الحجز
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <EditBookingModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </div>
  );
};

export default UserBookings;