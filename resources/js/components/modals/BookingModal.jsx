import { RiAddLine, RiSubtractLine, RiUploadCloud2Line, RiCloseLine, RiTimeLine, RiCheckboxCircleFill, RiLoader4Line, RiImageLine } from 'react-icons/ri';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SEAT_TYPES = ['مقعد عادي', 'مقعد VIP', 'غرفة خاصة'];

const BookingModal = ({ isOpen, onClose, space }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [hours, setHours] = useState(4);
  const [seatIndex, setSeatIndex] = useState(0);
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const spaceName = space?.name || 'مساحة العمل';
  const pricePerHour = space ? (parseFloat(space.price || space.price_per_hour) || 20) : 20;

  useEffect(() => {
    if (!isOpen) {
      setReceiptFile(null);
      setErrorMsg('');
      setSuccess(false);
      setLoading(false);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const seatType = SEAT_TYPES[seatIndex];
  const totalPrice = hours * pricePerHour;

  const handleNextSeat = () => setSeatIndex((i) => (i + 1) % SEAT_TYPES.length);
  const handlePrevSeat = () => setSeatIndex((i) => (i - 1 + SEAT_TYPES.length) % SEAT_TYPES.length);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleSubmit = async () => {
    if (!space?.id) {
      setErrorMsg('بيانات المساحة غير متوفرة');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('space_id', space.id);
      formData.append('seat_type', seatType);
      formData.append('hours', hours);
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      await axios.post('/api/bookings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate('/dashboard/bookings');
      }, 1800);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إرسال طلب الحجز، يرجى المحاولة ثانيةً';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[40px] p-8 relative shadow-2xl space-y-6 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-slate-300 hover:text-danger transition cursor-pointer"
        >
          <RiCloseLine size={24} />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800">احجز مقعدك</h2>
          <p className="text-xs text-slate-400 font-bold mt-1">
            {spaceName} • {pricePerHour}₪/ساعة
          </p>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <RiCheckboxCircleFill size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800">تم إرسال طلب الحجز بنجاح!</h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-bold">
              تم إرسال بيانات الحجز وإشعار الدفع لموظف الاستقبال للمراجعة. جاري تحويلك لصفحة حجوزاتي...
            </p>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-2xl text-center">
                {errorMsg}
              </div>
            )}

            {/* Hours Counter */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                <RiTimeLine className="text-[var(--primary)]" size={16} /> عدد الساعات
              </label>
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <button
                  onClick={() => setHours((h) => h + 1)}
                  className="w-12 h-12 bg-[var(--primary)] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 cursor-pointer"
                >
                  <RiAddLine size={24} />
                </button>
                <div className="text-center">
                  <span className="text-3xl font-black text-slate-800">{hours}</span>
                  <p className="text-[10px] text-[var(--primary)] font-bold">ساعات</p>
                </div>
                <button
                  onClick={() => setHours((h) => Math.max(1, h - 1))}
                  className="w-12 h-12 bg-white border border-[var(--primary)] text-[var(--primary)] rounded-2xl flex items-center justify-center shadow-sm cursor-pointer"
                >
                  <RiSubtractLine size={24} />
                </button>
              </div>
              <p className="text-[11px] font-bold text-[var(--primary)] text-right">
                {totalPrice}₪ إجمالي
              </p>
            </div>

            {/* Seat Type */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                🪑 نوع المقعد
              </label>
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <button
                  onClick={handleNextSeat}
                  className="w-10 h-10 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center shadow-md cursor-pointer"
                >
                  ›
                </button>
                <span className="font-bold text-slate-700">{seatType}</span>
                <button
                  onClick={handlePrevSeat}
                  className="w-10 h-10 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center shadow-md cursor-pointer"
                >
                  ‹
                </button>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                {SEAT_TYPES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === seatIndex ? 'w-4 bg-[var(--primary)]' : 'w-1.5 bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Payment Info & Upload */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-2">
                🏦 إشعار التحويل البنكي
              </label>
              <div className="bg-[var(--primary)]/5 p-4 rounded-3xl border border-[var(--primary)]/20">
                <p className="text-[10px] text-[var(--primary)] leading-relaxed font-bold">
                  يرجى التحويل إلى بنك فلسطين: 1234 5678 9012 0000
                  <br />
                  أو جوال باي: 0591234567 • المبلغ المطلوب: {totalPrice}₪
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,application/pdf"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--primary)]/20 bg-slate-50 rounded-3xl p-6 flex flex-col items-center gap-2 group cursor-pointer hover:bg-white transition-all text-center"
              >
                {receiptFile ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                    <RiImageLine size={20} />
                    <span>تم اختيار: {receiptFile.name}</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <RiUploadCloud2Line size={24} />
                    </div>
                    <p className="text-[11px] font-black text-slate-600">اضغط لرفع صورة إشعار التحويل</p>
                    <span className="text-[9px] text-slate-400">PNG, JPG, PDF — الحد الأقصى 5MB</span>
                  </>
                )}
              </div>
            </div>

            {/* Footer Info */}
            <div className="bg-slate-50 p-4 rounded-2xl text-[10px] space-y-1">
              <div className="flex justify-between font-bold text-slate-400">
                <span>المساحة</span>
                <span>{spaceName}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-400">
                <span>المدة</span>
                <span>{hours} ساعة</span>
              </div>
              <div className="flex justify-between font-bold text-slate-400">
                <span>نوع المقعد</span>
                <span>{seatType}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200 mt-1">
                <span>الإجمالي</span>
                <span className="text-[var(--primary)] text-base">{totalPrice}₪</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[var(--primary)] hover:opacity-90 text-white font-black py-4 rounded-3xl shadow-xl shadow-[var(--primary)]/30 cursor-pointer flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <RiLoader4Line className="animate-spin text-xl" />
                  <span>جاري إرسال الحجز...</span>
                </>
              ) : (
                'تأكيد الحجز وإرسال الإشعار'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;