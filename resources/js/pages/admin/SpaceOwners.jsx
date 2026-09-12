import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  RiUserAddLine,
  RiShieldUserLine,
  RiCalendarLine,
  RiEdit2Line,
  RiCloseCircleLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiBuildingLine,
  RiArrowRightLine,
  RiDeleteBinLine,
} from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';

const statusStyles = {
  'نشط': 'bg-emerald-50 text-emerald-500',
  'معطل': 'bg-red-50 text-red-400',
  'منتهي الاشتراك': 'bg-amber-50 text-amber-500',
};

const processAccount = (acc) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const end = acc.endDate ? new Date(acc.endDate) : new Date();
    end.setHours(0,0,0,0);
    
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let status = 'نشط';
    let remainingDays = 0;
    let expiredNotice = false;

    if (diffDays <= 0) {
        status = 'منتهي الاشتراك';
        expiredNotice = true;
    } else {
        remainingDays = diffDays;
        if (acc.isManualDisabled) {
            status = 'معطل';
        } else {
            status = 'نشط';
        }
    }
    
    const formatDate = (dateStr) => {
       if (!dateStr) return '';
       const d = new Date(dateStr);
       return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
    };

    return {
        ...acc,
        remainingDays,
        status,
        expiredNotice,
        dateRange: `${formatDate(acc.startDate)} – ${formatDate(acc.endDate)}`
    };
};

