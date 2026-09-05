import React from 'react';
import { Link } from 'react-router-dom';
import { InlineSpinner, LoadingButton } from '../ui/LoadingState';
import { buildWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../../utils/whatsapp';

export const inputClassName = (errors, name) => `w-full min-w-0 max-w-full rounded-lg border px-3 py-2.5 text-base outline-none transition-all md:text-sm ${
  errors[name]
    ? 'border-rose-400/70 bg-rose-500/10 text-white'
    : 'border-white/10 bg-black/35 text-white focus:border-secondary'
}`;

export const labelClassName = 'mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant';

export function FieldError({ error }) {
  if (!error) return null;
  return <p aria-live="polite" className="mt-2 text-xs text-rose-300">{error}</p>;
}

export { InlineSpinner, LoadingButton };

export function FormErrorSummary({ errors }) {
  const errorCount = Object.keys(errors || {}).length;

  if (!errorCount) return null;

  return (
    <div
      aria-live="polite"
      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
      data-error-summary="true"
      role="alert"
      tabIndex={-1}
    >
      Please review the highlighted {errorCount === 1 ? 'field' : 'fields'} below. We&apos;ll take you to the first required fix automatically.
    </div>
  );
}

export function SectionHeading({ step, title, description }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">{step}</p>
      <h2 className="font-headline text-xl font-bold text-white">{title}</h2>
      {description && <p className="max-w-2xl text-sm leading-6 text-on-surface-variant">{description}</p>}
    </div>
  );
}

