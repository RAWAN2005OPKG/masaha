import { useState, useEffect } from "react";
import axios from "axios";
import {
  RiAlertLine,
  RiFlashlightLine,
  RiWifiOffLine,
  RiToolsLine,
  RiFireLine,
  RiCheckLine,
  RiRestartLine,
  RiLoader4Line,
  RiTimeLine,
} from "react-icons/ri";
import PageHeader from "../../components/layout/PageHeader";

const ACTIONS = [
  { id: 1, label: "انقطاع الكهرباء المفاجئ", icon: <RiFlashlightLine /> },
  { id: 2, label: "مشكلة في الشبكة", icon: <RiWifiOffLine /> },
  { id: 3, label: "صيانة طارئة", icon: <RiToolsLine /> },
  { id: 4, label: "حريق أو طارئ أمني", icon: <RiFireLine /> },
];

// Format remaining time as "X ساعة Y دقيقة"
const formatRemaining = (isoString) => {
  if (!isoString) return null;
  const diff = new Date(isoString) - new Date();
  if (diff <= 0) return null;
  const totalMins = Math.floor(diff / 60000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0 && mins > 0) return `${hrs} ساعة و${mins} دقيقة`;
  if (hrs > 0) return `${hrs} ساعة`;
  return `${mins} دقيقة`;
};

