import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, TrendingUp, CheckCircle2, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { MetricCard } from '../components/MetricCard';
import { EnhancedTicketCard } from '../components/EnhancedTicketCard';
import { EmptyState } from '../components/EmptyState';
import { AnimatedPage } from '../components/AnimatedPage';
import { LiveCityMap } from '../components/LiveCityMap';
import { getMyTickets, getTicketById } from '../api/tickets';
import { useAuthStore } from '../store/authStore';
import { connectSocket } from '../socket/client';
import { motion, AnimatePresence } from 'framer-motion';
import { DemoAccessPanel } from '../components/DemoAccessPanel';

export function EnhancedResidentDashboard() {
  const profile = useAuthStore(state => state.profile);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const loadTickets = async () => {
    try {
      const data = await getMyTickets({ per_page: 100 });
      const list = Array.isArray(data) ? data : data?.data || [];
      setTickets(list);
      if (!selectedTicket && list[0]) setSelectedTicket(list[0]);
    } catch (err) {
      toast.error(err.message || 'Failed to load tickets');
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    const syncTicket = async payload => {
      const id = payload?.ticketId || payload?.ticket?.id || payload?.ticket?._id;
      if (!id) {
        await loadTickets();
        return;
      }
      try {
        const ticket = await getTicketById(id);
        setTickets(prev => {
          const exists = prev.some(item => item._id === ticket._id);
          if (exists) return prev.map(item => (item._id === ticket._id ? ticket : item));
          return [ticket, ...prev];
        });
      } catch (error) {
        loadTickets();
      }
    };

    socket.on('ticket:created', syncTicket);
    socket.on('ticket:updated', syncTicket);
    socket.on('ticket:statusChanged', syncTicket);

    return () => {
      socket.off('ticket:created', syncTicket);
      socket.off('ticket:updated', syncTicket);
      socket.off('ticket:statusChanged', syncTicket);
    };
  }, []);

  const counts = useMemo(() => ({
    open: tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length,
    resolved: tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
    urgent: tickets.filter(t => ['high', 'critical', 'emergency'].includes(t.priority)).length
  }), [tickets]);

  return (
    <AnimatedPage className="space-y-8 pb-12">
      <SectionHeader
        eyebrow={`Welcome back, ${profile?.name?.split(' ')[0] || profile?.full_name?.split(' ')[0] || 'Resident'}`}
        title="Your Civic Dashboard"
        description="Monitor your reported issues and track city-wide progress in real time."
        action={
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-gray-300 hover:bg-white/10 transition-all"
            >
              {viewMode === 'list' ? <MapIcon size={18} /> : <ListIcon size={18} />}
              {viewMode === 'list' ? 'Map View' : 'List View'}
            </button>
            <Link
              to="/tickets/new"
              className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
            >
              <Plus size={18} />
              Report Issue
            </Link>
          </div>
        }
      />

      {/* METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Active Requests" value={counts.open} icon="tickets" accent="primary" />
        <MetricCard label="Resolved" value={counts.resolved} icon="completed" accent="success" />
        <MetricCard label="Urgent Alerts" value={counts.urgent} icon="alerts" accent="danger" />
      </div>

      <DemoAccessPanel compact />

      {/* MAIN CONTENT AREA */}
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {viewMode === 'map' ? (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                <LiveCityMap tickets={tickets} />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {tickets.length > 0 ? (
                  tickets.map((ticket, idx) => (
                    <motion.div
                      key={ticket._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <EnhancedTicketCard 
                        ticket={ticket} 
                        isSelected={selectedTicket?._id === ticket._id}
                        onClick={() => setSelectedTicket(ticket)} 
                      />
                    </motion.div>
                  ))
                ) : (
                  <EmptyState
                    title="No active requests"
                    description="Your voice matters. Report an issue to help improve our city today."
                    action={
                      <Link
                        to="/tickets/new"
                        className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-glow"
                      >
                        <Plus size={18} />
                        Get Started
                      </Link>
                    }
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SIDE PANEL: SELECTED TICKET PREVIEW */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div 
                key={selectedTicket._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="cc-card sticky top-24 border-primary/20 p-8"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {selectedTicket.ticket_code}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                    selectedTicket.status === 'resolved' ? 'bg-success/10 text-success' : 'bg-white/5 text-gray-400'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-white mb-4 leading-tight">{selectedTicket.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-4">{selectedTicket.description}</p>

                <div className="mb-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border/60 bg-surface/80 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Priority</p>
                    <p className="font-bold text-white text-sm">{selectedTicket.priority}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-surface/80 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">SLA</p>
                    <p className={`font-bold text-sm ${
                      selectedTicket.metadata?.slaStatus === 'red' ? 'text-red-500' : 'text-emerald-500'
                    }`}>
                      {selectedTicket.metadata?.slaStatus || 'Healthy'}
                    </p>
                  </div>
                </div>

                {selectedTicket.ai_summary && (
                  <div className="relative mb-8 overflow-hidden rounded-2xl border border-primary/10 bg-primary/5 p-5 group">
                    <div className="absolute top-0 right-0 p-2 text-primary opacity-20 group-hover:opacity-100 transition-opacity">
                      <TrendingUp size={16} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">AI Summary</p>
                    <p className="text-xs text-gray-300 leading-relaxed italic">"{selectedTicket.ai_summary}"</p>
                  </div>
                )}

                <Link
                  to={`/tickets/${selectedTicket._id}`}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 font-semibold text-white shadow-glow transition-all hover:opacity-95"
                >
                  Explore Details
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            ) : (
              <div className="cc-card p-12 text-center flex flex-col items-center justify-center border-dashed border-white/10">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600 mb-4">
                  <ListIcon size={32} />
                </div>
                <h4 className="font-bold text-white mb-2">No selection</h4>
                <p className="text-xs text-gray-500">Choose a ticket from the list or map to view details.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnimatedPage>
  );
}

function ArrowRight({ className, size }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14m-7-7 7 7-7 7"/>
    </svg>
  );
}
