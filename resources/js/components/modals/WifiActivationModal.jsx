import { useState } from 'react';
import {
  RiWifiLine,
  RiCheckboxCircleFill,
  RiUserLine,
  RiLockPasswordLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckboxCircleLine,
} from 'react-icons/ri';

const WifiActivationModal = ({ isOpen, onClose, notification, onConfirm }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen || !notification) return null;

  const canSubmit = username.trim().length > 0 && password.trim().length > 0;

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm(notification.id, { username: username.trim(), password });
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/60 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl">
        {/* الهيدر */}
        <div className="flex shrink-0 items-start gap-3 border-b border-slate-100 p-6">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, white)' }}
          >
            <RiWifiLine size={20} style={{ color: 'var(--primary)' }} />
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-extrabold text-slate-800">إدخال بيانات الإنترنت</h3>
            <p className="text-xs leading-relaxed text-slate-400">
              أدخل اسم المستخدم وكلمة المرور التي سترسل للمستخدم فور التأكيد
            </p>
          </div>
        </div>

        {/* المحتوى — قابل للسكرول */}
        <div className="space-y-5 overflow-y-auto p-6">
          {/* بطاقة المستخدم/المساحة */}
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <RiCheckboxCircleFill size={20} className="shrink-0 text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-emerald-700">{notification.userName}</span>
              <span className="text-[11px] font-semibold text-emerald-600">
                {notification.spaceName} • {notification.price}
              </span>
            </div>
          </div>

          {/* اسم المستخدم */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <RiUserLine size={14} className="text-slate-400" />
              اسم المستخدم (للنت)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="مثال: user_ahmed2024"
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none placeholder:font-normal placeholder:text-slate-300"
            />
          </div>

          {/* كلمة المرور */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <RiLockPasswordLine size={14} className="text-slate-400" />
              كلمة المرور (للنت)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة مرور قوية"
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3.5 pr-4 pl-11 text-sm font-bold outline-none placeholder:font-normal placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
              </button>
            </div>
          </div>

          {/* ملاحظة توضيحية */}
          <div className="flex items-start gap-2 rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <RiWifiLine size={16} className="mt-0.5 shrink-0 text-sky-500" />
            <p className="text-[11px] font-semibold leading-relaxed text-sky-700">
              بمجرد الضغط على "إرسال وتفعيل الحجز" ستظهر هذه البيانات للمستخدم فوراً في صفحة حجوزاته
            </p>
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-500 transition hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canSubmit}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 enabled:active:scale-[0.98]"
              style={canSubmit ? { backgroundColor: '#16A34A' } : undefined}
            >
              إرسال وتفعيل الحجز
              <RiCheckboxCircleLine size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WifiActivationModal;