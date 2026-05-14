import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, 
  Download, 
  RefreshCw, 
  LayoutDashboard,
  Activity
} from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { AnimatedPage } from '../components/AnimatedPage';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { LiveCityMap } from '../components/LiveCityMap';
import { client as axiosInstance } from '../api/client';
import { getTickets } from '../api/tickets';
import { useAuthStore } from '../store/authStore';
import { connectSocket } from '../socket/client';

export function AdminDashboard() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('analytics');
  const profile = useAuthStore(state => state.profile);

  const exportCsv = async () => {
    try {
      const res = await axiosInstance.get('/analytics/export/tickets.csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'civicconnect-tickets.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch (err) {
      toast.error(err.message || 'Export failed');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = profile.role === 'super_admin' ? '/analytics/system' : '/analytics/department';
      const [analyticsRes, ticketsRes] = await Promise.all([
        axiosInstance.get(endpoint),
        getTickets({ per_page: 50 })
      ]);
      
      setAnalyticsData(analyticsRes.data.data);
      setTickets(Array.isArray(ticketsRes) ? ticketsRes : ticketsRes?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load executive data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile.role]);

  useEffect(() => {
    const socket = connectSocket();
    const sync = () => fetchData();

    socket.on('ticket:created', sync);
    socket.on('ticket:updated', sync);
    socket.on('ticket:statusChanged', sync);
    socket.on('ticket:assigned', sync);
    socket.on('notification:new', sync);

    return () => {
      socket.off('ticket:created', sync);
      socket.off('ticket:updated', sync);
      socket.off('ticket:statusChanged', sync);
      socket.off('ticket:assigned', sync);
      socket.off('notification:new', sync);
    };
  }, [profile.role]);

  useEffect(() => {
    if (profile.role !== 'super_admin') return;
    axiosInstance
      .get('/audit-logs')
      .then(res => setAuditLogs(res.data?.data || []))
      .catch(() => setAuditLogs([]));
  }, [profile.role]);

  return (
    <AnimatedPage className="space-y-8 pb-20">
      <SectionHeader
        eyebrow="Executive Command Center"
        title={profile.role === 'super_admin' ? 'City-Wide Operations' : 'Departmental Oversight'}
        description="Monitor system-wide health, response times, and citizen satisfaction in real-time."
        action={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setViewMode(viewMode === 'analytics' ? 'map' : 'analytics')}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base font-semibold sm:font-bold text-gray-300 hover:bg-white/10 transition-all"
            >
              {viewMode === 'analytics' ? <MapIcon size={16} className="sm:size-[18px]" /> : <LayoutDashboard size={16} className="sm:size-[18px]" />}
              <span className="hidden sm:inline">{viewMode === 'analytics' ? 'Live Map' : 'Analytics'}</span>
              <span className="sm:hidden">{viewMode === 'analytics' ? 'Map' : 'View'}</span>
            </button>
            <button 
              onClick={fetchData}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              title="Refresh data"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline text-sm font-semibold">Refresh</span>
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-white text-black px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-bold sm:font-black shadow-lg hover:bg-gray-100 transition-all"
            >
              <Download size={16} className="sm:size-[18px]" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        }
      />

      <div className="cc-card border-primary/15 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Executive control</p>
            <h3 className="mt-1 text-lg font-bold text-text">Clean analytics for demo mode</h3>
            <p className="mt-1 text-sm leading-6 text-muted">Switch views, refresh data, and export without visual clutter.</p>
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="rounded-2xl border border-border/60 bg-surface px-4 py-3 text-sm font-semibold text-text transition hover:bg-surface-2"
          >
            Refresh data
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-[600px] flex-col items-center justify-center space-y-4 rounded-[28px] border border-border/60 bg-surface/60"
          >
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Aggregating data…</p>
          </motion.div>
        ) : (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {viewMode === 'analytics' ? (
              <AnalyticsDashboard 
                data={analyticsData} 
                type={profile.role === 'super_admin' ? 'system' : 'department'} 
              />
            ) : (
              <div className="space-y-6">
                <div className="cc-card flex items-center justify-between border-primary/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Activity size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-muted">Live incident map</p>
                      <p className="text-sm font-bold text-text">Real-time status of all reported issues</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-muted">Active incidents</p>
                      <p className="text-lg font-black text-text">{tickets.length}</p>
                    </div>
                  </div>
                </div>
                <LiveCityMap tickets={tickets} zoom={12} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {profile.role === 'super_admin' && auditLogs.length > 0 ? (
        <div className="cc-card p-6">
          <p className="mb-4 text-xs font-black uppercase tracking-widest text-muted">Audit trail</p>
          <div className="overflow-x-auto text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-muted">
                  <th className="pb-2">Action</th>
                  <th className="pb-2">When</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 15).map((row, i) => (
                  <tr key={i} className="border-t border-border/60 text-text">
                    <td className="py-2 font-semibold text-text">{row.action}</td>
                    <td className="py-2">{row.timestamp ? new Date(row.timestamp).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </AnimatedPage>
  );
}
