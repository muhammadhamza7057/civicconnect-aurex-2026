import React from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

export function StatCard({ label, value, suffix = '', hint, accent = 'primary' }) {
  const accentMap = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    success: 'from-success/20 to-success/5 text-success',
    warning: 'from-warning/20 to-warning/5 text-warning',
    danger: 'from-danger/20 to-danger/5 text-danger'
  };

  const numeric = Number(value);
  const isNumeric = Number.isFinite(numeric) && String(value).trim() !== '' && /^-?\d+(\.\d+)?$/.test(String(value));

  return (
    <motion.div whileHover={{ y: -2 }} className="cc-card p-5">
      <div className={`rounded-2xl border border-border/50 bg-gradient-to-br p-4 ${accentMap[accent] || accentMap.primary}`}>
        <p className="text-sm font-medium text-muted">{label}</p>
        <div className="mt-2 text-3xl font-black tracking-tight text-text">
          {isNumeric ? <CountUp end={numeric} duration={1.6} /> : value}{suffix}
        </div>
        {hint ? <p className="mt-2 text-xs leading-5 text-muted">{hint}</p> : null}
      </div>
    </motion.div>
  );
}
