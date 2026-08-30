import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLockClosed,
  HiEye,
  HiEyeOff,
} from "react-icons/hi";
import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
<<<<<<< HEAD
import { auth, db, createUserWithEmailAndPassword, doc, setDoc } from "../../firebase"; // استيراد دوال الفايربيز والفايرستور
=======
>>>>>>> 867bf80af104b836fe59700b37f470fda18ad33a

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "الاسم يجب أن يكون 3 أحرف على الأقل";
    }

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "صيغة البريد غير صحيحة";
    }

    if (!/^[0-9+\s]{9,}$/.test(formData.phone)) {
      newErrors.phone = "رقم الهاتف غير صحيح";
    }

    if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    if (!formData.terms) {
      newErrors.terms = "لازم توافق على الشروط والأحكام";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
<<<<<<< HEAD
      console.log("1. جاري إنشاء الحساب في Authentication...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      console.log("2. تم إنشاء الحساب بنجاح، الـ UID هو:", user.uid);

      console.log("3. جاري حفظ البيانات في Firestore...");
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date().toISOString()
      });
      console.log("4. تم حفظ البيانات في Firestore بنجاح تام!");

      localStorage.setItem('auth_token', user.accessToken);
      alert("تم إنشاء الحساب وحفظ البيانات بنجاح!");
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ خطأ تفصيلي أثناء التنفيذ:", error);
      alert("خطأ: " + error.message);
      setErrors({ email: error.message });
=======
      const response = await window.axios.post('/api/register', formData);
      localStorage.setItem('auth_token', response.data.token);
      navigate("/dashboard");
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error("حدث خطأ أثناء التسجيل", error);
      }
>>>>>>> 867bf80af104b836fe59700b37f470fda18ad33a
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">
        انضم إلينا 👋
      </h1>
      <p className="mt-1.5 text-sm text-neutral-500">
        قم بإنشاء حساب جديد للبدء
      </p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
        <Input
          label="الاسم الرباعي"
          icon={HiOutlineUser}
          name="fullName"
          placeholder="أدخل اسمك الكامل"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />

        <Input
          label="البريد الإلكتروني"
          icon={HiOutlineMail}
          type="email"
          name="email"
          placeholder="masaha@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          label="رقم الجوال"
          icon={HiOutlinePhone}
          type="tel"
          name="phone"
          placeholder="+970 59X XXX XXX"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
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

        <Input
          label="تأكيد كلمة المرور"
          icon={HiOutlineLockClosed}
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <label className="flex items-start gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-400"
          />
          <span>
            أوافق على{" "}
            <span className="font-medium text-brand-600 underline decoration-dotted">
              الشروط والأحكام
            </span>{" "}
            و{" "}
            <span className="font-medium text-brand-600 underline decoration-dotted">
              سياسة الخصوصية
            </span>
          </span>
        </label>
        {errors.terms && <p className="text-xs text-accent-coral">{errors.terms}</p>}

        <Button type="submit" isLoading={isSubmitting}>
          إنشاء حساب
        </Button>
      </form>
    </AuthLayout>
  );
}