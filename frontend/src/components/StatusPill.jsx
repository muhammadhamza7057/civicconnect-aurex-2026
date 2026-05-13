import React from 'react';
import { classNames } from '../utils/classNames';
import { ticketStatusLabel } from '../utils/format';

const styles = {
  submitted: 'bg-blue-500/15 text-blue-300 border-blue-400/20',
  under_review: 'bg-amber-500/15 text-amber-300 border-amber-400/20',
  assigned: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/20',
  in_progress: 'bg-violet-500/15 text-violet-300 border-violet-400/20',
  resolved: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
  closed: 'bg-slate-500/15 text-slate-300 border-slate-400/20',
  escalated: 'bg-red-500/15 text-red-300 border-red-400/20'
};

export function StatusPill({ status }) {
  const className = styles[status] || styles.submitted;
  return <span className={classNames('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide', className)}>{ticketStatusLabel(status)}</span>;
}
