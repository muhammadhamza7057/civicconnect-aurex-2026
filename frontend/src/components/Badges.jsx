import React from 'react';
import { AlertCircle, CheckCircle2, Clock, Flag, AlertTriangle } from 'lucide-react';
import { classNames } from '../utils/classNames';

const priorityConfig = {
  emergency: { icon: AlertCircle, color: 'text-red-400 bg-red-500/15 border-red-400/20', label: 'Emergency' },
  critical: { icon: AlertTriangle, color: 'text-orange-400 bg-orange-500/15 border-orange-400/20', label: 'Critical' },
  high: { icon: Flag, color: 'text-amber-400 bg-amber-500/15 border-amber-400/20', label: 'High' },
  medium: { icon: Clock, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-400/20', label: 'Medium' },
  low: { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-400/20', label: 'Low' }
};

export function PriorityBadge({ priority = 'medium' }) {
  const config = priorityConfig[priority] || priorityConfig.medium;
  const Icon = config.icon;

  return (
    <div className={classNames('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold', config.color)}>
      <Icon size={14} strokeWidth={2} />
      {config.label}
    </div>
  );
}

const statusConfig = {
  submitted: { icon: Clock, color: 'text-blue-400 bg-blue-500/15 border-blue-400/20', label: 'Submitted' },
  under_review: { icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/15 border-amber-400/20', label: 'Under Review' },
  assigned: { icon: CheckCircle2, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-400/20', label: 'Assigned' },
  in_progress: { icon: Clock, color: 'text-violet-400 bg-violet-500/15 border-violet-400/20', label: 'In Progress' },
  resolved: { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-400/20', label: 'Resolved' },
  closed: { icon: CheckCircle2, color: 'text-slate-400 bg-slate-500/15 border-slate-400/20', label: 'Closed' },
  escalated: { icon: AlertCircle, color: 'text-red-400 bg-red-500/15 border-red-400/20', label: 'Escalated' }
};

export function StatusBadgeWithIcon({ status = 'submitted' }) {
  const config = statusConfig[status] || statusConfig.submitted;
  const Icon = config.icon;

  return (
    <div className={classNames('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold', config.color)}>
      <Icon size={14} strokeWidth={2} />
      {config.label}
    </div>
  );
}
