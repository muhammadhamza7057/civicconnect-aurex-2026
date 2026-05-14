import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ClipboardCopy, LogIn, Shield, User, Users, Crown, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const demoAccounts = [
  {
    role: 'resident',
    label: 'Resident Demo',
    icon: User,
    email: 'alice.resident@example.com',
    password: 'Password123!',
    route: '/resident',
    note: 'Report issues and track status in real-time.',
    features: ['Submit tickets', 'Track status', 'View timeline', 'Get notifications']
  },
  {
    role: 'staff',
    label: 'Staff Demo',
    icon: Users,
    email: 'bob.staff@example.com',
    staffId: 'STAFF-INF-001',
    password: 'Password123!',
    route: '/staff',
    note: 'Manage complaints on a Kanban board with real-time updates.',
    features: ['Kanban board', 'Drag to update', 'SLA alerts', 'AI briefing']
  },
  {
    role: 'admin',
    label: 'Department Admin Demo',
    icon: Shield,
    email: 'carol.deptadmin@example.com',
    password: 'Password123!',
    route: '/admin',
    note: 'View analytics, manage departments, and export data.',
    features: ['Analytics', 'KPI cards', 'CSV export', 'Department oversight']
  },
  {
    role: 'super_admin',
    label: 'Super Admin Demo',
    icon: Crown,
    email: 'dave.super@example.com',
    password: 'Password123!',
    route: '/admin',
    note: 'System-wide oversight, audit logs, and city operations.',
    features: ['City dashboard', 'Audit logs', 'Live map', 'System health']
  }
];

function buildLoginUrl(account) {
  const params = new URLSearchParams({ demo: account.role, autologin: '1' });
  return `/login?${params.toString()}`;
}

function formatCredentials(account) {
  return account.staffId
    ? `Email: ${account.email}\nStaff ID: ${account.staffId}\nPassword: ${account.password}`
    : `Email: ${account.email}\nPassword: ${account.password}`;
}

async function copyText(text) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  await navigator.clipboard.writeText(text);
  return true;
}

export function DemoAccessPanel() {
  return (
    <section className="w-full space-y-6">
      {/* HEADER */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-700">
          <Zap size={14} />
          Try Demo Accounts
        </div>
        <h2 className="text-3xl font-black text-slate-900">Ready to explore?</h2>
        <p className="text-lg text-slate-700">
          Click any role below to instantly access a fully functional demo. No signup required.
        </p>
      </div>

      {/* DEMO CARDS GRID */}
      <div className="grid gap-4 md:grid-cols-2">
        {demoAccounts.map((account, idx) => {
          const Icon = account.icon;
          return (
            <motion.article
              key={account.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group rounded-2xl border-2 border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100"
            >
              {/* Role header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-400/10 p-3 text-blue-600 group-hover:from-blue-500/20 group-hover:to-cyan-400/20">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{account.label}</p>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {account.role.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-700 leading-relaxed mb-4">
                {account.note}
              </p>

              {/* Features list */}
              {account.features && account.features.length > 0 && (
                <div className="mb-4 space-y-2">
                  {account.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      {feature}
                    </div>
                  ))}
                </div>
              )}

              {/* Credentials box */}
              <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                <div className="font-semibold text-slate-900">Email</div>
                <div className="text-slate-700 font-mono">{account.email}</div>
                {account.staffId && (
                  <>
                    <div className="font-semibold text-slate-900 mt-2">Staff ID</div>
                    <div className="text-slate-700 font-mono">{account.staffId}</div>
                  </>
                )}
                <div className="font-semibold text-slate-900 mt-2">Password</div>
                <div className="text-slate-700 font-mono">{account.password}</div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                <Link
                  to={buildLoginUrl(account)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition"
                >
                  <LogIn size={18} />
                  Launch Dashboard
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    const secret = formatCredentials(account);
                    const ok = await copyText(secret).catch(() => false);
                    if (!ok) {
                      toast.error('Copy failed. Please try again.');
                      return;
                    }
                    toast.success(`${account.label} credentials copied`);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white py-2.5 font-semibold text-slate-900 transition hover:bg-slate-50 hover:border-blue-300"
                >
                  <ClipboardCopy size={18} />
                  Copy Credentials
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* COPY ALL CREDENTIALS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-2xl bg-blue-50 border-2 border-blue-200 p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-slate-900">Quick Reference</p>
            <p className="text-sm text-slate-700 mt-1">Need all credentials at once?</p>
          </div>
          <motion.button
            type="button"
            onClick={async () => {
              const compiled = demoAccounts
                .map(a => `${a.label}\n${formatCredentials(a)}`)
                .join('\n\n');
              const ok = await copyText(compiled).catch(() => false);
              if (!ok) {
                toast.error('Copy failed. Please try again.');
                return;
              }
              toast.success('All demo credentials copied to clipboard');
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-lg bg-white border-2 border-blue-300 px-4 py-2.5 font-semibold text-blue-600 transition hover:bg-blue-100 whitespace-nowrap shrink-0"
          >
            <ClipboardCopy size={18} />
            Copy All
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
