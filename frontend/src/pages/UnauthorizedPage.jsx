import React from 'react';
import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="cc-card max-w-lg p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Access denied</p>
        <h1 className="mt-3 text-3xl font-black text-text">You do not have permission to access this area.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Switch accounts or return to a permitted workspace.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="rounded-2xl border border-white/10 px-4 py-3 font-semibold text-text">Home</Link>
          <Link to="/login" className="rounded-2xl bg-primary px-4 py-3 font-semibold text-white">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
