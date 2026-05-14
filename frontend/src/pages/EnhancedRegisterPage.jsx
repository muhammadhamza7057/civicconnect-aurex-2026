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
  Crown,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { listDepartments } from '../api/departments';
import { demoAccounts } from '../components/DemoAccessPanel';

function routeByRole(role) {
  if (role === 'resident') return '/resident';
  if (role === 'staff') return '/staff';
  return '/admin';
}

const ROLES = [
  {
    id: 'resident',
    title: 'Resident',
    description: 'I want to report issues or track requests.',
    Icon: Home
  },
  {
    id: 'staff',
    title: 'Staff',
    description: 'I manage complaints in my department.',
    Icon: ClipboardList
  },
  {
    id: 'admin',
    title: 'Department Admin',
    description: 'I lead a department and oversee the team.',
    Icon: UsersRound
  },
  {
    id: 'super_admin',
    title: 'Super Admin',
    description: 'I oversee the entire city system.',
    Icon: Crown
  }
];

const inputBase = 'relative z-10 w-full rounded-xl border-2 border-slate-200 bg-white py-3.5 pl-12 text-base text-slate-900 placeholder:text-slate-500 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60';
const inputPlain = `${inputBase} pr-4`;
const inputWithToggle = `${inputBase} pr-12`;
const fieldWrap = 'relative mt-3';
const labelClass = 'text-[14px] font-semibold leading-snug text-slate-900';

