import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineMail, HiOutlineLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // نمسح رسالة الخطأ فور ما المستخدم يبلش يعدّل الحقل
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "صيغة البريد غير صحيحة";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await window.axios.post('/api/login', formData);
      localStorage.setItem('auth_token', response.data.token);
      setSuccessMsg("تم تسجيل الدخول بنجاح! جاري التوجيه...");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ email: "بيانات الدخول غير صحيحة أو حدث خطأ بالاتصال" });
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">
        مرحباً بك 👋
      </h1>
      <p className="mt-1.5 text-sm text-neutral-500">
        سجل دخولك للمتابعة إلى منصتك
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
        <Input
          label="البريد الإلكتروني"
          icon={HiOutlineMail}
          type="email"
          name="email"
          placeholder="user@masaha.ps"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          label="كلمة المرور"
          icon={HiOutlineLockClosed}
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="text-neutral-400 hover:text-neutral-600"
              aria-label="إظهار/إخفاء كلمة المرور"
            >
              {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
            </button>
          }
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-neutral-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-400"
            />
            تذكرني لمدة 30 يوماً
          </label>
          <button
            type="button"
            className="font-medium text-accent-coral hover:underline"
            title="لسا مو مفعّلة بهاي النسخة التجريبية"
          >
            نسيت كلمة المرور؟
          </button>
        </div>

        {successMsg && (
          <p className="rounded-lg bg-brand-500/10 px-3 py-2 text-sm text-brand-600">
            {successMsg}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting}>
          تسجيل الدخول
        </Button>
      </form>
    </AuthLayout>
  );
}