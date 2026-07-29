import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye, EyeOff, Loader2, User, Mail, Phone,
  BookOpen, Building, ArrowLeft, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

// ── Schemas ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

// ── Demo accounts ─────────────────────────────────────────────────────────────

const DEMO_ACCOUNTS = [
  { label: 'Student Demo',  email: 'student@campusnest.demo', password: 'Demo@123', role: 'student', icon: User,     color: 'text-primary-500' },
  { label: 'Owner Demo',    email: 'owner@campusnest.demo',   password: 'Demo@123', role: 'owner',   icon: Building, color: 'text-teal-500'    },
  { label: 'Admin Demo',    email: 'admin@campusnest.demo',   password: 'Demo@123', role: 'admin',   icon: BookOpen, color: 'text-purple-500'  },
];

// ── Shared helpers ────────────────────────────────────────────────────────────

function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 border-t border-gray-200" />
      <span className="text-xs text-gray-400 font-medium">OR</span>
      <div className="flex-1 border-t border-gray-200" />
    </div>
  );
}

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits  = value.padEnd(6, '').split('').slice(0, 6);

  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    onChange(next.join(''));
    if (d && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted.padEnd(6, '').slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`w-11 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100 ${
            d ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-white'
          }`}
        />
      ))}
    </div>
  );
}

// ── Phone OTP login flow ──────────────────────────────────────────────────────

function PhoneLogin({ onSuccess }: { onSuccess: () => void }) {
  const { loginWithPhone } = useAuth();
  const [phone,    setPhone]    = useState('');
  const [otp,      setOtp]      = useState('');
  const [step,     setStep]     = useState<'phone' | 'otp'>('phone');
  const [loading,  setLoading]  = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(30);
    const t = setInterval(() => setCooldown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  };

  const sendOtp = async () => {
    if (!phone || phone.replace(/\D/g, '').length < 10) { toast.error('Enter a valid phone number.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/phone/send-otp', { phone });
      setStep('otp');
      startCooldown();
      toast.success('OTP sent!');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  const verify = async () => {
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP.'); return; }
    setLoading(true);
    try {
      await loginWithPhone(phone, otp);
      toast.success('Welcome back!');
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Invalid OTP.');
    } finally { setLoading(false); }
  };

  if (step === 'otp') return (
    <div className="space-y-4">
      <button onClick={() => setStep('phone')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <p className="text-sm text-gray-600 text-center">
        Enter the 6-digit code sent to <span className="font-semibold">{phone}</span>
      </p>
      <OtpInput value={otp} onChange={setOtp} />
      <button onClick={verify} disabled={loading || otp.length !== 6} className="btn-primary w-full">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Verify & Sign In'}
      </button>
      <button disabled={cooldown > 0 || loading} onClick={() => { setOtp(''); sendOtp(); }}
        className="w-full text-sm text-primary-600 disabled:text-gray-400 flex items-center justify-center gap-1">
        <RefreshCw className="w-3.5 h-3.5" />
        {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" type="tel" placeholder="+91 98765 43210"
            value={phone} onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendOtp()} />
        </div>
      </div>
      <button onClick={sendOtp} disabled={loading} className="btn-primary w-full">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</> : <><Phone className="w-4 h-4" /> Send OTP</>}
      </button>
    </div>
  );
}

// ── Email OTP (passwordless) login flow ───────────────────────────────────────

function EmailOtpLogin({ onSuccess }: { onSuccess: () => void }) {
  const { loginWithEmailOtp } = useAuth();
  const [email,    setEmail]    = useState('');
  const [otp,      setOtp]      = useState('');
  const [step,     setStep]     = useState<'email' | 'otp'>('email');
  const [loading,  setLoading]  = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(60);
    const t = setInterval(() => setCooldown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  };

  const sendOtp = async () => {
    if (!email.includes('@')) { toast.error('Enter a valid email address.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/email/send-otp', { email });
      setStep('otp');
      startCooldown();
      toast.success('Check your inbox for the sign-in code.');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Failed to send code.');
    } finally { setLoading(false); }
  };

  const verify = async () => {
    if (otp.length !== 6) { toast.error('Enter the 6-digit code.'); return; }
    setLoading(true);
    try {
      await loginWithEmailOtp(email, otp);
      toast.success('Welcome back!');
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Invalid or expired code.');
    } finally { setLoading(false); }
  };

  if (step === 'otp') return (
    <div className="space-y-4">
      <button onClick={() => setStep('email')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <p className="text-sm text-gray-600 text-center">
        Enter the 6-digit code sent to <span className="font-semibold">{email}</span>
      </p>
      <OtpInput value={otp} onChange={setOtp} />
      <button onClick={verify} disabled={loading || otp.length !== 6} className="btn-primary w-full">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Verify & Sign In'}
      </button>
      <button disabled={cooldown > 0 || loading} onClick={() => { setOtp(''); sendOtp(); }}
        className="w-full text-sm text-primary-600 disabled:text-gray-400 flex items-center justify-center gap-1">
        <RefreshCw className="w-3.5 h-3.5" />
        {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Email address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" type="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendOtp()} />
        </div>
      </div>
      <button onClick={sendOtp} disabled={loading} className="btn-primary w-full">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending code...</> : <><Mail className="w-4 h-4" /> Send Sign-in Code</>}
      </button>
    </div>
  );
}

// ── Main LoginPage ────────────────────────────────────────────────────────────

type Tab = 'password' | 'phone' | 'emailotp';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate    = useNavigate();
  const [tab,       setTab]        = useState<Tab>('password');
  const [showPwd,   setShowPwd]    = useState(false);
  const [submitting,setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const redirectAfterLogin = () => {
    const user = JSON.parse(localStorage.getItem('campusnest_user') || '{}');
    if (user.role === 'admin')  navigate('/admin/dashboard');
    else if (user.role === 'owner') navigate('/owner/dashboard');
    else navigate('/student/dashboard');
  };

  const onPasswordSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      redirectAfterLogin();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Login failed. Check your credentials.');
    } finally { setSubmitting(false); }
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'password', label: 'Password'  },
    { id: 'phone',    label: 'Phone OTP' },
    { id: 'emailotp', label: 'Email OTP' },
  ];

  return (
    <div className="w-full max-w-md">
      <div className="card p-7 shadow-lg">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your CampusNest account</p>
        </div>

        {/* Demo Accounts */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Quick Demo</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button key={acc.role} type="button" onClick={() => { setValue('email', acc.email); setValue('password', acc.password); setTab('password'); }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <acc.icon className={`w-4 h-4 ${acc.color}`} />
                <span className="text-xs font-medium text-gray-700">{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4 gap-1">
          {TABS.map(({ id, label }) => (
            <button key={id} type="button" onClick={() => setTab(id)}
              className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${tab === id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Password tab */}
        {tab === 'password' && (
          <form onSubmit={handleSubmit(onPasswordSubmit)} noValidate className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" autoComplete="email" {...register('email')}
                  className={`input pl-9 ${errors.email ? 'border-red-300' : ''}`} placeholder="you@example.com" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} autoComplete="current-password" {...register('password')}
                  className={`input pr-10 ${errors.password ? 'border-red-300' : ''}`} placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPwd ? 'Hide' : 'Show'}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        )}

        {/* Phone OTP tab */}
        {tab === 'phone' && <PhoneLogin onSuccess={redirectAfterLogin} />}

        {/* Email OTP tab */}
        {tab === 'emailotp' && <EmailOtpLogin onSuccess={redirectAfterLogin} />}

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
