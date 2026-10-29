import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  RiArrowRightLine, 
  RiWifiLine, 
  RiFlashlightLine, 
  RiUserStarLine, 
  RiCheckLine, 
  RiStarFill, 
  RiLoader4Line,
  RiAlertLine
} from 'react-icons/ri';
import { useNavigate, useParams } from 'react-router-dom';
import BookingModal from '../../components/modals/BookingModal';

const SpaceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`/api/spaces/${id}`)
      .then(res => {
        setSpace(res.data);
        if (window.location.hash === '#rate-space') {
          setTimeout(() => {
            const el = document.getElementById('rate-space');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        }
      })
      .catch(err => {
        console.error('Error fetching space details:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-3">
        <RiLoader4Line className="animate-spin text-[#009689]" size={40} />
        <p className="font-bold text-sm">جاري تحميل بيانات المساحة...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100 shadow-sm space-y-4">
        <p className="text-lg font-bold text-slate-700">المساحة غير موجودة</p>
        <button
          onClick={() => navigate('/dashboard/explore')}
          className="bg-[#009689] text-white px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer"
        >
          العودة لاستكشاف المساحات
        </button>
      </div>
    );
  }

  const speedDisplay = space.speed 
    ? (space.speed.toString().includes('Mbps') ? space.speed : `${space.speed} Mbps`) 
    : '100 Mbps';
  const electricityDisplay = space.electricity || '24/7';
  const totalSeats = space.seats || 40;
  const isClosed = Boolean(space.is_manual_disabled);
  const availableSeats = space.available !== undefined ? space.available : 12;
  const occupancyRate = space.occupancy !== undefined ? space.occupancy : 70;
  const services = (space.servicesList && space.servicesList.length > 0)
    ? space.servicesList
    : ['قهوة مجانية', 'طباعة', 'خزانة', 'قاعة اجتماعات'];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4">
      {/* Header & Back Button */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-[#009689] font-bold text-sm cursor-pointer transition-colors"
        >
          <RiArrowRightLine /> العودة للمساحات
        </button>
        <div className="bg-[#009689] p-2 rounded-lg text-white"><RiUserStarLine /></div>
      </div>

      {/* Coming Soon Alert Banner */}
      {space.is_coming_soon && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-[28px] p-6 text-blue-800 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 text-blue-600">
            <RiTimeLine size={28} />
          </div>
          <div>
            <h4 className="font-black text-base">⏳ هذه المساحة ستفتتح قريباً</h4>
            <p className="text-xs text-blue-600 mt-1 font-bold">
              تاريخ الافتتاح وبدء الحجوزات: {space.sub_start_date}. سيكون الحجز متاحاً لجميع المستخدمين فور حلول هذا الموعد.
            </p>
          </div>
        </div>
      )}

      {/* Emergency Alert Banner if Space is Stopped */}
      {isClosed && !space.is_coming_soon && (
        <div className="bg-red-50 border-2 border-red-200 rounded-[28px] p-6 text-red-700 flex items-center gap-4 shadow-sm animate-pulse">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0 text-red-600">
            <RiAlertLine size={28} />
          </div>
          <div>
            <h4 className="font-black text-base">⚠️ المساحة متوقفة ومغلقة حالياً</h4>
            <p className="text-xs text-red-600 mt-1 font-bold">
              السبب: {space.emergency_reason || 'إجراء طارئ مؤقت، يرجى مراجعة إدارة المساحة أو الاستقبال.'}
            </p>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative h-64 bg-gradient-to-br from-[#0D9488] to-[#0F766E] rounded-[32px] p-8 text-white flex flex-col justify-end overflow-hidden shadow-xl">
        <div className="absolute top-8 left-8 text-3xl font-black">{space.price}₪ <small className="text-sm font-normal opacity-70">/ساعة</small></div>
        <div className="relative z-10 space-y-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold">{space.region}</span>
            <h1 className="text-3xl font-bold">{space.name}</h1>
            <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2 py-1 rounded-md font-bold">
                  <RiStarFill /> {space.rating || 4.8}
                </span>
                <span className={`px-2 py-1 rounded-md font-bold ${isClosed ? 'bg-red-500/80 text-white' : 'bg-white/10'}`}>
                  {isClosed ? 'متوقفة حالياً' : `${availableSeats} مقعد متاح`}
                </span>
            </div>
        </div>
      </div>

      {/* Info Cards Grid (All from Database) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: <RiWifiLine />, label: 'الإنترنت', val: speedDisplay },
          { icon: <RiFlashlightLine />, label: 'الكهرباء', val: electricityDisplay },
          { icon: <RiUserStarLine />, label: 'المقاعد', val: `${totalSeats} مقعد` }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center gap-2 shadow-sm">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#009689] text-xl">{item.icon}</div>
            <p className="text-[10px] text-slate-400 font-bold">{item.label}</p>
            <p className="font-bold text-slate-800">{item.val}</p>
          </div>
        ))}
      </div>

      {/* Seat Options & Pricing Cards */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            🏷️ خيارات الحجز والأسعار المتاحة
          </h3>
          <span className="text-xs text-[#009689] font-bold">حسب رغبتك</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between gap-3 hover:border-[#009689] transition-all">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-lg">🪑</span>
                <span className="text-lg font-black text-[#009689]">{space.price_regular || space.price}₪<small className="text-xs font-normal text-slate-400">/س</small></span>
              </div>
              <h4 className="font-black text-slate-800 text-sm">مقعد عادي</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1">مساحة عمل مفتوحة مشتركة مع كهرباء وإنترنت فائق.</p>
            </div>
            <button
              onClick={() => {
                if (space.is_coming_soon) {
                  alert(`هذه المساحة ستفتتح قريباً بتاريخ (${space.sub_start_date}). الحجز متاح فور حلول الموعد.`);
                  return;
                }
                if (isClosed) {
                  alert('المساحة متوقفة حالياً، لا يمكن إتمام الحجز.');
                  return;
                }
                setIsBookingOpen(true);
              }}
              disabled={space.is_coming_soon || isClosed}
              className={`w-full text-xs font-bold py-2.5 rounded-xl transition ${
                space.is_coming_soon || isClosed 
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-white hover:bg-[#009689] hover:text-white text-slate-700 border border-slate-200 cursor-pointer'
              }`}
            >
              {space.is_coming_soon ? 'يفتتح قريباً' : isClosed ? 'المساحة متوقفة' : 'حجز مقعد عادي'}
            </button>
          </div>

          <div className="bg-[#009689]/5 border border-[#009689]/30 p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-lg">💼</span>
                <span className="text-lg font-black text-[#009689]">{space.price_private || Math.round((space.price || 15) * 1.5)}₪<small className="text-xs font-normal text-slate-400">/س</small></span>
              </div>
              <h4 className="font-black text-slate-800 text-sm">مقعد خاص</h4>
              <p className="text-[11px] text-slate-600 font-medium mt-1">مكتب مخصص بمزيد من الخصوصية والهدوء لإنجاز الأعمال.</p>
            </div>
            <button
              onClick={() => {
                if (space.is_coming_soon) {
                  alert(`هذه المساحة ستفتتح قريباً بتاريخ (${space.sub_start_date}). الحجز متاح فور حلول الموعد.`);
                  return;
                }
                if (isClosed) {
                  alert('المساحة متوقفة حالياً، لا يمكن إتمام الحجز.');
                  return;
                }
                setIsBookingOpen(true);
              }}
              disabled={space.is_coming_soon || isClosed}
              className={`w-full text-xs font-bold py-2.5 rounded-xl transition ${
                space.is_coming_soon || isClosed 
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-[#009689] text-white hover:bg-[#008577] cursor-pointer shadow-sm'
              }`}
            >
              {space.is_coming_soon ? 'يفتتح قريباً' : isClosed ? 'المساحة متوقفة' : 'حجز مقعد خاص'}
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between gap-3 hover:border-[#009689] transition-all">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-lg">🏢</span>
                <span className="text-lg font-black text-[#009689]">{space.price_room || Math.round((space.price || 15) * 3)}₪<small className="text-xs font-normal text-slate-400">/س</small></span>
              </div>
              <h4 className="font-black text-slate-800 text-sm">غرف خاصة</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1">غرف اجتماعات ومكاتب تنفيذية خاصة بالفرق والاجتماعات.</p>
            </div>
            <button
              onClick={() => {
                if (space.is_coming_soon) {
                  alert(`هذه المساحة ستفتتح قريباً بتاريخ (${space.sub_start_date}). الحجز متاح فور حلول الموعد.`);
                  return;
                }
                if (isClosed) {
                  alert('المساحة متوقفة حالياً، لا يمكن إتمام الحجز.');
                  return;
                }
                setIsBookingOpen(true);
              }}
              disabled={space.is_coming_soon || isClosed}
              className={`w-full text-xs font-bold py-2.5 rounded-xl transition ${
                space.is_coming_soon || isClosed 
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-white hover:bg-[#009689] hover:text-white text-slate-700 border border-slate-200 cursor-pointer'
              }`}
            >
              {space.is_coming_soon ? 'يفتتح قريباً' : isClosed ? 'المساحة متوقفة' : 'حجز غرفة خاصة'}
            </button>
          </div>
        </div>
      </div>

      {/* Services Section (From Database) */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 space-y-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 underline decoration-[#009689] underline-offset-8">🚀 الخدمات المتوفرة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center border border-slate-100 group hover:border-[#009689] transition-all">
                    <span className="text-sm font-bold text-slate-600">{s}</span>
                    <RiCheckLine className="text-[#009689]" />
                </div>
            ))}
        </div>
      </div>

      {/* Occupancy Indicator */}
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 space-y-4">
         <div className="flex justify-between items-end">
            <span className="text-slate-400 text-xs font-bold uppercase">نسبة الإشغال الحالية</span>
            <span className="text-[#009689] font-black text-xl">{occupancyRate}%</span>
         </div>
         <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="bg-[#009689] h-full rounded-full shadow-[0_0_15px_rgba(0,150,137,0.4)] transition-all duration-700"
              style={{ width: `${occupancyRate}%` }}
            ></div>
         </div>
         <p className="text-[10px] text-[#009689] font-bold">
           {isClosed ? 'المساحة مغلقة مؤقتاً' : `${availableSeats} مقعد متاح من أصل ${totalSeats}`}
         </p>
      </div>

      {/* Rating & Action */}
      <div id="rate-space" className="bg-white p-8 rounded-[32px] border border-slate-100 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[#009689] flex items-center gap-2">⭐ تقييم المساحة</h3>
            <span className="text-[#009689] font-bold">{space.rating || 4.9} <small className="text-[#009689]/70">({space.ratingCount || 0} تقييم)</small></span>
          </div>

          {ratingSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-bold text-center">
              {ratingSuccess}
            </div>
          )}

          {/* Star Selection */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setUserRating(star)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
              >
                <RiStarFill
                  size={32}
                  className={star <= userRating ? 'text-amber-400' : 'text-slate-200'}
                />
              </button>
            ))}
          </div>

          <textarea
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            placeholder="اكتب تعليقك أو تجربتك في المساحة (اختياري)..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#009689]/20 h-24 text-right"
          />

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => { setUserComment(''); setRatingSuccess(''); }}
              className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={submittingRating}
              onClick={() => {
                setSubmittingRating(true);
                axios.post(`/api/spaces/${space.id}/rate`, {
                  rating: userRating,
                  comment: userComment,
                })
                  .then(res => {
                    setSpace(prev => ({
                      ...prev,
                      rating: res.data.rating,
                      ratingCount: res.data.reviewsCount,
                    }));
                    setRatingSuccess(res.data.message || 'تم إرسال التقييم بنجاح!');
                  })
                  .catch(err => {
                    console.error(err);
                    alert('يرجى تسجيل الدخول لتقييم المساحة.');
                  })
                  .finally(() => setSubmittingRating(false));
              }}
              className="flex-1 bg-[#009689] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#009689]/20 cursor-pointer flex items-center justify-center gap-2"
            >
              {submittingRating && <RiLoader4Line className="animate-spin" size={18} />}
              إرسال التقييم
            </button>
          </div>
      </div>

      {isClosed ? (
        <button 
          disabled
          className="w-full bottom-6 bg-slate-300 text-slate-500 font-black py-5 rounded-3xl shadow-md cursor-not-allowed text-center"
        >
          المساحة متوقفة حالياً ({space.emergency_reason || 'إغلاق طارئ'}) — لا يمكن الحجز
        </button>
      ) : (
        <button 
          onClick={() => setIsBookingOpen(true)}
          className="w-full bottom-6 bg-[#009689] text-white font-black py-5 rounded-3xl shadow-2xl z-40 hover:scale-105 transition-transform cursor-pointer"
        >
          احجز الآن
        </button>
      )}

      {/* Booking Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} space={space} />
    </div>
  );
};

export default SpaceDetails;