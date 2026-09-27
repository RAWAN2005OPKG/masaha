import { useState, useEffect } from "react";
import {
  RiTeamLine,
  RiPencilLine,
  RiCloseCircleLine,
  RiCheckboxCircleLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import PageHeader from "../../components/layout/PageHeader";
import axios from "axios";

const FIELDS = [
  { key: "name", label: "اسم الموظف", type: "text", placeholder: "مثال: أحمد خليل" },
  { key: "email", label: "البريد الإلكتروني", type: "email", placeholder: "مثال: email@space.ps" },
  { key: "password", label: "كلمة المرور", type: "password", placeholder: "أدخل كلمة المرور" },
  { key: "confirm", label: "تأكيد كلمة المرور", type: "password", placeholder: "أعد إدخال كلمة المرور" },
];

const AVATAR_COLORS = ["bg-sky-500", "bg-pink-500", "bg-amber-500", "bg-purple-500", "bg-emerald-500"];

function StaffRow({ staff, onToggle, onDelete }) {
  const isActive = staff.status === 'active';
  
  return (
    <div className="bg-white rounded-[10px] flex items-center justify-between gap-4 px-5 py-4 border-t border-slate-100  shadow-sm mb-3">
       <div className="flex items-center gap-3 flex-1 justify-start min-w-0">
        <div className="text-right min-w-0">
          <div className="flex ">
            <div
          className={`w-9 h-9 shrink-0 rounded-full ${AVATAR_COLORS[(staff.id || 0) % AVATAR_COLORS.length]} text-white flex items-center justify-center text-xs me-4 font-bold`}
        >
          {staff.name ? staff.name.trim().charAt(0) : '?'}
        </div>
          <div className="flex items-center justify-end gap-2 flex-wrap">
          <div>
           <div className="flex">
<p className="text-sm font-bold text-slate-800 truncate">{staff.name}</p>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ms-2 ${
                isActive
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-slate-50 text-slate-500 border-slate-200"
              }`}
            >
              {isActive ? "نشط" : "معطل"}
            </span>
           </div>    
              <p className="mt-1 text-[11px] text-slate-400 truncate">
            {staff.email}
          </p>
          </div>
          </div>
          </div>       
        </div>
       
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          title={isActive ? "تعطيل الموظف" : "تفعيل الموظف"}
          className={`transition ${
            isActive ? "text-amber-500 hover:text-amber-600" : "text-emerald-500 hover:text-emerald-600"
          }`}
        >
          {isActive ? <RiCloseCircleLine size={18} /> : <RiCheckboxCircleLine size={18} />}
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="حذف الموظف"
          className="text-red-400 hover:text-red-600 transition ms-2"
        >
          <RiDeleteBinLine size={18} />
        </button>
      </div>

     
    </div>
  );
}

const StaffManagement = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = () => {
    axios.get('/api/owner/staff')
      .then(res => setStaff(res.data))
      .catch(err => console.error(err));
  };

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const resetForm = () => setForm({ name: "", email: "", password: "", confirm: "" });

  const canSubmit =
    form.name.trim() &&
    form.email.trim() &&
    form.password &&
    form.password === form.confirm;

  const handleAdd = () => {
    if (!canSubmit) return;
    axios.post('/api/owner/staff', form)
      .then(res => {
        alert(res.data.message);
        fetchStaff();
        resetForm();
      })
      .catch(err => {
        alert(err.response?.data?.message || err.response?.data?.error || 'حدث خطأ أثناء الإضافة');
      });
  };

  const toggleStatus = (s) => {
    const newStatus = s.status === 'active' ? 'inactive' : 'active';
    axios.put(`/api/owner/staff/${s.id}`, {
        name: s.name,
        email: s.email,
        status: newStatus
    }).then(res => {
        fetchStaff();
    }).catch(err => alert('حدث خطأ أثناء تعديل الحالة'));
  };

  const handleDelete = (id) => {
    if(confirm('هل أنت متأكد من حذف هذا الموظف؟ لن يتمكن من تسجيل الدخول بعد الآن.')) {
        axios.delete(`/api/owner/staff/${id}`)
            .then(res => fetchStaff())
            .catch(err => console.error(err));
    }
  };

  return (
    <div dir="rtl" className="space-y-6 pb-20">
      <PageHeader title="فريق العمل" icon={<RiTeamLine />} role="owner" />

      <div className="bg-white p-8 rounded-[32px] border border-slate-100 space-y-6">
        <h3 className="font-bold text-slate-800">إضافة موظف استقبال جديد</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-xs font-bold text-slate-500">{field.label}</label>
              {field.type === "select" ? (
                <select
                  value={form[field.key]}
                  onChange={(e) => update(field.key, e.target.value)}
                  className="w-full text-right bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white transition"
                >
                  <option value="">{field.placeholder}</option>
                  {field.options && field.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full text-right bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white transition mt-2"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canSubmit}
            className={`flex-1 font-bold py-3 rounded-2xl transition ${
              canSubmit
                ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            إضافة الموظف
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-2xl"
          >
            تفريغ
          </button>
        </div>
      </div>

      <div className=" overflow-hidden">
        {staff.length ? (
          staff.map((s) => <StaffRow key={s.id} staff={s} onToggle={() => toggleStatus(s)} onDelete={() => handleDelete(s.id)} />)
        ) : (
          <p className="text-center text-xs text-slate-400 py-10">لا يوجد موظفين مسجلين حالياً.</p>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
