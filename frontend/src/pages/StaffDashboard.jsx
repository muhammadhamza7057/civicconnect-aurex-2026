import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { TicketCard } from '../components/TicketCard';
import { EmptyState } from '../components/EmptyState';
import { AnimatedPage } from '../components/AnimatedPage';
import { getTickets, updateTicketStatus } from '../api/tickets';
import { connectSocket, getSocket } from '../socket/client';
import { useAuthStore } from '../store/authStore';

const columns = ['submitted', 'under_review', 'in_progress', 'resolved'];

function deriveBriefing(tickets) {
  const urgent = tickets.filter(ticket => ['high', 'critical', 'emergency'].includes(ticket.priority) || ticket.is_emergency);
  const duplicates = tickets.filter(ticket => ticket.is_duplicate);
  const breaches = tickets.filter(ticket => ticket.sla_due_at && new Date(ticket.sla_due_at).getTime() < Date.now() && !['resolved', 'closed'].includes(ticket.status));
  return { urgent, duplicates, breaches };
}

export function StaffDashboard() {
  const profile = useAuthStore(state => state.profile);
  const [tickets, setTickets] = useState([]);

  const loadTickets = async () => {
    const data = await getTickets({ per_page: 100 });
    const list = Array.isArray(data) ? data : data?.data || [];
    setTickets(list);
  };

  useEffect(() => {
    loadTickets().catch(err => toast.error(err.message || 'Failed to load staff tickets'));
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    const sync = async payload => {
      const id = payload?.ticketId || payload?.ticket?.id || payload?.ticket?._id;
      if (!id) return loadTickets();
      loadTickets();
    };
    socket.on('ticket:created', sync);
    socket.on('ticket:updated', sync);
    socket.on('ticket:aiUpdated', sync);
    socket.on('ticket:statusChanged', sync);
    socket.on('ticket:duplicateFound', sync);
    return () => {
      socket.off('ticket:created', sync);
      socket.off('ticket:updated', sync);
      socket.off('ticket:aiUpdated', sync);
      socket.off('ticket:statusChanged', sync);
      socket.off('ticket:duplicateFound', sync);
    };
  }, []);

  const briefing = useMemo(() => deriveBriefing(tickets), [tickets]);

  const grouped = useMemo(() => columns.reduce((acc, status) => {
    acc[status] = tickets.filter(ticket => ticket.status === status);
    return acc;
  }, {}), [tickets]);

  const changeStatus = async (ticketId, status) => {
    await toast.promise(updateTicketStatus(ticketId, status), {
      loading: 'Updating status...',
      success: 'Status updated',
      error: err => err.message || 'Unable to update status'
    });
    await loadTickets();
  };

  return (
    <AnimatedPage className="space-y-6">
      <SectionHeader
        eyebrow={`Department workspace${profile?.department ? ` / ${profile.department}` : ''}`}
        title="Staff operations board"
        description="A kanban-style workflow with AI morning briefing, SLA alerts, and instant ticket updates."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Urgent tickets" value={briefing.urgent.length} accent="danger" hint="High priority or emergency" />
        <StatCard label="SLA breaches" value={briefing.breaches.length} accent="warning" hint="Needs attention before deadline" />
        <StatCard label="Duplicates" value={briefing.duplicates.length} accent="primary" hint="Potential repeat complaints" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <section className="cc-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">AI morning briefing</p>
          <div className="mt-4 space-y-4">
            {[
              ['Urgent tickets', briefing.urgent.slice(0, 4)],
              ['SLA breaches', briefing.breaches.slice(0, 4)],
              ['Duplicates', briefing.duplicates.slice(0, 4)]
            ].map(([title, items]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="font-semibold text-text">{title}</h3>
                <div className="mt-3 space-y-2">
                  {items.length ? items.map(item => <p key={item._id} className="text-sm text-muted">{item.ticket_code} · {item.title}</p>) : <p className="text-sm text-muted">None right now.</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          {columns.map(status => (
            <div key={status} className="cc-card p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold capitalize text-text">{status.replace('_', ' ')}</h3>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-muted">{grouped[status].length}</span>
              </div>
              <div className="mt-4 space-y-3">
                {grouped[status].length ? grouped[status].map(ticket => (
                  <div key={ticket._id} className="rounded-2xl border border-white/10 bg-black/10 p-3">
                    <TicketCard ticket={ticket} compact />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['under_review', 'in_progress', 'resolved'].map(next => (
                        <button key={next} onClick={() => changeStatus(ticket._id, next)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-text transition hover:bg-white/5">
                          Move to {next.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )) : <EmptyState title="Clear lane" description="No tickets in this status." />}
              </div>
            </div>
          ))}
        </section>
      </div>
    </AnimatedPage>
  );
}
