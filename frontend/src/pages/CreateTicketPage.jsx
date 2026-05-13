import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AnimatedPage } from '../components/AnimatedPage';
import { SectionHeader } from '../components/SectionHeader';
import { createTicket } from '../api/tickets';
import { listDepartments } from '../api/departments';

export function CreateTicketPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      lat: '40.7128',
      lng: '-74.0060',
      location_text: 'Near incident / cross streets'
    }
  });

  useEffect(() => {
    listDepartments()
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]));
  }, []);

  const onSubmit = async values => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('priority', values.priority);
    if (values.department) formData.append('department', values.department);
    formData.append(
      'location',
      JSON.stringify({
        lat: parseFloat(values.lat),
        lng: parseFloat(values.lng),
        text: values.location_text || ''
      })
    );
    Array.from(values.attachments || []).forEach(file => formData.append('attachments', file));

    const ticket = await toast.promise(createTicket(formData), {
      loading: 'Submitting request...',
      success: 'Ticket created',
      error: err => err.message || 'Failed to create ticket'
    });

    navigate(`/tickets/${ticket._id || ticket.id || ticket.data?._id}`);
  };

  return (
    <AnimatedPage className="space-y-6">
      <SectionHeader
        eyebrow="Resident intake"
        title="Create civic ticket"
        description="Pin the location for the live operations map. Attachments help AI triage and field teams."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="cc-card space-y-5 p-6 lg:p-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-text">Title</label>
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none" {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Minimum 5 characters' } })} />
            {errors.title ? <p className="mt-1 text-sm text-danger">{errors.title.message}</p> : null}
          </div>
          <div>
            <label className="text-sm font-semibold text-text">Priority</label>
            <select className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none" {...register('priority')}>
              {['low', 'medium', 'high', 'critical', 'emergency'].map(priority => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-text">Department (optional)</label>
          <select className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none" {...register('department')}>
            <option value="">Auto-route by AI</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-semibold text-text">Latitude</label>
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none" {...register('lat')} />
          </div>
          <div>
            <label className="text-sm font-semibold text-text">Longitude</label>
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none" {...register('lng')} />
          </div>
          <div className="sm:col-span-1">
            <label className="text-sm font-semibold text-text">Location label</label>
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none" {...register('location_text')} />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-text">Description</label>
          <textarea rows={7} className="mt-2 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-text outline-none" {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Please add more detail' } })} />
          {errors.description ? <p className="mt-1 text-sm text-danger">{errors.description.message}</p> : null}
        </div>

        <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-5">
          <label className="text-sm font-semibold text-text">Attachments</label>
          <input type="file" multiple className="mt-3 block w-full text-sm text-muted file:mr-4 file:rounded-2xl file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-white" {...register('attachments')} />
          <p className="mt-3 text-sm text-muted">Optional. Add photos for faster AI triage and staff response.</p>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="rounded-2xl border border-white/10 px-5 py-3 font-semibold text-text">
            Cancel
          </button>
          <button disabled={isSubmitting} className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white shadow-glow disabled:opacity-50">
            {isSubmitting ? 'Submitting...' : 'Submit ticket'}
          </button>
        </div>
      </form>
    </AnimatedPage>
  );
}
