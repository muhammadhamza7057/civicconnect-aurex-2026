import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Zap, Shield, Users, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';

export function EnhancedLandingPage() {
  const features = [
    {
      icon: Clock,
      title: 'Real-time Response',
      description: 'Live socket updates keep residents and staff synchronized every second'
    },
    {
      icon: Zap,
      title: 'AI-Powered Triage',
      description: 'Gemini categorizes, prioritizes, and detects duplicate complaints instantly'
    },
    {
      icon: TrendingUp,
      title: 'SLA Control',
      description: 'Green-yellow-red SLA indicators ensure no complaint is forgotten'
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Residents submit, staff respond, admins govern—all in one platform'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Executive dashboards show system health, throughput, and performance'
    },
    {
      icon: Users,
      title: 'Multi-tenant Ready',
      description: 'Department management, staff workflows, and civic engagement in one place'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Resident Reports',
      description: 'Citizens submit issues with optional attachments',
      action: 'Create ticket in 60 seconds'
    },
    {
      number: '2',
      title: 'AI Processes',
      description: 'Gemini analyzes category, priority, duplicates, urgency',
      action: 'Auto-categorization'
    },
    {
      number: '3',
      title: 'Staff Responds',
      description: 'Teams see Kanban board, AI briefing, and SLA timers',
      action: 'Status updates live'
    },
    {
      number: '4',
      title: 'Admin Oversees',
      description: 'Executives track KPIs, department performance, compliance',
      action: 'Real-time dashboards'
    }
  ];

  return (
    <div className="space-y-20 px-4 py-12 lg:px-8 lg:py-16">
      {/* HERO SECTION */}
      <section className="mx-auto max-w-5xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-center">
            <div className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Now available</p>
            </div>
          </div>

          <h1 className="text-center text-5xl font-black tracking-tight text-text sm:text-6xl lg:text-7xl">
            Government-grade Civic Operations
          </h1>

          <p className="mx-auto max-w-2xl text-center text-lg leading-8 text-muted sm:text-xl">
            A modern Smart City AI platform for resident complaints, staff workflows, SLA tracking, and executive analytics.
            Built for trust. Designed for speed.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-glow transition hover:opacity-95"
            >
              Start Free Demo
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full border border-white/10 px-6 py-3.5 font-semibold text-text transition hover:bg-white/5"
            >
              Sign In
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>

        {/* HERO IMAGE PLACEHOLDER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/10 via-white/5 to-success/10 p-8 sm:p-12"
        >
          <div className="flex h-72 items-center justify-center">
            <div className="text-center">
              <BarChart3 size={64} className="mx-auto text-primary/30" strokeWidth={0.5} />
              <p className="mt-4 text-sm text-muted">Interactive dashboard preview</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES GRID */}
      <section className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Platform features</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-text sm:text-5xl">Built for civic operations</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="cc-card group p-6 transition hover:border-primary/30"
              >
                <div className="rounded-2xl bg-primary/10 p-3 w-fit">
                  <Icon size={24} className="text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 font-bold text-text">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* WORKFLOW STEPS */}
      <section className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">End-to-end workflow</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-text sm:text-5xl">From complaint to resolution</h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="cc-card relative p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-black text-primary">
                  {step.number}
                </div>
                {idx < steps.length - 1 && (
                  <ArrowRight size={20} className="hidden text-muted lg:block" />
                )}
              </div>
              <h3 className="mt-4 font-bold text-text">{step.title}</h3>
              <p className="mt-2 text-sm text-muted">{step.description}</p>
              <div className="mt-4 rounded-full border border-primary/20 bg-primary/10 px-3 py-2">
                <p className="text-xs font-semibold text-primary">{step.action}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="cc-card space-y-8 p-8 sm:p-12">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-text sm:text-4xl">Why governments choose CivicConnect</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {[
              'Citizen satisfaction increases by handling complaints faster',
              'Staff efficiency improves with AI morning briefing and kanban workflow',
              'Executives gain real-time visibility into civic operations',
              'Zero complaints fall through the cracks with SLA alerts',
              'AI detects duplicate complaints automatically',
              'Full audit trail and compliance records for governance'
            ].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <CheckCircle2 size={20} className="mt-1 flex-shrink-0 text-success" strokeWidth={1.5} />
                <p className="text-sm leading-6 text-muted">{benefit}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA SECTION */}
      <section className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-12 text-center"
        >
          <h2 className="text-3xl font-black tracking-tight text-text sm:text-4xl">Ready to transform civic operations?</h2>
          <p className="mt-4 text-lg text-muted">Start your free demo today. No credit card required.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-glow transition hover:opacity-95"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
