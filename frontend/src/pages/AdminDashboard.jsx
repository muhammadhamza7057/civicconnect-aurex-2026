import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { AnimatedPage } from '../components/AnimatedPage';
import { getTickets } from '../api/tickets';
import { moneyFormat } from '../utils/format';

function statusCount(tickets, status) {
  return tickets.filter(ticket => ticket.status === status).length;
}

export function AdminDashboard() {
  const [tickets, setTickets] = useState([]);

  const loadTickets = async () => {
    const data = await getTickets({ per_page: 100 });
    const list = Array.isArray(data) ? data : data?.data || [];
    setTickets(list);
  };

  useEffect(() => {
    loadTickets().catch(err => toast.error(err.message || 'Failed to load analytics'));
  }, []);

  const metrics = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(ticket => !['resolved', 'closed'].includes(ticket.status)).length,
    critical: tickets.filter(ticket => ['critical', 'emergency'].includes(ticket.priority)).length,
    resolved: statusCount(tickets, 'resolved') + statusCount(tickets, 'closed'),
    avgSla: tickets.length ? Math.round(tickets.reduce((sum, ticket) => sum + (ticket.metadata?.slaStatus === 'red' ? 3 : ticket.metadata?.slaStatus === 'amber' ? 2 : 1), 0) / tickets.length) : 0
  }), [tickets]);

  const departmentBreakdown = useMemo(() => {
    const counts = tickets.reduce((acc, ticket) => {
      const key = ticket.department?.name || ticket.department?.slug || 'Unassigned';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [tickets]);

  return (
    <AnimatedPage className="space-y-6">
      <SectionHeader
        eyebrow="Executive analytics"
        title="Admin command center"
        description="Track system health, departmental throughput, SLA performance, and governance at a glance."
        action={<div className="flex gap-3"><button className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold">Export CSV</button><button className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow">Export PDF</button></div>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tickets" value={metrics.total} accent="primary" hint="Current system-wide volume" />
        <StatCard label="Open tickets" value={metrics.open} accent="warning" hint="Still active in the workflow" />
        <StatCard label="Critical" value={metrics.critical} accent="danger" hint="Emergency attention required" />
        <StatCard label="Resolved" value={metrics.resolved} accent="success" hint="Closed and completed tickets" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="cc-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">SLA performance</p>
              <p className="mt-2 text-3xl font-black text-text"><CountUp end={metrics.avgSla} duration={1.3} /> / 3</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Compliance</p>
              <p className="mt-1 text-xl font-semibold text-text">{tickets.length ? `${Math.round((metrics.resolved / tickets.length) * 100)}%` : '0%'}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {['green', 'amber', 'red'].map(color => {
              const count = tickets.filter(ticket => ticket.metadata?.slaStatus === color).length;
              return (
                <div key={color} className="rounded-3xl border border-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{color} zone</p>
                  <p className="mt-2 text-2xl font-black text-text">{count}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="cc-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Department distribution</p>
          <div className="mt-4 space-y-3">
            {departmentBreakdown.length ? departmentBreakdown.map(([name, count]) => (
              <div key={name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-text">{name}</span>
                  <span className="text-muted">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5">
                  <div className="h-2 rounded-full bg-gradient-to-r from-primary to-success" style={{ width: `${Math.min(100, Math.max(8, count * 12))}%` }} />
                </div>
              </div>
            )) : <EmptyState title="No data yet" description="Department analytics will show once tickets are seeded or created." />}
          </div>
        </section>
      </div>

      <section className="cc-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Heatmap</p>
        <div className="mt-4 grid grid-cols-8 gap-2 sm:grid-cols-12">
          {Array.from({ length: 48 }).map((_, index) => {
            const active = tickets.length ? tickets[index % tickets.length] : null;
            const intensity = active ? (active.priority === 'emergency' ? 'bg-red-500/80' : active.priority === 'critical' ? 'bg-orange-500/70' : active.priority === 'high' ? 'bg-amber-500/60' : 'bg-primary/50') : 'bg-white/5';
            return <div key={index} className={`aspect-square rounded-xl ${intensity}`} />;
          })}
        </div>
      </section>
    </AnimatedPage>
  );
}
