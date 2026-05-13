import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { classNames } from '../utils/classNames';
import { ThemeToggle } from '../components/ThemeToggle';

const navigationByRole = {
  resident: [
    { to: '/resident', label: 'Dashboard' },
    { to: '/tickets/new', label: 'Create Ticket' }
  ],
  staff: [
    { to: '/staff', label: 'Dashboard' },
    { to: '/tickets/new', label: 'New Ticket' }
  ],
  department_admin: [
    { to: '/admin', label: 'Admin' },
    { to: '/staff', label: 'Staff View' }
  ],
  super_admin: [
    { to: '/admin', label: 'Admin' },
    { to: '/staff', label: 'Staff View' }
  ]
};

export function AppShell({ children }) {
  const profile = useAuthStore(state => state.profile);
  const logout = useAuthStore(state => state.logout);
  const sidebarOpen = useUiStore(state => state.sidebarOpen);
  const setSidebarOpen = useUiStore(state => state.setSidebarOpen);
  const navigate = useNavigate();
  const location = useLocation();

  const role = profile?.role || 'resident';
  const links = navigationByRole[role] || navigationByRole.resident;

  return (
    <div className="relative min-h-screen text-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.08),transparent_25%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px]">
        <aside className={classNames('glass-panel fixed inset-y-0 left-0 z-40 w-72 transform border-r border-white/10 px-5 py-6 transition-transform duration-300 lg:sticky lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-lg font-black text-primary shadow-glow">C</span>
              <div>
                <p className="font-bold">CivicConnect</p>
                <p className="text-xs text-muted">Smart City AI Platform</p>
              </div>
            </Link>
            <button className="rounded-xl border border-white/10 px-3 py-2 text-xs lg:hidden" onClick={() => setSidebarOpen(false)}>Close</button>
          </div>
          <div className="mt-8 space-y-2">
            {links.map(link => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => classNames('block rounded-2xl px-4 py-3 text-sm font-medium transition', isActive ? 'bg-primary/15 text-white shadow-glow' : 'text-slate-300 hover:bg-white/5 hover:text-white')}>
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Signed in as</p>
            <p className="mt-2 font-semibold">{profile?.full_name}</p>
            <p className="text-sm text-muted">{profile?.email}</p>
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-black/20 px-3 py-2 text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-success" />
              {role.replace('_', ' ')}
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <button className="rounded-2xl bg-primary px-4 py-3 font-semibold text-white shadow-glow transition hover:scale-[1.01]" onClick={() => navigate('/tickets/new')}>
              New Ticket
            </button>
            <button className="rounded-2xl border border-white/10 px-4 py-3 font-semibold text-white transition hover:bg-white/5" onClick={logout}>
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-bg/70 px-4 py-4 backdrop-blur-xl lg:px-8">
            <div className="flex items-center gap-3">
              <button className="rounded-2xl border border-white/10 px-3 py-2 lg:hidden" onClick={() => setSidebarOpen(true)}>Menu</button>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">CivicConnect / {location.pathname.replace('/', '') || 'dashboard'}</p>
                <h2 className="truncate text-lg font-semibold sm:text-2xl">{profile?.full_name || 'Workspace'}</h2>
              </div>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 px-4 py-5 lg:px-8 lg:py-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
