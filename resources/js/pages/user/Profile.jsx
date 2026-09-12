import { useState, useEffect } from 'react';
import { RiEdit2Line, RiHeartFill, RiCopperCoinLine, RiTrophyLine, RiLogoutBoxRLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from '../../components/modals/EditProfileModal';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('auth_token');
      navigate('/login');
    }
  };
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [user, setUser] = useState({
    name: 'جاري التحميل...',
    email: '',
    memberSince: '',
    phone: '',
  });

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Fetch favorites
    axios.get('/api/user/favorites')
      .then(res => setFavorites(res.data))
      .catch(err => console.error(err));

    // Fetch user...
    axios.get('/api/user')
      .then(res => {
        const data = res.data;
        const date = new Date(data.created_at);
        const formattedDate = date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          memberSince: formattedDate,
          avatarUrl: data.avatar || null,
          rating: data.rating || null,
        });
      })
      .catch(err => {
        console.error('خطأ في جلب بيانات المستخدم:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSaveProfile = (updatedUser, previewImage) => {
    const formData = new FormData();
    formData.append('_method', 'PUT'); 
    if (updatedUser.name) formData.append('name', updatedUser.name);
    if (updatedUser.email) formData.append('email', updatedUser.email);
    if (updatedUser.phone) formData.append('phone', updatedUser.phone);
    if (updatedUser.password) formData.append('password', updatedUser.password);
    if (updatedUser.rating) formData.append('rating', updatedUser.rating);
    if (updatedUser.avatarFile) formData.append('avatar', updatedUser.avatarFile);

    axios.post('/api/user', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(res => {
        setUser((prev) => ({
          ...prev,
          name: res.data.user.name,
          email: res.data.user.email,
          phone: res.data.user.phone || prev.phone,
          avatarUrl: res.data.user.avatar || previewImage || prev.avatarUrl,
          rating: res.data.user.rating || prev.rating,
        }));
      })
      .catch(err => {
        console.error('خطأ في تحديث البيانات:', err);
        alert('حدث خطأ أثناء التحديث، يرجى المحاولة مرة أخرى.');
      });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {loading ? (
        <div className="flex justify-center py-20 text-brand-500">جاري تحميل البيانات...</div>
      ) : (
        <>
          <h1 className="text-2xl font-black text-slate-800 underline decoration-brand-500 underline-offset-[12px]">البروفايل الشخصي</h1>

      {/* User Info Card */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 flex flex-col md:flex-row items-center gap-8 shadow-sm relative overflow-hidden group">
        <button 
          onClick={() => setIsEditOpen(true)}
          className="absolute top-6 left-6 text-slate-300 hover:text-brand-500 transition-colors"
        >
          <RiEdit2Line size={22} />
        </button>

        <div className="w-32 h-32 bg-brand-500 rounded-[32px] flex items-center justify-center text-5xl text-white font-black shadow-xl group-hover:scale-105 transition-transform overflow-hidden">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            user.name.charAt(0)
          )}
        </div>
        <div className="text-center md:text-right space-y-1">
            <h2 className="text-2xl font-black text-slate-800">{user.name}</h2>
            <p className="text-sm text-slate-400 font-bold">{user.email}</p>
            <p className="text-xs text-slate-400 mt-2">عضو منذ {user.memberSince}</p>
        </div>
      </div>

      {/* Favorites List */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 space-y-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><RiHeartFill className="text-danger" /> المفضلة</h3>
          <div className="space-y-4">
              {favorites.length === 0 ? (
                <p className="text-slate-400 text-sm text-center">لا يوجد مساحات مفضلة بعد</p>
              ) : (
                favorites.map((space) => (
                    <div key={space.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-500/30 transition-all">
                        <span className="font-bold text-slate-600 text-sm">{space.name}</span>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => {
                               axios.post(`/api/spaces/${space.id}/favorite`)
                                 .then(() => setFavorites(prev => prev.filter(f => f.id !== space.id)))
                                 .catch(err => console.error(err));
                             }}
                             className="bg-red-50 hover:bg-red-100 w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-red-500"
                             title="إزالة من المفضلة"
                           >
                             <RiHeartFill size={16} />
                           </button>
                           <div className="bg-brand-500 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs cursor-pointer">‹</div>
                        </div>
                    </div>
                ))
              )}
          </div>
      </div>

      {/* Gamification: Points & Rewards */}
      <div className="bg-gradient-to-br from-[#0D9488] to-[#0F766E] p-8 rounded-[40px] text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>
          <div className="flex justify-between items-center relative z-10">
              <div className="space-y-1">
                <h3 className="font-black text-xl flex items-center gap-2"><RiTrophyLine className="text-warning" /> النقاط والمكافآت</h3>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">المستوى الذهبي</p>
              </div>
              <div className="text-right">
                  <span className="text-4xl font-black">240</span>
                  <p className="text-[10px] font-bold">نقطة</p>
              </div>
          </div>

          <div className="space-y-2 relative z-10">
              <div className="flex justify-between text-[10px] font-bold">
                  <span>تحتاج 60 نقطة للوصول للمستوى الماسي 💎</span>
                  <span>80%</span>
              </div>
              <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden border border-white/10">
                  <div className="bg-warning h-full w-[80%] rounded-full shadow-[0_0_15px_#FFB90066]"></div>
              </div>
          </div>
          <p className="text-[10px] text-center font-bold opacity-60 underline decoration-white/20">يحدث تلقائياً مع كل حجز ✓</p>
      </div>

      {/* Site Rating */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm text-center space-y-4">
        <h3 className="font-black text-slate-800">تقييمك للمنصة يهمنا 🌟</h3>
        <p className="text-sm text-slate-500">شاركنا رأيك في تجربة استخدام مساحة</p>
        <div className="flex justify-center gap-2 flex-row-reverse">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleSaveProfile({ rating: star })}
              className={`text-4xl transition-all hover:scale-110 ${
                user.rating >= star ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        {user.rating && <p className="text-xs text-brand-500 font-bold">شكراً لتقييمك ({user.rating}/5)</p>}
      </div>
      <button 
        onClick={handleLogout}
        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-[32px] flex items-center justify-center gap-2 transition-colors mt-8"
      >
        <RiLogoutBoxRLine size={20} />
        تسجيل الخروج
      </button>

      <EditProfileModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        user={user}
        onSave={handleSaveProfile}
      />
      </>
      )}
    </div>
  );
};

export default Profile;