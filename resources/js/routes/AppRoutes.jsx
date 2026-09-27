import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from "../components/layout/MainLayout";
import Login from '../pages/auth/Login'; 
import Register from '../pages/auth/Register'; 
import ForgotPassword from '../pages/auth/ForgotPassword';
import UserHome from '../pages/user/UserHome';
import UserExplore from '../pages/user/UserExplore';
import SpaceDetails from '../pages/user/SpaceDetails'; 
import Profile from '../pages/user/Profile'; 
import UserBookings from '../pages/user/UserBookings'; 
import UserOffers from '../pages/user/UserOffers'; 
import UserNotifications from '../pages/user/UserNotifications'; 

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UsersManagement from '../pages/admin/UsersManagement';
import SpaceOwners, { EditSpaceOwner } from '../pages/admin/SpaceOwners';

// Receptionist Pages
import ReceptionistDashboard from '../pages/receptionist/ReceptionistDashboard';
import Bookingdetails from '../pages/receptionist/Bookingdetails';
import Paymentnotifications from '../pages/receptionist/Paymentnotifications';
import StatisticsPage from '../pages/receptionist/StatisticsPage';
import NotificationsPage from '../pages/receptionist/NotificationsPage';
import SpacesManagement, { EditSpace } from '../pages/admin/SpacesManagement';
import AdminReports from '../pages/admin/AdminReports';
import AdminNotifications from '../pages/admin/AdminNotifications';

import OwnerDashboard from '../pages/owner/OwnerDashboard';
import Emergencymanagement from '../pages/owner/Emergencymanagement';
import Eventsmanagement from '../pages/owner/Eventsmanagement';
import Offersmanagement from '../pages/owner/Offersmanagement';
import OwnerReports from '../pages/owner/Reports';
import Staffmanagement from '../pages/owner/Staffmanagement';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* User Routes */}
      <Route path="/dashboard" element={<MainLayout role="user" />}>
        <Route index element={<UserHome />} /> 
        <Route path="explore" element={<UserExplore />} />
        <Route path="explore/:id" element={<SpaceDetails />} />
        <Route path="profile" element={<Profile />} /> 
        <Route path="bookings" element={<UserBookings />} />
        <Route path="offers" element={<UserOffers />} />
        <Route path="notifications" element={<UserNotifications />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin-dashboard" element={<MainLayout role="admin" />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="owners" element={<SpaceOwners />} />
        <Route path="spaceowners" element={<SpaceOwners />} />
        <Route path="owners/edit/:id" element={<EditSpaceOwner />} />
        <Route path="spaces" element={<SpacesManagement />} />
        <Route path="spaces/edit/:id" element={<EditSpace />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Route>

      {/* Owner Routes */}
      <Route path="/owner-dashboard" element={<MainLayout role="owner" />}>
        <Route index element={<OwnerDashboard />} />
        <Route path="emergency" element={<Emergencymanagement />} />
        <Route path="events" element={<Eventsmanagement />} />
        <Route path="offers" element={<Offersmanagement />} />
        <Route path="reports" element={<OwnerReports />} />
        <Route path="staff" element={<Staffmanagement />} />
        <Route path="notifications" element={<UserNotifications />} />
      </Route>

      {/* Receptionist Routes */}
      <Route path="/receptionist-dashboard" element={<MainLayout role="receptionist" />}>
        <Route index element={<ReceptionistDashboard />} />
        <Route path="Chechin" element={<ReceptionistDashboard />} />
        <Route path="bookings" element={<Bookingdetails />} />
        <Route path="paymentnotifications" element={<Paymentnotifications />} />
        <Route path="statisticspage" element={<StatisticsPage />} />
        <Route path="notificationspage" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;