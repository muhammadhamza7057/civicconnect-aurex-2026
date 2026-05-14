import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Megaphone, AlertTriangle } from 'lucide-react';
import { client } from '../api/client';
import { AnimatedPage } from '../components/AnimatedPage';
import { SectionHeader } from '../components/SectionHeader';
import { connectSocket } from '../socket/client';

export function AnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [dismissedEmergency, setDismissedEmergency] = useState(false);

  useEffect(() => {
    client
      .get('/announcements')
      .then(res => setItems(res.data?.data || []))
      .catch(err => toast.error(err.message || 'Failed to load'));
  }, []);

  useEffect(() => {
    const socket = connectSocket();

    const handleEmergency = (announcement) => {
      setItems(current => {
        const next = current.filter(item => item._id !== announcement.id);
        return [{
          _id: announcement.id,
          title: announcement.title,
          body: announcement.body,
          is_emergency: true,
          createdAt: announcement.createdAt
        }, ...next];
      });
      setDismissedEmergency(false);
      toast.error(`Emergency alert: ${announcement.title || 'New city emergency'}`, { duration: 8000 });
    };

    socket.on('announcement:emergency', handleEmergency);

    return () => {
      socket.off('announcement:emergency', handleEmergency);
    };
  }, []);

  const emergency = !dismissedEmergency ? items.find(a => a.is_emergency) : null;

  return (
    <AnimatedPage className="space-y-8">
      <SectionHeader
        eyebrow="Civic communications"
        title="Announcements"
        description="Official updates from departments and city operations."
      />

      {emergency ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-6"
        >
          <div className="max-w-lg rounded-3xl border border-red-500/40 bg-red-950/90 p-8 text-center shadow-2xl">
            <AlertTriangle className="mx-auto mb-4 text-red-400" size={40} />
            <p className="text-xs font-black uppercase tracking-widest text-red-300">Emergency</p>
            <h2 className="mt-2 text-2xl font-black text-white">{emergency.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-red-100/90">{emergency.body}</p>
            <button
              type="button"
              onClick={() => setDismissedEmergency(true)}
              className="mt-8 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black"
            >
              Acknowledge
            </button>
          </div>
        </motion.div>
      ) : null}

      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="cc-card p-8 text-center text-muted">No announcements yet.</div>
        ) : (
          items.map(a => (
            <div key={a._id} className="cc-card p-6 flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Megaphone size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">{a.is_emergency ? 'Emergency' : 'Update'}</p>
                <h3 className="mt-1 text-xl font-black text-white">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{a.body}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </AnimatedPage>
  );
}
