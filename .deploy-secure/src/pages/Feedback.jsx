import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BrandMark from '../components/branding/BrandMark';
import FeedbackStars from '../components/feedback/FeedbackStars';
import {
  FieldError,
  FormErrorSummary,
  focusFirstInvalidField,
  inputClassName,
  labelClassName,
  LoadingButton,
} from '../components/forms/EnquiryFormParts';
import { FEEDBACK_SERVICE_OPTIONS } from '../data/feedback';
import { submitFeedback } from '../services/dataService';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '../utils/contact';

const monthInputToLabel = (value) => {
  if (!value) return '';

  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
};

export default function Feedback() {
  const [formData, setFormData] = useState({
    customer_name: '',
    city: '',
    service_used: FEEDBACK_SERVICE_OPTIONS[0],
    rating: 0,
    feedback_message: '',
    contact_number: '',
    email: '',
    trip_month: '',
    publish_consent: false,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);

  const tripMonthLabel = useMemo(
    () => monthInputToLabel(formData.trip_month),
    [formData.trip_month]
  );

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.customer_name.trim()) nextErrors.customer_name = 'Full name is required.';
    if (!formData.city.trim()) nextErrors.city = 'City is required.';
    if (!formData.service_used) nextErrors.service_used = 'Please choose the service used.';
    if (!Number.isInteger(Number(formData.rating)) || Number(formData.rating) < 1) nextErrors.rating = 'Please choose a star rating.';
    if (formData.feedback_message.trim().length < 10) nextErrors.feedback_message = 'Please share at least a short feedback note.';
    if (formData.contact_number && !/^[+0-9\s()-]{8,20}$/.test(formData.contact_number.trim())) {
      nextErrors.contact_number = 'Enter a valid phone or WhatsApp number.';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!formData.publish_consent) nextErrors.publish_consent = 'Consent is required before submitting.';

    return nextErrors;
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      city: '',
      service_used: FEEDBACK_SERVICE_OPTIONS[0],
      rating: 0,
      feedback_message: '',
      contact_number: '',
      email: '',
      trip_month: '',
      publish_consent: false,
    });
    setErrors({});
    setApiError('');
    setSubmittedFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);
    setApiError('');

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalidField(formRef.current, nextErrors);
      return;
    }

    setIsLoading(true);

    try {
      const created = await submitFeedback({
        customer_name: formData.customer_name,
        city: formData.city,
        service_used: formData.service_used,
        rating: Number(formData.rating),
        feedback_message: formData.feedback_message,
        contact_number: formData.contact_number,
        email: formData.email,
        trip_month: formData.trip_month,
        publish_consent: formData.publish_consent,
        source_page: 'feedback',
      });

      setSubmittedFeedback(created);
    } catch (error) {
      setApiError(error.message || 'Unable to submit feedback right now. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex">
            <BrandMark
              className="gap-3"
              logoClassName="w-11"
              priority
              titleClassName="text-xl text-[#EFBF04]"
              caption="Customer feedback page"
            />
          </Link>
          <Link
            className="rounded-xl border border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-white/5"
            to="/"
          >
            Back to Home
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-surface-container-low px-5 py-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:px-8 md:px-10 md:py-10">
          <div className="absolute left-[-8%] top-0 h-72 w-72 rounded-full bg-primary-container/15 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-4%] h-72 w-72 rounded-full bg-[#EFBF04]/10 blur-[120px]" />

          <div className="relative grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#EFBF04]">Public Feedback Form</p>
                <h1 className="font-headline text-4xl font-black leading-none tracking-tight text-white sm:text-5xl md:text-6xl">
                  Share your travel experience with Velvet Pearl.
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
                  This page is only for customer feedback. Your experience helps us improve the service and highlight real customer journeys.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">Shared details</p>
                  <p className="mt-3 text-sm leading-relaxed text-white">Full name, city, service used, star rating, and your feedback note.</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">What stays private</p>
                  <p className="mt-3 text-sm leading-relaxed text-white">Optional phone, optional email, and trip month details are for internal verification only.</p>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#EFBF04]/15 bg-[linear-gradient(135deg,rgba(239,191,4,0.08),rgba(34,73,219,0.12))] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#EFBF04]">Support Email</p>
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                  If you want to reach us directly instead of using the form, write to{' '}
                  <a className="text-secondary hover:underline" href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</a>.
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-[30px] border border-white/10 p-5 shadow-[0_24px_48px_rgba(0,0,0,0.45)] sm:p-6 md:p-8">
              {submittedFeedback ? (
                <div aria-live="polite" className="flex flex-col items-center text-center" role="status">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
                    <span className="material-symbols-outlined text-4xl text-emerald-300">check_circle</span>
                  </div>
                  <h2 className="font-headline text-3xl font-bold text-white">Thank you. Your feedback has been submitted.</h2>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-[#EFBF04]">
                    Reference ID: {submittedFeedback.reference_id}
                  </p>
                  <div className="mt-10 flex w-full max-w-xl flex-col gap-3 md:flex-row">
                    <Link className="flex-1 rounded-xl bg-primary-container px-5 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-white transition-all hover:brightness-110" to="/">
                      Back to Home
                    </Link>
                    <button className="flex-1 rounded-xl border border-[#EFBF04]/30 px-5 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#EFBF04] transition-all hover:bg-[#EFBF04]/5" onClick={resetForm} type="button">
                      Submit Another
                    </button>
                  </div>
                </div>
              ) : (
                <form ref={formRef} aria-busy={isLoading} className="space-y-8" noValidate onSubmit={handleSubmit}>
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#EFBF04]">Feedback Form</p>
                    <h2 className="font-headline text-3xl font-bold text-white">Tell us how the trip felt.</h2>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      Honest, specific feedback helps us show visitors what the actual customer experience looks like.
                    </p>
                  </div>

                  {apiError && (
                    <div aria-live="assertive" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
                      {apiError}
                    </div>
                  )}
                  <FormErrorSummary errors={errors} />

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className={labelClassName}>Full Name <span className="text-[#EFBF04]">*</span></label>
                      <input className={inputClassName(errors, 'customer_name')} name="customer_name" onChange={handleChange} type="text" value={formData.customer_name} />
                      <FieldError error={errors.customer_name} />
                    </div>
                    <div>
                      <label className={labelClassName}>City <span className="text-[#EFBF04]">*</span></label>
                      <input className={inputClassName(errors, 'city')} name="city" onChange={handleChange} type="text" value={formData.city} />
                      <FieldError error={errors.city} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClassName}>Service Used <span className="text-[#EFBF04]">*</span></label>
                    <select className={inputClassName(errors, 'service_used')} name="service_used" onChange={handleChange} value={formData.service_used}>
                      {FEEDBACK_SERVICE_OPTIONS.map((option) => (
                        <option key={option} value={option} className="bg-[#0A0A0A]">
                          {option}
                        </option>
                      ))}
                    </select>
                    <FieldError error={errors.service_used} />
                  </div>

                  <div>
                    <label className={labelClassName}>Rating <span className="text-[#EFBF04]">*</span></label>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {Array.from({ length: 5 }).map((_, index) => {
                        const value = index + 1;
                        const isActive = Number(formData.rating) === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFormData((current) => ({ ...current, rating: value }))}
                            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                              isActive
                                ? 'border-[#EFBF04] bg-[#EFBF04]/10 text-white'
                                : 'border-white/10 bg-black/20 text-on-surface-variant'
                            }`}
                          >
                            <FeedbackStars rating={value} />
                            <span>{value}</span>
                          </button>
                        );
                      })}
                    </div>
                    <FieldError error={errors.rating} />
                  </div>

                  <div>
                    <label className={labelClassName}>Feedback Message <span className="text-[#EFBF04]">*</span></label>
                    <textarea
                      className={inputClassName(errors, 'feedback_message')}
                      name="feedback_message"
                      onChange={handleChange}
                      rows="6"
                      value={formData.feedback_message}
                    />
                    <p className="mt-2 text-xs text-on-surface-variant">
                      Share what stood out: responsiveness, driver behavior, planning support, timing, comfort, or anything else that mattered.
                    </p>
                    <FieldError error={errors.feedback_message} />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className={labelClassName}>Phone / WhatsApp (Optional, Private)</label>
                      <input className={inputClassName(errors, 'contact_number')} name="contact_number" onChange={handleChange} type="tel" value={formData.contact_number} />
                      <FieldError error={errors.contact_number} />
                    </div>
                    <div>
                      <label className={labelClassName}>Email (Optional, Private)</label>
                      <input className={inputClassName(errors, 'email')} name="email" onChange={handleChange} type="email" value={formData.email} />
                      <FieldError error={errors.email} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClassName}>Trip Month / Year (Optional)</label>
                    <input className={inputClassName(errors, 'trip_month')} name="trip_month" onChange={handleChange} type="month" value={formData.trip_month} />
                    {tripMonthLabel ? <p className="mt-2 text-xs text-on-surface-variant">Selected trip period: {tripMonthLabel}</p> : null}
                    <FieldError error={errors.trip_month} />
                  </div>

                  <div>
                    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 text-sm ${
                      errors.publish_consent ? 'border-rose-400/70 bg-rose-500/10' : 'border-white/10 bg-black/20'
                    }`}>
                      <input checked={formData.publish_consent} name="publish_consent" onChange={handleChange} type="checkbox" />
                      <span className="text-on-surface-variant">
                        I allow Velvet Pearl to use my feedback with my full name and city.
                      </span>
                    </label>
                    <FieldError error={errors.publish_consent} />
                  </div>

                  <LoadingButton
                    type="submit"
                    isLoading={isLoading}
                    idleLabel="Submit Feedback"
                    loadingLabel="Submitting Feedback..."
                  />
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
