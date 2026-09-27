import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  className,
  isLoading,
  type = "button",
  ...rest
}) {
  const base =
    "w-full rounded-xl py-2.5 text-sm md:text-base font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    outline:
      "border border-neutral-200 text-neutral-700 hover:bg-neutral-50",
    ghost: "text-blue-600 hover:bg-blue-50",
  };

  return (
    <button
      type={type}
      className={`w-full rounded-xl py-2.5 text-sm md:text-base font-semibold bg-emerald-500 text-white hover:bg-emerald-600 ${className}`}
      disabled={isLoading}
      {...rest}
    >
      {isLoading ? "جاري التحميل..." : children}
    </button>
  );
}