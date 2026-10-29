import React, { useState, useEffect } from 'react';
import { RiSearchLine, RiTeamLine, RiShieldUserLine, RiPulseLine, RiUserLine, RiUserUnfollowLine } from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, online, offline
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    window.axios.get('/api/admin/users')
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
    // Live update online/offline presence every 20 seconds
    const interval = setInterval(fetchUsers, 20000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = users.filter(u => u.is_online || u.status === 'نشط').length;
  const offlineCount = users.length - onlineCount;

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'online') return u.is_online || u.status === 'نشط';
    if (statusFilter === 'offline') return !u.is_online && u.status !== 'نشط';
    return true;
  });

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="إدارة المستخدمين وحالة التواجد"
        icon={<RiTeamLine />}
        role="admin"
        roleIcon={<RiShieldUserLine size={20} />}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`cursor-pointer bg-white rounded-3xl p-6 border transition-all shadow-sm flex items-center justify-between ${statusFilter === 'all' ? 'border-violet-500 ring-2 ring-violet-500/10' : 'border-slate-100'}`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400">إجمالي المستخدمين</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{users.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl">
            <RiUserLine />
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('online')}
          className={`cursor-pointer bg-white rounded-3xl p-6 border transition-all shadow-sm flex items-center justify-between ${statusFilter === 'online' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-100'}`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs font-bold text-emerald-600">نشط (متواجد في الموقع الآن)</p>
            </div>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">{onlineCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <RiPulseLine />
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('offline')}
          className={`cursor-pointer bg-white rounded-3xl p-6 border transition-all shadow-sm flex items-center justify-between ${statusFilter === 'offline' ? 'border-slate-400 ring-2 ring-slate-400/10' : 'border-slate-100'}`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400">غير نشط (غير متواجد حالياً)</p>
            <h3 className="text-3xl font-black text-slate-500 mt-1">{offlineCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-xl">
            <RiUserUnfollowLine />
          </div>
        </div>
      </div>

      <div className="relative">
        <RiSearchLine className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث باسم المستخدم أو البريد الإلكتروني..."
          className="w-full bg-white border border-slate-100 rounded-3xl py-4 pr-14 pl-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all shadow-sm"
        />
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-[13px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-5">المستخدم</th>
              <th className="px-8 py-5">الدور</th>
              <th className="px-8 py-5">التقييم</th>
              <th className="px-8 py-5">تاريخ الانضمام</th>
              <th className="px-8 py-5 text-center">حالة التواجد الحقيقية</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-slate-400 font-bold">جاري تحميل بيانات المستخدمين والتواجد...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-slate-400 font-bold">لا توجد نتائج مطابقة.</td>
              </tr>
            ) : (
              filteredUsers.map((u, i) => {
                const initial = u.name ? u.name.charAt(0) : 'U';
                const isOnline = Boolean(u.is_online || u.status === 'نشط');

                return (
                  <tr key={u.id || i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm">{initial}</div>
                          )}
                          {/* Live Online Dot */}
                          <span 
                            title={isOnline ? 'متصل الآن' : 'غير متصل'} 
                            className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-bold">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-600 text-sm">
                      {u.role === 'admin' ? 'مدير' : u.role === 'owner' ? 'صاحب مساحة' : 'مستخدم'}
                    </td>
                    <td className="px-8 py-6 font-black text-amber-500 text-sm">
                      {u.rating ? `⭐ ${u.rating}` : <span className="text-slate-300 text-xs font-normal">لم يُقيّم</span>}
                    </td>
                    <td className="px-8 py-6 text-xs text-slate-400 font-bold">{u.joinDate}</td>
                    <td className="px-8 py-6 text-center">
                      {isOnline ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            نشط
                          </span>
                          <span className="text-[10px] text-emerald-500 font-bold mt-1">متواجد في الموقع</span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                            غير نشط
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium mt-1">{u.last_seen || 'غير متواجد'}</span>
                        </div>
                      )}
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
