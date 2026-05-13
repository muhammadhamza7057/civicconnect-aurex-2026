import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { TicketCard } from '../components/TicketCard';
import { EmptyState } from '../components/EmptyState';
import { AnimatedPage } from '../components/AnimatedPage';
import { getMyTickets, getTicketById } from '../api/tickets';
import { useAuthStore } from '../store/authStore';
import { connectSocket, getSocket } from '../socket/client';
import { DemoAccessPanel } from '../components/DemoAccessPanel';

export function ResidentDashboard() {
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
    <AnimatedPage className="space-y-6">
      <SectionHeader
        eyebrow={`Hello ${profile?.full_name?.split(' ')[0] || 'Resident'}`}
        title="Your civic requests at a glance"
        description="Track every complaint, SLA timer, and AI insight in real time."
        action={<Link to="/tickets/new" className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow">Report Issue</Link>}
      />

      <div className="cc-card border-primary/20 bg-gradient-to-r from-primary/10 via-surface to-success/10 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Resident workflow</p>
            <h3 className="mt-1 text-lg font-bold text-text">Quick actions for a demo run</h3>
            <p className="mt-1 text-sm leading-6 text-muted">Submit a ticket, watch its timeline update, and review AI guidance without hunting through the UI.</p>
          </div>
          <Link to="/tickets/new" className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-glow">
            Create ticket
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Open tickets" value={counts.open} accent="primary" hint="Requests still in motion" />
        <StatCard label="Resolved" value={counts.resolved} accent="success" hint="Closed or completed issues" />
        <StatCard label="Urgent issues" value={counts.urgent} accent="warning" hint="Need immediate civic attention" />
      </div>

      <DemoAccessPanel compact />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="space-y-4">
          {tickets.length ? (
            tickets.map(ticket => <TicketCard key={ticket._id} ticket={ticket} />)
          ) : (
            <EmptyState
              title="No tickets yet"
              description="Your dashboard will populate here the moment you submit a civic request."
              action={<Link to="/tickets/new" className="rounded-2xl bg-primary px-4 py-3 font-semibold text-white">Submit your first ticket</Link>}
            />
          )}
        </section>

        <aside className="space-y-4">
          <div className="cc-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Selected ticket</p>
            {selectedTicket ? (
              <div className="mt-4 space-y-3">
                <h3 className="text-xl font-semibold text-text">{selectedTicket.title}</h3>
                <p className="text-sm leading-6 text-muted">{selectedTicket.description}</p>
                <div className="rounded-2xl border border-primary/15 bg-primary/10 p-4 text-sm text-text">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">AI insight</p>
                  <p className="mt-2 leading-6">{selectedTicket.ai_summary || 'AI is still processing this request.'}</p>
                </div>
                <div className="space-y-2 text-sm text-muted">
                  <p>Status: <span className="font-semibold text-text">{selectedTicket.status}</span></p>
                  <p>Priority: <span className="font-semibold text-text">{selectedTicket.priority}</span></p>
                  <p>SLA: <span className="font-semibold text-text">{selectedTicket.metadata?.slaStatus || 'amber'}</span></p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">Pick a ticket to see AI notes and SLA details.</p>
            )}
          </div>
        </aside>
      </div>
    </AnimatedPage>
  );
}
