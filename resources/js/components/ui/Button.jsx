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
    primary: "bg-primary-500 text-white hover:bg-primary-600",
    outline:
      "border border-neutral-200 text-neutral-700 hover:bg-neutral-50",
    ghost: "text-primary-600 hover:bg-primary-50",
  };

  return (
    <button
      type={type}
      className={clsx(base, variants[variant], className)}
      disabled={isLoading}
      {...rest}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}