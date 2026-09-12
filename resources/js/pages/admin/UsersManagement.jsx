import React, { useState, useEffect } from 'react';
import { RiSearchLine, RiUserAddLine, RiTeamLine, RiShieldUserLine } from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch users from API
    window.axios.get('/api/admin/users')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="إدارة المستخدمين"
        icon={<RiTeamLine />}
        role="admin"
        roleIcon={<RiShieldUserLine size={20} />}
      />

      <div className="relative">
        <RiSearchLine className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث باسم المستخدم أو البريد الإلكتروني..."
          className="w-full bg-white border border-slate-100 rounded-3xl py-4 pr-14 pl-6 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all"
        />
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-slate-50/50 border-b border-slate-50">
            <tr className="text-[15px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-5">المستخدم</th>
              <th className="px-8 py-5">الدور</th>
              <th className="px-8 py-5">التقييم</th>
              <th className="px-8 py-5">عضو منذُ</th>
              <th className="px-8 py-5 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-slate-500 font-bold">جاري تحميل البيانات...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-slate-500 font-bold">لا يوجد مستخدمين.</td>
              </tr>
            ) : (
              filteredUsers.map((u, i) => {
                const initial = u.name ? u.name.charAt(0) : 'U';
                const status = u.status === 'active' || u.status === 'نشط' ? 'نشط' : 'معطل';

                return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-11 h-11 rounded-2xl object-cover shadow-sm" />
                        ) : (
                          <div className="w-11 h-11 bg-teal-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm">{initial}</div>
                        )}
                        <div><p className="text-sm font-black text-slate-800">{u.name}</p><p className="text-[10px] text-slate-400 font-bold">{u.email}</p></div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-600 text-sm">
                      {u.role === 'admin' ? 'مدير' : 'مستخدم'}
                    </td>
                    <td className="px-8 py-6 font-black text-amber-500 text-sm">
                      {u.rating ? `⭐ ${u.rating}` : <span className="text-slate-300 text-xs">لم يُقيّم</span>}
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-400 font-bold">{u.joinDate}</td>
                    <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${status === 'نشط' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-400'}`}>{status}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagement;