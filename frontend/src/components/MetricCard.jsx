import React from 'react';
import { TrendingUp, Users, Clock, AlertCircle, CheckCircle2, BarChart3 } from 'lucide-react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

const iconMap = {
  tickets: Clock,
  users: Users,
  performance: TrendingUp,
  alerts: AlertCircle,
  completed: CheckCircle2,
  analytics: BarChart3
};

export function MetricCard({ label, value, icon = 'tickets', trend, accent = 'primary' }) {
  const Icon = iconMap[icon] || iconMap.tickets;
  const numeric = Number(value);
  const isNumeric = Number.isFinite(numeric) && String(value).trim() !== '' && /^-?\d+(\.\d+)?$/.test(String(value));

  const accentMap = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    success: 'from-success/20 to-success/5 text-success',
    warning: 'from-warning/20 to-warning/5 text-warning',
    danger: 'from-danger/20 to-danger/5 text-danger'
  };

  return (
    <motion.div whileHover={{ y: -4 }} className="cc-card p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-muted">{label}</p>
          <div className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-black tracking-tight text-text break-words">
            {isNumeric ? <CountUp end={numeric} duration={1.8} /> : value}
          </div>
          {trend && <p className="mt-1 sm:mt-2 text-xs font-medium text-success">{trend}</p>}
        </div>
        <div className={`shrink-0 rounded-2xl border border-border/50 bg-gradient-to-br p-2 sm:p-3 ${accentMap[accent] || accentMap.primary}`}>
          <Icon size={20} className="sm:w-6 sm:h-6" strokeWidth={1.5} />
        </div>
      </div>
    </motion.div>
  );
}
