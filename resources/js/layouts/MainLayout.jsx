// import { Outlet } from 'react-router-dom';
// import Sidebar from "../layout/Sidebar";
// import Navbar from "../layout/Navbar";
// import { useAuth } from "../../context/AuthContext";

// const MainLayout = () => {
//   const { user } = useAuth();
//   const role = user?.role;

//   return (
//     <div className="flex min-h-screen bg-[#F1F5F9]">
//       <Sidebar role={role} />
//       <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
//         <Navbar role={role} />
//         <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default MainLayout;


import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = ({ role }) => {
  // تحديد كلاس الثيم بناءً على النوع
  const themeClass = role === 'admin' ? 'theme-admin' : 'theme-user';

  return (
    <div className={`flex min-h-screen ${themeClass} bg-mainBg font-['Cairo']`}>
      {/* تمرير الـ role للسايدبار ليقرأ الروابط الخاصة به */}
      <Sidebar role={role} />
      
      <main className="flex-1 max-h-screen overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;