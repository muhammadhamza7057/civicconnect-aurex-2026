import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, BadgeCheck } from 'lucide-react';
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
    defaultValues: { identifier: '', password: '' }
  });

  const onSubmit = async values => {
    const payload =
      values.identifier.includes('@')
        ? { email: values.identifier.trim(), password: values.password }
        : { staff_id: values.identifier.trim(), password: values.password };

    const profile = await toast.promise(login(payload), {
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
        <p className="mt-2 text-sm text-muted">Use your work email or staff ID. Sessions use JWT + secure refresh cookies.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-text">Email or staff ID</label>
          <div className="relative mt-2">
            <Mail size={18} className="absolute left-4 top-3.5 text-muted" strokeWidth={1.5} />
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-text outline-none transition focus:border-primary focus:bg-white/10"
              placeholder="you@agency.gov or STAFF-INF-001"
              {...register('identifier', { required: 'Required' })}
            />
          </div>
          {errors.identifier && (
            <div className="mt-2 flex items-center gap-2 text-sm text-danger">
              <AlertCircle size={16} strokeWidth={2} />
              {errors.identifier.message}
            </div>
          )}
        </div>

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

        <button
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
          {!isSubmitting && <ArrowRight size={18} />}
        </button>
      </form>

      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <BadgeCheck size={14} /> Demo identities (seed script)
        </p>
        <ul className="text-xs text-text/90 space-y-1 font-mono leading-relaxed">
          <li>Resident: alice.resident@example.com / Password123!</li>
          <li>Staff: bob.staff@example.com or STAFF-INF-001 / Password123!</li>
          <li>Dept admin: carol.deptadmin@example.com / Password123!</li>
          <li>Super admin: dave.super@example.com / Password123!</li>
        </ul>
      </div>

      <p className="text-sm text-muted">
        Need an account?{' '}
        <Link to="/register" className="font-semibold text-primary transition hover:text-primary/80">
          Register with role
        </Link>
      </p>
    </motion.div>
  );
}
