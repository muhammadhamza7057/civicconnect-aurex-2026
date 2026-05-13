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
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode(viewMode === 'analytics' ? 'map' : 'analytics')}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-gray-300 hover:bg-white/10 transition-all"
            >
              {viewMode === 'analytics' ? <MapIcon size={18} /> : <LayoutDashboard size={18} />}
              {viewMode === 'analytics' ? 'Live Map' : 'Analytics'}
            </button>
            <button 
              onClick={fetchData}
              className="p-3 rounded-2xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="hidden md:flex items-center gap-2 rounded-2xl bg-white text-black px-6 py-3 font-black shadow-lg hover:bg-gray-100 transition-all"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        }
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[600px] flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Aggregating Data...</p>
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
                <div className="cc-card p-4 flex items-center justify-between border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Activity size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-500">Live Incident Map</p>
                      <p className="text-sm font-bold text-white">Real-time status of all reported issues</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-gray-600">Active Incidents</p>
                      <p className="text-lg font-black text-white">{tickets.length}</p>
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
          <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Audit trail</p>
          <div className="overflow-x-auto text-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <th className="pb-2">Action</th>
                  <th className="pb-2">When</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 15).map((row, i) => (
                  <tr key={i} className="border-t border-white/5 text-gray-300">
                    <td className="py-2 font-semibold text-white">{row.action}</td>
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
