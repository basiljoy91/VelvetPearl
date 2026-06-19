import React, { useState } from 'react';
import BottomSheet from '../../ui/BottomSheet';
import { LoadingButton } from '../../ui/LoadingState';

const inputClassName = 'mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-[#EFBF04]/50';
const labelClassName = 'text-[11px] font-semibold tracking-[0.12em] text-gray-400';
const sectionClassName = 'rounded-[20px] border border-white/10 bg-white/[0.04] p-4';

function Field({ label, children }) {
  return (
    <div>
      <label className={labelClassName}>{label}</label>
      {children}
    </div>
  );
}

const emptyState = {
  model: '',
  plate: '',
  type: '',
  status: 'Available',
  age: '',
  fuel_status: '100',
  lastService: '',
  next_service: '',
  condition: 'Good',
  insurance_provider: '',
  insurance_policy: '',
  insurance_start: '',
  insurance_expiry: '',
  notes: '',
};

export default function MobileAddFleetForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState(emptyState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError('');
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData(emptyState);
    setError('');
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(formData);
      handleClose();
    } catch (submissionError) {
      setError(submissionError.message || 'Unable to add the fleet record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Add fleet vehicle"
      subtitle="Create a vehicle record for assignment and availability tracking."
      fullScreen
      footer={(
        <LoadingButton
          type="submit"
          form="mobile-add-fleet-form"
          isLoading={isSubmitting}
          idleLabel="Add Fleet Vehicle"
          loadingLabel="Adding Fleet Vehicle..."
          className="bg-[#EFBF04] text-black hover:brightness-100"
          spinnerClassName="text-black"
        />
      )}
    >
      <form id="mobile-add-fleet-form" aria-busy={isSubmitting} onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <section className={sectionClassName}>
          <div className="space-y-4">
            <Field label="Vehicle model">
              <input name="model" value={formData.model} onChange={handleChange} className={inputClassName} required />
            </Field>
            <Field label="Plate number">
              <input name="plate" value={formData.plate} onChange={handleChange} className={inputClassName} required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vehicle type">
                <select name="type" value={formData.type} onChange={handleChange} className={inputClassName}>
                  <option value="" disabled className="bg-[#0F0F0F]">Select type</option>
                  <option value="VIP MPV" className="bg-[#0F0F0F]">VIP MPV</option>
                  <option value="Luxury Van" className="bg-[#0F0F0F]">Luxury Van</option>
                  <option value="Executive Sedan" className="bg-[#0F0F0F]">Executive Sedan</option>
                  <option value="Premium SUV" className="bg-[#0F0F0F]">Premium SUV</option>
                </select>
              </Field>
              <Field label="Status">
                <select name="status" value={formData.status} onChange={handleChange} className={inputClassName}>
                  <option value="Available" className="bg-[#0F0F0F]">Available</option>
                  <option value="On Trip" className="bg-[#0F0F0F]">On Trip</option>
                  <option value="Maintenance" className="bg-[#0F0F0F]">Maintenance</option>
                </select>
              </Field>
            </div>
          </div>
        </section>

        <section className={sectionClassName}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age (years)">
                <input name="age" type="number" min="0" value={formData.age} onChange={handleChange} className={inputClassName} />
              </Field>
              <Field label="Fuel status (%)">
                <input name="fuel_status" type="number" min="0" max="100" value={formData.fuel_status} onChange={handleChange} className={inputClassName} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Last service">
                <input name="lastService" type="date" value={formData.lastService} onChange={handleChange} className={inputClassName} />
              </Field>
              <Field label="Next service">
                <input name="next_service" type="date" value={formData.next_service} onChange={handleChange} className={inputClassName} />
              </Field>
            </div>
            <Field label="Condition">
              <select name="condition" value={formData.condition} onChange={handleChange} className={inputClassName}>
                <option value="Excellent" className="bg-[#0F0F0F]">Excellent</option>
                <option value="Good" className="bg-[#0F0F0F]">Good</option>
                <option value="Needs Attention" className="bg-[#0F0F0F]">Needs Attention</option>
              </select>
            </Field>
          </div>
        </section>

        <section className={sectionClassName}>
          <div className="space-y-4">
            <Field label="Insurance provider">
              <input name="insurance_provider" value={formData.insurance_provider} onChange={handleChange} className={inputClassName} />
            </Field>
            <Field label="Insurance policy">
              <input name="insurance_policy" value={formData.insurance_policy} onChange={handleChange} className={inputClassName} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Insurance start">
                <input name="insurance_start" type="date" value={formData.insurance_start} onChange={handleChange} className={inputClassName} />
              </Field>
              <Field label="Insurance expiry">
                <input name="insurance_expiry" type="date" value={formData.insurance_expiry} onChange={handleChange} className={inputClassName} />
              </Field>
            </div>
            <Field label="Notes">
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" className={inputClassName} />
            </Field>
          </div>
        </section>
      </form>
    </BottomSheet>
  );
}
