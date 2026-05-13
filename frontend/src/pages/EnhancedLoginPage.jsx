import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

function routeByRole(role) {
  if (role === 'resident') return '/resident';
  if (role === 'staff') return '/staff';
  return '/admin';
}

export function EnhancedLoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      email: 'resident@example.com',
      password: 'password123'
    }
  });

  const onSubmit = async values => {
    const profile = await toast.promise(login(values), {
      loading: 'Securing your session...',
      success: 'Welcome to CivicConnect!',
      error: err => err.message || 'Unable to sign in'
    });
    navigate(routeByRole(profile?.role), { replace: true });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="cc-card space-y-8 p-8 sm:p-10 shadow-soft">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Sign in</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-text">Welcome to CivicConnect</h2>
        <p className="mt-2 text-sm text-muted">Manage civic operations with AI assistance and real-time collaboration.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* EMAIL FIELD */}
        <div>
          <label className="text-sm font-semibold text-text">Email</label>
          <div className="relative mt-2">
            <Mail size={18} className="absolute left-4 top-3.5 text-muted" strokeWidth={1.5} />
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-text outline-none transition focus:border-primary focus:bg-white/10"
              {...register('email', { required: 'Email is required' })}
            />
          </div>
          {errors.email && (
            <div className="mt-2 flex items-center gap-2 text-sm text-danger">
              <AlertCircle size={16} strokeWidth={2} />
              {errors.email.message}
            </div>
          )}
        </div>

        {/* PASSWORD FIELD */}
        <div>
          <label className="text-sm font-semibold text-text">Password</label>
          <div className="relative mt-2">
            <Lock size={18} className="absolute left-4 top-3.5 text-muted" strokeWidth={1.5} />
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-text outline-none transition focus:border-primary focus:bg-white/10"
              {...register('password', { required: 'Password is required' })}
            />
          </div>
          {errors.password && (
            <div className="mt-2 flex items-center gap-2 text-sm text-danger">
              <AlertCircle size={16} strokeWidth={2} />
              {errors.password.message}
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <button
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
          {!isSubmitting && <ArrowRight size={18} />}
        </button>
      </form>

      {/* DIVIDER */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-slate-950 px-3 text-muted">Demo credentials available</span>
        </div>
      </div>

      {/* DEMO INFO */}
      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Demo Account</p>
        <p className="mt-2 text-sm leading-6 text-text">
          Use <code className="rounded bg-black/30 px-2 py-1 font-mono">resident@example.com</code> with password <code className="rounded bg-black/30 px-2 py-1 font-mono">password123</code>
        </p>
      </div>

      {/* SIGNUP LINK */}
      <p className="text-sm text-muted">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary transition hover:text-primary/80">
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
