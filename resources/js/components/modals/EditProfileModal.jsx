import { useEffect, useRef, useState } from 'react';
import { RiCloseLine, RiPencilLine } from 'react-icons/ri';

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  if (!isOpen) return null;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  };

  const fields = [
    { key: 'name', label: 'الاسم الكامل', val: user?.name || 'أحمد محمد', type: 'text' },
    { key: 'email', label: 'البريد الإلكتروني', val: user?.email || 'ahmed.m@example.com', type: 'email' },
    { key: 'phone', label: 'رقم الهاتف', val: user?.phone || '059-123-4567', type: 'tel' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updated = {
      ...user,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
    };
    onSave?.(updated);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/70 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-[48px] p-10 relative shadow-2xl space-y-10 animate-in slide-in-from-top-10 duration-500 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-8 left-8 text-slate-300 hover:text-danger transition-colors cursor-pointer"
        >
          <RiCloseLine size={28} />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800">تعديل البروفايل</h2>
        </div>

        {/* Profile Pic */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="w-28 h-28 bg-[var(--primary)] rounded-[32px] flex items-center justify-center text-4xl text-white font-black shadow-xl shadow-[var(--primary)]/20 overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="الصورة الشخصية" className="w-full h-full object-cover" />
              ) : (
                (user?.name || 'أحمد محمد').charAt(0)
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -left-2 w-9 h-9 bg-white shadow-lg rounded-full flex items-center justify-center text-[var(--primary)] cursor-pointer hover:bg-[var(--primary)] hover:text-white transition-all border border-slate-100"
            >
              <RiPencilLine size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-5">
            {fields.map((f) => (
              <div key={f.key} className="space-y-2">
                <label className="text-xs font-bold text-[var(--primary)] pr-2">{f.label}</label>
                <input
                  type={f.type}
                  name={f.key}
                  defaultValue={f.val}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] transition-all"
                />
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--primary)] pr-2">كلمة المرور</label>
              <input
                type="password"
                name="password"
                placeholder="اتركه فارغاً لعدم التغيير"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 placeholder:font-normal placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] transition-all"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-[var(--primary)] text-white font-black py-4 rounded-full shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 transition-all cursor-pointer"
            >
              حفظ التغييرات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-slate-200 text-slate-500 font-black py-4 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;