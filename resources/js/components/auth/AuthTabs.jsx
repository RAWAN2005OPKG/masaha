import { NavLink } from "react-router-dom";
import clsx from "clsx";

export default function AuthTabs() {
  const baseTab =
    "flex-1 rounded-lg py-2 text-center text-sm font-semibold transition-colors md:text-base";

  return (
    <div className="mb-8 flex w-full max-w-sm gap-1 rounded-xl bg-neutral-100 p-1">
      <NavLink
        to="/login"
        className={({ isActive }) =>
          clsx(
            baseTab,
            isActive
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          )
        }
      >
        تسجيل الدخول
      </NavLink>

      <NavLink
        to="/register"
        className={({ isActive }) =>
          clsx(
            baseTab,
            isActive
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          )
        }
      >
        حساب جديد
      </NavLink>
    </div>
  );
}