import { Outlet } from 'react-router-dom';
import Sidebar from "../layout/Sidebar";
const MainLayout = ({ role }) => {
  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <Sidebar role={role} />
      
      {/* Content Area */}
      <main className="flex-1 max-h-screen overflow-y-auto custom-scrollbar p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;