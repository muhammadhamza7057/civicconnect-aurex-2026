import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

function routeByRole(role) {
  if (role === 'resident') return '/resident';
  if (role === 'staff') return '/staff';
  return '/admin';
}

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async values => {
    const profile = await toast.promise(login(values), {
      loading: 'Signing in securely...',
      success: 'Welcome back',
      error: err => err.message || 'Unable to sign in'
    });
    navigate(routeByRole(profile?.role), { replace: true });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="cc-card p-7 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Welcome back</p>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-text">Sign in to CivicConnect</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-semibold text-text">Email</label>
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none transition focus:border-primary" {...register('email', { required: 'Email is required' })} />
          {errors.email ? <p className="mt-1 text-sm text-danger">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-semibold text-text">Password</label>
          <input type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none transition focus:border-primary" {...register('password', { required: 'Password is required' })} />
          {errors.password ? <p className="mt-1 text-sm text-danger">{errors.password.message}</p> : null}
        </div>
        <button disabled={isSubmitting} className="w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-50">
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-5 text-sm text-muted">Need access? <Link to="/register" className="font-semibold text-primary">Create an account</Link></p>
    </motion.div>
  );
}
