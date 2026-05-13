import React from 'react';
import { classNames } from '../utils/classNames';

export function SlaBadge({ status = 'amber', label }) {
  const styles = {
    green: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
    amber: 'border-amber-400/20 bg-amber-500/10 text-amber-300',
    red: 'border-red-400/20 bg-red-500/10 text-red-300'
  };

  return <span className={classNames('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize', styles[status] || styles.amber)}>{label || status}</span>;
}