export function EnhancedRegisterPage() {
  const navigate = useNavigate();
  const registerUser = useAuthStore(state => state.register);
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);
  const [deptError, setDeptError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1); // 1: role, 2: email/name, 3: dept/staff, 4: password

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: 'resident', department_id: '', staff_id: '' }
  });

  const password = watch('password');
  const role = watch('role');
  const email = watch('email');
  const name = watch('name');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }, []);

  useEffect(() => {
    setDeptLoading(true);
    setDeptError(null);
    listDepartments()
      .then(d => setDepartments(Array.isArray(d) ? d : []))
      .catch(() => {
        setDepartments([]);
        setDeptError('Could not load departments. You can still sign up as a resident or super admin.');
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
      return toast.error('Please select your department.');
    }
    if (values.role === 'staff' && !values.staff_id?.trim()) {
      return toast.error('Please enter your staff ID.');
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
      loading: 'Creating your account…',
      success: 'Welcome! Redirecting to dashboard…',
      error: err => err.message || 'Something went wrong. Try another email or staff ID.'
    });
    navigate(routeByRole(profile?.role || 'resident'), { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* STEP INDICATOR */}
      <div className="mb-8 flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full font-semibold text-sm flex items-center justify-center transition ${
                step === s
                  ? 'bg-blue-600 text-white'
                  : step > s
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {step > s ? <CheckCircle2 size={18} /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-8 h-1 rounded-full transition ${
                  step > s ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-0" noValidate>
        <input type="hidden" {...register('role', { required: true })} />

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-slate-900">Who are you?</h2>
              <p className="mt-2 text-sm text-slate-600">
                Select your role to get started. You can always change this later.
              </p>
            </div>

            <div className="space-y-3">
              {ROLES.map(({ id, title, description, Icon }) => {
                const active = role === id;
                return (
                  <motion.button
                    key={id}
                    type="button"
                    onClick={() => setValue('role', id, { shouldValidate: true })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full rounded-xl border-2 p-4 text-left transition ${
                      active
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 rounded-lg p-2 ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-blue-600'
                        }`}
                      >
                        <Icon size={24} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{title}</p>
                        <p className="mt-1 text-sm text-slate-600">{description}</p>
                      </div>
                      {active && <CheckCircle2 size={24} className="text-blue-600 shrink-0" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              type="button"
              onClick={() => setStep(2)}
              disabled={!role}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 transition"
            >
              Continue <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        )}

        {/* STEP 2: EMAIL & NAME */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-slate-900">Your details</h2>
              <p className="mt-2 text-sm text-slate-600">
                We'll use this to create your account and send updates.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="reg-name" className={labelClass}>
                  Full Name
                </label>
                <div className={fieldWrap}>
                  <User
                    size={20}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    strokeWidth={1.75}
                  />
                  <input
                    id="reg-name"
                    autoComplete="name"
                    className={inputPlain}
                    placeholder="Jane Doe"
                    {...register('name', { required: 'Name is required' })}
                  />
                </div>
                {errors.name && (
                  <div className="mt-2 flex items-start gap-2 text-sm text-red-700">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    {errors.name.message}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="reg-email" className={labelClass}>
                  Email Address
                </label>
                <div className={fieldWrap}>
                  <Mail
                    size={20}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    strokeWidth={1.75}
                  />
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    className={inputPlain}
                    placeholder="you@example.com"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && (
                  <div className="mt-2 flex items-start gap-2 text-sm text-red-700">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    {errors.email.message}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <motion.button
                type="button"
                onClick={() => setStep(1)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 rounded-xl border-2 border-slate-200 py-3.5 font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Back
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setStep(3)}
                disabled={!name || !email}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                Continue <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: DEPARTMENT & STAFF ID (conditional) */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {['staff', 'admin'].includes(role) ? (
              <>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Your organization</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Tell us where you work so we can route your tickets correctly.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="reg-dept" className={labelClass}>
                      Department
                    </label>
                    <div className={fieldWrap}>
                      <Building2
                        size={20}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        strokeWidth={1.75}
                      />
                      {deptLoading ? (
                        <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-600">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          Loading departments…
                        </div>
                      ) : (
                        <select
                          id="reg-dept"
                          className="w-full rounded-xl border-2 border-slate-200 bg-white py-3.5 pl-12 pr-4 text-base text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-60"
                          {...register('department_id', {
                            validate: v => (['staff', 'admin'].includes(role) ? (v ? true : 'Please select a department') : true)
                          })}
                        >
                          <option value="">Select your department…</option>
                          {departments.map(d => (
                            <option key={d._id} value={d._id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    {deptError && (
                      <p className="mt-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-2">{deptError}</p>
                    )}
                    {errors.department_id && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-red-700">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        {errors.department_id.message}
                      </div>
                    )}
                  </div>

                  {role === 'staff' && (
                    <div>
                      <label htmlFor="reg-staff" className={labelClass}>
                        Staff ID
                      </label>
                      <div className={fieldWrap}>
                        <IdCard
                          size={20}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          strokeWidth={1.75}
                        />
                        <input
                          id="reg-staff"
                          className={inputPlain}
                          placeholder="e.g., STAFF-INF-001"
                          {...register('staff_id', {
                            validate: v => (role === 'staff' ? (v?.trim() ? true : 'Staff ID is required') : true)
                          })}
                        />
                      </div>
                      {errors.staff_id && (
                        <div className="mt-2 flex items-start gap-2 text-sm text-red-700">
                          <AlertCircle size={18} className="mt-0.5 shrink-0" />
                          {errors.staff_id.message}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-green-50 border-2 border-green-200 p-6 text-center">
                <CheckCircle2 size={32} className="mx-auto text-green-600 mb-2" />
                <h3 className="font-bold text-slate-900">All set!</h3>
                <p className="mt-2 text-sm text-slate-700">
                  Your role as a <strong>{role === 'resident' ? 'Resident' : 'Super Admin'}</strong> doesn't need additional organization details.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <motion.button
                type="button"
                onClick={() => setStep(2)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 rounded-xl border-2 border-slate-200 py-3.5 font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Back
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setStep(4)}
                disabled={['staff', 'admin'].includes(role) && deptLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                Continue <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: PASSWORD */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-slate-900">Create a password</h2>
              <p className="mt-2 text-sm text-slate-600">
                At least 8 characters for security.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="reg-pass" className={labelClass}>
                  Password
                </label>
                <div className={fieldWrap}>
                  <Lock
                    size={20}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    strokeWidth={1.75}
                  />
                  <input
                    id="reg-pass"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={inputWithToggle}
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password required',
                      minLength: { value: 8, message: 'Min 8 characters' }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <div className="mt-2 flex items-start gap-2 text-sm text-red-700">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    {errors.password.message}
                  </div>
                )}
                {password && password.length >= 8 && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 size={18} /> Strong password
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="reg-confirm" className={labelClass}>
                  Confirm Password
                </label>
                <div className={fieldWrap}>
                  <Lock
                    size={20}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    strokeWidth={1.75}
                  />
                  <input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={inputWithToggle}
                    placeholder="••••••••"
                    {...register('confirmPassword', { required: 'Confirm your password' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="mt-2 flex items-start gap-2 text-sm text-red-700">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    {errors.confirmPassword.message}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <motion.button
                type="button"
                onClick={() => setStep(3)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 rounded-xl border-2 border-slate-200 py-3.5 font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Back
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {isSubmitting ? 'Creating account…' : 'Create Account'}
                {!isSubmitting && <ArrowRight size={20} />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </form>

      {/* FOOTER */}
      <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition">
          Sign in
        </Link>
      </div>

      {/* DEMO ACCOUNTS PREVIEW */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 rounded-xl bg-blue-50 border-2 border-blue-200 p-6"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3">Or try a demo</p>
          <p className="text-sm text-blue-900 mb-4">
            Want to explore before creating an account? Click any demo to instantly access the dashboard.
          </p>
          <div className="space-y-2">
            {demoAccounts.slice(0, 2).map((account) => (
              <Link
                key={account.role}
                to={`/login?demo=${account.role}&autologin=1`}
                className="block rounded-lg bg-white hover:bg-blue-100 p-3 text-sm font-semibold text-blue-600 transition border border-blue-200 hover:border-blue-300"
              >
                Try {account.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
