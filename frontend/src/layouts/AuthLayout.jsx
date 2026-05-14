import React, { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Shield, Activity } from 'lucide-react';

export function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  // Animated metrics for left panel
  const metrics = [
    { icon: TrendingUp, label: '10,000+ Issues', subtext: 'Resolved this year' },
    { icon: Zap, label: '500+ Staff', subtext: 'Across all departments' },
    { icon: Shield, label: '98% SLA', subtext: 'On-time resolution' },
    { icon: Activity, label: '24/7 Monitoring', subtext: 'Real-time updates' }
  ];

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-white/95 shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        {/* LEFT PANEL — PREMIUM STORYTELLING */}
        <section className="relative hidden flex-col justify-between overflow-hidden px-8 py-12 lg:flex xl:px-12">
          {/* Background gradient overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-400/5 to-transparent"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1), transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.08), transparent 60%)
              `,
            }}
          />

          {/* Animated background element */}
          <motion.div
            className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-300/10 blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-400/20 to-cyan-300/10 blur-3xl"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />

          <div className="relative z-10">
            {/* Logo */}
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center gap-3 rounded-full border border-white/20 bg-white/80 px-4 py-2.5 text-base font-bold text-slate-900 shadow-lg backdrop-blur-sm transition hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <span className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-lg" />
              CivicConnect
            </Link>

            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-10 max-w-2xl space-y-4"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Smart City Platform
              </p>
              <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-slate-900 lg:text-6xl">
                Transforming City Complaints Into Real-Time Action
              </h1>
              <p className="max-w-lg text-lg leading-8 text-slate-700 lg:text-xl">
                CivicConnect helps residents report issues and administrators resolve them with AI-powered workflows and transparent city operations.
              </p>
            </motion.div>
          </div>

          {/* Animated metrics section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 mt-12 grid gap-4 md:grid-cols-2"
          >
            {metrics.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="group rounded-2xl border border-blue-200/40 bg-white/60 p-4 backdrop-blur-sm transition hover:bg-white hover:shadow-lg hover:border-blue-300/60"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-400/10 p-2 text-blue-600 group-hover:bg-gradient-to-br group-hover:from-blue-500/20 group-hover:to-cyan-400/20">
                      <Icon size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{metric.label}</p>
                      <p className="text-sm text-slate-600">{metric.subtext}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Footer testimonial */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative z-10 mt-10 rounded-2xl border border-white/30 bg-white/50 p-6 backdrop-blur-sm"
          >
            <p className="text-sm italic text-slate-700">
              "CivicConnect reduced our complaint resolution time by 60% and improved citizen satisfaction significantly. It's a game-changer for municipal operations."
            </p>
            <p className="mt-3 text-xs font-semibold text-slate-600">— City Operations Director</p>
          </motion.div>
        </section>

        {/* RIGHT PANEL — AUTH EXPERIENCE */}
        <section className="flex items-center justify-center bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Outlet />
          </motion.div>
        </section>
      </div>
    </div>
  );
}
