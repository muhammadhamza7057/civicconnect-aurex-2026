import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export function AuthLayout() {
  return (
    <div className="min-h-screen px-4 py-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-7xl overflow-hidden rounded-[2rem] border-2 border-border bg-slate-950/80 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[1.12fr_0.88fr]">
        <section className="relative flex flex-col justify-between overflow-hidden px-6 py-10 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.35),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.22),transparent_32%)]" />
          <div className="relative z-10">
            <Link
              to="/"
              title="Return to CivicConnect home page"
              className="inline-flex min-h-[44px] items-center gap-3 rounded-full border-2 border-white/20 bg-white/10 px-4 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <span className="h-3 w-3 shrink-0 rounded-full bg-primary shadow-glow" aria-hidden />
              CivicConnect
            </Link>
            <div className="mt-10 max-w-xl space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">CivicConnect</p>
              <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-[2.5rem]">
                One place for residents and teams to move requests forward.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-100 sm:text-xl sm:leading-9">
                Submit issues, see status at a glance, and keep everyone aligned—without hunting through email threads or
                spreadsheets.
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 mt-10 grid gap-4 sm:grid-cols-3"
          >
            {[
              ['Clear status', 'You always see where a request stands.'],
              ['Built for teams', 'Work is routed to the right department.'],
              ['Designed for focus', 'Only the fields you need—nothing extra.']
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border-2 border-white/15 bg-black/25 p-4 text-left shadow-inner backdrop-blur-sm"
              >
                <h2 className="text-base font-bold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-100 sm:text-[15px]">{text}</p>
              </div>
            ))}
          </motion.div>
        </section>
        <section className="flex items-center justify-center bg-slate-100 px-4 py-10 dark:bg-slate-950 lg:py-12">
          <div className="w-full max-w-xl">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
