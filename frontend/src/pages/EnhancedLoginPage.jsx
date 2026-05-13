import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

function routeByRole(role) {
  if (role === 'resident') return '/resident';
  if (role === 'staff') return '/staff';
  return '/admin';
}

const inputBase =
  'w-full rounded-2xl border-2 border-border bg-surface py-3.5 pl-12 text-base text-text placeholder:text-muted/90 shadow-sm transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60';
const inputPlain = `${inputBase} pr-4`;
const inputWithToggle = `${inputBase} pr-12`;
const fieldWrap = 'relative mt-2';
const labelClass = 'text-[15px] font-semibold leading-snug text-text';

export function EnhancedLoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { identifier: '', password: '' }
  });

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
      transition={{ duration: 0.3 }}
      className="cc-card space-y-7 p-8 sm:p-10 shadow-soft ring-1 ring-border/60"
    >
      <header className="space-y-2 border-b border-border/60 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">Sign in</h1>
        <p className="text-[15px] leading-relaxed text-text/88">
          Enter the <strong className="font-semibold text-text">email</strong> your account uses, or your{' '}
          <strong className="font-semibold text-text">staff ID</strong> if your organization signs you in that way.
          Staff IDs look like codes or numbers—if you are unsure, ask your administrator.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate aria-label="Sign in form">
        <div>
          <label htmlFor="login-identifier" className={labelClass}>
            Email or staff ID <span className="font-normal text-danger">*</span>
          </label>
          <div className={fieldWrap}>
            <Mail
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              id="login-identifier"
              autoComplete="username"
              spellCheck={false}
              aria-required="true"
              aria-invalid={errors.identifier ? 'true' : 'false'}
              aria-describedby="login-identifier-hint"
              className={inputPlain}
              placeholder="name@your-organization.org"
              {...register('identifier', { required: 'Enter your email or staff ID.' })}
            />
          </div>
          <p id="login-identifier-hint" className="mt-2 text-sm leading-relaxed text-muted">
            Tip: email addresses contain an @ symbol. Staff IDs usually do not.
          </p>
          {errors.identifier && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger" role="alert">
              <AlertCircle size={18} className="mt-0.5 shrink-0" strokeWidth={2} aria-hidden />
              {errors.identifier.message}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className={labelClass}>
            Password <span className="font-normal text-danger">*</span>
          </label>
          <div className={fieldWrap}>
            <Lock
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
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
              placeholder="Your password"
              {...register('password', { required: 'Enter your password.' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted ring-offset-surface transition hover:bg-surface-2 hover:text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password as plain text'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger" role="alert">
              <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden />
              {errors.password.message}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-semibold text-white shadow-glow transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-primary/35 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
            {!isSubmitting && <ArrowRight size={20} strokeWidth={2.5} aria-hidden />}
          </button>
          <p className="text-center text-sm leading-relaxed text-muted">
            Trouble signing in? Password resets and staff IDs are managed by your organization—not from this screen.
          </p>
        </div>
      </form>

      <footer className="border-t border-border/60 pt-6 text-center text-[15px] text-text/88">
        <span className="text-muted">No account yet?</span>{' '}
        <Link
          to="/register"
          className="font-semibold text-primary underline decoration-2 underline-offset-4 transition hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-sm"
        >
          Create an account
        </Link>
      </footer>
    </motion.div>
  );
}