const SpaceOwners = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', spaceName: '', phone: '', region: 'غزة',
    internet: '', seats: '', electricity: '', pricePerHour: '', services: '', startDate: '', duration: 3
  });

  const fetchOwners = () => {
    window.axios.get('/api/admin/owners')
      .then(res => setAccounts(res.data.map(processAccount)))
      .catch(err => console.error(err));
  };

  useEffect(() => {
     fetchOwners();
  }, []);

  const handleEditClick = (id) => {
    window.axios.get(`/api/admin/owners/${id}`)
      .then(res => {
        setFormData({
          name: res.data.name || '',
          email: res.data.email || '',
          password: '',
          spaceName: res.data.spaceName || '',
          phone: res.data.phone || '',
          region: res.data.region || 'غزة',
          internet: res.data.internet || '',
          seats: res.data.seats || '',
          electricity: res.data.electricity || '',
          pricePerHour: res.data.pricePerHour || '',
          services: res.data.services || '',
          startDate: res.data.startDate || '',
          duration: res.data.duration || 3
        });
        setEditingId(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(err => console.error(err));
  };

  const handleSubmit = () => {
    // If startDate is empty, use today's date
    const payload = { ...formData };
    if (!payload.startDate) {
       payload.startDate = new Date().toISOString().split('T')[0];
    }
    if (!payload.seats) payload.seats = 0;
    if (!payload.pricePerHour) payload.pricePerHour = 0;

    if (editingId) {
      window.axios.put(`/api/admin/owners/${editingId}`, payload)
        .then(res => {
           fetchOwners();
           cancelEdit();
           alert('تم حفظ التعديلات بنجاح');
        })
        .catch(err => {
           console.error(err);
           const errorMsg = err.response?.data?.message || err.response?.data?.error || 'حدث خطأ أثناء الحفظ';
           alert('حدث خطأ: ' + errorMsg);
        });
    } else {
      window.axios.post('/api/admin/owners', payload)
        .then(res => {
           fetchOwners(); // Refresh table
           cancelEdit();
           alert(res.data.message);
        })
        .catch(err => {
           console.error(err);
           const errorMsg = err.response?.data?.message || err.response?.data?.error || 'تأكد من تعبئة جميع الحقول المطلوبة بشكل صحيح.';
           alert('حدث خطأ: ' + errorMsg);
        });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', spaceName: '', phone: '', region: 'غزة', internet: '', seats: '', electricity: '', pricePerHour: '', services: '', startDate: '', duration: 3 });
  };

  const toggleStatus = (id) => {
    window.axios.put(`/api/admin/owners/${id}/toggle-status`)
      .then(() => {
        setAccounts((prev) =>
          prev.map((acc) => {
            if (acc.id === id) {
                if (acc.status === 'منتهي الاشتراك') return acc;
                const newIsManualDisabled = !acc.isManualDisabled;
                return processAccount({ ...acc, isManualDisabled: newIsManualDisabled });
            }
            return acc;
          })
        );
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    if(window.confirm('هل أنت متأكد أنك تريد حذف حساب صاحب المساحة هذا؟ لا يمكن التراجع عن هذا الإجراء.')) {
      window.axios.delete(`/api/admin/owners/${id}`)
        .then(() => {
          setAccounts(prev => prev.filter(a => a.id !== id));
        })
        .catch(err => console.error(err));
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="حسابات أصحاب المساحات"
        icon={<RiUserAddLine />}
        role="admin"
        roleIcon={<RiShieldUserLine size={20} />}
      />

      <div className="relative bg-white rounded-[45px] border border-slate-100 p-10 shadow-sm space-y-8">
        <div className="flex items-center">
          <RiUserAddLine size={24} className="text-violet-600 me-4" />
          <h3 className="text-slate-800 font-black text-xl">
            {editingId ? 'تعديل حساب صاحب المساحة' : 'حساب صاحب مساحة جديد'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-widest">الاسم الكامل</label>
            <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="محمد الغزاوي" className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-widest">البريد الإلكتروني</label>
            <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} placeholder="owner@masaha.ps" className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-widest">
              كلمة المرور {editingId && '(اتركه فارغاً لعدم التغيير)'}
            </label>
            <input type="password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} placeholder="أدخل كلمة المرور" className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-widest">اسم المساحة</label>
            <input type="text" value={formData.spaceName} onChange={e=>setFormData({...formData, spaceName: e.target.value})} placeholder="مساحة الإبداع" className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" />
          </div>
            <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-widest">رقم الهاتف</label>
            <input type="tel" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} placeholder="059-000-0000" className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-widest">المنطقة</label>
            <select value={formData.region} onChange={e=>setFormData({...formData, region: e.target.value})} className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold outline-none">
              <option>غزة</option>
              <option>الوسطى</option>
              <option>الجنوب</option>
            </select>
          </div>
        
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-widest">سرعة الإنترنت</label>
            <input type="text" value={formData.internet} onChange={e=>setFormData({...formData, internet: e.target.value})} placeholder="100 Mbps" className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-widest">إجمالي المقاعد</label>
            <input type="number" value={formData.seats} onChange={e=>setFormData({...formData, seats: e.target.value})} placeholder="40" className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" />
          </div>
        
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-widest">الكهرباء</label>
            <input type="text" value={formData.electricity} onChange={e=>setFormData({...formData, electricity: e.target.value})} placeholder="24/7" className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-widest">السعر/ساعة (₪)</label>
            <input type="number" value={formData.pricePerHour} onChange={e=>setFormData({...formData, pricePerHour: e.target.value})} placeholder="15" className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-widest">الخدمات (مفصولة بفاصلة عربية ،)</label>
          <textarea rows="3" value={formData.services} onChange={e=>setFormData({...formData, services: e.target.value})} placeholder="قهوة مجانية، طباعة، قاعة اجتماعات" className="w-full bg-slate-50 border border-slate-50 rounded-3xl py-4 px-6 text-sm font-bold"></textarea>
        </div>

        {/* Subscription Duration */}
        <div className="bg-violet-50/40 border border-violet-100 rounded-[32px] p-6 space-y-4">
          <h3 className="text-violet-600 font-black text-xl flex items-center gap-2"><RiCalendarLine />مدة الاشتراك </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-widest">تاريخ بداية الاشتراك</label>
              <input type="date" value={formData.startDate} onChange={e=>setFormData({...formData, startDate: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase pr-2 tracking-widest">مدة الاشتراك</label>
              <select value={formData.duration} onChange={e=>setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full bg-white border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none">
                <option value={3}>3 أشهر</option>
                <option value={1}>1 شهر</option>
                <option value={6}>6 أشهر</option>
                <option value={12}>12 شهر</option>
              </select>
            </div>
          
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={handleSubmit} className="bg-violet-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-violet-500/20 hover:bg-violet-700 transition-all">
            {editingId ? 'حفظ التعديلات' : 'إنشاء الحساب'}
          </button>
          <button onClick={cancelEdit} className="bg-white text-slate-500 px-8 py-3.5 rounded-2xl font-black border border-slate-100 hover:bg-slate-50 transition-all">إلغاء</button>
        </div>
      </div>

      <div className="space-y-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-4">
           
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 ${acc.avatarColor} rounded-2xl flex items-center justify-center text-white font-bold`}>
                  {acc.initial}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end flex-wrap">
                    <h3 className="font-black text-slate-800">{acc.name}</h3>
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-black ${statusStyles[acc.status]}`}>{acc.status}</span>
                    {acc.remainingDays > 0 && (
                      <span className="bg-teal-50 text-teal-600 px-3 py-0.5 rounded-full text-[10px] font-black">متبقي {acc.remainingDays} يوم</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-bold">{acc.email}</p>
                </div>
              </div>

                 <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatus(acc.id)}
                  disabled={acc.status === 'منتهي الاشتراك'}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                    acc.status === 'نشط'
                      ? 'border-red-100 text-red-400 hover:bg-red-50'
                      : acc.status === 'منتهي الاشتراك' 
                      ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                      : 'border-emerald-100 text-emerald-500 hover:bg-emerald-50'
                  }`}
                >
                  {acc.status === 'نشط' ? <RiCloseCircleLine size={18} /> : <RiCheckboxCircleLine size={18} />}
                </button>
                <button 
                  onClick={() => handleEditClick(acc.id)}
                  className="w-9 h-9 rounded-xl border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-violet-50 hover:text-violet-600 transition-all">
                  <RiEdit2Line size={16} />
                </button>
                <button 
                  onClick={() => {
                    if(window.confirm('هل أنت متأكد أنك تريد حذف حساب صاحب المساحة هذا؟ لا يمكن التراجع عن هذا الإجراء.')) {
                      setAccounts(prev => prev.filter(a => a.id !== acc.id));
                    }
                  }}
                  className="w-9 h-9 rounded-xl border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                  <RiDeleteBinLine size={16} />
                </button>
              </div>

            </div>

            <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 justify-end">
              <RiBuildingLine className="text-slate-300" /> مساحة {acc.spaces}
              <span className="text-slate-200">•</span>
              <RiCalendarLine className="text-slate-300" /> {acc.dateRange}
              <span className="text-slate-200">•</span>
              <span className="text-emerald-500 font-black">{acc.price}₪</span>
            </p>

            {acc.expiredNotice && (
              <p className="text-[11px] text-amber-500 font-bold flex items-center gap-1.5 justify-end bg-amber-50/50 rounded-xl px-3 py-2">
                <RiAlertLine /> تم إيقاف الحساب تلقائيًا بعد انتهاء الاشتراك
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpaceOwners;
