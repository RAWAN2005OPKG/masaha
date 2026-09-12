import { useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HiOutlineMail, HiOutlineLockClosed, HiEye, HiEyeOff } from "react-icons/hi";
import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
// import { useAuthStore } from "../../store/authStore";

const loginSchema = z.object({
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("صيغة البريد غير صحيحة"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export default function Login() {
  const navigate = useNavigate();
  


  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  // const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const response = await axios.post('/api/login', data);
      localStorage.setItem('auth_token', response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setServerError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  };

  return (
    <AuthLayout
      title="تسجيل الدخول"
      subtitle="أهلاً فيك من جديد! سجّل دخولك عشان تكمل حجوزاتك"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="البريد الإلكتروني"
          icon={HiOutlineMail}
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="كلمة المرور"
          icon={HiOutlineLockClosed}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.password?.message}
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
          {...register("password")}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-neutral-600">
            <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-400" />
            تذكرني
          </label>
          <Link to="/forgot-password" className="font-medium text-primary-600 hover:underline">
            نسيت كلمة المرور؟
          </Link>
        </div>

        {serverError && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        )}

        {/* <Button type="submit" className="bg-red-500" isLoading={isSubmitting}>
          تسجيل الدخول
        </Button> */}
      
        <button
      type="submit"
      className="
      
        w-full py-4 px-6 rounded-xl font-bold text-white
        
        
        bg-[#00BBA7] hover:bg-[#009689] 
     
        shadow-lg shadow-[#00BBA7]/30 
        transition-all duration-300 transform active:scale-[0.98]
        
      
        flex items-center justify-center gap-2
        
     
        text-base md:text-lg
      "
    >
      <span>تسجيل الدخول</span>
      <RiArrowLeftLine className="text-xl" />
    </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        ما عندك حساب؟{" "}
        <Link to="/register" className="font-semibold text-primary-600 hover:underline">
          إنشاء حساب جديد
        </Link>
      </p>
      <p>worfhowgf</p>
    </AuthLayout>
  );
}