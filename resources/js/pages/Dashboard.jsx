import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await window.axios.get('/api/user');
        setUser(response.data);
      } catch (error) {
        console.error("غير مصرح بالدخول", error);
        localStorage.removeItem('auth_token');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await window.axios.post('/api/logout');
    } catch (error) {
      console.error("خطأ أثناء تسجيل الخروج", error);
    } finally {
      localStorage.removeItem('auth_token');
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <p className="text-neutral-500">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">لوحة التحكم</h1>
            <p className="mt-1 text-sm text-neutral-500">مرحباً بعودتك، {user?.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="text-accent-coral border-accent-coral hover:bg-accent-coral/10">
            تسجيل الخروج
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-6">
            <h3 className="font-semibold text-neutral-700">بيانات الحساب</h3>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600">
              <li className="flex justify-between">
                <span>الاسم:</span>
                <span className="font-medium text-neutral-900">{user?.name}</span>
              </li>
              <li className="flex justify-between">
                <span>البريد الإلكتروني:</span>
                <span className="font-medium text-neutral-900">{user?.email}</span>
              </li>
              <li className="flex justify-between">
                <span>رقم الجوال:</span>
                <span className="font-medium text-neutral-900" dir="ltr">{user?.phone || 'غير محدد'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
