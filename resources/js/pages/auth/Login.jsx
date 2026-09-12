import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  RiEyeOffLine, RiEyeLine, RiArrowLeftLine, 
  RiWifiLine, RiFlashlightLine, RiGroupLine, RiQuestionLine, RiBuilding2Line 
} from 'react-icons/ri';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const isLoginPage = location.pathname === '/login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // تسجيل الدخول الوهمي لصاحب المساحة
    if (email.includes('@spaces.ps') || email === 'owner@masaha.ps' || password === 'owner') {
      navigate('/owner-dashboard');
      return;
    }

    try {
      const res = await window.axios.post('/api/login', { email, password });
      localStorage.setItem('auth_token', res.data.token);
      
      // التوجيه بناءً على الصلاحيات
      if (res.data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg('بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-white font-['Cairo'] overflow-x-hidden">
      
   
{/* start-left-section */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#05231D] relative flex-col p-12 overflow-hidden justify-between border-l border-white/5">
                 <div className="flex items-center gap-3 self-start mb-12">
                    <div className="w-12 h-12 bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] rounded-xl flex items-center justify-center text-2xl text-white font-black shadow-lg shadow-[#00BBA7]/20"><RiBuilding2Line /></div>
                     <div className="text-left">
                         <h2 className="text-white font-black text-xl leading-none">مساحة</h2>
                         <span className="text-[10px] text-[var(--color-brand-400)] font-bold tracking-[4px] uppercase">MASAHA</span>
                     </div>
                    
                 </div>
         
                 <div className="flex-1 flex flex-col justify-center space-y-8 relative z-10">
                   <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full w-fit border border-white/10">
                     <span className="w-2 h-2 bg-[var(--color-brand-500)] rounded-full animate-pulse"></span>
                     <span className="text-white text-xs font-bold uppercase tracking-wider">المنصة الأولى لمساحات العمل المشتركة</span>
                   </div>
                   <h2 className="text-3xl xl:text-5xl font-black text-white leading-tight">اعمل، ابتكر، <br/>انجح معنا.</h2>
                   <p className="text-white/60 max-w-sm text-lg leading-relaxed font-medium">منصة متكاملة تربط رواد الأعمال بمساحات العمل المشتركة في كل مكان.</p>
                   <div className="grid grid-cols-1 gap-4 pt-8">
                     {[
                       { icon: <RiWifiLine className="text-[#00BBA7]" />, title: 'إنترنت فائق السرعة', desc: 'حتى 200 Mbps في جميع المساحات' },
                       { icon: <RiFlashlightLine className="text-amber-400 " />, title: 'كهرباء متواصلة', desc: 'طاقة شمسية ومولدات احتياطية' },
                       { icon: <RiGroupLine className="text-indigo-400" />, title: 'مجتمع ريادي نشط', desc: 'أكثر من ١٢٠ عضو في المنصة' }
                     ].map((f, i) => (
                       <div key={i} className="flex items-center gap-5 bg-white/5 border border-white/10 p-3 rounded-[28px] backdrop-blur-sm transition-all hover:bg-white/10">
                         <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">{f.icon}</div>
                         <div><h4 className="text-white font-bold">{f.title}</h4><p className="text-white/40 text-[10px] mt-1 font-bold">{f.desc}</p></div>
                       </div>
                     ))}
                   </div>
                 </div>
                 <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#00BBA7]/10 rounded-full blur-[120px]"></div>
               </div>

{/* end-left-section */}
{/* start-right-section */}

      <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-12 relative min-h-screen overflow-y-auto">
        
        <div className="flex justify-center w-full mb-10">
          <div className="inline-flex bg-[#F1F5F9] p-1.5 rounded-[20px] w-full max-w-[340px] shadow-inner">
            <button 
              onClick={() => navigate('/login')}
              className={`flex-1 py-3 px-6 rounded-[16px] text-sm font-bold transition-all duration-300 cursor-pointer ${isLoginPage ? 'bg-white text-[#009689] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              تسجيل الدخول
            </button>
            <button 
              onClick={() => navigate('/register')}
              className={`flex-1 py-3 px-6 rounded-[16px] text-sm font-bold transition-all duration-300 cursor-pointer ${!isLoginPage ? 'bg-white text-[#009689] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              حساب جديد
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 flex items-center justify-center gap-2">
              مرحباً بك <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-slate-400 text-sm font-bold">سجل دخولك للمتابعة إلى منصتك</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && <p className="text-red-500 text-sm font-bold text-center">{errorMsg}</p>}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 pr-2 uppercase tracking-wider">البريد الإلكتروني</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@masaha.ps" className="w-full bg-white border border-slate-200 rounded-xl py-4 px-5 text-left font-sans focus:outline-none focus:ring-4 focus:ring-[#00BBA7]/10 focus:border-[#00BBA7] transition-all" required />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">كلمة المرور</label>
               
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white border border-slate-200 rounded-xl py-4 px-12 text-left font-sans focus:outline-none focus:ring-4 focus:ring-[#00BBA7]/10 focus:border-[#00BBA7] transition-all" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#009689] cursor-pointer">
                  {showPassword ? <RiEyeLine size={20} /> : <RiEyeOffLine size={20} />}
                </button>
              </div>
            </div>
        <div className="flex justify-between items-center px-2">
           <div className="flex items-center gap-2 px-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-[#00BBA7] focus:ring-[#00BBA7] cursor-pointer" />
              <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer">تذكرني لمدة 30 يوماً</label>
            </div>

                <button type="button" onClick={() => navigate('/forgot-password')} className="text-[10px] font-black text-red-400 hover:underline cursor-pointer">نسيت كلمة المرور؟</button>
              </div>         

            <button type="submit" className="w-full bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white py-4 rounded-xl font-black flex items-center justify-center gap-3 shadow-lg shadow-[#00BBA7]/20 transition-all active:scale-[0.98] cursor-pointer">
              <span>تسجيل الدخول</span>
              <RiArrowLeftLine size={20} />
            </button>
          </form>
        </div>

        <div className="mt-auto text-center py-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">© ٢٠٢٤ مساحة — جميع الحقوق محفوظة</div>
        <button className="fixed bottom-6 right-6 lg:relative lg:bottom-0 lg:right-0 lg:self-start w-12 h-12 bg-white border border-slate-100 shadow-lg rounded-full flex items-center justify-center text-slate-400 hover:text-[#00BBA7] transition-all cursor-pointer"><RiQuestionLine size={24} /></button>
      </div>
{/* end-right-section */}

    </div>
  );
};
export default Login;