export function FormShell({ eyebrow, title, description, children, aside }) {
  return (
    <main className="min-h-screen bg-background pb-28 pt-24 md:pb-20">
      <section className="px-4 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="min-w-0 space-y-5 lg:sticky lg:top-28 lg:h-fit">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">{eyebrow}</p>
              <h1 className="font-headline text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">{title}</h1>
              <p className="max-w-xl text-sm leading-7 text-on-surface-variant md:text-base">{description}</p>
            </div>
            {aside}
          </div>
          <div className="glass-panel min-w-0 overflow-x-hidden rounded-2xl border border-white/10 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.35)] sm:p-5 md:p-6">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

export function CustomerDetailsFields({ formData, errors, onChange }) {
  const useDifferentWhatsApp = Boolean(formData.use_different_whatsapp);
  const handleDifferentWhatsAppChange = (event) => {
    onChange(event);

    if (!event.target.checked) {
      onChange({
        target: {
          name: 'whatsapp_number',
          type: 'text',
          value: formData.phone_number,
          checked: false,
        },
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className={labelClassName}>Full Name <span className="text-secondary">*</span></label>
        <input className={inputClassName(errors, 'customer_name')} name="customer_name" onChange={onChange} type="text" value={formData.customer_name} />
        <FieldError error={errors.customer_name} />
      </div>
      <div>
        <label className={labelClassName}>Phone Number <span className="text-secondary">*</span></label>
        <input className={inputClassName(errors, 'phone_number')} name="phone_number" onChange={onChange} type="tel" value={formData.phone_number} />
        <FieldError error={errors.phone_number} />
      </div>
      <div className="md:col-span-2">
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-on-surface-variant">
          <input
            checked={useDifferentWhatsApp}
            name="use_different_whatsapp"
            onChange={handleDifferentWhatsAppChange}
            type="checkbox"
          />
          <span>Use a different WhatsApp number</span>
        </label>
      </div>
      {useDifferentWhatsApp && (
        <div>
          <label className={labelClassName}>WhatsApp Number <span className="text-secondary">*</span></label>
          <input className={inputClassName(errors, 'whatsapp_number')} name="whatsapp_number" onChange={onChange} type="tel" value={formData.whatsapp_number} />
          <FieldError error={errors.whatsapp_number} />
        </div>
      )}
      <details className="md:col-span-2 rounded-lg border border-white/10 bg-black/20 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-white">More details</summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClassName}>Email</label>
            <input className={inputClassName(errors, 'email')} name="email" onChange={onChange} type="email" value={formData.email} />
            <FieldError error={errors.email} />
          </div>
          <div>
            <label className={labelClassName}>Preferred Contact Method <span className="text-secondary">*</span></label>
            <select className={inputClassName(errors, 'preferred_contact_method')} name="preferred_contact_method" onChange={onChange} value={formData.preferred_contact_method}>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone call</option>
              <option value="email">Email</option>
            </select>
            <FieldError error={errors.preferred_contact_method} />
          </div>
        </div>
      </details>
      <div className="md:col-span-2">
        <label className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 text-sm ${
          errors.consent_to_contact ? 'border-rose-400/70 bg-rose-500/10' : 'border-white/10 bg-black/20'
        }`}>
          <input checked={formData.consent_to_contact} name="consent_to_contact" onChange={onChange} type="checkbox" />
          <span className="text-on-surface-variant">I agree to be contacted regarding this enquiry.</span>
        </label>
        <FieldError error={errors.consent_to_contact} />
      </div>
    </div>
  );
}

export function EnquirySuccess({ referenceId, message, whatsappHref, onReset }) {
  return (
    <div aria-live="polite" className="flex flex-col items-center text-center" role="status">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
        <span className="material-symbols-outlined text-4xl text-green-400">check_circle</span>
      </div>
      <h2 className="font-headline text-3xl font-bold text-white">Thank you. Your enquiry has been received.</h2>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-secondary">
        Reference ID: {referenceId || 'Pending'}
      </p>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-on-surface-variant">{message}</p>
      <div className="mt-10 flex w-full max-w-xl flex-col gap-3 md:flex-row">
        <a className="flex-1 rounded-xl bg-[#25D366] px-5 py-4 text-center text-sm font-bold text-white transition-all hover:brightness-110" href={whatsappHref} rel="noreferrer" target="_blank">
          Chat on WhatsApp
        </a>
        <Link className="flex-1 rounded-xl border border-white/10 px-5 py-4 text-center text-sm font-bold text-white transition-all hover:bg-white/5" to="/">
          Back to Home
        </Link>
        <button className="flex-1 rounded-xl border border-secondary/30 px-5 py-4 text-sm font-bold text-secondary transition-all hover:bg-secondary/5" onClick={onReset} type="button">
          Submit Another Enquiry
        </button>
      </div>
    </div>
  );
}

export const phonePattern = /^[+0-9\s()-]{8,20}$/;

export function validateCommonFields(formData) {
  const errors = {};
  const useDifferentWhatsApp = Boolean(formData.use_different_whatsapp);
  const whatsappNumber = useDifferentWhatsApp ? formData.whatsapp_number : formData.phone_number;

  if (!formData.customer_name.trim()) errors.customer_name = 'Full name is required.';
  if (!phonePattern.test(formData.phone_number.trim())) errors.phone_number = 'Enter a valid phone number.';
  if (useDifferentWhatsApp && !phonePattern.test(String(whatsappNumber || '').trim())) errors.whatsapp_number = 'Enter a valid WhatsApp number.';
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = 'Enter a valid email address.';
  if (!formData.preferred_contact_method) errors.preferred_contact_method = 'Choose a contact method.';
  if (!formData.consent_to_contact) errors.consent_to_contact = 'Consent is required before submitting.';

  return errors;
}

export function buildWhatsAppHref(message) {
  return buildWhatsAppLink({ phone: DEFAULT_WHATSAPP_PHONE, message });
}

const escapeSelectorValue = (value) => String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export function focusFirstInvalidField(formElement, errors) {
  if (!formElement || !errors || Object.keys(errors).length === 0) return;

  const [firstFieldName] = Object.keys(errors);
  const selector = `[name="${escapeSelectorValue(firstFieldName)}"]`;

  window.requestAnimationFrame(() => {
    const summary = formElement.querySelector('[data-error-summary="true"]');
    const field = formElement.querySelector(selector);

    if (summary) {
      summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (!field) return;

    field.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (typeof field.focus === 'function') {
      window.setTimeout(() => field.focus({ preventScroll: true }), 150);
    }
  });
}
