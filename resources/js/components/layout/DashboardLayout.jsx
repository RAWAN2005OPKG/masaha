import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = ({ role }) => {
  const themeClass = `theme-${role}`;

  return (
    <div className={`flex min-h-screen ${themeClass} bg-[#F1F5F9] font-['Cairo']`}>
      <Sidebar role={role} />
      
      <main className="flex-1 max-h-screen overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;