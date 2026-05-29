import React from 'react';
import { Link } from 'react-router-dom';
import { buildWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../../utils/whatsapp';

export const inputClassName = (errors, name) => `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
  errors[name]
    ? 'border-rose-400/70 bg-rose-500/10 text-white'
    : 'border-white/10 bg-black/30 text-white focus:border-secondary'
}`;

export const labelClassName = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant';

export function FieldError({ error }) {
  if (!error) return null;
  return <p className="mt-2 text-xs text-rose-300">{error}</p>;
}

export function SectionHeading({ step, title, description }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary">{step}</p>
      <h2 className="font-headline text-2xl font-bold text-white">{title}</h2>
      {description && <p className="max-w-2xl text-sm text-on-surface-variant">{description}</p>}
    </div>
  );
}

export function FormShell({ eyebrow, title, description, children, aside }) {
  return (
    <main className="min-h-screen bg-background pb-36 pt-24 md:pb-24">
      <section className="relative overflow-hidden px-4 sm:px-6">
        <div className="absolute left-[-10%] top-0 h-80 w-80 rounded-full bg-primary-container/10 blur-[120px]"></div>
        <div className="absolute bottom-0 right-[-10%] h-80 w-80 rounded-full bg-secondary/10 blur-[120px]"></div>
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8 lg:sticky lg:top-28 lg:h-fit">
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>
              <h1 className="font-headline text-4xl font-black leading-none tracking-tight text-white sm:text-5xl md:text-7xl">{title}</h1>
              <p className="max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">{description}</p>
            </div>
            {aside}
          </div>
          <div className="glass-panel rounded-3xl border border-white/10 p-5 shadow-[0_24px_48px_rgba(0,0,0,0.45)] sm:p-6 md:p-10">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

export function CustomerDetailsFields({ formData, errors, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
      <div>
        <label className={labelClassName}>WhatsApp Number <span className="text-secondary">*</span></label>
        <input className={inputClassName(errors, 'whatsapp_number')} name="whatsapp_number" onChange={onChange} type="tel" value={formData.whatsapp_number} />
        <FieldError error={errors.whatsapp_number} />
      </div>
      <div>
        <label className={labelClassName}>Email</label>
        <input className={inputClassName(errors, 'email')} name="email" onChange={onChange} type="email" value={formData.email} />
        <FieldError error={errors.email} />
      </div>
      <div className="md:col-span-2">
        <label className={labelClassName}>Preferred Contact Method <span className="text-secondary">*</span></label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            ['whatsapp', 'WhatsApp'],
            ['phone', 'Phone Call'],
            ['email', 'Email'],
          ].map(([value, label]) => (
            <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${
              formData.preferred_contact_method === value ? 'border-secondary bg-secondary/10 text-white' : 'border-white/10 bg-black/20 text-on-surface-variant'
            }`}>
              <input checked={formData.preferred_contact_method === value} className="sr-only" name="preferred_contact_method" onChange={onChange} type="radio" value={value} />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <FieldError error={errors.preferred_contact_method} />
      </div>
      <div className="md:col-span-2">
        <label className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 text-sm ${
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
    <div className="flex flex-col items-center text-center">
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

  if (!formData.customer_name.trim()) errors.customer_name = 'Full name is required.';
  if (!phonePattern.test(formData.phone_number.trim())) errors.phone_number = 'Enter a valid phone number.';
  if (!phonePattern.test(formData.whatsapp_number.trim())) errors.whatsapp_number = 'Enter a valid WhatsApp number.';
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = 'Enter a valid email address.';
  if (!formData.preferred_contact_method) errors.preferred_contact_method = 'Choose a contact method.';
  if (!formData.consent_to_contact) errors.consent_to_contact = 'Consent is required before submitting.';

  return errors;
}

export function buildWhatsAppHref(message) {
  return buildWhatsAppLink({ phone: DEFAULT_WHATSAPP_PHONE, message });
}
