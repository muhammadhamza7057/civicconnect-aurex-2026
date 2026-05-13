import React, { useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ShieldAlert, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  FileText,
  Megaphone
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { classNames } from '../utils/classNames';
import { ThemeToggle } from '../components/ThemeToggle';
import { connectSocket, disconnectSocket } from '../socket/client';
import toast from 'react-hot-toast';

const navigationByRole = {
  resident: [
    { to: '/resident', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tickets/new', label: 'Create Ticket', icon: PlusCircle },
    { to: '/permits', label: 'Permits', icon: FileText },
    { to: '/announcements', label: 'News', icon: Megaphone }
  ],
  staff: [
    { to: '/staff', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tickets/new', label: 'Queue', icon: PlusCircle },
    { to: '/permits', label: 'Permits', icon: FileText },
    { to: '/announcements', label: 'News', icon: Megaphone }
  ],
  admin: [
    { to: '/admin', label: 'Command', icon: ShieldAlert },
    { to: '/staff', label: 'Staff queue', icon: LayoutDashboard },
    { to: '/announcements', label: 'Comms', icon: Megaphone }
  ],
  super_admin: [
    { to: '/admin', label: 'Global Admin', icon: ShieldAlert },
    { to: '/staff', label: 'Staff view', icon: LayoutDashboard },
    { to: '/announcements', label: 'Comms', icon: Megaphone }
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

  useEffect(() => {
    if (profile) {
      const socket = connectSocket();
      
      socket.on('ticket:created', (data) => {
        toast.success(`New ticket created: ${data.ticket.ticket_code}`, { icon: '🎫' });
      });

      socket.on('ticket:statusChanged', (data) => {
        toast.info(`Ticket ${data.ticketId} status changed to ${data.status}`, { icon: '🔄' });
      });

      socket.on('ticket:assigned', (data) => {
        if (data.assigneeId === profile.id) {
          toast.success('A new ticket has been assigned to you!', { icon: '👤', duration: 5000 });
        }
      });

      socket.on('notification:new', (data) => {
        toast(data.message, { icon: '🔔' });
      });

      return () => {
        socket.off('ticket:created');
        socket.off('ticket:statusChanged');
        socket.off('ticket:assigned');
        socket.off('notification:new');
      };
    }
  }, [profile]);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-white">
      {/* Background Decor */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-success/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen max-w-[1600px] mx-auto">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={classNames(
          'fixed inset-y-0 left-0 z-50 w-72 transform border-r border-white/5 bg-black/40 backdrop-blur-2xl px-6 py-8 transition-transform duration-300 lg:sticky lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
          <div className="flex items-center justify-between mb-10">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-lg font-black text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                C
              </div>
              <div>
                <p className="font-black tracking-tight text-lg">CivicConnect</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Smart City OS</p>
              </div>
            </Link>
            <button className="lg:hidden p-2 rounded-lg hover:bg-white/5" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1.5">
            {links.map(link => {
              const Icon = link.icon;
              return (
                <NavLink 
                  key={link.to} 
                  to={link.to} 
                  className={({ isActive }) => classNames(
                    'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200 group',
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                  )}
                >
                  <Icon size={20} className={classNames('transition-transform group-hover:scale-110')} />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-10 pt-10 border-t border-white/5">
            <div className="rounded-3xl bg-white/5 p-5 border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Account</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold">
                  {(profile?.name || profile?.full_name)?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate text-sm">{profile?.name || profile?.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {role.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-6 right-6 space-y-2">
            <button 
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/5 px-4 py-3.5 text-sm font-bold text-gray-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
              onClick={logout}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 lg:px-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  className="lg:hidden p-2 rounded-xl border border-white/10" 
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={20} />
                </button>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">
                    <span>CivicConnect</span>
                    <span className="opacity-30">/</span>
                    <span className="text-primary">{location.pathname.replace('/', '') || 'dashboard'}</span>
                  </div>
                  <h2 className="text-xl font-black">{(profile?.name || profile?.full_name || 'User')?.split(' ')[0]}&apos;s Workspace</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-black" />
                </button>
                <ThemeToggle />
                <button 
                  onClick={() => navigate('/tickets/new')}
                  className="hidden md:flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                >
                  <PlusCircle size={18} />
                  New Request
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-10 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
