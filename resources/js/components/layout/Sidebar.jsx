import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MENU_LINKS } from '../../constants/menuLinks';
import {
  RiBuilding2Line,
  RiShieldUserLine,
  RiCustomerService2Line,
  RiAccountCircleLine,
  RiUserStarLine,
  RiMenuLine,
  RiCloseLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
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

const COLLAPSE_STORAGE_KEY = 'masaha:sidebar-collapsed';

const readCollapsed = (role) => {
  try {
    return window.localStorage.getItem(`${COLLAPSE_STORAGE_KEY}:${role}`) === 'true';
  } catch {
    return false;
  }
};

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const [collapsed, setCollapsed] = useState(() => readCollapsed(role));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  const roleRef = useRef(role);

  // حفظ حالة التصغير في الذاكرة المحلية
  useEffect(() => {
    try {
      window.localStorage.setItem(`${COLLAPSE_STORAGE_KEY}:${role}`, String(collapsed));
    } catch {
    }
  }, [collapsed, role]);

  useEffect(() => {
    if (roleRef.current === role) return;
    roleRef.current = role;
    setCollapsed(readCollapsed(role));
  }, [role]);

  // إغلاق القائمة تلقائياً عند تغيير الصفحة
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!collapsed) setTooltip(null);
  }, [collapsed]);

  // إغلاق القائمة عند الضغط على زر Escape
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const showTooltip = (event, text) => {
    if (!collapsed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const isRtl = getComputedStyle(document.documentElement).direction === 'rtl';

    setTooltip({
      text,
      y: rect.top + rect.height / 2,
      x: isRtl ? rect.left - 8 : rect.right + 8,
      toStart: isRtl,
    });
  };

  return (
    <>
      {/* خلفية معتمة للجوال عند فتح القائمة */}
      <div
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div className="sticky top-0 z-50 flex h-screen shrink-0">
        <aside
          onScroll={() => setTooltip(null)}
          className={`flex shrink-0 flex-col overflow-y-auto overflow-x-hidden bg-[#0F172B] text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            max-lg:fixed max-lg:right-0 max-lg:top-0 max-lg:h-screen lg:h-full
            transition-[width] duration-300 ease-in-out
            ${mobileOpen ? 'w-20 max-lg:shadow-2xl' : 'w-0'}
            ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}
        >
          {/* ترويسة القائمة ومعلومات المستخدم */}
          <div className={`relative shrink-0 bg-gradient-to-b ${gradient} shadow-lg transition-all duration-500 p-6 max-lg:flex max-lg:h-[6.75rem] max-lg:items-center max-lg:justify-center max-lg:p-0 ${collapsed ? 'lg:px-3 lg:pb-6 lg:pt-14' : ''}`}>
            {/* زر التصغير على الشاشات الكبيرة */}
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? 'توسيع القائمة الجانبية' : 'تصغير القائمة الجانبية'}
              aria-expanded={!collapsed}
              className="absolute end-5 top-5 hidden h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-white/80 ring-1 ring-white/10 transition hover:bg-white/25 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white lg:flex"
            >
              {collapsed ? <RiArrowLeftDoubleLine size={16} /> : <RiArrowRightDoubleLine size={16} />}
            </button>

            <div className={`flex items-center max-lg:hidden ${collapsed ? 'lg:justify-center' : ''}`}>
              <div className={`bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/10 shrink-0 me-4 ${collapsed ? 'lg:me-0' : ''}`}>
                <RiBuilding2Line size={24} />
              </div>
              <div className={`max-lg:hidden ${collapsed ? 'lg:hidden' : ''}`}>
                <h2 className="font-black text-[15px] leading-tight">مساحة</h2>
                <p className="text-[13px] opacity-50 uppercase mt-1">{label}</p>
              </div>
            </div>

            <div className={`mt-6 bg-white/10 backdrop-blur-md p-4 rounded-3xl flex items-center max-lg:mt-0 max-lg:bg-transparent max-lg:p-0 max-lg:justify-center ${collapsed ? 'lg:mt-5 lg:bg-transparent lg:p-0 lg:justify-center' : ''}`}>
              <div className={`w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 me-4 max-lg:me-0 ${collapsed ? 'lg:me-0' : ''}`}>
                {roleIcon}
              </div>
              <div className={`max-lg:hidden ${collapsed ? 'lg:hidden' : ''}`}>
                <p className="text-[15px] font-black">{userName}</p>
                <p className="text-[13px] opacity-50">حساب نشط</p>
              </div>
            </div>
          </div>

          {/* روابط القائمة */}
          <nav className={`flex-1 px-4 max-lg:px-3 mt-8 space-y-2 pb-6 ${collapsed ? 'lg:px-3' : ''}`}>
            {links.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                title={collapsed ? item.name : undefined}
                aria-label={collapsed ? item.name : undefined}
                onMouseEnter={(event) => showTooltip(event, item.name)}
                onMouseLeave={() => setTooltip(null)}
                onFocus={(event) => showTooltip(event, item.name)}
                onBlur={() => setTooltip(null)}
                className={({ isActive }) => `
                  group relative flex items-center justify-between px-5 py-4 max-lg:justify-center max-lg:px-0 rounded-2xl transition-all duration-300
                  ${collapsed ? 'lg:justify-center lg:px-0' : ''}
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
                      <span className={`text-sm font-bold max-lg:hidden ${collapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
                    </div>
                    {isActive && (
                      <div className={`w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff] max-lg:hidden ${collapsed ? 'lg:hidden' : ''}`} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* زر تسجيل الخروج */}
          <div className={`p-4 border-t border-white/10 max-lg:p-2 ${collapsed ? 'lg:p-2' : ''}`}>
            <button 
              type="button"
              onClick={handleLogout}
              title="تسجيل الخروج"
              className={`flex items-center gap-4 w-full px-5 py-4 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-2xl transition-all cursor-pointer max-lg:justify-center max-lg:px-0 ${
                collapsed ? 'lg:justify-center lg:px-0' : ''
              }`}
            >
              <RiLogoutBoxRLine size={24} />
              <span className={`text-sm font-bold max-lg:hidden ${collapsed ? 'lg:hidden' : ''}`}>تسجيل الخروج</span>
            </button>
          </div>
        </aside>

        {/* زر الهامبورغر على الجوال */}
        <div className="flex h-[6.75rem] w-14 shrink-0 items-center justify-center pr-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل'}
            aria-expanded={mobileOpen}
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg ring-1 ring-white/20 transition-transform duration-300 active:scale-90 ${
              mobileOpen ? '-translate-x-20' : ''
            }`}
          >
            {mobileOpen ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
          </button>
        </div>
      </div>

      {/* Tooltip عند التصغير على الديسكتوب */}
      {collapsed &&
        tooltip &&
        createPortal(
          <div
            role="tooltip"
            style={{
              top: tooltip.y,
              left: tooltip.x,
              transform: tooltip.toStart ? 'translate(-100%, -50%)' : 'translateY(-50%)',
            }}
            className="pointer-events-none fixed z-[70] whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl ring-1 ring-white/10"
          >
            {tooltip.text}
          </div>,
          document.body
        )}
    </>
  );
};

export default Sidebar;