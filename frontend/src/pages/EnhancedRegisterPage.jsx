import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Building2,
  IdCard,
  Eye,
  EyeOff,
  Loader2,
  Home,
  ClipboardList,
  UsersRound,
  Crown
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { listDepartments } from '../api/departments';
import { classNames } from '../utils/classNames';

function routeByRole(role) {
  if (role === 'resident') return '/resident';
  if (role === 'staff') return '/staff';
  return '/admin';
}

const ROLES = [
  {
    id: 'resident',
    title: 'Resident',
    line: 'I live or work here and want to report or follow requests.',
    Icon: Home
  },
  {
    id: 'staff',
    title: 'Staff',
    line: 'I work on tickets my department assigns to me.',
    Icon: ClipboardList
  },
  {
    id: 'admin',
    title: 'Dept. admin',
    line: 'I lead a department and manage our team and workload.',
    Icon: UsersRound
  },
  {
    id: 'super_admin',
    title: 'Super admin',
    line: 'I oversee the whole system across departments.',
    Icon: Crown
  }
];

const input =
  'w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] text-text placeholder:text-muted/80 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:opacity-60';
const inputWithIcon = `${input} pl-11`;
const label = 'mb-1.5 block text-sm font-semibold text-text';

export function EnhancedRegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore(state => state.register);
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);
  const [deptError, setDeptError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: 'resident', department_id: '', staff_id: '' }
  });

  const password = watch('password');
  const role = watch('role');

  useEffect(() => {
    setDeptLoading(true);
    setDeptError(null);
    listDepartments()
      .then(d => setDepartments(Array.isArray(d) ? d : []))
      .catch(() => {
        setDepartments([]);
        setDeptError(
          'Departments could not be loaded. You can still sign up as a resident or super admin. For staff or dept admin, try again later.'
        );
      })
      .finally(() => setDeptLoading(false));
  }, []);

  useEffect(() => {
    if (role === 'resident' || role === 'super_admin') setValue('department_id', '');
    if (role !== 'staff') setValue('staff_id', '');
  }, [role, setValue]);

  const onSubmit = async values => {
    if (values.password !== values.confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (['staff', 'admin'].includes(values.role) && !values.department_id) {
      return toast.error('Pick your department.');
    }
    if (values.role === 'staff' && !values.staff_id?.trim()) {
      return toast.error('Enter your staff ID.');
    }

    const payload = {
      email: values.email.trim().toLowerCase(),
      password: values.password,
      name: values.name.trim(),
      role: values.role,
      department_id:
        ['staff', 'admin'].includes(values.role) && values.department_id ? values.department_id : undefined,
      staff_id: values.role === 'staff' ? values.staff_id.trim() : undefined
    };

    const profile = await toast.promise(registerUser(payload), {
      loading: 'Almost there…',
      success: 'Welcome aboard.',
      error: err => err.message || 'Something went wrong. Try another email or staff ID.'
    });
    navigate(routeByRole(profile?.role || 'resident'), { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="cc-card w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-border/50"
    >
      <div className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-transparent to-success/5 px-6 py-8 sm:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-[1.65rem]">Create your account</h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
          Tap the box that fits you. Only the fields you need will show up next.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-0" noValidate aria-label="Register">
        <input type="hidden" {...register('role', { required: true })} />

        <div className="px-6 py-6 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Step 1</p>
          <h2 className="mt-1 text-lg font-bold text-text">I am a…</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ROLES.map(({ id, title, line, Icon }) => {
              const active = role === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setValue('role', id, { shouldValidate: true, shouldDirty: true })}
                  className={classNames(
                    'flex gap-3 rounded-xl border-2 p-4 text-left transition',
                    active
                      ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/20'
                      : 'border-border/80 bg-surface hover:border-primary/40 hover:bg-surface-2'
                  )}
                >
                  <span
                    className={classNames(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                      active ? 'bg-primary text-white' : 'bg-surface-2 text-primary'
                    )}
                  >
                    <Icon size={22} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-text">{title}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-muted">{line}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border/50 bg-surface-2/30 px-6 py-6 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Step 2</p>
          <h2 className="mt-1 text-lg font-bold text-text">Your name & email</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor="reg-name" className={label}>
                Full name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                <input
                  id="reg-name"
                  autoComplete="name"
                  className={inputWithIcon}
                  placeholder="Jane Doe"
                  {...register('name', { required: 'Name required' })}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-sm font-medium text-danger" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="reg-email" className={label}>
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  className={inputWithIcon}
                  placeholder="you@email.com"
                  {...register('email', { required: 'Email required' })}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm font-medium text-danger" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {['staff', 'admin'].includes(role) ? (
            <motion.div
              key="dept-block"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-t border-border/50"
            >
              <div className="px-6 py-6 sm:px-8">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">For your role</p>
                <h2 className="mt-1 text-lg font-bold text-text">Where you work</h2>

                {['staff', 'admin'].includes(role) ? (
                  <div className="mt-4">
                    <label htmlFor="reg-dept" className={classNames(label, 'inline-flex items-center gap-2')}>
                      <Building2 size={16} className="text-primary" aria-hidden />
                      Department
                    </label>
                    {deptLoading ? (
                      <div className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
                        Loading…
                      </div>
                    ) : (
                      <select
                        id="reg-dept"
                        className={classNames(input, 'mt-2 cursor-pointer')}
                        disabled={!!deptError && departments.length === 0}
                        {...register('department_id', {
                          validate: v => (['staff', 'admin'].includes(role) ? (v ? true : 'Choose a department') : true)
                        })}
                      >
                        <option value="">Select department</option>
                        {departments.map(d => (
                          <option key={d._id} value={d._id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {deptError && <p className="mt-2 text-sm text-warning">{deptError}</p>}
                    {errors.department_id && (
                      <p className="mt-1.5 text-sm font-medium text-danger" role="alert">
                        {errors.department_id.message}
                      </p>
                    )}
                  </div>
                ) : null}

                {role === 'staff' ? (
                  <div className="mt-4">
                    <label htmlFor="reg-staff" className={classNames(label, 'inline-flex items-center gap-2')}>
                      <IdCard size={16} className="text-primary" aria-hidden />
                      Staff ID
                    </label>
                    <input
                      id="reg-staff"
                      className={classNames(input, 'mt-2')}
                      placeholder="From your manager"
                      {...register('staff_id', {
                        validate: v => (role === 'staff' ? (v?.trim() ? true : 'Staff ID required') : true)
                      })}
                    />
                    {errors.staff_id && (
                      <p className="mt-1.5 text-sm font-medium text-danger" role="alert">
                        {errors.staff_id.message}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="border-t border-border/50 px-6 py-6 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Step 3</p>
          <h2 className="mt-1 text-lg font-bold text-text">Password</h2>
          <p className="mt-1 text-sm text-muted">At least 8 characters.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-pass" className={label}>
                Password
              </label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                <input
                  id="reg-pass"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={classNames(inputWithIcon, 'pr-11')}
                  {...register('password', {
                    required: 'Required',
                    minLength: { value: 8, message: 'Min 8 characters' }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-text"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm font-medium text-danger">{errors.password.message}</p>
              )}
              {password && password.length >= 8 && (
                <p className="mt-1.5 flex items-center gap-1 text-sm font-medium text-success">
                  <CheckCircle2 size={16} /> Looks good
                </p>
              )}
            </div>
            <div>
              <label htmlFor="reg-confirm" className={label}>
                Confirm
              </label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={classNames(inputWithIcon, 'pr-11')}
                  {...register('confirmPassword', { required: 'Confirm password' })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-text"
                  aria-label="Toggle confirm visibility"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm font-medium text-danger">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 bg-surface-2/20 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-sm text-muted">
            Wrong role?{' '}
            <Link to="/#who-its-for" className="font-semibold text-primary hover:underline">
              See roles on the home page
            </Link>
          </p>
          <button
            type="submit"
            disabled={isSubmitting || (['staff', 'admin'].includes(role) && deptLoading)}
            className="inline-flex min-h-[48px] min-w-[180px] items-center justify-center gap-2 self-end rounded-xl bg-primary px-8 py-3 text-base font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-50 sm:self-auto"
          >
            {isSubmitting ? 'Please wait…' : 'Create account'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </div>

        <div className="border-t border-border/40 px-6 py-4 text-center text-sm text-muted sm:px-8">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
