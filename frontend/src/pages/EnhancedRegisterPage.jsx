import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, Building2, IdCard } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { listDepartments } from '../api/departments';

function routeByRole(role) {
  if (role === 'resident') return '/resident';
  if (role === 'staff') return '/staff';
  return '/admin';
}

export function EnhancedRegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore(state => state.register);
  const [departments, setDepartments] = useState([]);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: 'resident' }
  });

  const password = watch('password');
  const role = watch('role');

  useEffect(() => {
    listDepartments()
      .then(d => setDepartments(Array.isArray(d) ? d : []))
      .catch(() => setDepartments([]));
  }, []);

  const onSubmit = async values => {
    if (values.password !== values.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    const payload = {
      email: values.email,
      password: values.password,
      name: values.name,
      role: values.role,
      department_id:
        ['staff', 'admin'].includes(values.role) && values.department_id ? values.department_id : undefined,
      staff_id: values.role === 'staff' && values.staff_id ? values.staff_id.trim() : undefined
    };

    const profile = await toast.promise(registerUser(payload), {
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
        <p className="mt-2 text-sm text-muted">Select your role for the demo. Staff and admins must belong to a department.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-text">Full name</label>
          <div className="relative mt-2">
            <User size={18} className="absolute left-4 top-3.5 text-muted" strokeWidth={1.5} />
            <input
              placeholder="Your full name"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-text outline-none transition focus:border-primary focus:bg-white/10"
              {...register('name', { required: 'Name is required' })}
            />
          </div>
          {errors.name && (
            <div className="mt-2 flex items-center gap-2 text-sm text-danger">
              <AlertCircle size={16} strokeWidth={2} />
              {errors.name.message}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-text">Role</label>
          <select
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none"
            {...register('role', { required: true })}
          >
            <option value="resident">Resident</option>
            <option value="staff">Department staff</option>
            <option value="admin">Department admin</option>
            <option value="super_admin">Super admin</option>
          </select>
        </div>

        {['staff', 'admin'].includes(role) ? (
          <div>
            <label className="text-sm font-semibold text-text flex items-center gap-2">
              <Building2 size={16} /> Department
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none"
              {...register('department_id', { required: 'Department is required for this role' })}
            >
              <option value="">Select department</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.department_id && (
              <div className="mt-2 flex items-center gap-2 text-sm text-danger">
                <AlertCircle size={16} strokeWidth={2} />
                {errors.department_id.message}
              </div>
            )}
          </div>
        ) : null}

        {role === 'staff' ? (
          <div>
            <label className="text-sm font-semibold text-text flex items-center gap-2">
              <IdCard size={16} /> Staff ID
            </label>
            <input
              placeholder="e.g. STAFF-PARKS-014"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none"
              {...register('staff_id', { required: 'Staff ID is required' })}
            />
            {errors.staff_id && (
              <div className="mt-2 flex items-center gap-2 text-sm text-danger">
                <AlertCircle size={16} strokeWidth={2} />
                {errors.staff_id.message}
              </div>
            )}
          </div>
        ) : null}

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
              Password meets minimum length
            </div>
          )}
        </div>

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

        <button
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 font-semibold text-white shadow-glow transition hover:opacity-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
          {!isSubmitting && <ArrowRight size={18} />}
        </button>
      </form>

      <p className="text-sm text-muted">
        Already have access?{' '}
        <Link to="/login" className="font-semibold text-primary transition hover:text-primary/80">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
