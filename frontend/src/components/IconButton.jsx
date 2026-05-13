import React from 'react';
import { classNames } from '../utils/classNames';

export function IconButton({ icon: Icon, label, onClick, size = 'md', variant = 'ghost', disabled = false, className = '' }) {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const variantMap = {
    ghost: 'text-muted hover:bg-white/10 hover:text-text',
    primary: 'text-primary hover:bg-primary/10',
    danger: 'text-danger hover:bg-danger/10',
    success: 'text-success hover:bg-success/10'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={classNames(
        'flex items-center justify-center rounded-full transition-colors',
        sizeMap[size],
        variantMap[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} strokeWidth={1.5} />}
    </button>
  );
}
