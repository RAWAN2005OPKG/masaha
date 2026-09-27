import { useState, useEffect } from "react";
import axios from "axios";
import { RiPriceTag3Line, RiDeleteBin6Line, RiLoader4Line } from "react-icons/ri";
import PageHeader from "../../components/layout/PageHeader";

const STATUS = {
  active: { label: "نشط", cls: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  expired: { label: "منتهي", cls: "bg-slate-50 text-slate-500 border-slate-200" },
};

function OfferCard({ offer, onDelete }) {
  const st = STATUS[offer.status] || STATUS.active;
  const pct = offer.limit ? Math.min(100, Math.round((offer.used / offer.limit) * 100)) : 0;

  return (
    <div className="bg-white rounded-2xl border border-amber-500 shadow-md p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="text-right min-w-0">
          <p className="mt-1 text-sm font-bold text-slate-800">{offer.title}</p>
          <div className="flex items-center justify-start mt-3 gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500">
              {offer.code}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${st.cls}`}>
              {st.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => onDelete(offer.id)}
              className="text-slate-300 hover:text-red-500 transition p-1"
              title="حذف العرض"
            >
              <RiDeleteBin6Line size={16} />
            </button>
          )}
          <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-alt)] text-white text-xs font-black shrink-0">
            -{offer.discount}%
          </span>
        </div>
      </div>

      <div>
        <span className="text-[11px] text-slate-400">ينتهي بتاريخ {offer.expiry}</span>
      </div>

      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden" dir="ltr">
        <div
          className="h-full rounded-full bg-[var(--accent-alt)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>
          استخدام {offer.used || 0}/{offer.limit || 100}
        </span>
      </div>
    </div>
  );
}

const OffersManagement = () => {
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("");
  const [code, setCode] = useState("");
  const [expiry, setExpiry] = useState("");
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = () => {
    setLoading(true);
    axios.get('/api/owner/offers')
      .then(res => {
        if (Array.isArray(res.data)) {
          setOffers(res.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setTitle("");
    setDiscount("");
    setCode("");
    setExpiry("");
  };

  const canSubmit = title.trim() && discount && code.trim() && expiry && !submitting;

  const handleLaunch = () => {
    if (!canSubmit) return;
    setSubmitting(true);

    axios.post('/api/owner/offers', {
      title,
      code: code.toUpperCase().trim(),
      discount: Number(discount) || 0,
      expiry,
    })
      .then(res => {
        if (res.data.offer) {
          setOffers(prev => [res.data.offer, ...prev]);
        } else {
          fetchOffers();
        }
        resetForm();
        alert('تم إطلاق العرض بنجاح وإشعار المستخدمين!');
      })
      .catch(err => {
        console.error(err);
        alert(err.response?.data?.message || 'حدث خطأ أثناء إضافة العرض');
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا العرض؟')) return;
    axios.delete(`/api/owner/offers/${id}`)
      .then(() => {
        setOffers(prev => prev.filter(o => o.id !== id));
      })
      .catch(err => console.error(err));
  };

  return (
    <div dir="rtl" className="space-y-6 pb-20">
      <PageHeader title="العروض والخصومات" icon={<RiPriceTag3Line />} role="owner" />

      <div className="bg-white p-8 border border-amber-500 rounded-[32px] space-y-6">
        <h3 className="font-bold text-slate-800">إطلاق خصم جديد</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">عنوان العرض</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان العرض"
              className="w-full text-right bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">نسبة الخصم %</label>
            <input
              type="number"
              min="1"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="أدخل نسبة الخصم %"
              className="w-full text-right bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white transition"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">كود الخصم</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="أدخل كود الخصم مثل: SAVE20"
              className="w-full text-right bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white transition uppercase"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">تاريخ الانتهاء</label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full text-right bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white transition"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleLaunch}
            disabled={!canSubmit}
            className={`flex-1 font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2 ${
              canSubmit
                ? "bg-[var(--accent-alt)] text-white shadow-lg shadow-[var(--primary)]/20"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {submitting && <RiLoader4Line className="animate-spin" />}
            إطلاق العرض
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-2xl"
          >
            إلغاء
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
            <RiLoader4Line className="animate-spin text-amber-500" size={24} />
            <span className="text-xs font-bold">جاري تحميل العروض...</span>
          </div>
        ) : offers.length ? (
          offers.map((o) => (
            <OfferCard key={o.id} offer={o} onDelete={handleDelete} />
          ))
        ) : (
          <p className="text-center text-xs text-slate-400 py-10 font-bold">لا توجد عروض حالياً</p>
        )}
      </div>
    </div>
  );
};

export default OffersManagement;