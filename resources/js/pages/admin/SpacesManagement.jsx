import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  RiBuildingLine, 
  RiEdit2Line, 
  RiShieldUserLine, 
  RiArrowRightLine, 
  RiSave3Line,
  RiLoader4Line
} from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';

export const SpacesManagement = () => {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSpaces = () => {
    setLoading(true);
    axios.get('/api/admin/spaces')
      .then(res => {
        setSpaces(res.data);
      })
      .catch(err => {
        console.error('Error fetching admin spaces:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const toggleStatus = (id) => {
    axios.put(`/api/admin/spaces/${id}/toggle-status`)
      .then(res => {
        setSpaces(prev => prev.map(s => {
          if (s.id === id) {
            const newDisabled = res.data.is_manual_disabled;
            return {
              ...s,
              is_manual_disabled: newDisabled,
              status: newDisabled ? 'معطلة' : 'مفتوحة'
            };
          }
          return s;
        }));
      })
      .catch(err => {
        console.error('Error toggling space status:', err);
        alert('حدث خطأ أثناء تغيير حالة المساحة');
      });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المساحات"
        icon={<RiBuildingLine />}
        role="admin"
        roleIcon={<RiShieldUserLine size={20} />}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <RiLoader4Line className="animate-spin text-[#009689]" size={36} />
          <p className="font-bold text-sm">جاري تحميل بيانات المساحات من قاعدة البيانات...</p>
        </div>
      ) : spaces.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100 shadow-sm space-y-3">
          <p className="text-lg font-bold text-slate-700">لا توجد مساحات مسجلة حالياً</p>
          <p className="text-xs text-slate-400 font-medium">يمكن إضافة أصحاب مساحات ومساحات جديدة من صفحة أصحاب المساحات.</p>
        </div>
      ) : (
        spaces.map((item) => {
          const isClosed = item.is_manual_disabled || item.status === 'معطلة';
          const statusClass = item.status === 'معطلة'
            ? 'bg-red-50 text-red-500'
            : item.status === 'منتهي الاشتراك'
            ? 'bg-amber-50 text-amber-500'
            : 'bg-emerald-50 text-emerald-500';

          const total = item.total || item.seats || 30;
          // Kept as is per user instructions (occupancy rate untouched)
          const occupied = item.occupied !== undefined ? item.occupied : Math.round(total * 0.7);
          const occupancyPercent = total > 0 ? Math.round((occupied / total) * 100) : 70;

          return (
            <div key={item.id} className="bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col md:flex-row gap-8 shadow-sm">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-800">{item.name}</h2>
                      <div className="flex gap-2 items-center mb-1">
                        <span className={`${statusClass} text-[13px] font-bold px-3 py-0.5 rounded-full`}>
                          {item.status}
                        </span>
                        <span className="bg-violet-50 text-violet-500 text-[13px] font-bold px-3 py-0.5 rounded-full">
                          {item.category || item.region}
                        </span>
                      </div>
                    </div>

                    <p className="text-[13px] text-slate-400 font-bold">
                      {item.seats} مقعد • {item.speed} Mbps • {item.power || 'مولد احتياطي'}
                    </p>
                    
                    <div className="flex gap-2 items-center flex-wrap mt-2">
                      {item.amenities && item.amenities.map((a, idx) => (
                        <span key={idx} className="bg-slate-50 text-slate-500 text-[13px] font-bold px-3 py-0.5 rounded-full border border-slate-100">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/admin-dashboard/spaces/edit/${item.id}`)}
                      title="تعديل المساحة"
                      className="w-10 h-10 text-slate-400 flex items-center justify-center hover:text-violet-600 transition-all cursor-pointer rounded-xl hover:bg-slate-50"
                    >
                      <RiEdit2Line size={18} />
                    </button>
                    <p className="text-lg font-black text-[#009689] whitespace-nowrap">
                      {item.price}₪ <small className="text-slate-400 font-normal">/ساعة</small>
                    </p>
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 border whitespace-nowrap cursor-pointer transition-colors ${
                        isClosed 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                          : 'bg-red-50 text-red-500 border-red-50 hover:bg-red-100'
                      }`}
                    >
                      {isClosed ? 'تفعيل' : 'ايقاف'}
                    </button>
                  </div>
                </div>

                {/* Occupancy Indicator (Kept as is per user instructions) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[13px] font-black text-slate-400 uppercase tracking-tighter">
                    <span>الإشغال</span>
                    <span>{occupied}/{total}</span>
                  </div>
                  <div dir="ltr" className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div
                      className="bg-[#009689] h-full rounded-full transition-all"
                      style={{ width: `${occupancyPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default SpacesManagement;

export const EditSpace = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'غزة',
    price: 0,
    seats: 0,
    speed: 0,
    power: 'مولد احتياطي',
    amenities: '',
    status: 'مفتوحة'
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`/api/admin/spaces/${id}`)
      .then(res => {
        setFormData({
          name: res.data.name || '',
          category: res.data.category || res.data.region || 'غزة',
          price: res.data.price || 0,
          seats: res.data.seats || 0,
          speed: res.data.speed || 0,
          power: res.data.power || 'مولد احتياطي',
          amenities: res.data.amenities || '',
          status: res.data.status || 'مفتوحة'
        });
      })
      .catch(err => {
        console.error('Error fetching space details:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setSaving(true);
    axios.put(`/api/admin/spaces/${id}`, formData)
      .then(res => {
        alert(res.data.message || 'تم حفظ التعديلات بنجاح');
        navigate('/admin-dashboard/spaces');
      })
      .catch(err => {
        console.error('Error saving space:', err);
        const errorMsg = err.response?.data?.message || 'حدث خطأ أثناء حفظ التعديلات';
        alert('حدث خطأ: ' + errorMsg);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-3">
        <RiLoader4Line className="animate-spin text-[#009689]" size={40} />
        <p className="font-bold text-sm">جاري تحميل بيانات المساحة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="إدارة المساحات"
        icon={<RiBuildingLine />}
        role="admin"
        roleIcon={<RiShieldUserLine size={20} />}
      />

      <div className="w-full p-2">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate('/admin-dashboard/spaces')} 
            className="flex items-center gap-2 text-slate-400 font-bold hover:text-violet-600 transition-colors cursor-pointer"
          >
            إدارة المساحات <RiArrowRightLine />
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-l from-[#009689] to-[#005F5A] text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'} <RiSave3Line />
          </button>
        </div>
      </div>

      <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[32px] overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-8">
          <h1 className="text-3xl font-black text-white">{formData.name || 'مساحة العمل'}</h1>
          <p className="text-emerald-400 font-bold text-sm">{formData.category} • {formData.price}₪/ساعة</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 p-8 md:p-10 shadow-sm space-y-8">
        <h3 className="text-violet-600 font-black text-lg flex items-center gap-2 underline decoration-violet-100 underline-offset-8">
          <RiEdit2Line /> تعديل بيانات المساحة 
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-2">
            <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">اسم المساحة</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">المنطقة</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all"
            >
              <option value="غزة">غزة</option>
              <option value="الشمال">الشمال</option>
              <option value="الوسطى">الوسطى</option>
              <option value="الجنوب">الجنوب</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">السعر/ساعة (₪)</label>
            <input 
              type="number" 
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">إجمالي المقاعد</label>
            <input 
              type="number" 
              name="seats"
              value={formData.seats}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">سرعة الإنترنت (Mbps)</label>
            <input 
              type="number" 
              name="speed"
              value={formData.speed}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">الكهرباء</label>
            <select 
              name="power"
              value={formData.power}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all"
            >
              <option value="24/7">24/7</option>
              <option value="مولد احتياطي">مولد احتياطي</option>
              <option value="كهرباء دائمة">كهرباء دائمة</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">الخدمات المتوفرة (مفصولة بفاصلة عربية ،)</label>
          <textarea 
            rows="3" 
            name="amenities"
            value={formData.amenities}
            onChange={handleInputChange}
            placeholder="قهوة مجانية، طباعة، خزانة، قاعة اجتماعات"
            className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">حالة المساحة</label>
          <select 
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all"
          >
            <option value="مفتوحة">مفتوحة</option>
            <option value="معطلة">معطلة</option>
            <option value="قيد الصيانة">قيد الصيانة</option>
          </select>
        </div>

        <p 
          className="text-[15px] text-slate-400 font-bold underline cursor-pointer hover:text-red-400 transition-colors text-start"
          onClick={() => navigate('/admin-dashboard/spaces')}
        >
          إلغاء التعديل
        </p>
      </div>
    </div>
  );
};
