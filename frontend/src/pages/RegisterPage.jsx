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

export function RegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore(state => state.register);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async values => {
    const profile = await toast.promise(registerUser(values), {
      loading: 'Creating account...',
      success: 'Account created',
      error: err => err.message || 'Unable to register'
    });
    navigate(routeByRole(profile?.role), { replace: true });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="cc-card p-7 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Create account</p>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-text">Join CivicConnect</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-semibold text-text">Full name</label>
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none transition focus:border-primary" {...register('full_name', { required: 'Full name is required' })} />
          {errors.full_name ? <p className="mt-1 text-sm text-danger">{errors.full_name.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-semibold text-text">Email</label>
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none transition focus:border-primary" {...register('email', { required: 'Email is required' })} />
          {errors.email ? <p className="mt-1 text-sm text-danger">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-semibold text-text">Password</label>
          <input type="password" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none transition focus:border-primary" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Use at least 8 characters' } })} />
          {errors.password ? <p className="mt-1 text-sm text-danger">{errors.password.message}</p> : null}
        </div>
        <button disabled={isSubmitting} className="w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-50">
          {isSubmitting ? 'Creating...' : 'Create account'}
        </button>
      </form>
      <p className="mt-5 text-sm text-muted">Already have access? <Link to="/login" className="font-semibold text-primary">Sign in</Link></p>
    </motion.div>
  );
}
