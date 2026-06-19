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
  name: '',
  phone: '',
  experience: '',
  rating: '',
  status: 'Active',
  licence_status: 'Pending',
  assigned_vehicle: '',
  total_rides: '',
  address: '',
  notes: '',
};

export default function MobileAddDriverForm({ isOpen, onClose, onSubmit }) {
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
      setError(submissionError.message || 'Unable to add the driver.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Add driver"
      subtitle="Create a driver profile for assignment and follow-up."
      fullScreen
      footer={(
        <LoadingButton
          type="submit"
          form="mobile-add-driver-form"
          isLoading={isSubmitting}
          idleLabel="Add Driver"
          loadingLabel="Adding Driver..."
          className="bg-[#EFBF04] text-black hover:brightness-100"
          spinnerClassName="text-black"
        />
      )}
    >
      <form id="mobile-add-driver-form" aria-busy={isSubmitting} onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <section className={sectionClassName}>
          <div className="space-y-4">
            <Field label="Driver name">
              <input name="name" value={formData.name} onChange={handleChange} className={inputClassName} required />
            </Field>
            <Field label="Phone number">
              <input name="phone" value={formData.phone} onChange={handleChange} className={inputClassName} required />
            </Field>
            <Field label="Experience">
              <input name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 5 Years" className={inputClassName} required />
            </Field>
          </div>
        </section>

        <section className={sectionClassName}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status">
                <select name="status" value={formData.status} onChange={handleChange} className={inputClassName}>
                  <option value="Active" className="bg-[#0F0F0F]">Active</option>
                  <option value="Unavailable" className="bg-[#0F0F0F]">Unavailable</option>
                </select>
              </Field>
              <Field label="Licence status">
                <select name="licence_status" value={formData.licence_status} onChange={handleChange} className={inputClassName}>
                  <option value="Verified" className="bg-[#0F0F0F]">Verified</option>
                  <option value="Pending" className="bg-[#0F0F0F]">Pending</option>
                  <option value="Expired" className="bg-[#0F0F0F]">Expired</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Assigned vehicle">
                <input name="assigned_vehicle" value={formData.assigned_vehicle} onChange={handleChange} className={inputClassName} />
              </Field>
              <Field label="Total rides">
                <input name="total_rides" type="number" min="0" value={formData.total_rides} onChange={handleChange} className={inputClassName} />
              </Field>
            </div>
            <Field label="Rating">
              <input name="rating" type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={handleChange} className={inputClassName} />
            </Field>
            <Field label="Address">
              <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className={inputClassName} />
            </Field>
            <Field label="Notes">
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" className={inputClassName} />
            </Field>
          </div>
        </section>
      </form>
    </BottomSheet>
  );
}
