import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ClipboardCopy, LogIn, Shield, User, Users, Crown, ArrowRight, Sparkles } from 'lucide-react';

export const demoAccounts = [
  {
    role: 'resident',
    label: 'Resident demo',
    icon: User,
    email: 'alice.resident@example.com',
    password: 'Password123!',
    route: '/resident',
    note: 'Best for checking ticket submission and tracking.'
  },
  {
    role: 'staff',
    label: 'Staff demo',
    icon: Users,
    email: 'bob.staff@example.com',
    staffId: 'STAFF-INF-001',
    password: 'Password123!',
    route: '/staff',
    note: 'Best for Kanban board, SLA alerts, and updates.'
  },
  {
    role: 'admin',
    label: 'Department admin demo',
    icon: Shield,
    email: 'carol.deptadmin@example.com',
    password: 'Password123!',
    route: '/admin',
    note: 'Best for analytics, exports, and department oversight.'
  },
  {
    role: 'super_admin',
    label: 'Super admin demo',
    icon: Crown,
    email: 'dave.super@example.com',
    password: 'Password123!',
    route: '/admin',
    note: 'Best for city-wide oversight and audit review.'
  }
];

function buildLoginUrl(account) {
  const params = new URLSearchParams({ demo: account.role, autologin: '1' });
  return `/login?${params.toString()}`;
}

async function copyText(text) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  await navigator.clipboard.writeText(text);
  return true;
}

export function DemoAccessPanel({ compact = false, onUseDemo }) {
  return (
    <section className={compact ? 'space-y-3' : 'rounded-[28px] border border-border/60 bg-white/85 p-5 shadow-soft backdrop-blur-xl lg:p-7'}>
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
            <Sparkles size={12} />
            Demo access
          </div>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-text">Judge-ready accounts</h3>
          <p className="mt-2 text-sm leading-6 text-muted sm:text-[15px]">
            Open the login page with a prefilled demo role, copy the credentials, or launch the right dashboard in one click.
          </p>
        </div>
        {compact ? null : <LogIn size={22} className="text-primary" />}
      </div>

      <div className="pt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {demoAccounts.map(account => {
          const Icon = account.icon;
          return (
            <article key={account.role} className="min-w-0 rounded-[24px] border border-border/60 bg-gradient-to-b from-white to-surface/70 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">{account.label}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{account.role.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 rounded-2xl border border-border/60 bg-bg/60 p-3 text-sm">
                <div className="grid gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Email</p>
                    <p className="mt-1 break-words font-medium text-text">{account.email}</p>
                  </div>
                  {account.staffId ? (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Staff ID</p>
                      <p className="mt-1 font-medium text-text">{account.staffId}</p>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">Password</p>
                    <p className="mt-1 font-medium text-text">{account.password}</p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-muted">{account.note}</p>

              <div className="mt-4 grid gap-2">
                <Link
                  to={buildLoginUrl(account)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-95"
                >
                  <LogIn size={16} />
                  Launch dashboard
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    const secret = account.staffId
                      ? `Email: ${account.email}\nStaff ID: ${account.staffId}\nPassword: ${account.password}`
                      : `Email: ${account.email}\nPassword: ${account.password}`;
                    const ok = await copyText(secret).catch(() => false);
                    if (!ok) {
                      toast.error('Copy failed. Please copy manually.');
                      return;
                    }
                    toast.success(`${account.label} credentials copied`);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border/70 bg-surface px-4 py-2.5 text-sm font-semibold text-text transition hover:bg-surface-2"
                >
                  <ClipboardCopy size={16} />
                  Copy credentials
                </button>
                {onUseDemo ? (
                  <button
                    type="button"
                    onClick={() => onUseDemo(account)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border/70 bg-surface px-4 py-2.5 text-sm font-semibold text-text transition hover:bg-surface-2"
                  >
                    <ClipboardCopy size={16} />
                    Fill form
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
        </div>
      </div>
    </section>
  );
}
