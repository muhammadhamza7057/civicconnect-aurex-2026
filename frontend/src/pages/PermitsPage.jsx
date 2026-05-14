import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { FileText, ChevronRight } from 'lucide-react';
import { client } from '../api/client';
import { AnimatedPage } from '../components/AnimatedPage';
import { SectionHeader } from '../components/SectionHeader';

export function PermitsPage() {
  const [step, setStep] = useState(1);
  const [permitId, setPermitId] = useState(null);
  const { register, handleSubmit } = useForm({ defaultValues: { permit_type: 'construction', address: '', scope: '' } });

  const start = async values => {
    const res = await toast.promise(client.post('/permits', { permit_type: values.permit_type, data: { address: values.address } }), {
      loading: 'Starting application...',
      success: 'Draft saved',
      error: e => e.message || 'Failed'
    });
    const id = res.data?.data?._id;
    setPermitId(id);
    setStep(2);
  };

  const saveStep2 = async values => {
    await toast.promise(
      client.patch(`/permits/${permitId}`, { data: { scope: values.scope, wizard_step: 2 }, wizard_step: 2 }),
      { loading: 'Saving...', success: 'Progress saved', error: e => e.message || 'Failed' }
    );
    setStep(3);
  };

  const submit = async () => {
    await toast.promise(client.post(`/permits/${permitId}/submit`), {
      loading: 'Submitting...',
      success: 'Submitted for review',
      error: e => e.message || 'Failed'
    });
    setStep(4);
  };

  return (
    <AnimatedPage className="space-y-8 max-w-2xl">
      <SectionHeader
        eyebrow="Permits & licensing"
        title="Multi-step permit wizard"
        description="Complete each step. Fees are simulated for the demo ($25 processing)."
      />

      <div className="cc-card p-8 space-y-6">
        <div className="flex gap-2 text-xs font-black uppercase tracking-widest text-muted">
          {[1, 2, 3].map(n => (
            <span key={n} className={`rounded-full px-3 py-1 ${step >= n ? 'bg-primary text-white' : 'bg-white/5'}`}>
              Step {n}
            </span>
          ))}
        </div>

        {step === 1 ? (
          <form className="space-y-4" onSubmit={handleSubmit(start)}>
            <div>
              <label className="text-sm font-semibold text-text">Permit type</label>
              <select className="relative z-10 mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3" {...register('permit_type')}>
                <option value="construction">Construction</option>
                <option value="event">Special event</option>
                <option value="vendor">Street vendor</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-text">Site address</label>
              <input className="relative z-10 mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3" {...register('address', { required: true })} />
            </div>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-bold text-white">
              Continue <ChevronRight size={18} />
            </button>
          </form>
        ) : null}

        {step === 2 ? (
          <form className="space-y-4" onSubmit={handleSubmit(saveStep2)}>
            <div>
              <label className="text-sm font-semibold text-text">Work scope</label>
              <textarea rows={5} className="relative z-10 mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3" {...register('scope', { required: true })} />
            </div>
            <p className="text-xs text-muted">Upload supporting documents from your device (simulated in this build).</p>
            <button type="submit" className="w-full rounded-2xl bg-primary py-3 font-bold text-white">
              Continue
            </button>
          </form>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted">Simulated fee: <span className="font-black text-white">$25.00</span> — charged on approval in production.</p>
            <button type="button" onClick={submit} className="w-full rounded-2xl bg-white py-3 font-black text-black">
              Submit application
            </button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-4 text-success">
            <FileText size={24} />
            <p className="text-sm font-semibold">Application received. Track status from your dashboard.</p>
          </div>
        ) : null}
      </div>
    </AnimatedPage>
  );
}
