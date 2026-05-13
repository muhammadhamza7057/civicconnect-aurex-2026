import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(var(--primary),0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(var(--success),0.08),transparent_22%),linear-gradient(180deg,rgb(var(--bg))_0%,rgb(var(--bg-soft))_100%)] px-4 py-6 lg:px-8">
      <div
        className={[
          'mx-auto grid min-h-[calc(100vh-48px)] max-w-7xl overflow-hidden rounded-[2rem] border border-border/70 bg-white/90 shadow-2xl shadow-slate-900/10 backdrop-blur-xl',
          isRegister ? '2xl:grid-cols-[0.85fr_1.15fr]' : 'lg:grid-cols-[1.05fr_0.95fr]'
        ].join(' ')}
      >
        <section className={["relative flex flex-col justify-between overflow-hidden px-6 py-10 lg:px-12", isRegister ? 'hidden 2xl:flex' : ''].join(' ')}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.22),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(var(--success),0.18),transparent_32%)]" />
          <div className="relative z-10">
            <Link
              to="/"
              title="Return to CivicConnect home page"
              className="inline-flex min-h-[44px] items-center gap-3 rounded-full border border-border/70 bg-white/80 px-4 py-2.5 text-base font-semibold text-text shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <span className="h-3 w-3 shrink-0 rounded-full bg-primary shadow-glow" aria-hidden />
              CivicConnect
            </Link>
            <div className="mt-10 max-w-xl space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">CivicConnect</p>
              <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-text sm:text-[2.6rem]">
                One place for residents and teams to move requests forward.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-muted sm:text-xl sm:leading-9">
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
                className="rounded-2xl border border-border/70 bg-white/80 p-4 text-left shadow-soft backdrop-blur-sm"
              >
                <h2 className="text-base font-bold text-text">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted sm:text-[15px]">{text}</p>
              </div>
            ))}
          </motion.div>
        </section>
        <section className="flex items-start justify-center bg-[rgb(var(--bg))/0.45] px-4 py-10 lg:px-6 lg:py-12">
          <div className={['w-full', isRegister ? 'max-w-4xl' : 'max-w-xl'].join(' ')}>
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
