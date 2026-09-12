import React from 'react';

const PageHeader = ({ title, icon, role, roleIcon, children }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-sm">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">{title}</h1>
          {role && (
            <div className="flex items-center gap-1 text-slate-400 text-sm mt-1 font-bold">
              {roleIcon && <span>{roleIcon}</span>}
              <span className="uppercase tracking-widest">{role}</span>
            </div>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
