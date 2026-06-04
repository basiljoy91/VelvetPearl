import React, { useMemo, useRef, useState } from 'react';
import { addEnquiry } from '../services/dataService';
import {
  buildWhatsAppHref,
  CustomerDetailsFields,
  EnquirySuccess,
  FieldError,
  focusFirstInvalidField,
  FormErrorSummary,
  FormShell,
  inputClassName,
  labelClassName,
  LoadingButton,
  SectionHeading,
  validateCommonFields,
} from '../components/forms/EnquiryFormParts';
import { buildWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../utils/whatsapp';

const faqs = [
  {
    question: 'Will this contact form save to your dashboard?',
    answer: 'Yes. Contact enquiries are submitted to the dashboard so the team can review and follow up manually.',
  },
  {
    question: 'Can I message directly on WhatsApp instead?',
    answer: 'Yes. You can use the WhatsApp buttons on this page if you want a faster first contact.',
  },
  {
    question: 'When will I get a reply?',
    answer: 'We reply manually after review. Response timing can vary based on request complexity and current operating hours.',
  },
];

const renderSectionIntro = (eyebrow, title, description) => (
  <div className="mb-10 max-w-3xl space-y-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>
    <h2 className="font-headline text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h2>
    <p className="text-lg leading-relaxed text-on-surface-variant">{description}</p>
  </div>
);

export default function Contact() {
  const initialFormData = useMemo(() => ({
    customer_name: '',
    phone_number: '',
    whatsapp_number: '',
    email: '',
    preferred_contact_method: 'whatsapp',
    consent_to_contact: false,
    enquiry_topic: 'General travel enquiry',
    requirement_message: '',
  }), []);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'phone_number' && !current.whatsapp_number ? { whatsapp_number: value } : {}),
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      ...validateCommonFields(formData),
    };

    if (!formData.enquiry_topic.trim()) nextErrors.enquiry_topic = 'Choose or enter an enquiry topic.';
    if (!formData.requirement_message.trim()) nextErrors.requirement_message = 'Please share your requirement.';

    return nextErrors;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setApiError('');
    setSubmittedEnquiry(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);
    setApiError('');

    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalidField(formRef.current, nextErrors);
      return;
    }

    setIsLoading(true);

    try {
      const createdEnquiry = await addEnquiry({
        customer_name: formData.customer_name,
        phone_number: formData.phone_number,
        whatsapp_number: formData.whatsapp_number,
        email: formData.email,
        preferred_contact_method: formData.preferred_contact_method,
        consent_to_contact: formData.consent_to_contact,
        service_type: 'general',
        source_page: 'contact',
        requirement_notes: formData.requirement_message,
        enquiry_details: {
          topic: formData.enquiry_topic,
          message: formData.requirement_message,
        },
      });

      setSubmittedEnquiry(createdEnquiry);
    } catch (error) {
      setApiError(error.message || 'Sorry, we could not submit your enquiry. Please try again or contact us on WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const contactWhatsAppHref = buildWhatsAppLink({
    phone: DEFAULT_WHATSAPP_PHONE,
    message: 'Hi, I would like to know more about your travel services.',
  });

  const successWhatsAppHref = buildWhatsAppHref(
    `Hi, I submitted an enquiry. My reference ID is ${submittedEnquiry?.reference_id || 'GEN-REF-PENDING'}. Please help me with the next steps.`
  );

  return (
    <>
      <FormShell
        aside={(
          <div className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-6">
            <h3 className="font-headline text-2xl text-white">Contact Details</h3>
            <div className="space-y-3 text-sm text-on-surface-variant">
              <p><span className="font-bold text-white">Phone:</span> <a href="tel:+917845039353">+91 78450 39353</a></p>
              <p><span className="font-bold text-white">WhatsApp:</span> <a href={contactWhatsAppHref} rel="noreferrer" target="_blank">Start chat</a></p>
              <p><span className="font-bold text-white">Support note:</span> We review travel requirements manually before sharing availability and pricing.</p>
            </div>
            <a
              className="inline-flex rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
              href={contactWhatsAppHref}
              rel="noreferrer"
              target="_blank"
            >
              Chat on WhatsApp
            </a>
          </div>
        )}
        description="Use this page for general travel questions, service clarification, or requirements that do not fit a single booking form. Every message is saved as an enquiry for manual follow-up."
        eyebrow="Contact Page"
        title="Reach Out for Travel Support"
      >
        {submittedEnquiry ? (
          <EnquirySuccess
            message="Our team will review your request and contact you shortly with the next steps. Availability and pricing, if needed, will be shared after manual review."
            onReset={resetForm}
            referenceId={submittedEnquiry.reference_id}
            whatsappHref={successWhatsAppHref}
          />
        ) : (
          <form ref={formRef} aria-busy={isLoading} className="space-y-10" noValidate onSubmit={handleSubmit}>
            {apiError && (
              <div aria-live="assertive" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
                {apiError}
              </div>
            )}
            <FormErrorSummary errors={errors} />

            <SectionHeading
              description="Tell us how you want us to follow up on this general travel enquiry."
              step="01"
              title="Customer Details"
            />
            <CustomerDetailsFields errors={errors} formData={formData} onChange={handleChange} />

            <SectionHeading
              description="Use this form to ask about travel services, support, or general trip planning."
              step="02"
              title="General Enquiry Form"
            />
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className={labelClassName}>Enquiry Topic <span className="text-secondary">*</span></label>
                <select className={inputClassName(errors, 'enquiry_topic')} name="enquiry_topic" onChange={handleChange} value={formData.enquiry_topic}>
                  <option value="General travel enquiry">General travel enquiry</option>
                  <option value="Cab support">Cab support</option>
                  <option value="Room support">Room support</option>
                  <option value="Tour package support">Tour package support</option>
                  <option value="Custom trip support">Custom trip support</option>
                </select>
                <FieldError error={errors.enquiry_topic} />
              </div>
              <div>
                <label className={labelClassName}>Your Message <span className="text-secondary">*</span></label>
                <textarea
                  className={inputClassName(errors, 'requirement_message')}
                  name="requirement_message"
                  onChange={handleChange}
                  placeholder="Tell us what you need help with."
                  rows="5"
                  value={formData.requirement_message}
                ></textarea>
                <FieldError error={errors.requirement_message} />
              </div>
            </div>

            <LoadingButton
              idleLabel="Submit Enquiry"
              isLoading={isLoading}
              loadingLabel="Submitting Enquiry..."
            />
          </form>
        )}
      </FormShell>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <article className="rounded-[28px] border border-white/10 bg-black/20 p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Business Location</p>
            <h3 className="mt-4 font-headline text-3xl font-bold text-white">Map Placeholder</h3>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              Business location and map embed will be updated soon. For verification or travel discussion, contact us directly on WhatsApp.
            </p>
          </article>
          <article className="rounded-[28px] border border-white/10 bg-black/20 p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Support Hours</p>
            <h3 className="mt-4 font-headline text-3xl font-bold text-white">Hours Placeholder</h3>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              Support hours will be updated soon. Response timing may vary depending on the enquiry type and operating schedule.
            </p>
          </article>
          <article className="rounded-[28px] border border-white/10 bg-black/20 p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Contact Note</p>
            <h3 className="mt-4 font-headline text-3xl font-bold text-white">Manual Follow-Up</h3>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              We do not auto-confirm services from this page. Every message is reviewed manually and then added to the follow-up workflow.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-background px-6 py-24 md:px-8">
        <div className="mx-auto max-w-5xl">
          {renderSectionIntro(
            'FAQ',
            'Contact Questions',
            'A few quick answers to explain how this page works and what happens after you send a message.'
          )}
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-[22px] border border-white/10 bg-surface-container p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-headline text-2xl font-bold text-white">
                  <span>{faq.question}</span>
                  <span className="material-symbols-outlined text-secondary transition-transform group-open:rotate-45">add</span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 pb-24 pt-8 md:px-8">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,73,219,0.12),rgba(255,255,255,0.06))] p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Prefer Direct Chat?</p>
              <h2 className="mt-4 font-headline text-4xl font-bold text-white">Use WhatsApp for Quick Contact</h2>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
                If you want a faster first conversation, message directly on WhatsApp and then continue with the full enquiry form if needed.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <button
                className="rounded-xl bg-primary-container px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all hover:brightness-110"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                type="button"
              >
                Submit Enquiry
              </button>
              <a
                className="rounded-xl border border-secondary px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-secondary transition-all hover:bg-secondary/10"
                href={contactWhatsAppHref}
                rel="noreferrer"
                target="_blank"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
