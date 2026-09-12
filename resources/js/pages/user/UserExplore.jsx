import { useNavigate } from "react-router-dom";
import { RiSearchLine, RiFilterLine, RiWifiLine, RiTimeLine, RiChargingPile2Line, RiStarLine } from 'react-icons/ri';

const UserExplore = () => {
  const navigate = useNavigate();

  const getOccupancyColor = (percent) => {
    return percent >= 80 ? "#EF4444" : "#009689";
  };

  // بيانات تجريبية - بدلها لاحقاً ببيانات حقيقية من الـ API
  const spaces = [
    {
      id: 1,
      name: "مساحة الريادة",
      region: "غزة - حي الرمال",
      price: 20,
      speed: 200,
      occupancy: 80,
    },
    {
      id: 2,
      name: "مساحة الإبداع",
      region: "غزة",
      price: 15,
      speed: 100,
      occupancy: 45,
    },
    {
      id: 3,
      name: "مساحة المستقبل",
      region: "الوسطى",
      price: 12,
      speed: 150,
      occupancy: 30,
    },
  ];

  return (
    <div  className="space-y-8 animate-in slide-in-from-bottom-5 duration-700">
      {/* Header Section */}
      <div>
        <h1 className="text-res-h1 text-[#0F172B]">استكشاف المساحات</h1>
        <p className="text-slate-400 text-sm mt-1">ابحث عن المساحة المثالية لك</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative group">
          <RiSearchLine className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#009689] transition-colors" size={20} />
          <input
            type="text"
            placeholder="ابحث باسم المساحة أو المنطقة..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pr-14 pl-6 text-sm focus:outline-none focus:ring-4 focus:ring-[#009689]/10 transition-all"
          />
        </div>
      </div>

      <div className="space-y-6">
        {spaces.map((space) => {
          const occupancyColor = getOccupancyColor(space.occupancy);

          return (
            <div
              key={space.id}
              onClick={() => navigate(`/dashboard/explore/${space.id}`)}
              className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-6 md:p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-800">{space.name}</h2>
                      <p className="text-xs text-slate-400 flex items-center gap-1 font-bold">
                        {space.region}
                      </p>
                    </div>
                    <div className="bg-[#009689]/10 px-4 py-2 rounded-2xl text-center">
                      <span className="text-xl font-black text-[#009689]">{space.price}₪</span>
                      <p className="text-[9px] text-[#009689] font-bold uppercase">/ ساعة</p>
                    </div>
                  </div>

                  {/* Features Badges */}
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 border border-slate-100">
                      <RiWifiLine className="text-[#009689]" /> {space.speed} Mbps
                    </span>
                    <span className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 border border-slate-100">
                      <RiTimeLine className="text-[#009689]" /> 24/7 مفتوح
                    </span>
                    <span className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-2 border border-slate-100">
                      <RiChargingPile2Line className="text-[#009689]" /> مولد احتياطي
                    </span>
                  </div>

<div className="space-y-2">
  <div className="flex justify-between text-[11px] font-bold">
    <span className="text-slate-400 uppercase tracking-tighter"> الإشغال </span>
    <span style={{ color: occupancyColor }}>{space.occupancy}%</span>
  </div>
  <div dir="ltr" className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex justify-start">
    <div
      className="h-full rounded-full transition-all"
      style={{
        width: `${space.occupancy}%`,
        backgroundColor: occupancyColor,
        boxShadow: `0 0 10px ${occupancyColor}4D`,
      }}
    ></div>
  </div>
</div>

  <div className="flex justify-between items-start">
     <div className="flex items-baseline justify-center gap-1 px-4 py-2 rounded-2xl text-center">
  <span className="text-5xl font-black text-[#009689]">{space.price}₪</span>
  <p className="text-[15px] text-slate-400 font-bold uppercase">/ ساعة</p>
</div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/explore/${space.id}`);
                      }}
                      className="bg-[#009689] hover:bg-[#0D9488] text-white font-bold text-sm py-2.5 px-6 rounded-xl shadow-md shadow-[#009689]/20 transition-all"
                    >
                      عرض التفاصيل
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 border border-slate-200 text-slate-600 font-bold text-sm py-2.5 px-6 rounded-xl hover:bg-slate-50 transition-all"
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
    </div>
  );
};

export default UserExplore;