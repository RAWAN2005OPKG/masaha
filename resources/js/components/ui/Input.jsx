import clsx from "clsx";


export default function Input({ label, icon: Icon, error, type = "text", trailing, ...rest }) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-neutral-400">
            <Icon size={18} />
          </span>
        )}
        <input
          type={type}
          className={clsx(
            "w-full rounded-xl border bg-white py-2.5 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400",
            "focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
            Icon ? "pr-10" : "pr-4",
            trailing ? "pl-10" : "pl-4",
            error ? "border-danger" : "border-neutral-200"
          )}
          {...rest}
        />
        {trailing && (
          <span className="absolute inset-y-0 left-3 flex items-center">
            {trailing}
          </span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}