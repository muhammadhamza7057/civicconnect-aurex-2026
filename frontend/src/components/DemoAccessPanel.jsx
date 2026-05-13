import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCopy, LogIn, Shield, User, Users, Crown } from 'lucide-react';

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
    <section className={compact ? 'space-y-3' : 'cc-card space-y-5 p-6 lg:p-8'}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Demo access</p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-text">Judge-ready accounts</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Open the login page with a prefilled demo role, or copy credentials directly into the form.
          </p>
        </div>
        {compact ? null : <LogIn size={20} className="text-primary" />}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {demoAccounts.map(account => {
          const Icon = account.icon;
          return (
            <div key={account.role} className="rounded-3xl border border-border/60 bg-surface/80 p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">{account.label}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">{account.role.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 rounded-2xl border border-border/50 bg-bg/60 p-3 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Email</p>
                  <p className="mt-1 break-all text-text">{account.email}</p>
                </div>
                {account.staffId ? (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Staff ID</p>
                    <p className="mt-1 text-text">{account.staffId}</p>
                  </div>
                ) : null}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Password</p>
                  <p className="mt-1 text-text">{account.password}</p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-muted">{account.note}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={buildLoginUrl(account)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-95"
                >
                  <LogIn size={16} />
                  Open dashboard
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    const secret = account.staffId
                      ? `Email: ${account.email}\nStaff ID: ${account.staffId}\nPassword: ${account.password}`
                      : `Email: ${account.email}\nPassword: ${account.password}`;
                    const ok = await copyText(secret).catch(() => false);
                    if (!ok) return;
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-surface px-4 py-2.5 text-sm font-semibold text-text transition hover:bg-surface-2"
                >
                  <ClipboardCopy size={16} />
                  Copy credentials
                </button>
                {onUseDemo ? (
                  <button
                    type="button"
                    onClick={() => onUseDemo(account)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-surface px-4 py-2.5 text-sm font-semibold text-text transition hover:bg-surface-2"
                  >
                    <ClipboardCopy size={16} />
                    Fill form
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
