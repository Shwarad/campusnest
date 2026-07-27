import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, Phone, User, GraduationCap, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(10, 'Enter a valid 10-digit phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'owner']),
  college: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((d) => d.role !== 'student' || (d.college && d.college.length >= 2), {
  message: 'College name is required for students',
  path: ['college'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: (params.get('role') as 'student' | 'owner') || 'student' },
  });

  const role = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        college: data.college,
      });
      toast.success('Account created successfully! Welcome to CampusNest!');
      if (data.role === 'owner') navigate('/owner/dashboard');
      else navigate('/student/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card p-7 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join CampusNest — it's free</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="label">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {(['student', 'owner'] as const).map((r) => (
                <label
                  key={r}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    role === r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input type="radio" value={r} {...register('role')} className="sr-only" />
                  {r === 'student' ? <GraduationCap className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                  <span className="font-medium text-sm capitalize">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="name" className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="name" type="text" autoComplete="name" {...register('name')}
                className={`input pl-9 ${errors.name ? 'border-red-300' : ''}`} placeholder="Your full name" />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1" role="alert">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-email" className="label">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="reg-email" type="email" autoComplete="email" {...register('email')}
                className={`input pl-9 ${errors.email ? 'border-red-300' : ''}`} placeholder="you@example.com" />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1" role="alert">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="label">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="phone" type="tel" autoComplete="tel" {...register('phone')}
                className={`input pl-9 ${errors.phone ? 'border-red-300' : ''}`} placeholder="10-digit mobile number" />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1" role="alert">{errors.phone.message}</p>}
          </div>

          {role === 'student' && (
            <div>
              <label htmlFor="college" className="label">College / University</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input id="college" type="text" {...register('college')}
                  className={`input pl-9 ${errors.college ? 'border-red-300' : ''}`} placeholder="Your college name" />
              </div>
              {errors.college && <p className="text-red-500 text-xs mt-1" role="alert">{errors.college.message}</p>}
            </div>
          )}

          <div>
            <label htmlFor="reg-password" className="label">Password</label>
            <div className="relative">
              <input id="reg-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                {...register('password')} className={`input pr-10 ${errors.password ? 'border-red-300' : ''}`}
                placeholder="At least 6 characters" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1" role="alert">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">Confirm Password</label>
            <input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')}
              className={`input ${errors.confirmPassword ? 'border-red-300' : ''}`} placeholder="Repeat your password" />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1" role="alert">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
