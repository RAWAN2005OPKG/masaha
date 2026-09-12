import { useNavigate, useParams } from 'react-router-dom';
import { RiBuildingLine, RiEdit2Line, RiShieldUserLine, RiArrowRightLine, RiSave3Line } from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';
import { useState } from 'react';

const spaces = [
  {
    id: 1,
    status: 'مفتوحة',
    category: 'الوسطى', 
    name: 'مساحة الإبداع',
    seats: 30,
    speed: 150,
    power: 'مولد احتياطي',
    amenities: ['غرف هادئة', 'شاشات عرض', 'واي فاي فائق'],
    price: 12,
    occupied: 22,
    total: 30,
  },
  {
    id: 2,
    status: 'مفتوحة',
    category: 'الجنوب',
    name: 'مساحة الريادة',
    seats: 25,
    speed: 200,
    power: 'مولد احتياطي',
    amenities: ['قاعة اجتماعات', 'قهوة مجانية', 'طباعة'],
    price: 18,
    occupied: 10,
    total: 25,
  },
  {
    id: 3,
    status: 'مفتوحة',
    category: 'الوسطى',
    name: 'مساحة التطوير',
    seats: 20,
    speed: 100,
    power: 'كهرباء دائمة',
    amenities: ['واي فاي فائق', 'خزانة'],
    price: 10,
    occupied: 8,
    total: 20,
  },
  {
    id: 4,
    status: 'معطلة',
    category: 'الشمال',
    name: 'مساحة الابداع',
    seats: 40,
    speed: 100,
    power: 'مولد احتياطي',
    amenities: ['غرف هادئة'],
    price: 8,
    occupied: 0,
    total: 40,
  },
];

export const SpacesManagement = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المساحات"
        icon={<RiBuildingLine />}
        role="admin"
        roleIcon={<RiShieldUserLine size={20} />}
      />

      {spaces.map((item) => (
        <div key={item.id} className="bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col md:flex-row gap-8 shadow-sm">
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex gap-2 items-center mb-1">
                  <span className="bg-emerald-50 text-emerald-500 text-[13px] font-bold px-3 py-0.5 rounded-full">{item.status}</span>
                  <span className="bg-violet-50 text-violet-500 text-[13px] font-bold px-3 py-0.5 rounded-full">{item.category}</span>
                </div>
                <h2 className="text-xl font-black text-slate-800">{item.name}</h2>
                <p className="text-[13px] text-slate-400 font-bold">{item.seats} مقعد • {item.speed} Mbps • {item.power}</p>
                <div className="flex gap-2 items-center flex-wrap mt-2">
                  {item.amenities.map((a, idx) => (
                    <span key={idx} className="bg-slate-50 text-slate-500 text-[13px] font-bold px-3 py-0.5 rounded-full border border-slate-100">{a}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                    <button
                    onClick={() => navigate(`/admin/spaces/edit/${item.id}`)}
                    className="w-10 h-10  text-slate-400 flex items-center justify-center hover:text-violet-600 transition-all cursor-pointer"
                  >
                    <RiEdit2Line size={18} />
                  </button>
                  <p className="text-lg font-black text-brand-600 whitespace-nowrap">{item.price}₪ <small className="text-slate-400 font-normal">/ساعة</small></p>
                
                </div>
                <button className="bg-red-50 text-red-400 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 border border-red-50 whitespace-nowrap">
                  ايقاف 
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[13px] font-black text-slate-400 uppercase tracking-tighter">
                <span>الإشغال</span>
                <span>{item.occupied}/{item.total}</span>
              </div>
              <div dir="ltr" className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div
                  className="bg-brand-500 h-full rounded-full"
                  style={{ width: `${(item.occupied / item.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpacesManagement;

 export const EditSpace = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const space = spaces.find(s => s.id === parseInt(id));
  
  const [formData, setFormData] = useState({
    name: space?.name || '',
    category: space?.category || 'غزة',
    price: space?.price || 0,
    seats: space?.seats || 0,
    speed: space?.speed || 0,
    power: space?.power || 'مولد احتياطي',
    amenities: space?.amenities?.join('، ') || '',
    status: space?.status || 'مفتوحة'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving space data:', formData);
    navigate('/admin/spaces');
  };

  if (!space) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">المساحة غير موجودة</p>
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

      <div className="w-full p-6">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate('/admin/spaces')} 
            className="flex items-center gap-2 text-slate-400 font-bold hover:text-violet-600 transition-colors"
          >
          إدارة المساحات    <RiArrowRightLine />
          </button>
          <button 
            onClick={handleSave}
            className="bg-gradient-to-l from-[#009689] to-[#005F5A] text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            حفظ التعديلات <RiSave3Line />
          </button>
        </div>
      </div>

      <div className="relative h-60 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-10">
          <h1 className="text-3xl font-black text-white">{space.name}</h1>
          <p className="text-emerald-400 font-bold text-sm">{space.category} • {space.price}₪/ساعة</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 p-10 shadow-sm space-y-8">
        <h3 className="text-violet-600 font-black text-lg flex items-center gap-2 underline decoration-violet-100 underline-offset-8">
         <RiEdit2Line />  تعديل بيانات المساحة 
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-2">
            <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">اسم المساحة</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">المنطقة</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all"
            >
              <option>غزة</option>
              <option>الشمال</option>
              <option>الوسطى</option>
              <option>الجنوب</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">السعر/ساعة (₪)</label>
            <input 
              type="number" 
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">إجمالي المقاعد</label>
            <input 
              type="number" 
              name="seats"
              value={formData.seats}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">سرعة الإنترنت (Mbps)</label>
            <input 
              type="number" 
              name="speed"
              value={formData.speed}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">الكهرباء</label>
            <select 
              name="power"
              value={formData.power}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all"
            >
              <option>24/7</option>
              <option>مولد احتياطي</option>
              <option>كهرباء دائمة</option>
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
            className="w-full bg-slate-50 border border-slate-50 rounded-3xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-black text-slate-400 uppercase pr-2 tracking-widest">حالة المساحة</label>
          <select 
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all"
          >
            <option>مفتوحة</option>
            <option>معطلة</option>
            <option>قيد الصيانة</option>
          </select>
        </div>

        <p 
          className="text-[15px] text-center text-slate-400 font-bold underline cursor-pointer hover:text-red-400 transition-colors text-start"
          onClick={() => navigate('/admin/spaces')}
        >
          إلغاء التعديل
        </p>
      </div>
    </div>
  );
};

