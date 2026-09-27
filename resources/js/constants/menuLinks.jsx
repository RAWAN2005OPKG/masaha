import { RiHome4Line, RiSearchLine, RiUserLine,
  RiBuildingLine, RiBarChartBoxLine, RiNotification3Line,
  RiCalendarCheckLine, RiPriceTag3Line,
  RiSettings3Line, RiTeamLine, RiFileListLine,
  RiUserStarLine,
  RiCalendarEventLine,
  RiAlertLine,
  
} from 'react-icons/ri';

export const MENU_LINKS = {
  user: [
    { name: 'الرئيسية',           path: '/dashboard',              icon: <RiHome4Line />,         exact: true },
    { name: 'استكشاف المساحات',  path: '/dashboard/explore',      icon: <RiSearchLine /> },
    { name: 'حجوزاتي',           path: '/dashboard/bookings',     icon: <RiCalendarCheckLine /> },
    { name: 'العروض والفعاليات', path: '/dashboard/offers',       icon: <RiPriceTag3Line /> },
    { name: 'الإشعارات',         path: '/dashboard/notifications',icon: <RiNotification3Line /> },
    { name: 'البروفايل',         path: '/dashboard/profile',      icon: <RiUserLine /> },
  ],

  admin: [
    { name: 'الرئيسية',          path: '/admin-dashboard',     icon: <RiHome4Line />,       exact: true },
    { name: 'إدارة المستخدمين', path: '/admin-dashboard/users',         icon: <RiTeamLine /> },
    { name: 'إدارة المساحات',   path: '/admin-dashboard/spaces',        icon: <RiBuildingLine /> },
    { name: 'أصحاب المساحات',   path: '/admin-dashboard/spaceowners',   icon: <RiUserStarLine /> },
    { name: 'التقارير',         path: '/admin-dashboard/reports',       icon: <RiBarChartBoxLine /> },
    { name: 'الإشعارات',        path: '/admin-dashboard/notifications', icon: <RiNotification3Line /> },
  ],

  owner: [
    { name: 'الرئيسية',         path: '/owner-dashboard',        icon: <RiHome4Line />,    exact: true },
    { name: 'الفعاليات',          path: '/owner-dashboard/events',           icon: <RiCalendarEventLine /> },
    { name: 'العروض',         path: '/owner-dashboard/offers',         icon: <RiPriceTag3Line /> },
    { name: 'التقارير',         path: '/owner-dashboard/reports',          icon: <RiBarChartBoxLine /> },
    { name: 'الطوارئ',        path: '/owner-dashboard/emergency',    icon: <RiAlertLine /> },
    { name: 'ادارة الموظفين',        path: '/owner-dashboard/staff',         icon: <RiTeamLine /> },
    { name: 'الإشعارات',        path: '/owner-dashboard/notifications',  icon: <RiNotification3Line /> },
  ],

  receptionist: [
    { name: 'الرئيسية',         path: '/receptionist-dashboard',         icon: <RiHome4Line />,         exact: true },
    { name: 'تسجيل الوصول',         path: '/receptionist-dashboard/Chechin',         icon: <RiHome4Line />,         },
    { name: 'تفاصيل الحجوزات',         path: '/receptionist-dashboard/bookings',          icon: <RiCalendarCheckLine /> },
    { name: ' اشعارات الدفع',         path: '/receptionist-dashboard/paymentnotifications',          icon: <RiCalendarCheckLine /> },
    { name: '  الاحصائيات',         path: '/receptionist-dashboard/statisticspage',          icon: <RiCalendarCheckLine /> },
    { name: 'الإشعارات',        path: '/receptionist-dashboard/notificationspage',    icon: <RiNotification3Line /> },
  ],
};