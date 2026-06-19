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

export default function MobileAddEnquiryForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone_number: '',
    whatsapp_number: '',
    enquiry_type: '',
    travel_date: '',
    travel_time: '',
    preferred_contact_method: 'whatsapp',
    source_page: 'admin',
    quote_amount: '',
    requirement_notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError('');
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData({
      customer_name: '',
      phone_number: '',
      whatsapp_number: '',
      enquiry_type: '',
      travel_date: '',
      travel_time: '',
      preferred_contact_method: 'whatsapp',
      source_page: 'admin',
      quote_amount: '',
      requirement_notes: '',
    });
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
      setError(submissionError.message || 'Unable to add the enquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="Add enquiry"
      subtitle="Create a manual enquiry without using the public form."
      fullScreen
      footer={(
        <LoadingButton
          type="submit"
          form="mobile-add-enquiry-form"
          isLoading={isSubmitting}
          idleLabel="Add Enquiry"
          loadingLabel="Adding Enquiry..."
          className="bg-[#EFBF04] text-black hover:brightness-100"
          spinnerClassName="text-black"
        />
      )}
    >
      <form id="mobile-add-enquiry-form" aria-busy={isSubmitting} onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <section className={sectionClassName}>
          <div className="space-y-4">
            <Field label="Full name">
              <input name="customer_name" value={formData.customer_name} onChange={handleChange} className={inputClassName} required />
            </Field>
            <Field label="Phone number">
              <input name="phone_number" value={formData.phone_number} onChange={handleChange} className={inputClassName} required />
            </Field>
            <Field label="WhatsApp number">
              <input name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} className={inputClassName} />
            </Field>
          </div>
        </section>

        <section className={sectionClassName}>
          <div className="space-y-4">
            <Field label="Enquiry type">
              <select name="enquiry_type" value={formData.enquiry_type} onChange={handleChange} className={inputClassName} required>
                <option value="" disabled className="bg-[#0F0F0F]">Select type</option>
                <option value="cab" className="bg-[#0F0F0F]">Cab enquiry</option>
                <option value="room" className="bg-[#0F0F0F]">Room enquiry</option>
                <option value="tour" className="bg-[#0F0F0F]">Tour enquiry</option>
                <option value="custom" className="bg-[#0F0F0F]">Custom trip enquiry</option>
                <option value="general" className="bg-[#0F0F0F]">General travel enquiry</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Travel date">
                <input name="travel_date" type="date" value={formData.travel_date} onChange={handleChange} className={inputClassName} />
              </Field>
              <Field label="Travel time">
                <input name="travel_time" type="time" value={formData.travel_time} onChange={handleChange} className={inputClassName} />
              </Field>
            </div>
            <Field label="Preferred contact">
              <select name="preferred_contact_method" value={formData.preferred_contact_method} onChange={handleChange} className={inputClassName}>
                <option value="whatsapp" className="bg-[#0F0F0F]">WhatsApp</option>
                <option value="phone" className="bg-[#0F0F0F]">Phone</option>
                <option value="email" className="bg-[#0F0F0F]">Email</option>
              </select>
            </Field>
            <Field label="Quote amount">
              <input name="quote_amount" value={formData.quote_amount} onChange={handleChange} placeholder="Optional" className={inputClassName} />
            </Field>
            <Field label="Requirement notes">
              <textarea name="requirement_notes" value={formData.requirement_notes} onChange={handleChange} rows="5" className={inputClassName} required />
            </Field>
          </div>
        </section>
      </form>
    </BottomSheet>
  );
}
