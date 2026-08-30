import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const registerSchema = z
  .object({
    fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
    email: z.string().min(1, "البريد الإلكتروني مطلوب").email("صيغة البريد غير صحيحة"),
    phone: z
      .string()
      .min(9, "رقم الهاتف غير صحيح")
      .regex(/^[0-9+\s]+$/, "رقم الهاتف يجب أن يحتوي أرقام فقط"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      // await authService.register(data);
      console.log("register payload", data);
      navigate("/login");
    } catch (err) {
      setServerError("حدث خطأ أثناء إنشاء الحساب، حاول مرة أخرى");
    }
  };

  return (
    <AuthLayout
      title="إنشاء حساب جديد"
      subtitle="سجّل بياناتك عشان تبلش تحجز مساحتك المفضلة"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="الاسم الكامل"
          icon={HiOutlineUser}
          placeholder="محمد أحمد"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <Input
          label="البريد الإلكتروني"
          icon={HiOutlineMail}
          type="email"
          placeholder="example@email.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="رقم الهاتف"
          icon={HiOutlinePhone}
          type="tel"
          placeholder="05xxxxxxxx"
          error={errors.phone?.message}
          {...register("phone")}
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

        <Input
          label="تأكيد كلمة المرور"
          icon={HiOutlineLockClosed}
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {serverError && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting}>
          إنشاء الحساب
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        عندك حساب مسبقاً؟{" "}
        <Link to="/login" className="font-semibold text-primary-600 hover:underline">
          تسجيل الدخول
        </Link>
      </p>
    </AuthLayout>
  );
}