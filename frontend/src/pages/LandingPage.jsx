import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';

export function LandingPage() {
  const highlights = [
    { title: 'Resident requests', value: '24/7', accent: 'primary', hint: 'Complaint intake, SLA tracking, and citizen notifications' },
    { title: 'Staff response', value: 'Live', accent: 'success', hint: 'Kanban workflow with AI morning briefing' },
    { title: 'Administration', value: 'Ready', accent: 'warning', hint: 'Analytics, departments, exports, and governance' }
  ];

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="cc-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">CivicConnect / GovTech SaaS</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-text sm:text-3xl">Smart City AI Platform</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/login" className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/5">Sign in</Link>
            <Link to="/register" className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-95">Get started</Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="cc-card relative overflow-hidden p-8 lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.14),transparent_22%)]" />
            <div className="relative z-10 max-w-2xl space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted">Minimal cognitive load. Maximum civic trust.</p>
              <h2 className="text-4xl font-black tracking-tight text-text sm:text-6xl">Operate resident services like Stripe runs money flows.</h2>
              <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">A modern, government-grade SaaS interface for ticket intake, AI triage, real-time operations, and executive analytics.</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/register" className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white shadow-glow transition hover:scale-[1.01]">Start demo</Link>
                <Link to="/login" className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-text transition hover:bg-white/5">Open dashboard</Link>
              </div>
            </div>
          </motion.div>
          <div className="grid gap-4">
            {highlights.map(item => <StatCard key={item.title} {...item} />)}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Real-time updates', 'Socket-powered dashboards, notifications, and AI updates'],
            ['AI assist', 'Gemini categorization, duplicate detection, and urgency scoring'],
            ['Role controls', 'Resident, staff, department admin, and super admin flows'],
            ['Accessible by design', 'High contrast, keyboard-friendly, mobile-first UI']
          ].map(([title, description]) => (
            <div key={title} className="cc-card p-5">
              <h3 className="font-semibold text-text">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </div>
          ))}
        </section>

        <section className="cc-card p-6 lg:p-8">
          <SectionHeader
            eyebrow="Demo-ready flow"
            title="Resident to staff to admin in one cohesive system"
            description="Submit a ticket, watch AI classify it, see it move through the staff board, and review results in the admin dashboard."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ['1. Resident submits', 'Create a civic issue with title, description, and optional attachments.'],
              ['2. AI processes', 'Tickets gain category, priority, summary, and duplicate detection.'],
              ['3. Staff responds', 'Statuses and comments update residents in real time.']
            ].map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-primary">{title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
