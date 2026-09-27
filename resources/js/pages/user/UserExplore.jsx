import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  RiSearchLine, 
  RiWifiLine, 
  RiTimeLine, 
  RiChargingPile2Line, 
  RiStarLine, 
  RiLoader4Line,
  RiUserStarLine,
  RiCheckboxCircleFill
} from 'react-icons/ri';
import PageHeader from '../../components/layout/PageHeader';

const UserExplore = () => {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const getOccupancyColor = (percent) => {
    return percent >= 80 ? "#EF4444" : "#009689";
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = () => {
    setLoading(true);
    axios.get('/api/spaces')
      .then(res => {
        setSpaces(res.data);
      })
      .catch(err => {
        console.error('Error fetching spaces:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const filteredSpaces = spaces.filter(space => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (space.name && space.name.toLowerCase().includes(term)) ||
      (space.region && space.region.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
      <PageHeader title="استكشاف المساحات" icon={<RiSearchLine />} role="user" />

      <div className="flex gap-4">
        <div className="flex-1 relative group">
          <RiSearchLine className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#009689] transition-colors" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم المساحة أو المنطقة..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pr-14 pl-6 text-sm focus:outline-none focus:ring-4 focus:ring-[#009689]/10 transition-all font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <RiLoader4Line className="animate-spin text-[#009689]" size={36} />
          <p className="font-bold text-sm">جاري تحميل المساحات من قاعدة البيانات...</p>
        </div>
      ) : filteredSpaces.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100 shadow-sm space-y-3">
          <p className="text-lg font-bold text-slate-700">لا توجد مساحات مطابقة للبحث</p>
          <p className="text-xs text-slate-400 font-medium">جرب البحث بكلمات أخرى أو تصفح كافة المساحات.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSpaces.map((space) => {
            // Keep occupancy rate as requested (static placeholder unchanged)
            const occupancyVal = 70;
            const occupancyColor = getOccupancyColor(occupancyVal);
            const speedDisplay = space.speed 
              ? (space.speed.toString().includes('Mbps') ? space.speed : `${space.speed} Mbps`) 
              : '100 Mbps';
            const electricityDisplay = space.electricity || '24/7 مفتوح';
            const featureDisplay = (space.servicesList && space.servicesList.length > 0)
              ? space.servicesList[0]
              : 'مكاتب مجهزة';

            return (
              <div
                key={space.id}
                onClick={() => navigate(`/dashboard/explore/${space.id}`)}
                className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group"
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-black text-slate-800 group-hover:text-[#009689] transition-colors">{space.name}</h2>
                          {/* Status Badge: متاح */}
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            متاح
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1 font-bold">
                          {space.region}
                        </p>
                      </div>

                      <div className="bg-[#009689]/10 px-4 py-2 rounded-2xl text-center">
                        <span className="text-xl font-black text-[#009689]">{space.price}₪</span>
                        <p className="text-[9px] text-[#009689] font-bold uppercase">/ ساعة</p>
                      </div>
                    </div>

                    {/* Features Badges from DB */}
                    <div className="flex flex-wrap gap-3">
                      <span className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 border border-slate-100">
                        <RiWifiLine className="text-[#009689]" /> {speedDisplay}
                      </span>
                      <span className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 border border-slate-100">
                        <RiTimeLine className="text-[#009689]" /> {electricityDisplay}
                      </span>
                      <span className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 border border-slate-100">
                        <RiUserStarLine className="text-[#009689]" /> {space.seats || 30} مقعد
                      </span>
                      <span className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 border border-slate-100">
                        <RiChargingPile2Line className="text-[#009689]" /> {featureDisplay}
                      </span>
                    </div>

                    {/* Occupancy Section (Kept static placeholder as requested) */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400 uppercase tracking-tighter"> الإشغال </span>
                        <span style={{ color: occupancyColor }}>{occupancyVal}%</span>
                      </div>
                      <div dir="ltr" className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex justify-start">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${occupancyVal}%`,
                            backgroundColor: occupancyColor,
                            boxShadow: `0 0 10px ${occupancyColor}4D`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#009689]">{space.price}₪</span>
                        <p className="text-xs text-slate-400 font-bold uppercase">/ ساعة</p>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/explore/${space.id}`);
                          }}
                          className="bg-[#009689] hover:bg-[#0D9488] text-white font-bold text-sm py-2.5 px-6 rounded-xl shadow-md shadow-[#009689]/20 transition-all cursor-pointer"
                        >
                          عرض التفاصيل
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 border border-slate-200 text-slate-600 font-bold text-sm py-2.5 px-6 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          <RiStarLine className="text-amber-400" size={16} /> التقييمات
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserExplore;