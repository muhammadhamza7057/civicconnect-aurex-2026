import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="cc-card max-w-lg p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">404</p>
        <h1 className="mt-3 text-3xl font-black text-text">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-muted">The route you requested does not exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-2xl bg-primary px-4 py-3 font-semibold text-white">Back to home</Link>
      </div>
    </div>
  );
}
