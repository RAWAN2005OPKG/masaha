import { 
  RiAddLine, 
  RiSubtractLine, 
  RiUploadCloud2Line, 
  RiCloseLine, 
  RiTimeLine, 
  RiCheckboxCircleFill, 
  RiLoader4Line, 
  RiImageLine,
  RiCheckLine,
  RiAlertLine
} from 'react-icons/ri';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookingModal = ({ isOpen, onClose, space }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [hours, setHours] = useState(4);
  const [selectedSeatType, setSelectedSeatType] = useState('مقعد عادي');
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const spaceName = space?.name || 'مساحة العمل';
  const regularPrice = space ? (parseFloat(space.price_regular || space.price || space.price_per_hour) || 15) : 15;
  const privatePrice = space ? (parseFloat(space.price_private) || Math.round(regularPrice * 1.5)) : Math.round(regularPrice * 1.5);
  const roomPrice = space ? (parseFloat(space.price_room) || Math.round(regularPrice * 3)) : Math.round(regularPrice * 3);

  const SEAT_OPTIONS = [
    { 
      type: 'مقعد عادي', 
      price: regularPrice, 
      desc: 'مساحة عمل مفتوحة ومجهزة',
      icon: '🪑'
    },
    { 
      type: 'مقعد خاص', 
      price: privatePrice, 
      desc: 'مكتب مخصص بهدوء وخصوصية',
      icon: '💼'
    },
    { 
      type: 'غرف خاصة', 
      price: roomPrice, 
      desc: 'غرفة مغلقة للاجتماعات وفرق العمل',
      icon: '🏢'
    },
  ];

  const currentOption = SEAT_OPTIONS.find((s) => s.type === selectedSeatType) || SEAT_OPTIONS[0];
  const currentPricePerHour = currentOption.price;
  const totalPrice = hours * currentPricePerHour;

  useEffect(() => {
    if (!isOpen) {
      setReceiptFile(null);
      setErrorMsg('');
      setSuccess(false);
      setLoading(false);
      setSelectedSeatType('مقعد عادي');
      setHours(4);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

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

    // MANDATORY RECEIPT VALIDATION
    if (!receiptFile) {
      setErrorMsg('يرجى رفع صورة إشعار التحويل/الدفع (إجباري لإتمام الحجز)');
      if (fileInputRef.current) {
        fileInputRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('space_id', space.id);
      formData.append('seat_type', selectedSeatType);
      formData.append('hours', hours);
      formData.append('receipt', receiptFile);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[36px] p-6 sm:p-8 relative shadow-2xl space-y-6 animate-in zoom-in-95 duration-300 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-slate-300 hover:text-red-500 transition cursor-pointer"
        >
          <RiCloseLine size={24} />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800">احجز مكانك في {spaceName}</h2>
          <p className="text-xs text-slate-400 font-bold mt-1">
            اختر نوع المقعد والمدة وقم برفع إشعار التحويل لتأكيد حجزك
          </p>
        </div>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <RiCheckboxCircleFill size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800">تم استلام طلب الحجز بنجاح!</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-bold">
              تم إرسال إشعار الدفع لموظف الاستقبال للمراجعة والتفعيل. جاري تحويلك لصفحة حجوزاتي...
            </p>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-2xl text-center flex items-center justify-center gap-2">
                <RiAlertLine size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Seat Type Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                <span>نوع المقعد والمساحة:</span>
                <span className="text-[11px] text-[#009689] font-black">{currentPricePerHour}₪ / ساعة</span>
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {SEAT_OPTIONS.map((opt) => {
                  const isSelected = selectedSeatType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setSelectedSeatType(opt.type)}
                      className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'border-[#009689] bg-[#009689]/10 text-slate-800 shadow-sm ring-2 ring-[#009689]/30'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-lg">{opt.icon}</span>
                        {isSelected && <RiCheckLine className="text-[#009689]" size={16} />}
                      </div>
                      <div className="mt-1">
                        <p className="font-bold text-xs leading-tight">{opt.type}</p>
                        <p className="text-[11px] font-black text-[#009689] mt-0.5">{opt.price}₪<span className="text-[9px] font-normal text-slate-400">/س</span></p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 text-right pr-1">
                {currentOption.desc}
              </p>
            </div>

            {/* 2. Hours Counter */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <RiTimeLine className="text-[#009689]" size={16} /> عدد الساعات
                </span>
                <span className="text-[11px] text-slate-400 font-bold">{hours} ساعات × {currentPricePerHour}₪ = {totalPrice}₪</span>
              </label>

              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setHours((h) => Math.min(24, h + 1))}
                  className="w-11 h-11 bg-[#009689] hover:bg-[#008577] text-white rounded-xl flex items-center justify-center shadow-md cursor-pointer transition"
                >
                  <RiAddLine size={20} />
                </button>
                <div className="text-center">
                  <span className="text-3xl font-black text-slate-800">{hours}</span>
                  <p className="text-[10px] text-[#009689] font-bold">ساعات</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHours((h) => Math.max(1, h - 1))}
                  className="w-11 h-11 bg-white border border-slate-300 hover:border-[#009689] text-slate-700 rounded-xl flex items-center justify-center shadow-xs cursor-pointer transition"
                >
                  <RiSubtractLine size={20} />
                </button>
              </div>
            </div>

            {/* 3. Mandatory Receipt Upload */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>صورة إشعار التحويل البنكي / الدفع</span>
                  <span className="text-red-500 font-black text-xs">* إجباري</span>
                </label>
                <span className="text-[11px] font-black text-[#009689]">
                  المبلغ المطلوب: {totalPrice}₪
                </span>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/70 text-right">
                <p className="text-[11px] text-emerald-900 leading-relaxed font-bold">
                  🏦 بنك فلسطين: <span className="font-mono text-xs">1234 5678 9012 0000</span>
                  <br />
                  📱 جوال باي / بال باي: <span className="font-mono text-xs">0591234567</span>
                  <br />
                  💵 يرجى تحويل مبلغ <span className="text-emerald-700 font-black underline">{totalPrice}₪</span> ورفع صورة الإشعار أدناه.
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
                className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center gap-2 group cursor-pointer transition-all text-center ${
                  receiptFile 
                    ? 'border-emerald-500 bg-emerald-50/50' 
                    : errorMsg && !receiptFile 
                    ? 'border-red-400 bg-red-50/40 hover:bg-red-50/60' 
                    : 'border-[#009689]/40 bg-slate-50 hover:bg-white hover:border-[#009689]'
                }`}
              >
                {receiptFile ? (
                  <div className="flex flex-col items-center gap-1 text-emerald-700 font-bold text-xs py-1">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-1">
                      <RiCheckboxCircleFill size={24} />
                    </div>
                    <span className="font-black text-sm">تم إرفاق الإشعار بنجاح:</span>
                    <span className="text-slate-600 font-mono text-[11px] truncate max-w-xs">{receiptFile.name}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">اضغط لتغيير الصورة إن أردت</span>
                  </div>
                ) : (
                  <>
                    <div className="w-11 h-11 bg-[#009689]/10 text-[#009689] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <RiUploadCloud2Line size={24} />
                    </div>
                    <p className="text-xs font-black text-slate-700">
                      اضغط هنا لرفع صورة إشعار التحويل <span className="text-red-500">*</span>
                    </p>
                    <span className="text-[10px] text-slate-400">
                      صورة واضحة للتحويل (PNG, JPG, WEBP أو PDF) بحد أقصى 10MB
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 4. Booking Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl text-[11px] space-y-1.5 border border-slate-100">
              <div className="flex justify-between font-bold text-slate-500">
                <span>المساحة:</span>
                <span className="text-slate-700">{spaceName}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-500">
                <span>نوع الحجز:</span>
                <span className="text-slate-700">{selectedSeatType} ({currentPricePerHour}₪/ساعة)</span>
              </div>
              <div className="flex justify-between font-bold text-slate-500">
                <span>المدة:</span>
                <span className="text-slate-700">{hours} ساعات</span>
              </div>
              <div className="flex justify-between font-bold text-slate-500">
                <span>إشعار الدفع:</span>
                <span className={receiptFile ? 'text-emerald-600' : 'text-red-500'}>
                  {receiptFile ? 'تم الرفع ✓' : 'لم يتم الرفع بعد ✗'}
                </span>
              </div>
              <div className="flex justify-between font-black text-slate-800 pt-2 border-t border-slate-200 mt-1">
                <span className="text-sm">المبلغ الإجمالي للدفع:</span>
                <span className="text-[#009689] text-lg">{totalPrice}₪</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full font-black py-4 rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition ${
                loading 
                  ? 'bg-slate-400 text-white cursor-not-allowed' 
                  : 'bg-[#009689] hover:bg-[#008577] text-white shadow-[#009689]/25 hover:scale-[1.01]'
              }`}
            >
              {loading ? (
                <>
                  <RiLoader4Line className="animate-spin text-xl" />
                  <span>جاري إرسال طلب الحجز والإشعار...</span>
                </>
              ) : (
                'تأكيد الحجز ورفع الإشعار'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
