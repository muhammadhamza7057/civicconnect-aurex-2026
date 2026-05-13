import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Zap, 
  Clock,
  Bell,
  Home,
  ClipboardList,
  UsersRound,
  Crown
} from 'lucide-react';
import CountUp from 'react-countup';
import { Footer } from '../components/Footer';

const WHO_ROLES = [
  {
    id: 'resident',
    icon: Home,
    title: 'Resident',
    description:
      'Report issues, track tickets, and get updates about your neighborhood. This is the default for most people who live or work in the city.'
  },
  {
    id: 'staff',
    icon: ClipboardList,
    title: 'Staff',
    description:
      'Department workers who pick up tickets, update status, and keep SLAs on track. You will choose your department and use a staff ID when you sign up.'
  },
  {
    id: 'admin',
    icon: UsersRound,
    title: 'Admin',
    description:
      'Leads who oversee teams, departments, and day-to-day operations. Same extra fields as staff so we can place you in the right org chart.'
  },
  {
    id: 'super_admin',
    icon: Crown,
    title: 'Super admin',
    description:
      'Platform-wide access for IT or city leadership who configure the system, audit activity, and manage sensitive settings.'
  }
];

export function EnhancedLandingPage() {
  useEffect(() => {
    if (window.location.hash !== '#who-its-for') return;
    const el = document.getElementById('who-its-for');
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const stats = [
    { value: 10000, label: 'Issues Resolved', suffix: '+' },
    { value: 500, label: 'Active Staff', suffix: '+' },
    { value: 24, label: 'Avg Resolution Time', suffix: 'h' },
    { value: 99, label: 'Citizen Satisfaction', suffix: '%' }
  ];

  const features = [
    {
      icon: Zap,
      title: 'AI Detection',
      description: 'Gemini instantly categorizes and prioritizes incoming complaints.'
    },
    {
      icon: Clock,
      title: 'SLA Tracking',
      description: 'Real-time countdowns ensure no ticket exceeds resolution timeframes.'
    },
    {
      icon: Bell,
      title: 'Live Notifications',
      description: 'Push alerts for residents and staff on every status change.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-primary selection:text-white overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] scale-110"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1920&q=80")',
          }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/40 to-black" />
        
        <div className="relative z-20 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-bold tracking-widest uppercase">The Future of Urban Governance</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]">
              Every City Problem <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-success">
                Deserves Instant Action
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 leading-relaxed">
              CivicConnect is a production-grade Smart City Operating System that connects residents, staff, and leadership in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="group relative flex items-center gap-2 px-8 py-4 bg-primary rounded-2xl font-bold text-white shadow-lg shadow-primary/25 overflow-hidden transition-all"
                >
                  Report Issue <ArrowRight size={20} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white backdrop-blur-sm hover:bg-white/10 transition-all"
                >
                  Track Complaint
                </Link>
              </motion.div>
            </div>
            <div className="mx-auto mt-8 max-w-5xl rounded-[28px] border border-border/60 bg-surface/75 p-4 shadow-soft backdrop-blur-xl">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Quick demo access</p>
                  <p className="mt-1 text-sm leading-6 text-text">Open the judge-ready logins and jump straight into the resident, staff, or admin dashboards.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {['resident', 'staff', 'admin', 'super_admin'].map(role => (
                    <Link
                      key={role}
                      to={`/login?demo=${role}`}
                      className="rounded-full border border-border/60 bg-bg/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-text transition hover:border-primary/40 hover:bg-surface-2"
                    >
                      {role.replace('_', ' ')}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              <a href="#who-its-for" className="text-gray-300 underline-offset-4 hover:text-white hover:underline">
                Who can use CivicConnect? See the four roles before you register.
              </a>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 max-w-4xl mx-auto border-t border-white/10 pt-12"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-white">
                  <CountUp end={stat.value} duration={3} />
                  {stat.suffix}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-2">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        id="who-its-for"
        className="relative border-y border-border/60 bg-gradient-to-b from-surface/90 to-bg/90 py-24"
        aria-labelledby="who-its-for-heading"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Register with confidence</p>
            <h2 id="who-its-for-heading" className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">
              Four roles. Pick the one that fits you.
            </h2>
            <p className="mt-4 text-lg text-muted">
              When you create an account, you choose a role so we can show the right dashboard and permissions. Here is a plain-language overview.
            </p>
          </motion.div>

          <div className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHO_ROLES.map((r, idx) => {
              const Icon = r.icon;
              return (
                <motion.article
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.05 }}
                  className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left backdrop-blur-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{r.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-400">{r.description}</p>
                </motion.article>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-12 flex justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-surface px-6 py-3 text-sm font-bold text-text transition hover:border-primary/40 hover:bg-surface-2"
            >
              Go to register <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-lg text-primary font-bold text-sm">
                The Platform
              </div>
              <h2 className="text-4xl md:text-5xl font-black">
                Transforming Delay into <br />
                <span className="text-primary">Instant Resolution.</span>
              </h2>
              <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                <p>
                  Old systems rely on manual filing, paper trails, and disconnected departments. CivicConnect replaces friction with flow.
                </p>
                <div className="grid gap-6 mt-8">
                  {features.map((f, i) => (
                    <div key={i} className="flex gap-4 p-6 bg-white/5 border border-white/5 rounded-2xl hover:border-primary/30 transition-all group">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <f.icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-1">{f.title}</h3>
                        <p className="text-sm text-gray-500">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px]" />
              <div className="relative z-10 bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[40px] p-8 backdrop-blur-2xl h-full flex flex-col justify-center items-center text-center">
                <div className="w-64 h-64 mb-8">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 90, 180, 270, 360],
                      borderRadius: ["20%", "50%", "20%"]
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-full h-full bg-gradient-to-tr from-primary via-blue-500 to-success opacity-20 blur-xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={80} className="text-primary animate-bounce" />
                  </div>
                </div>
                <h3 className="text-2xl font-black mb-4">AI-Driven Engine</h3>
                <p className="text-gray-400">
                  Our core engine analyzes thousands of data points to ensure every citizen is heard and every problem is solved.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary/20 to-success/20 border border-white/10 rounded-[40px] p-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/20 blur-[100px]" />
            <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to Build a Smarter City?</h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join 50+ municipalities already using CivicConnect to power their urban operations.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black rounded-2xl font-black hover:bg-gray-100 transition-all"
              >
                Get Started Now <ArrowRight size={24} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
