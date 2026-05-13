import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Map as MapIcon, 
  List as ListIcon,
  AlertTriangle,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { MetricCard } from '../components/MetricCard';
import { EnhancedTicketCard } from '../components/EnhancedTicketCard';
import { EmptyState } from '../components/EmptyState';
import { AnimatedPage } from '../components/AnimatedPage';
import { LiveCityMap } from '../components/LiveCityMap';
import { getTickets, updateTicketStatus } from '../api/tickets';
import { connectSocket } from '../socket/client';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const columns = ['submitted', 'under_review', 'in_progress', 'resolved'];

export function StaffDashboard() {
  const profile = useAuthStore(state => state.profile);
  const [tickets, setTickets] = useState([]);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'map'
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      const data = await getTickets({ per_page: 100 });
      const list = Array.isArray(data) ? data : data?.data || [];
      setTickets(list);
    } catch (err) {
      toast.error(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    const sync = () => loadTickets();
    
    socket.on('ticket:created', sync);
    socket.on('ticket:updated', sync);
    socket.on('ticket:statusChanged', sync);
    socket.on('ticket:assigned', sync);

    return () => {
      socket.off('ticket:created', sync);
      socket.off('ticket:updated', sync);
      socket.off('ticket:statusChanged', sync);
      socket.off('ticket:assigned', sync);
    };
  }, []);

  const stats = useMemo(() => ({
    assigned: tickets.filter(t => t.assigned_to?._id === profile._id || t.assigned_to === profile._id).length,
    urgent: tickets.filter(t => ['high', 'critical', 'emergency'].includes(t.priority)).length,
    overdue: tickets.filter(t => t.metadata?.slaStatus === 'red').length
  }), [tickets, profile._id]);

  const grouped = useMemo(() => columns.reduce((acc, status) => {
    acc[status] = tickets.filter(ticket => ticket.status === status);
    return acc;
  }, {}), [tickets]);

  const changeStatus = async (ticketId, status) => {
    await toast.promise(updateTicketStatus(ticketId, status), {
      loading: 'Updating...',
      success: 'Status synchronized',
      error: 'Sync failed'
    });
    loadTickets();
  };

  return (
    <AnimatedPage className="space-y-8 pb-20">
      <SectionHeader
        eyebrow={`Ops Command / ${profile.department?.name || 'Department'}`}
        title="Operations Board"
        description="Manage assigned tasks, monitor department workload, and respond to civic issues in real-time."
        action={
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode(viewMode === 'kanban' ? 'map' : 'kanban')}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-gray-300 hover:bg-white/10 transition-all"
            >
              {viewMode === 'kanban' ? <MapIcon size={18} /> : <Layers size={18} />}
              {viewMode === 'kanban' ? 'Live Map' : 'Kanban Board'}
            </button>
            <button className="flex items-center gap-2 rounded-2xl bg-white text-black px-6 py-3 font-black shadow-lg hover:bg-gray-100 transition-all">
              <Sparkles size={18} />
              AI Briefing
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Assigned to Me" value={stats.assigned} icon="tickets" accent="primary" />
        <MetricCard label="Priority Issues" value={stats.urgent} icon="alerts" accent="danger" />
        <MetricCard label="SLA Breaches" value={stats.overdue} icon="completed" accent="warning" />
      </div>

      <div className="cc-card border-primary/15 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Staff action center</p>
            <h3 className="mt-1 text-lg font-bold text-text">One-click triage, better visibility</h3>
            <p className="mt-1 text-sm leading-6 text-muted">Use the board to advance tickets, check SLA pressure, and keep the workload balanced.</p>
          </div>
          <button className="rounded-2xl border border-border/60 bg-surface px-4 py-3 text-sm font-semibold text-text transition hover:bg-surface-2">
            AI Briefing
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'map' ? (
          <motion.div
            key="map"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="cc-card p-4 border-primary/20 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">Live Department Activity</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-success">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Sockets Active
                </div>
              </div>
            </div>
            <LiveCityMap tickets={tickets} zoom={13} />
          </motion.div>
        ) : (
          <motion.div
            key="kanban"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 lg:grid-cols-4"
          >
            {columns.map((status, idx) => (
              <div key={status} className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted">
                    {status.replace('_', ' ')}
                  </h3>
                  <span className="rounded-full border border-border/60 bg-surface/80 px-2 py-0.5 text-[10px] font-black text-muted">
                    {grouped[status].length}
                  </span>
                </div>
                
                <div className="min-h-[500px] flex-1 space-y-4 rounded-[28px] border border-border/60 bg-surface/70 p-3 shadow-soft">
                  {grouped[status].length > 0 ? (
                    grouped[status].map((ticket) => (
                      <div key={ticket._id} className="group relative">
                        <EnhancedTicketCard
                          ticket={ticket}
                          compact
                          isAssigned={ticket.assigned_to?._id === profile._id || ticket.assigned_to === profile._id}
                        />
                        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {columns.filter(c => c !== status).slice(0, 2).map(next => (
                            <button
                              key={next}
                              onClick={() => changeStatus(ticket._id, next)}
                              className="rounded-lg border border-border/60 bg-bg/90 p-1.5 text-[10px] font-bold text-muted transition-all hover:border-primary/50 hover:text-text"
                              title={`Move to ${next}`}
                            >
                              <ChevronRight size={14} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-border/60 bg-bg/30">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}
