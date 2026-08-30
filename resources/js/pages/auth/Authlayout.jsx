import { HiOutlineOfficeBuilding, HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { HiOutlineWifi, HiOutlineBolt, HiOutlineUserGroup, HiSparkles } from "react-icons/hi2";
import AuthTabs from "./AuthTabs";

const features = [
  {
    icon: HiOutlineWifi,
    iconBg: "bg-brand-500/10 text-brand-400",
    title: "إنترنت فائق السرعة",
    subtitle: "حتى Mbps 200 في جميع المساحات",
  },
  {
    icon: HiOutlineBolt,
    iconBg: "bg-accent-amber/10 text-accent-amber",
    title: "كهرباء متواصلة",
    subtitle: "طاقة شمسية ومولدات احتياطية",
  },
  {
    icon: HiOutlineUserGroup,
    iconBg: "bg-accent-indigo/10 text-accent-indigo",
    title: "مجتمع ريادي نشط",
    subtitle: "أكثر من 120 عضو في المنصة",
  },
];

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row" dir="rtl">
      {/* البانل الغامق - يظهر من md فما فوق، على الموبايل بيختفي عشان الفورم ياخد الأولوية */}
      <div className="relative hidden w-full flex-col justify-center bg-panel px-10 py-12 md:flex md:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
              <HiOutlineOfficeBuilding size={20} />
            </span>
            <div className="leading-tight">
              <p className="font-bold text-white">مساحة</p>
              <p className="text-[10px] tracking-widest text-neutral-500">MASAHA</p>
            </div>
          </div>

          <span className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-panel">
            <HiSparkles className="text-brand-500" />
            المنصة الأولى لمساحات العمل المشتركة
          </span>

          <h1 className="text-3xl font-bold leading-snug text-white lg:text-4xl">
            اعمل، ابتكر، انجح معنا.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-500 lg:text-base">
            منصة متكاملة تربط رواد الأعمال بمساحات العمل المشتركة في كل مكان.
          </p>

          <div className="mt-10 space-y-3">
            {features.map(({ icon: Icon, iconBg, title, subtitle }) => (
              <div
                key={title}
                className="flex items-center justify-between rounded-xl bg-panel-card px-4 py-3.5"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
                  <Icon size={20} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* البانل الأبيض - الفورم */}
      <div className="relative flex w-full flex-1 flex-col items-center justify-center bg-white px-6 py-10 sm:px-10 md:w-1/2">
        <div className="flex w-full max-w-sm flex-col items-center">
          <AuthTabs />
          <div className="w-full">{children}</div>
        </div>

        <button
          type="button"
          className="absolute bottom-6 left-6 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-400 hover:text-neutral-600"
          aria-label="مساعدة"
        >
          <HiOutlineQuestionMarkCircle size={18} />
        </button>

        <p className="mt-10 text-center text-xs text-neutral-400">
          © 2026 مساحة — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}