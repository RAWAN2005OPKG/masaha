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
} from "react-icons/ri";
import PageHeader from "../../components/layout/PageHeader";

const ACTIONS = [
  { id: 1, label: "انقطاع الكهرباء المفاجئ", icon: <RiFlashlightLine /> },
  { id: 2, label: "مشكلة في الشبكة", icon: <RiWifiOffLine /> },
  { id: 3, label: "صيانة طارئة", icon: <RiToolsLine /> },
  { id: 4, label: "حريق أو طارئ أمني", icon: <RiFireLine /> },
];

const EmergencyManagement = () => {
  const [closed, setClosed] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("");
  const [spaceName, setSpaceName] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [notified, setNotified] = useState(null);

  useEffect(() => {
    fetchSpaceStatus();
  }, []);

  const fetchSpaceStatus = () => {
    setLoading(true);
    axios
      .get("/api/owner/space")
      .then((res) => {
        setClosed(Boolean(res.data.is_closed || res.data.is_manual_disabled));
        setEmergencyReason(res.data.emergency_reason || "");
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

  const notify = async (action) => {
    try {
      setNotified(action.id);
      await axios.post("/api/owner/space/notify-emergency", {
        reason: action.label,
      });
      setTimeout(() => setNotified(null), 3000);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إرسال الإشعار.");
      setNotified(null);
    }
  };

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
                  ? `سبب التوقف الحالي: (${emergencyReason || "إجراء طارئ مؤقت"}). اضغط الزر أدناه لإلغاء الإيقاف وإعادة فتح المساحة للرواد فوراً.`
                  : "عند تفعيل الإغلاق الطارئ، سيتم تحويل حالة المساحة فوراً إلى مغلقة، ويتوقف استقبال الحجوزات مع إشعار كافة المستخدمين."}
              </p>
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
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-800 text-sm">إرسال إشعارات طارئة سريعة</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-bold">
                  إرسال تنبيه فوري لجميع الرواد والاستقبال بشأن أي مستجد
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {ACTIONS.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-lg">
                      {a.icon}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{a.label}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => notify(a)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      notified === a.id
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-red-50 text-red-500 hover:bg-red-100"
                    }`}
                  >
                    {notified === a.id ? (
                      <>
                        <RiCheckLine size={14} /> تم الإرسال
                      </>
                    ) : (
                      "إرسال إشعار"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmergencyManagement;