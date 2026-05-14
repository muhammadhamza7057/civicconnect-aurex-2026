import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, LogIn, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { demoAccounts } from '../components/DemoAccessPanel';

function routeByRole(role) {
  if (role === 'resident') return '/resident';
  if (role === 'staff') return '/staff';
  return '/admin';
}

const inputBase =
  'relative z-10 w-full rounded-xl border-2 border-slate-200 bg-white py-3.5 pl-12 text-base text-slate-900 placeholder:text-slate-500 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60';
const inputPlain = `${inputBase} pr-4`;
const inputWithToggle = `${inputBase} pr-12`;
const fieldWrap = 'relative mt-3';
const labelClass = 'text-[14px] font-semibold leading-snug text-slate-900';

export function EnhancedLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore(state => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin'); // signin, signup, demo
  
  const demoRole = searchParams.get('demo');
  const autoLogin = searchParams.get('autologin') === '1';
  const demoAccount = demoAccounts.find(account => account.role === demoRole);
  
  const { register, handleSubmit, setValue, trigger, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      identifier: demoAccount?.staffId || demoAccount?.email || '',
      password: demoAccount?.password || ''
    }
  });

  useEffect(() => {
    if (!demoAccount) return;
    setValue('identifier', demoAccount.staffId || demoAccount.email, { shouldValidate: true });
    setValue('password', demoAccount.password, { shouldValidate: true });
    setActiveTab('signin');
  }, [demoAccount, setValue]);

  useEffect(() => {
    if (!demoAccount || !autoLogin) return;
    const timer = window.setTimeout(() => {
      trigger().then(valid => {
        if (!valid) return;
        handleSubmit(onSubmit)();
      });
    }, 400);
    return () => window.clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoAccount, autoLogin]);

  const onSubmit = async values => {
    const raw = values.identifier.trim();
    if (!raw) {
      toast.error('Enter the email address or staff ID you were given.');
      return;
    }
    const payload = raw.includes('@')
      ? { email: raw.toLowerCase(), password: values.password }
      : { staff_id: raw, password: values.password };

    const profile = await toast.promise(login(payload), {
      loading: 'Checking your details…',
      success: 'You are signed in.',
      error: err =>
        err.message ||
        'We could not sign you in. Check your email or staff ID and password, then try again.'
    });
    navigate(routeByRole(profile?.role), { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Tabs */}
      <div className="mb-8 flex gap-2 border-b-2 border-slate-200">
        <button
          onClick={() => setActiveTab('signin')}
          className={`pb-3 px-1 text-sm font-semibold transition ${
            activeTab === 'signin'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setActiveTab('demo')}
          className={`pb-3 px-1 text-sm font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'demo'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap size={16} />
          Try Demo
        </button>
        <button
          onClick={() => navigate('/register')}
          className="pb-3 px-1 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          Sign Up
        </button>
      </div>

      {/* SIGN IN TAB */}
      {activeTab === 'signin' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter your email or staff ID to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="login-identifier" className={labelClass}>
                Email or Staff ID
              </label>
              <div className={fieldWrap}>
                <Mail
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <input
                  id="login-identifier"
                  autoComplete="username"
                  spellCheck={false}
                  aria-required="true"
                  aria-invalid={errors.identifier ? 'true' : 'false'}
                  className={inputPlain}
                  placeholder="name@example.com"
                  {...register('identifier', { required: 'Email or staff ID required' })}
                />
              </div>
              {errors.identifier && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" strokeWidth={2} aria-hidden />
                  {errors.identifier.message}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className={labelClass}>
                Password
              </label>
              <div className={fieldWrap}>
                <Lock
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  className={inputWithToggle}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden />
                  {errors.password.message}
                </div>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
              {!isSubmitting && <ArrowRight size={20} strokeWidth={2.5} aria-hidden />}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      )}

      {/* DEMO TAB */}
      {activeTab === 'demo' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900">Try a Demo Account</h2>
            <p className="mt-2 text-sm text-slate-600">
              Click any role to instantly access the dashboard. No signup required.
            </p>
          </div>

          <div className="space-y-3">
            {demoAccounts.map((account) => {
              const Icon = account.icon || Mail;
              return (
                <motion.button
                  key={account.role}
                  onClick={() => {
                    const loginUrl = `/login?demo=${account.role}&autologin=1`;
                    navigate(loginUrl);
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-400/10 p-2 text-blue-600">
                        <Icon size={20} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{account.label}</p>
                        <p className="text-xs text-slate-600">{account.note}</p>
                      </div>
                    </div>
                    <LogIn size={20} className="text-blue-600" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl bg-blue-50 p-4 border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">Demo Credentials</p>
            <div className="space-y-2 text-xs text-blue-800">
              {demoAccounts.map((account) => (
                <div key={account.role}>
                  <p className="font-semibold">{account.label}</p>
                  <p>Email: {account.email}</p>
                  {account.staffId && <p>Staff ID: {account.staffId}</p>}
                  <p>Password: {account.password}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
