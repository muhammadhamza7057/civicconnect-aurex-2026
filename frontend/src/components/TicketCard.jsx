import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { StatusPill } from './StatusPill';
import { SlaBadge } from './SlaBadge';
import { formatDateTime, formatRelativeTime } from '../utils/format';

export function TicketCard({ ticket, compact = false }) {
  const slaStatus = ticket?.metadata?.slaStatus || ticket?.sla_status || 'amber';

  return (
    <motion.div whileHover={{ y: -3 }} className="cc-card flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{ticket.ticket_code}</p>
          <h3 className="mt-2 text-lg font-semibold text-text">{ticket.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusPill status={ticket.status} />
          <SlaBadge status={slaStatus} label={`SLA ${formatRelativeTime(ticket.sla_due_at)}`} />
        </div>
      </div>
      <p className="line-clamp-3 text-sm leading-6 text-muted">{ticket.description}</p>
      {ticket.ai_summary ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-text">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">AI insight</p>
          <p className="mt-2 leading-6">{ticket.ai_summary}</p>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3 text-xs text-muted">
        <span>Updated {formatDateTime(ticket.updatedAt)}</span>
        <Link to={`/tickets/${ticket._id}`} className="rounded-full border border-white/10 px-3 py-1.5 font-semibold text-text transition hover:bg-white/5">
          View details
        </Link>
      </div>
      {compact ? null : <div className="h-px bg-white/10" />}
    </motion.div>
  );
}
