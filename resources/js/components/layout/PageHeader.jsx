import {
  RiShieldUserLine,
  RiAccountCircleLine,
  RiUserStarLine,
  RiCustomerService2Line,
} from 'react-icons/ri';


const ROLE_GRADIENT = {
  user:         'from-[var(--user-primary)] to-[var(--user-secondary)]',
  admin:        'from-[var(--admin-primary)] to-[var(--admin-secondary)]', 
  owner:        'from-[var(--owner-primary)] to-[var(--owner-secondary)]',
  receptionist: 'from-[var(--receptionist-primary)] to-[var(--receptionist-secondary)]',
};


const ROLE_ICON = {
  user:         <RiAccountCircleLine size={20} />,
  admin:        <RiShieldUserLine size={20} />,
  owner:        <RiUserStarLine size={20} />,
  receptionist: <RiCustomerService2Line size={20} />,
};


const PageHeader = ({ title, icon, role = 'user' }) => {
  const gradient = ROLE_GRADIENT[role] ?? ROLE_GRADIENT.user;
  const roleIcon = ROLE_ICON[role]     ?? ROLE_ICON.user;

  return (
    <header className="w-full bg-white shadow-lg rounded-2xl p-6 mb-8">
      <div className="flex justify-between items-center">

        <div className="flex items-center gap-3">
          {icon && (
            <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shrink-0`}>
              {icon}
            </div>
          )}
          <h1 className="text-xl font-black text-slate-800">{title}</h1>
        </div>

        <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0`}>
          {roleIcon}
        </div>

      </div>
    </header>
  );
};

export default PageHeader;