const EmergencyManagement = () => {
  const [closed, setClosed] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("");
  const [emergencyUntil, setEmergencyUntil] = useState(null);
  const [spaceName, setSpaceName] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Per-action state: { actionId: { hours: '', sending: false, sent: false } }
  const [actionState, setActionState] = useState(() =>
    Object.fromEntries(ACTIONS.map((a) => [a.id, { hours: "", sending: false, sent: false }]))
  );

  useEffect(() => {
    fetchSpaceStatus();
  }, []);

  // Countdown ticker
  useEffect(() => {
    if (!emergencyUntil) return;
    const timer = setInterval(() => {
      if (new Date(emergencyUntil) <= new Date()) {
        setClosed(false);
        setEmergencyReason("");
        setEmergencyUntil(null);
        clearInterval(timer);
      }
    }, 30000); // check every 30s
    return () => clearInterval(timer);
  }, [emergencyUntil]);

  const fetchSpaceStatus = () => {
    setLoading(true);
    axios
      .get("/api/owner/space")
      .then((res) => {
        setClosed(Boolean(res.data.is_closed || res.data.is_manual_disabled));
        setEmergencyReason(res.data.emergency_reason || "");
        setEmergencyUntil(res.data.emergency_until || null);
        setSpaceName(res.data.name || "المساحة");
      })
      .catch((err) => console.error("Error fetching space status:", err))
      .finally(() => setLoading(false));
  };

  const handleToggleEmergency = async () => {
    setToggling(true);
    try {
      const payload = {
        reason: customReason.trim() || emergencyReason || "إجراء طارئ مؤقت",
      };
      const res = await axios.post("/api/owner/space/emergency-toggle", payload);
      setClosed(Boolean(res.data.is_closed));
      setEmergencyReason(res.data.emergency_reason || "");
      setEmergencyUntil(res.data.emergency_until || null);
      if (res.data.is_closed) {
        alert("تم إغلاق المساحة طارئاً وإرسال التنبيهات لكافة الرواد بنجاح.");
      } else {
        alert("تم إعادة فتح المساحة واستئناف العمل بنجاح.");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تحديث حالة المساحة.");
    } finally {
      setToggling(false);
    }
  };

  const setHours = (actionId, value) => {
    setActionState((prev) => ({
      ...prev,
      [actionId]: { ...prev[actionId], hours: value },
    }));
  };

  const notify = async (action) => {
    const state = actionState[action.id];
    const hours = parseFloat(state.hours) || null;

    setActionState((prev) => ({
      ...prev,
      [action.id]: { ...prev[action.id], sending: true },
    }));

    try {
      const res = await axios.post("/api/owner/space/notify-emergency", {
        reason: action.label,
        hours: hours || undefined,
      });

      // If the space was closed via this notification, update UI
      if (res.data.is_closed) {
        setClosed(true);
        setEmergencyReason(action.label);
        setEmergencyUntil(res.data.emergency_until || null);
      }

      setActionState((prev) => ({
        ...prev,
        [action.id]: { ...prev[action.id], sending: false, sent: true },
      }));
      setTimeout(() => {
        setActionState((prev) => ({
          ...prev,
          [action.id]: { ...prev[action.id], sent: false },
        }));
      }, 4000);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إرسال الإشعار.");
      setActionState((prev) => ({
        ...prev,
        [action.id]: { ...prev[action.id], sending: false },
      }));
    }
  };

  const remaining = formatRemaining(emergencyUntil);

  return (
    <div dir="rtl" className="space-y-6 pb-20">
      <PageHeader title="إدارة الطوارئ وحالة المساحة" icon={<RiAlertLine />} role="owner" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <RiLoader4Line className="animate-spin text-red-500" size={40} />
          <p className="font-bold text-sm">جاري جلب حالة المساحة...</p>
        </div>
      ) : (
        <>
          {/* Main Emergency Control Box */}
          <div
            className={`p-8 rounded-[32px] border space-y-5 text-center shadow-lg transition-all ${
              closed
                ? "bg-red-50/50 border-red-200"
                : "bg-white border-slate-100"
            }`}
          >
            <div
              className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${
                closed ? "bg-red-500 text-white animate-bounce" : "bg-red-50 text-red-500"
              }`}
            >
              <RiAlertLine />
            </div>

            <div>
              <h3 className="font-black text-slate-800 text-xl">
                {closed ? "المساحة متوقفة ومغلقة حالياً" : "إيقاف المساحة في حالات الطوارئ"}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mt-1 font-bold">
                {closed
                  ? `سبب التوقف الحالي: (${emergencyReason || "إجراء طارئ مؤقت"}).${remaining ? ` ستُفتح تلقائياً خلال ${remaining}.` : ""} اضغط الزر أدناه لإلغاء الإيقاف وإعادة فتح المساحة فوراً.`
                  : "عند تفعيل الإغلاق الطارئ، سيتم تحويل حالة المساحة فوراً إلى مغلقة، ويتوقف استقبال الحجوزات مع إشعار كافة المستخدمين."}
              </p>

              {/* Remaining time badge */}
              {closed && remaining && (
                <div className="mt-3 inline-flex items-center gap-2 bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-full">
                  <RiTimeLine size={14} />
                  تُفتح تلقائياً خلال: {remaining}
                </div>
              )}
            </div>

            {!closed && (
              <div className="max-w-sm mx-auto">
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="سبب التوقف (مثال: صيانة مولد الكهرباء)..."
                  className="w-full text-xs font-bold px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-red-400 text-center transition"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleEmergency}
              disabled={toggling}
              className={`mx-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition shadow-lg cursor-pointer ${
                closed
                  ? "bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-700"
                  : "bg-red-500 text-white shadow-red-500/20 hover:bg-red-600"
              }`}
            >
              {toggling ? (
                <>
                  <RiLoader4Line className="animate-spin text-lg" />
                  <span>جاري المعالجة...</span>
                </>
              ) : closed ? (
                <>
                  <RiRestartLine size={18} />
                  <span>إلغاء الإيقاف وإعادة فتح المساحة</span>
                </>
              ) : (
                <>
                  <RiAlertLine size={18} />
                  <span>إغلاق المساحة طارئاً + إشعار الرواد</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Emergency Action Notifications */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-800 text-sm">إرسال إشعارات طارئة سريعة</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-bold">
                حدد مدة التوقف (اختياري) ثم أرسل التنبيه — ستُغلق المساحة تلقائياً للمدة المحددة
              </p>
            </div>

            <div className="divide-y divide-slate-50">
              {ACTIONS.map((a) => {
                const st = actionState[a.id];
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors flex-wrap"
                  >
                    {/* Icon + Label */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-lg shrink-0">
                        {a.icon}
                      </span>
                      <span className="text-sm font-bold text-slate-700">{a.label}</span>
                    </div>

                    {/* Hours input */}
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min="0.25"
                        max="72"
                        step="0.25"
                        value={st.hours}
                        onChange={(e) => setHours(a.id, e.target.value)}
                        placeholder="ساعات"
                        className="w-20 text-center text-xs font-bold px-2 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-red-400 transition"
                      />
                      <span className="text-[10px] text-slate-400 font-bold">ساعة</span>
                    </div>

                    {/* Send button */}
                    <button
                      type="button"
                      onClick={() => notify(a)}
                      disabled={st.sending || st.sent}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        st.sent
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : st.sending
                          ? "bg-slate-100 text-slate-400"
                          : "bg-red-50 text-red-500 hover:bg-red-100"
                      }`}
                    >
                      {st.sent ? (
                        <>
                          <RiCheckLine size={14} /> تم الإرسال
                        </>
                      ) : st.sending ? (
                        <>
                          <RiLoader4Line className="animate-spin" size={14} /> جاري...
                        </>
                      ) : (
                        "إرسال إشعار"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmergencyManagement;