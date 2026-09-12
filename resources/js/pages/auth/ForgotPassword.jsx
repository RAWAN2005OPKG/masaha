import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  RiEyeOffLine, RiEyeLine, RiArrowLeftLine, RiArrowRightLine,
  RiWifiLine, RiFlashlightLine, RiGroupLine, RiQuestionLine, RiBuilding2Line 
} from 'react-icons/ri';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await window.axios.post('/api/password/forgot', { email });
      setSuccessMsg('تم إرسال الرمز إلى بريدك الإلكتروني');
      setStep(2);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'البريد الإلكتروني غير مسجل');
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await window.axios.post('/api/password/verify-code', { email, code });
      setSuccessMsg('تم التحقق من الرمز بنجاح');
      setStep(3);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'رمز التحقق غير صحيح');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await window.axios.post('/api/password/reset', { email, code, password });
      setSuccessMsg('تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-white font-['Cairo'] overflow-x-hidden">
      
      {/* start-left-section */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#05231D] relative flex-col p-12 overflow-hidden justify-between border-l border-white/5">
        <div className="flex items-center gap-3 self-start mb-12 cursor-pointer" onClick={() => navigate('/login')}>
          <div className="w-12 h-12 bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] rounded-xl flex items-center justify-center text-2xl text-white font-black shadow-lg shadow-[#00BBA7]/20"><RiBuilding2Line /></div>
          <div className="text-left">
              <h2 className="text-white font-black text-xl leading-none">مساحة</h2>
              <span className="text-[10px] text-[var(--color-brand-400)] font-bold tracking-[4px] uppercase">MASAHA</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-white/10">
            <span className="w-2 h-2 bg-[var(--color-brand-500)] rounded-full animate-pulse"></span>
            <span className="text-white text-xs font-bold uppercase tracking-wider">استعادة الحساب</span>
          </div>
          <h2 className="text-3xl xl:text-5xl font-black text-white leading-tight">لا تقلق، <br/>نحن هنا للمساعدة.</h2>
          <p className="text-white/60 max-w-sm text-lg leading-relaxed font-medium">اتبع الخطوات لاستعادة الوصول إلى حسابك ومتابعة أعمالك.</p>
          <div className="grid grid-cols-1 gap-4 pt-8">
            <div className={`flex items-center gap-5 border p-3 rounded-[28px] backdrop-blur-sm transition-all ${step >= 1 ? 'bg-white/10 border-[#00BBA7]/50' : 'bg-white/5 border-white/10'}`}>
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-xl text-[#00BBA7] font-bold">1</div>
              <div><h4 className="text-white font-bold">أدخل بريدك الإلكتروني</h4></div>
            </div>
            <div className={`flex items-center gap-5 border p-3 rounded-[28px] backdrop-blur-sm transition-all ${step >= 2 ? 'bg-white/10 border-[#00BBA7]/50' : 'bg-white/5 border-white/10'}`}>
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-xl text-amber-400 font-bold">2</div>
              <div><h4 className="text-white font-bold">أدخل رمز التحقق</h4></div>
            </div>
            <div className={`flex items-center gap-5 border p-3 rounded-[28px] backdrop-blur-sm transition-all ${step >= 3 ? 'bg-white/10 border-[#00BBA7]/50' : 'bg-white/5 border-white/10'}`}>
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-xl text-indigo-400 font-bold">3</div>
              <div><h4 className="text-white font-bold">كلمة مرور جديدة</h4></div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#00BBA7]/10 rounded-full blur-[120px]"></div>
      </div>
      {/* end-left-section */}

      {/* start-right-section */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-12 relative min-h-screen overflow-y-auto">
        <button onClick={() => step === 1 ? navigate('/login') : setStep(step - 1)} className="self-start text-slate-400 hover:text-[#00BBA7] flex items-center gap-2 text-sm font-bold transition-colors cursor-pointer mb-8">
          <RiArrowRightLine />
          العودة
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 flex items-center justify-center gap-2">
              استعادة كلمة المرور
            </h1>
            <p className="text-slate-400 text-sm font-bold">
              {step === 1 && 'أدخل بريدك الإلكتروني المسجل لدينا'}
              {step === 2 && 'أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك'}
              {step === 3 && 'قم بتعيين كلمة مرور جديدة وقوية لحسابك'}
            </p>
          </div>

          {errorMsg && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-lg">{errorMsg}</p>}
          {successMsg && <p className="text-[#00BBA7] text-sm font-bold text-center bg-[#00BBA7]/10 p-3 rounded-lg">{successMsg}</p>}

          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pr-2 uppercase tracking-wider">البريد الإلكتروني</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@masaha.ps" className="w-full bg-white border border-slate-200 rounded-xl py-4 px-5 text-left font-sans focus:outline-none focus:ring-4 focus:ring-[#00BBA7]/10 focus:border-[#00BBA7] transition-all" required />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 shadow-lg shadow-[#00BBA7]/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50">
                <span>{loading ? 'جاري الإرسال...' : 'إرسال الرمز'}</span>
                <RiArrowLeftLine size={20} />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pr-2 uppercase tracking-wider">رمز التحقق</label>
                <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="123456" className="w-full bg-white border border-slate-200 rounded-xl py-4 px-5 text-center text-2xl font-sans tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-[#00BBA7]/10 focus:border-[#00BBA7] transition-all" required maxLength={6} />
              </div>

              <button type="submit" disabled={loading || code.length < 5} className="w-full bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 shadow-lg shadow-[#00BBA7]/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50">
                <span>{loading ? 'جاري التحقق...' : 'تأكيد الرمز'}</span>
                <RiArrowLeftLine size={20} />
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 pr-2 uppercase tracking-wider">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white border border-slate-200 rounded-xl py-4 px-12 text-left font-sans focus:outline-none focus:ring-4 focus:ring-[#00BBA7]/10 focus:border-[#00BBA7] transition-all" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#009689] cursor-pointer">
                    {showPassword ? <RiEyeLine size={20} /> : <RiEyeOffLine size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 shadow-lg shadow-[#00BBA7]/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50">
                <span>{loading ? 'جاري الحفظ...' : 'حفظ وتسجيل الدخول'}</span>
                <RiArrowLeftLine size={20} />
              </button>
            </form>
          )}
        </div>

        <div className="mt-auto text-center py-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">© ٢٠٢٤ مساحة — جميع الحقوق محفوظة</div>
        <button className="fixed bottom-6 right-6 lg:relative lg:bottom-0 lg:right-0 lg:self-start w-12 h-12 bg-white border border-slate-100 shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-[#00BBA7] transition-all cursor-pointer"><RiQuestionLine size={24} /></button>
      </div>
      {/* end-right-section */}

    </div>
  );
};

export default ForgotPassword;
