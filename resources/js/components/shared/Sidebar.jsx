import { NavLink } from 'react-router-dom';
import { RiHome4Line, RiSearchLine, RiUserLine, RiCalendarCheckLine, RiPriceTag3Line, RiNotification3Line, RiLayoutGridLine } from 'react-icons/ri';

const Sidebar = () => {
  const menuItems = [
    { name: 'الرئيسية', path: '/', icon: <RiHome4Line /> },
    { name: 'استكشاف المساحات', path: '/dashboard/explore', icon: <RiSearchLine /> },
    { name: 'البروفايل', path: '/dashboard/profile', icon: <RiUserLine /> },
    { name: 'حجوزاتي', path: '/bookings', icon: <RiCalendarCheckLine /> },
    { name: 'العروض والفعاليات', path: '/offers', icon: <RiPriceTag3Line /> },
    { name: 'الإشعارات', path: '/notifications', icon: <RiNotification3Line /> },
  ];

  return (
    <aside className="w-72 bg-[#0F172B] text-white flex flex-col hidden lg:flex sticky top-0 h-screen">
      {/* Header Profile Info */}
      <div className="p-6 space-y-4">
        <div className="bg-[#009689] p-4 rounded-2xl flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg text-xl">🏢</div>
          <div>
            <h2 className="font-bold text-sm">مساحة</h2>
            <p className="text-[10px] opacity-70">نظام إدارة مشارك</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00D5BE] rounded-xl flex items-center justify-center text-secondary">
                <RiUserLine size={20} />
            </div>
            <div>
                <p className="text-xs font-bold">المستخدم</p>
                <p className="text-[10px] text-slate-400">حساب نشط</p>
            </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                ? 'bg-white/10 text-[#00D5BE] border-r-4 border-[#00D5BE]' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;