import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

function routeByRole(role) {
  if (role === 'resident') return '/resident';
  if (role === 'staff') return '/staff';
  return '/admin';
}

export function EnhancedRegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore(state => state.register);
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();

  const password = watch('password');

  const onSubmit = async values => {
    if (values.password !== values.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    const profile = await toast.promise(registerUser(values), {
      loading: 'Creating your account...',
      success: 'Welcome to CivicConnect!',
      error: err => err.message || 'Unable to register'
    });
    navigate(routeByRole(profile?.role || 'resident'), { replace: true });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="cc-card space-y-8 p-8 sm:p-10 shadow-soft">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Create account</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-text">Join CivicConnect</h2>
        <p className="mt-2 text-sm text-muted">Get started in less than 2 minutes. Free account, always.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* FULL NAME FIELD */}
        <div>
          <label className="text-sm font-semibold text-text">Full name</label>
          <div className="relative mt-2">
            <User size={18} className="absolute left-4 top-3.5 text-muted" strokeWidth={1.5} />
            <input
              placeholder="Your full name"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-text outline-none transition focus:border-primary focus:bg-white/10"
              {...register('full_name', { required: 'Full name is required' })}
            />
          </div>
          {errors.full_name && (
            <div className="mt-2 flex items-center gap-2 text-sm text-danger">
              <AlertCircle size={16} strokeWidth={2} />
              {errors.full_name.message}
            </div>
          )}
        </div>

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
              {...register('password', { 
                required: 'Password is required', 
                minLength: { value: 8, message: 'Minimum 8 characters' } 
              })}
            />
          </div>
          {errors.password && (
            <div className="mt-2 flex items-center gap-2 text-sm text-danger">
              <AlertCircle size={16} strokeWidth={2} />
              {errors.password.message}
            </div>
          )}
          {password && password.length >= 8 && (
            <div className="mt-2 flex items-center gap-2 text-sm text-success">
              <CheckCircle2 size={16} strokeWidth={2} />
              Password is strong
            </div>
          )}
        </div>

        {/* CONFIRM PASSWORD FIELD */}
        <div>
          <label className="text-sm font-semibold text-text">Confirm password</label>
          <div className="relative mt-2">
            <Lock size={18} className="absolute left-4 top-3.5 text-muted" strokeWidth={1.5} />
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-text outline-none transition focus:border-primary focus:bg-white/10"
              {...register('confirmPassword', { required: 'Please confirm your password' })}
            />
          </div>
          {errors.confirmPassword && (
            <div className="mt-2 flex items-center gap-2 text-sm text-danger">
              <AlertCircle size={16} strokeWidth={2} />
              {errors.confirmPassword.message}
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <button
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
          {!isSubmitting && <ArrowRight size={18} />}
        </button>
      </form>

      {/* BENEFITS */}
      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">What you get</p>
        <div className="space-y-2">
          {[
            'Real-time complaint tracking',
            'AI-powered issue analysis',
            'Instant notifications',
            'Staff collaboration tools'
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm text-muted">
              <CheckCircle2 size={14} className="text-success" strokeWidth={2} />
              {benefit}
            </div>
          ))}
        </div>
      </div>

      {/* LOGIN LINK */}
      <p className="text-sm text-muted">
        Already have access?{' '}
        <Link to="/login" className="font-semibold text-primary transition hover:text-primary/80">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
