import React from 'react';
import PageHeader from '../../components/layout/PageHeader';
import { RiDashboardLine } from 'react-icons/ri';

const OwnerDashboard = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="لوحة تحكم صاحب المساحة"
        icon={<RiDashboardLine />}
        role="owner"
        roleIcon={<RiDashboardLine size={20} />}
      />
      <div className="bg-white rounded-[32px] border border-slate-100 p-10 text-center shadow-sm">
        <h2 className="text-2xl font-black text-slate-800">أهلاً بك في منصة مساحة</h2>
        <p className="text-slate-500 mt-2 font-bold">هذه صفحة وهمية مؤقتة لصاحب المساحة.</p>
      </div>
    </div>
  );
};

export default OwnerDashboard;
