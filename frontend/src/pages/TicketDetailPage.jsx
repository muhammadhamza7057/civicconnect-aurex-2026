import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { AnimatedPage } from '../components/AnimatedPage';
import { SectionHeader } from '../components/SectionHeader';
import { StatusPill } from '../components/StatusPill';
import { SlaBadge } from '../components/SlaBadge';
import { getTicketById, getTicketTimeline, updateTicketStatus, addTicketComment } from '../api/tickets';
import { connectSocket } from '../socket/client';
import { useAuthStore } from '../store/authStore';
import { formatDateTime } from '../utils/format';

export function TicketDetailPage() {
  const { id } = useParams();
  const profile = useAuthStore(state => state.profile);
  const [ticket, setTicket] = useState(null);
  const [timeline, setTimeline] = useState({ comments: [], audits: [] });
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const loadTicket = async () => {
    const data = await getTicketById(id);
    setTicket(data);
    const timelineData = await getTicketTimeline(id);
    setTimeline(timelineData || { comments: [], audits: [] });
  };

  useEffect(() => {
    loadTicket().catch(err => toast.error(err.message || 'Failed to load ticket'));
  }, [id]);

  useEffect(() => {
    const socket = connectSocket();
    const sync = payload => {
      const nextId = payload?.ticketId || payload?.ticket?.id || payload?.ticket?._id;
      if (nextId === id) loadTicket().catch(() => null);
    };
    socket.on('ticket:updated', sync);
    socket.on('ticket:aiUpdated', sync);
    socket.on('ticket:statusChanged', sync);
    return () => {
      socket.off('ticket:updated', sync);
      socket.off('ticket:aiUpdated', sync);
      socket.off('ticket:statusChanged', sync);
    };
  }, [id]);

  const canManage = useMemo(() => ['staff', 'admin', 'super_admin'].includes(profile?.role), [profile]);

  const onComment = async values => {
    await toast.promise(addTicketComment(id, values.body), {
      loading: 'Sending comment...',
      success: 'Comment added',
      error: err => err.message || 'Unable to add comment'
    });
    reset();
    await loadTicket();
  };

  const changeStatus = async status => {
    await toast.promise(updateTicketStatus(id, status), {
      loading: 'Updating ticket...',
      success: 'Ticket updated',
      error: err => err.message || 'Unable to change status'
    });
    await loadTicket();
  };

  if (!ticket) {
    return <AnimatedPage><div className="cc-card p-8 text-center text-muted">Loading ticket...</div></AnimatedPage>;
  }

  return (
    <AnimatedPage className="space-y-6">
      <SectionHeader
        eyebrow={ticket.ticket_code}
        title={ticket.title}
        description={ticket.description}
        action={<div className="flex flex-wrap gap-2"><StatusPill status={ticket.status} /><SlaBadge status={ticket.metadata?.slaStatus || 'amber'} label={`SLA ${ticket.metadata?.slaStatus || 'amber'}`} /></div>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-4">
          <div className="cc-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">AI summary</p>
            <p className="mt-3 leading-7 text-text">{ticket.ai_summary || 'AI is still analyzing this ticket.'}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 p-4"><p className="text-xs text-muted">Priority</p><p className="mt-1 font-semibold text-text">{ticket.priority}</p></div>
              <div className="rounded-3xl border border-white/10 p-4"><p className="text-xs text-muted">Emergency</p><p className="mt-1 font-semibold text-text">{ticket.is_emergency ? 'Yes' : 'No'}</p></div>
              <div className="rounded-3xl border border-white/10 p-4"><p className="text-xs text-muted">Updated</p><p className="mt-1 font-semibold text-text">{formatDateTime(ticket.updatedAt)}</p></div>
            </div>
          </div>

          <div className="cc-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Timeline</p>
            <div className="mt-4 space-y-4">
              {(timeline.comments || []).map(c => (
                <div key={c._id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-success" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                      Comment · {c.visibility || 'public'}
                    </p>
                    <p className="mt-1 font-semibold text-text">{c.message || c.body}</p>
                    <p className="text-sm text-muted">{formatDateTime(c.createdAt)}</p>
                  </div>
                </div>
              ))}
              {(timeline.audits || []).map(item => (
                <div key={item._id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div>
                    <p className="font-semibold text-text">{item.action.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-muted">{formatDateTime(item.createdAt)}</p>
                  </div>
                </div>
              ))}
              {!(timeline.comments?.length || timeline.audits?.length) ? (
                <p className="text-sm text-muted">No timeline data yet.</p>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          {canManage ? (
            <div className="cc-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Quick actions</p>
              <div className="mt-4 grid gap-3">
                {['under_review', 'in_progress', 'resolved', 'closed'].map(status => (
                  <button key={status} onClick={() => changeStatus(status)} className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-text transition hover:bg-white/5">
                    Move to {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="cc-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Add comment</p>
            <form onSubmit={handleSubmit(onComment)} className="mt-4 space-y-3">
              <textarea rows="5" placeholder="Write a public or internal update" className="relative z-10 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none" {...register('body', { required: true })} />
              <button disabled={isSubmitting} className="w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-white shadow-glow disabled:opacity-50">{isSubmitting ? 'Sending...' : 'Add comment'}</button>
            </form>
          </div>
        </aside>
      </div>
    </AnimatedPage>
  );
}
