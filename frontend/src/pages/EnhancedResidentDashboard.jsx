import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, TrendingUp, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { MetricCard } from '../components/MetricCard';
import { EnhancedTicketCard } from '../components/EnhancedTicketCard';
import { EmptyState } from '../components/EmptyState';
import { AnimatedPage } from '../components/AnimatedPage';
import { getMyTickets, getTicketById } from '../api/tickets';
import { useAuthStore } from '../store/authStore';
import { connectSocket, getSocket } from '../socket/client';
import { motion } from 'framer-motion';

export function EnhancedResidentDashboard() {
  const profile = useAuthStore(state => state.profile);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const loadTickets = async () => {
    const data = await getMyTickets({ per_page: 100 });
    const list = Array.isArray(data) ? data : data?.data || [];
    setTickets(list);
    if (!selectedTicket && list[0]) setSelectedTicket(list[0]);
  };

  useEffect(() => {
    loadTickets().catch(err => toast.error(err.message || 'Failed to load tickets'));
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    const syncTicket = async payload => {
      const id = payload?.ticketId || payload?.ticket?.id || payload?.ticket?._id;
      if (!id) {
        await loadTickets();
        return;
      }
      try {
        const ticket = await getTicketById(id);
        setTickets(prev => {
          const exists = prev.some(item => item._id === ticket._id);
          if (exists) return prev.map(item => (item._id === ticket._id ? ticket : item));
          return [ticket, ...prev];
        });
        setSelectedTicket(ticket);
      } catch (error) {
        loadTickets();
      }
    };

    socket.on('ticket:created', syncTicket);
    socket.on('ticket:updated', syncTicket);
    socket.on('ticket:aiUpdated', syncTicket);
    socket.on('ticket:statusChanged', syncTicket);

    return () => {
      socket.off('ticket:created', syncTicket);
      socket.off('ticket:updated', syncTicket);
      socket.off('ticket:aiUpdated', syncTicket);
      socket.off('ticket:statusChanged', syncTicket);
    };
  }, [selectedTicket]);

  const counts = useMemo(() => ({
    open: tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
    resolved: tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
    urgent: tickets.filter(t => ['high', 'critical', 'emergency'].includes(t.priority)).length
  }), [tickets]);

  return (
    <AnimatedPage className="space-y-8">
      <SectionHeader
        eyebrow={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'Resident'}`}
        title="Your civic requests"
        description="Submit issues, track progress, and see your impact on city operations in real time."
        action={
          <Link
            to="/tickets/new"
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-glow transition hover:opacity-95"
          >
            <Plus size={18} />
            Report Issue
          </Link>
        }
      />

      {/* METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Open Requests" value={counts.open} icon="tickets" accent="primary" />
        <MetricCard label="Resolved" value={counts.resolved} icon="completed" accent="success" />
        <MetricCard label="Urgent Issues" value={counts.urgent} icon="alerts" accent="danger" />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        {/* TICKETS LIST */}
        <section className="space-y-4">
          {tickets.length > 0 ? (
            tickets.map((ticket, idx) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <EnhancedTicketCard ticket={ticket} onClick={() => setSelectedTicket(ticket)} />
              </motion.div>
            ))
          ) : (
            <EmptyState
              title="No requests yet"
              description="Submit your first civic issue and watch real-time updates as it progresses through our system."
              action={
                <Link
                  to="/tickets/new"
                  className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-glow"
                >
                  <Plus size={18} />
                  Report Issue
                </Link>
              }
            />
          )}
        </section>

        {/* SIDEBAR - SELECTED TICKET */}
        <aside className="space-y-4">
          {selectedTicket ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="cc-card space-y-5 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{selectedTicket.ticket_code}</p>
                <h3 className="mt-3 text-xl font-bold text-text">{selectedTicket.title}</h3>
              </div>

              {/* STATUS & INFO */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs text-muted">Status</p>
                  <p className="mt-1 font-semibold text-text">{selectedTicket.status.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Priority</p>
                  <p className="mt-1 font-semibold text-text">{selectedTicket.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">SLA Status</p>
                  <p className={`mt-1 font-semibold ${selectedTicket.metadata?.slaStatus === 'red' ? 'text-red-400' : selectedTicket.metadata?.slaStatus === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {selectedTicket.metadata?.slaStatus || 'on track'}
                  </p>
                </div>
              </div>

              {/* AI INSIGHT */}
              {selectedTicket.ai_summary && (
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">AI Analysis</p>
                  <p className="mt-3 text-sm leading-6 text-text">{selectedTicket.ai_summary}</p>
                </div>
              )}

              {/* ACTION BUTTON */}
              <Link
                to={`/tickets/${selectedTicket._id}`}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 py-3 font-semibold text-primary transition hover:bg-primary/20"
              >
                <TrendingUp size={18} />
                View Full Details
              </Link>
            </motion.div>
          ) : (
            <div className="cc-card p-6 text-center">
              <CheckCircle2 size={40} className="mx-auto text-muted/30" strokeWidth={1} />
              <p className="mt-4 text-sm text-muted">Select a request to view details</p>
            </div>
          )}
        </aside>
      </div>
    </AnimatedPage>
  );
}
