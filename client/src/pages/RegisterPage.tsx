import { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye, EyeOff, Loader2, Mail, Phone, User,
  GraduationCap, Building, ArrowLeft, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

// ── Zod schemas ───────────────────────────────────────────────────────────────

const emailPasswordSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email'),
  phone:    z.string().min(10, 'Enter a valid 10-digit phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role:     z.enum(['student', 'owner']),
  college:  z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
}).refine((d) => d.role !== 'student' || (d.college && d.college.length >= 2), {
  message: 'College name is required for students', path: ['college'],
});

type EmailPasswordForm = z.infer<typeof emailPasswordSchema>;

// ── Role Selector ─────────────────────────────────────────────────────────────

function RoleSelector({ value, onChange }: { value: 'student' | 'owner'; onChange: (r: 'student' | 'owner') => void }) {
  return (
    <div>
      <label className="label">I am a...</label>
      <div className="grid grid-cols-2 gap-3">
        {(['student', 'owner'] as const).map((r) => (
          <button key={r} type="button" onClick={() => onChange(r)}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
              value === r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {r === 'student' ? <GraduationCap className="w-4 h-4" /> : <Building className="w-4 h-4" />}
            <span className="font-medium text-sm capitalize">{r}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 border-t border-gray-200" />
      <span className="text-xs text-gray-400 font-medium">OR</span>
      <div className="flex-1 border-t border-gray-200" />
    </div>
  );
}

// ── OTP Input ─────────────────────────────────────────────────────────────────

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
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
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

// ── Phone OTP Register ────────────────────────────────────────────────────────

function PhoneOtpRegister({ role, college, onSuccess }: {
  role: 'student' | 'owner';
  college?: string;
  onSuccess: (token: string, user: unknown) => void;
}) {
  const [phone,    setPhone]    = useState('');
  const [name,     setName]     = useState('');
  const [otp,      setOtp]      = useState('');
  const [step,     setStep]     = useState<'form' | 'otp'>('form');
  const [loading,  setLoading]  = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(30);
    const t = setInterval(() => setCooldown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  };

  const sendOtp = async () => {
    if (!phone || phone.replace(/\D/g, '').length < 10) { toast.error('Enter a valid 10-digit phone number.'); return; }
    if (!name || name.length < 2) { toast.error('Enter your full name.'); return; }
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
      const res = await api.post('/auth/phone/verify-otp', { phone, otp, name, role, college });
      onSuccess(res.data.token, res.data.user);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Invalid OTP.');
    } finally { setLoading(false); }
  };

  if (step === 'otp') return (
    <div className="space-y-4">
      <button onClick={() => setStep('form')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>
      <p className="text-sm text-gray-600 text-center">
        Enter the 6-digit code sent to <span className="font-semibold">{phone}</span>
      </p>
      <OtpInput value={otp} onChange={setOtp} />
      <button onClick={verify} disabled={loading || otp.length !== 6} className="btn-primary w-full">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Verify & Create Account'}
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
        <label className="label">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input pl-9" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      <button onClick={sendOtp} disabled={loading} className="btn-primary w-full">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</> : <><Phone className="w-4 h-4" /> Send OTP</>}
      </button>
    </div>
  );
}

// ── Main RegisterPage ─────────────────────────────────────────────────────────

type Tab = 'email' | 'phone';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate    = useNavigate();
  const [params]    = useSearchParams();
  const [tab,       setTab]       = useState<Tab>('email');
  const [role,      setRole]      = useState<'student' | 'owner'>((params.get('role') as 'student' | 'owner') || 'student');
  const [college,   setCollege]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [submitting,setSubmitting]= useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EmailPasswordForm>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: { role },
  });

  const formRole = watch('role');
  // Keep local role state in sync with form
  const handleRoleChange = (r: 'student' | 'owner') => { setRole(r); setValue('role', r); };

  const redirectAfterAuth = (userRole: string) => {
    if (userRole === 'owner') navigate('/owner/dashboard');
    else navigate('/student/dashboard');
  };

  const onEmailSubmit = async (data: EmailPasswordForm) => {
    setSubmitting(true);
    try {
      await registerUser({ name: data.name, email: data.email, phone: data.phone, password: data.password, role: data.role, college: data.college });
      toast.success('Account created! Welcome to CampusNest!');
      redirectAfterAuth(data.role);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Registration failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  const handlePhoneSuccess = (_token: string, user: unknown) => {
    const u = user as { role?: string };
    toast.success('Account created! Welcome to CampusNest!');
    redirectAfterAuth(u.role ?? 'student');
    // Refresh auth state
    window.location.href = u.role === 'owner' ? '/owner/dashboard' : '/student/dashboard';
  };

  return (
    <div className="w-full max-w-md">
      <div className="card p-7 shadow-lg">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join CampusNest — it's free</p>
        </div>

        {/* Role selector — shared across all tabs */}
        <RoleSelector value={role} onChange={handleRoleChange} />

        {role === 'student' && (
          <div className="mt-3">
            <label className="label">College / University</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input pl-9" placeholder="Your college name" value={college} onChange={(e) => { setCollege(e.target.value); setValue('college', e.target.value); }} />
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {([['email', 'Email & Password'], ['phone', 'Phone OTP']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Email + Password form */}
        {tab === 'email' && (
          <form onSubmit={handleSubmit(onEmailSubmit)} noValidate className="space-y-4">
            <input type="hidden" {...register('role')} />
            <input type="hidden" {...register('college')} />

            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input id="name" type="text" autoComplete="name" {...register('name')}
                  className={`input pl-9 ${errors.name ? 'border-red-300' : ''}`} placeholder="Your full name" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

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
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" autoComplete="tel" {...register('phone')}
                  className={`input pl-9 ${errors.phone ? 'border-red-300' : ''}`} placeholder="10-digit mobile number" />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} autoComplete="new-password" {...register('password')}
                  className={`input pr-10 ${errors.password ? 'border-red-300' : ''}`} placeholder="At least 6 characters" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPwd ? 'Hide' : 'Show'}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input type="password" autoComplete="new-password" {...register('confirmPassword')}
                className={`input ${errors.confirmPassword ? 'border-red-300' : ''}`} placeholder="Repeat your password" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full mt-1">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>
        )}

        {/* Phone OTP form */}
        {tab === 'phone' && (
          <PhoneOtpRegister role={role} college={college} onSuccess={handlePhoneSuccess} />
        )}

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
