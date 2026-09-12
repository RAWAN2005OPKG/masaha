import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RiMapPinLine, RiLayoutGridLine, RiStarFill , RiHome4Fill,RiHeartFill } from 'react-icons/ri';

const UserHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'جاري التحميل...', email: '' });
  const [spaces, setSpaces] = useState([]);

  useEffect(() => {
    axios.get('/api/user')
      .then(res => {
        setUser({ name: res.data.name, email: res.data.email });
      })
      .catch(err => console.error(err));

    axios.get('/api/spaces')
      .then(res => setSpaces(res.data))
      .catch(err => console.error(err));
  }, []);

  const toggleFavorite = (id) => {
    axios.post(`/api/spaces/${id}/favorite`)
      .then(res => {
        setSpaces(prev => prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
        navigate('/dashboard/profile'); // Redirect to profile to see favorites as requested
      })
      .catch(err => console.error(err));
  };

  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const categories = ['الكل', 'غزة', 'الوسطى', 'الجنوب'];

  const displayedSpaces = spaces.filter(space => 
    selectedCategory === 'الكل' || space.region === selectedCategory
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
        <header className="flex justify-between items-center mb-8 px-2">
        <h1 className="text-xl font-black text-slate-800">الرئيسية</h1>
        <div className="w-10 h-10 bg-[#009689] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#009689]/20">
          <RiHome4Fill size={20} />
        </div>
      </header>
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--primary)] via-[#3AAFA6] to-[var(--primary-hover)] rounded-[32px] p-8 md:p-12 text-white">
        <div className="relative z-10 space-y-2">
          <p className="text-res-p opacity-90 text-[var(--secondary-color)]">مرحباً بعودتك 👋</p>
          <h1 className="text-3xl md:text-4xl font-black">{user.name}</h1>
          <p className="text-sm opacity-80">{user.email}</p>
          <div className="pt-4 flex items-center gap-2">
            <span className="bg-white backdrop-blur-md px-4 py-1.5 rounded-full border border-[var(--secondary-color)] text-xs font-bold text-[var(--secondary-color)] ">
               لديك حجز نشط اليوم
            </span>
          </div>
        </div>
        
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      </section>

      {/* Filter Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setSelectedCategory(cat)}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-[#009689] text-white shadow-lg shadow-[#009689]/30' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[#0F172B]">
            <RiLayoutGridLine className="text-[#009689]" /> الأكثر استخداماً
          </h2>
          <button 
            onClick={() => setSelectedCategory('الكل')}
            className="bg-[#009689] hover:bg-[#0D9488] text-white text-xs font-bold px-5 py-2 rounded-xl transition-all">
            عرض كل المساحات
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
       {displayedSpaces.length === 0 ? (
         <p className="text-slate-400 font-bold text-sm">لا يوجد مساحات متاحة في هذه المنطقة حالياً.</p>
       ) : displayedSpaces.map((space) => (
  <div
    key={space.id}
    dir="rtl"
    className="group bg-white rounded-[24px] border border-slate-100 p-2 shadow-sm hover:shadow-xl transition-all duration-500"
  >
   
    <div className="relative h-40 bg-gradient-to-br from-[#009689] to-[#005F5A] rounded-[20px] overflow-hidden">
      
     
      <button
        onClick={() => toggleFavorite(space.id)}
        className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors"
        aria-label="إضافة إلى المفضلة"
      >
        <RiHeartFill
          className={space.isFavorite ? "text-pink-500" : "text-white/70"}
        />
      </button>

     
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] text-white font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {space.available ? 'متاح' : 'مغلق'}
      </div>

   
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-md text-white text-[10px]">
        <RiStarFill className="text-warning" /> {space.rating}
      </div>
    </div>

    <div className="p-4 space-y-4">
      
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-slate-800 group-hover:text-[#009689] transition-colors">
          {space.name}
        </h3>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[#009689] font-black text-xl leading-none">
            {space.price}₪
          </span>
          <span className="text-[9px] text-slate-400 font-bold">/ساعة</span>
        </div>
      </div>

      
      <p className="text-[10px] text-slate-400 flex items-center gap-1 -mt-2">
        <RiMapPinLine /> {space.region}
      </p>

      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
         <button className="text-[11px] font-bold text-[#009689] hover:underline flex items-center gap-1">
          التفاصيل ←
        </button>
        <span className="text-[10px] text-slate-400 font-medium">
          {space.seats} مقعد • {space.speed} 
        </span>
      </div>
    </div>
  </div>
))}
        </div>
      </section>

      {/* Active Offers Section */}
   <section >
 
  <div className="flex justify-start pb-3 mb-6 border-b border-dotted border-slate-200">
    <h3 className="font-bold text-slate-800 text-lg">العروض النشطة</h3>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
   
    <div
      className="p-6 rounded-[24px] border"
      style={{ background: 'var(--offer-bg)', borderColor: 'var(--offer-border)' }}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <h4 className="font-bold text-base" style={{ color: 'var(--offer-title)' }}>
            خصم %30 على الحجوزات الأسبوعية
          </h4>

          <span
            className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-md"
            style={{ background: 'var(--offer-pill-bg)', color: 'var(--offer-pill-text)' }}
          >
            WEEK30
          </span>

          <p className="text-xs mt-2" style={{ color: 'var(--offer-sub)' }}>
            ينتهي في: ٢٠٢٤/١٢/٣١
          </p>

          <div
            className="mt-4 w-40 h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--offer-track)' }}
          >
            <div className="h-full w-[45%]" style={{ background: 'var(--offer-fill)' }}></div>
          </div>

          <p className="text-xs text-slate-400 mt-2">45/100 استخدام</p>
        </div>

        <span
          className="shrink-0 text-white text-sm font-extrabold px-2.5 py-1 rounded-lg"
          style={{ background: 'var(--offer-badge)' }}
        >
          -30%
        </span>
      </div>
    </div>

    
    <div
      className="p-6 rounded-[24px] border"
      style={{ background: 'var(--offer-bg)', borderColor: 'var(--offer-border)' }}
    >
      <div>
        <h4 className="font-bold text-base" style={{ color: 'var(--offer-title)' }}>
          ساعة مجانية مع كل حجز ٤ ساعات
        </h4>

        <span
          className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-md"
          style={{ background: 'var(--offer-pill-bg)', color: 'var(--offer-pill-text)' }}
        >
          FREE1H
        </span>

        <p className="text-xs mt-2" style={{ color: 'var(--offer-sub)' }}>
          ينتهي في: ٢٠٢٤/١٢/٢٥
        </p>

        <div
          className="mt-4 w-40 h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--offer-track)' }}
        >
          <div className="h-full w-[89%]" style={{ background: 'var(--offer-fill)' }}></div>
        </div>

        <p className="text-xs text-slate-400 mt-2">89/100 استخدام</p>
      </div>
    </div>
  </div>
</section>
    </div>
  );
};

export default UserHome;