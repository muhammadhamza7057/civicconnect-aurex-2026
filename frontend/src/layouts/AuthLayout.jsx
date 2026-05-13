import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export function AuthLayout() {
  return (
    <div className="min-h-screen px-4 py-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 shadow-soft backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex flex-col justify-between overflow-hidden px-6 py-10 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.16),transparent_25%)]" />
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
              <span className="h-3 w-3 rounded-full bg-primary shadow-glow" />
              CivicConnect
            </Link>
            <div className="mt-12 max-w-xl space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">GovTech SaaS</p>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Government-grade civic operations, built for real-time trust.</h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Handle resident complaints, AI triage, SLA tracking, staff workflows, and analytics in one beautifully calm command center.
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative z-10 mt-10 grid gap-4 sm:grid-cols-3"
          >
            {[
              ['Real-time tickets', 'Live socket updates'],
              ['AI triage', 'Gemini-powered insights'],
              ['SLA control', 'Green-yellow-red clarity']
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/90 backdrop-blur">
                <div className="text-sm font-semibold">{title}</div>
                <div className="mt-1 text-sm text-slate-400">{text}</div>
              </div>
            ))}
          </motion.div>
        </section>
        <section className="flex items-center justify-center bg-slate-50 px-4 py-8 dark:bg-slate-950">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
