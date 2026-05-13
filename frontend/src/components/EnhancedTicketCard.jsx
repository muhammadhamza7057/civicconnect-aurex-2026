import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, AlertCircle, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { PriorityBadge, StatusBadgeWithIcon } from './Badges';
import { formatDateTime, formatRelativeTime } from '../utils/format';

export function EnhancedTicketCard({ ticket, compact = false, onClick }) {
  const slaStatus = ticket?.metadata?.slaStatus || ticket?.sla_status || 'amber';
  const slaColor = slaStatus === 'red' ? 'text-red-400' : slaStatus === 'amber' ? 'text-amber-400' : 'text-emerald-400';
  const slaIcon = slaStatus === 'red' ? AlertCircle : Clock;
  const SlaIcon = slaIcon;

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }} 
      onClick={onClick}
      className="cc-card group cursor-pointer overflow-hidden p-0 transition-all"
    >
      <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-r from-white/5 to-transparent p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{ticket.ticket_code}</p>
            <h3 className="mt-2 line-clamp-2 text-lg font-bold tracking-tight text-text">{ticket.title}</h3>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 rounded-full border border-border/60 bg-bg/60 px-3 py-1">
            <SlaIcon size={14} className={slaColor} strokeWidth={2} />
            <span className={`text-xs font-bold ${slaColor}`}>{formatRelativeTime(ticket.sla_due_at)}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <p className="line-clamp-2 text-sm leading-6 text-muted">{ticket.description}</p>

        {ticket.ai_summary && (
          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">AI Insight</p>
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-text">{ticket.ai_summary}</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadgeWithIcon status={ticket.status} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 px-6 py-4">
        <p className="text-xs text-muted">Updated {formatDateTime(ticket.updatedAt)}</p>
        <Link
          to={`/tickets/${ticket._id}`}
          className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
        >
          Details
          <ChevronRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
