

import { NavLink, useNavigate } from 'react-router-dom';
import { MENU_LINKS } from '../../constants/menuLinks';
import {
 RiBuilding2Line,
  RiShieldUserLine,
  RiCustomerService2Line,
  RiAccountCircleLine,
  RiUserStarLine,
  RiLogoutBoxRLine,
} from 'react-icons/ri';

const ROLE_STYLES = {
  user:         'from-[var(--user-primary)] to-[var(--user-secondary)]', 
  admin:        'from-[var(--admin-primary)] to-[var(--admin-secondary)]', 
  owner:        'from-[var(--owner-primary)] to-[var(--owner-secondary)]', 
  receptionist: 'from-[var(--receptionist-primary)] to-[var(--receptionist-secondary)]', 
};

const ROLE_LABELS = {
  user:         'نظام إدارة مشارك',
  admin:        'لوحة تحكم الإدارة',
  owner:        'صاحب المساحة ',
  receptionist: 'لوحة الاستقبال',
};

const ROLE_NAMES = {
  user:         'المستخدم',
  admin:        'الأدمن العام',
  owner:        'صاحب المساحة',
  receptionist: 'موظف الاستقبال',
};


const ROLE_ICONS = {
  user:         <RiAccountCircleLine size={24} />,
  admin:        <RiShieldUserLine size={24} />,
  owner:        <RiUserStarLine size={24} />,
  receptionist: <RiCustomerService2Line size={24} />,
};

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const links    = MENU_LINKS[role] ?? [];
  const gradient = ROLE_STYLES[role] ?? ROLE_STYLES.user;
  const label    = ROLE_LABELS[role] ?? '';
  const userName = ROLE_NAMES[role]  ?? 'مستخدم';
  const roleIcon = ROLE_ICONS[role]  ?? ROLE_ICONS.user;

  return (
    <aside className="w-72 bg-[#0F172B] text-white flex flex-col hidden lg:flex sticky top-0 h-screen overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

      <div className={`bg-gradient-to-b ${gradient}  pb-8 shadow-lg transition-all duration-500 p-6`}>
        <div className="flex items-center">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/10 me-4">
              <RiBuilding2Line size={24} />
          </div>
           <div>

        
        <h2 className="font-black text-[15px] leading-tight">مساحة</h2>
        <p className="text-[13px] opacity-50 uppercase mt-1">{label}</p>
</div>
        </div>
       
        <div className="mt-6 bg-white/10 backdrop-blur-md p-4 rounded-3xl flex items-center">
           <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center me-4">
           {roleIcon}
          </div>
          <div className="text-right">
            <p className="text-[15px] font-black">{userName}</p>
            <p className="text-[13px] opacity-50">حساب نشط</p>
          </div>
       
        </div>
      </div>

      <nav className="flex-1 px-4 mt-8 space-y-2 pb-10">
        {links.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `
              group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300
              ${isActive
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-4">
                  <span className={`text-2xl ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-bold">{item.name}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-5 py-4 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-2xl transition-all cursor-pointer"
        >
          <RiLogoutBoxRLine size={24} />
          <span className="text-sm font-bold">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;