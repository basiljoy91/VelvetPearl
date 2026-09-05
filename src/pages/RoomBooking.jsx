import React, { useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
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

const stayTypes = [
  { title: 'Budget rooms', description: 'Useful for practical stays where price range matters most.' },
  { title: 'Family rooms', description: 'Helpful when room count, guest mix, and meal preference are important.' },
  { title: 'Resorts', description: 'For travellers who want a different stay style and location preference review.' },
  { title: 'Group stays', description: 'Useful for larger trips that need room planning and coordination.' },
  { title: 'Honeymoon stays', description: 'Share your stay style and travel dates so options can be reviewed manually.' },
  { title: 'Homestays', description: 'A good fit for travellers looking for local stay preferences and flexible planning.' },
];

const detailsToShare = [
  'Check-in and check-out dates',
  'Adults, children, and room count',
  'Room type or stay preference',
  'Budget, pickup need, and special requests',
];

const howItWorks = [
  'Submit your stay requirement',
  'We check dates, guest mix, and available options',
  'We contact you with suitable suggestions',
  'You review pricing and options manually',
  'Final stay confirmation happens after discussion',
];

const faqs = [
  {
    question: 'Is my room enquiry a confirmed booking?',
    answer: 'No. Room options are shared after checking availability based on your dates and requirements.',
  },
  {
    question: 'Can I ask for a preferred area?',
    answer: 'Yes. You can mention a preferred area, and we will consider it while reviewing available options.',
  },
  {
    question: 'Can I request pickup along with the stay?',
    answer: 'Yes. There is a pickup field in the form so we can review both needs together.',
  },
  {
    question: 'Do you support family or group stays?',
    answer: 'Yes. Share guest count and room count so we can review suitable options manually.',
  },
];

const renderSectionIntro = (eyebrow, title, description) => (
  <div className="mb-10 max-w-3xl space-y-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>
    <h2 className="font-headline text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h2>
    <p className="text-lg leading-relaxed text-on-surface-variant">{description}</p>
  </div>
);

export default function RoomBooking() {
  const { state } = useLocation();

  const initialFormData = useMemo(() => ({
    customer_name: state?.name || '',
    phone_number: state?.phone || '',
    whatsapp_number: state?.phone || '',
    use_different_whatsapp: false,
    email: state?.email || '',
    preferred_contact_method: 'whatsapp',
    consent_to_contact: false,
    destination_city: '',
    preferred_area: '',
    check_in_date: '',
    check_out_date: '',
    adults: '2',
    children: '0',
    room_count: '1',
    room_type: 'not_sure',
    meal_preference: 'not_sure',
    approximate_budget: '',
    pickup_required: 'Not sure',
    early_check_in_required: 'No',
    late_checkout_required: 'No',
    special_requirements: '',
  }), [state?.email, state?.name, state?.phone]);

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
      ...(name === 'phone_number' && !current.use_different_whatsapp ? { whatsapp_number: value } : {}),
      ...(name === 'use_different_whatsapp' && !checked ? { whatsapp_number: current.phone_number } : {}),
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      ...validateCommonFields(formData),
    };

    if (!formData.destination_city.trim()) nextErrors.destination_city = 'Destination or city is required.';
    if (!formData.check_in_date) nextErrors.check_in_date = 'Check-in date is required.';
    if (!formData.check_out_date) nextErrors.check_out_date = 'Check-out date is required.';
    if (!formData.adults || Number(formData.adults) < 1) nextErrors.adults = 'At least one adult is required.';
    if (!formData.room_count || Number(formData.room_count) < 1) nextErrors.room_count = 'At least one room is required.';
    if (formData.check_in_date && formData.check_out_date && formData.check_out_date < formData.check_in_date) {
      nextErrors.check_out_date = 'Check-out must be after check-in.';
    }

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
        service_type: 'room',
        source_page: 'room',
        travel_date: formData.check_in_date,
        requirement_notes: formData.special_requirements || `${formData.destination_city} stay enquiry`,
        enquiry_details: {
          destination_city: formData.destination_city,
          hotel_name: formData.destination_city,
          location_preference: formData.preferred_area,
          check_in: formData.check_in_date,
          check_out: formData.check_out_date,
          guests: String(Number(formData.adults) + Number(formData.children || 0)),
          adults: formData.adults,
          children: formData.children,
          room_count: formData.room_count,
          room_type: formData.room_type,
          meal_preference: formData.meal_preference,
          budget: formData.approximate_budget,
          pickup_required: formData.pickup_required,
          early_check_in_required: formData.early_check_in_required,
          late_checkout_required: formData.late_checkout_required,
          notes: formData.special_requirements,
        },
      });

      setSubmittedEnquiry(createdEnquiry);
    } catch (error) {
      setApiError(error.message || 'Sorry, we could not submit your enquiry. Please try again or contact us on WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const genericRoomWhatsApp = buildWhatsAppLink({
    phone: DEFAULT_WHATSAPP_PHONE,
    message: 'Hi, I am looking for room booking. Please help me with availability.',
  });

  const successWhatsAppHref = buildWhatsAppHref(
    `Hi, I submitted an enquiry. My reference ID is ${submittedEnquiry?.reference_id || 'ROOM-REF-PENDING'}. Please help me with the next steps.`
  );

  return (
    <>
      <FormShell
        aside={(
          <div className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-6">
            <h3 className="font-headline text-2xl text-white">Stay Assistance</h3>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Room options are shared after checking availability based on your dates and requirements.
            </p>
            <a
              className="inline-flex rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
              href={genericRoomWhatsApp}
              rel="noreferrer"
              target="_blank"
            >
              Chat on WhatsApp
            </a>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li>Stay dates, guest count, and room preference help narrow options quickly.</li>
              <li>Pickup support and special timing requests can be added in the same enquiry.</li>
              <li>Final stay confirmation happens only after manual review.</li>
            </ul>
          </div>
        )}
        description="Share your stay dates, guest details, room preference, and budget so we can review suitable room or stay options manually."
        eyebrow="Room Booking Page"
        title="Find the Right Stay Across Chennai and South India"
      >
        {submittedEnquiry ? (
          <EnquirySuccess
            message="Our team will review your request and contact you shortly with availability and pricing. Final confirmation will happen after manual review."
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
              description="Tell us how you want to be contacted about stay options and pricing."
              step="01"
              title="Customer Details"
            />
            <CustomerDetailsFields errors={errors} formData={formData} onChange={handleChange} />

            <SectionHeading
              description="These details help us check the best available options for your dates and requirements."
              step="02"
              title="Room Enquiry Form"
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className={labelClassName}>Destination / City <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'destination_city')} name="destination_city" onChange={handleChange} type="text" value={formData.destination_city} />
                <FieldError error={errors.destination_city} />
              </div>
              <div>
                <label className={labelClassName}>Preferred Area</label>
                <input className={inputClassName(errors, 'preferred_area')} name="preferred_area" onChange={handleChange} type="text" value={formData.preferred_area} />
              </div>
              <div>
                <label className={labelClassName}>Check-In Date <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'check_in_date')} name="check_in_date" onChange={handleChange} type="date" value={formData.check_in_date} />
                <FieldError error={errors.check_in_date} />
              </div>
              <div>
                <label className={labelClassName}>Check-Out Date <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'check_out_date')} name="check_out_date" onChange={handleChange} type="date" value={formData.check_out_date} />
                <FieldError error={errors.check_out_date} />
              </div>
              <div>
                <label className={labelClassName}>Adults <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'adults')} min="1" name="adults" onChange={handleChange} type="number" value={formData.adults} />
                <FieldError error={errors.adults} />
              </div>
              <div>
                <label className={labelClassName}>Children</label>
                <input className={inputClassName(errors, 'children')} min="0" name="children" onChange={handleChange} type="number" value={formData.children} />
              </div>
              <div>
                <label className={labelClassName}>Number of Rooms <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'room_count')} min="1" name="room_count" onChange={handleChange} type="number" value={formData.room_count} />
                <FieldError error={errors.room_count} />
              </div>
              <div>
                <label className={labelClassName}>Room Type <span className="text-secondary">*</span></label>
                <select className={inputClassName(errors, 'room_type')} name="room_type" onChange={handleChange} value={formData.room_type}>
                  <option value="budget">Budget</option>
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="family_room">Family room</option>
                  <option value="resort">Resort</option>
                  <option value="not_sure">Not sure</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}>Meal Preference</label>
                <select className={inputClassName(errors, 'meal_preference')} name="meal_preference" onChange={handleChange} value={formData.meal_preference}>
                  <option value="no_meals">No meals</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="breakfast_and_dinner">Breakfast + dinner</option>
                  <option value="not_sure">Not sure</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}>Approximate Budget</label>
                <input className={inputClassName(errors, 'approximate_budget')} name="approximate_budget" onChange={handleChange} type="text" value={formData.approximate_budget} />
              </div>
              <div>
                <label className={labelClassName}>Pickup Required</label>
                <select className={inputClassName(errors, 'pickup_required')} name="pickup_required" onChange={handleChange} value={formData.pickup_required}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}>Early Check-In Required</label>
                <select className={inputClassName(errors, 'early_check_in_required')} name="early_check_in_required" onChange={handleChange} value={formData.early_check_in_required}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}>Late Checkout Required</label>
                <select className={inputClassName(errors, 'late_checkout_required')} name="late_checkout_required" onChange={handleChange} value={formData.late_checkout_required}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>Special Requirements</label>
                <textarea className={inputClassName(errors, 'special_requirements')} name="special_requirements" onChange={handleChange} rows="4" value={formData.special_requirements}></textarea>
              </div>
            </div>

            <LoadingButton
              idleLabel="Submit Room Enquiry"
              isLoading={isLoading}
              loadingLabel="Submitting Enquiry..."
            />
          </form>
        )}
      </FormShell>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {renderSectionIntro(
            'Stay Types',
            'Stay Types You Can Ask For',
            'Use the room enquiry form for different stay styles. We review availability based on dates, guest count, room preference, and budget.'
          )}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stayTypes.map((item) => (
              <article key={item.title} className="rounded-[24px] border border-white/10 bg-black/20 p-6">
                <h3 className="font-headline text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {renderSectionIntro(
            'What To Share',
            'What Details Help Most',
            'The more specific the stay requirement, the easier it is to review useful room or stay options manually.'
          )}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {detailsToShare.map((item, index) => (
              <article key={item} className="rounded-[24px] border border-white/10 bg-surface-container p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">Detail {index + 1}</p>
                <h3 className="mt-4 font-headline text-2xl font-bold text-white">{item}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {renderSectionIntro(
            'How It Works',
            'How Room Assistance Works',
            'This page collects your stay requirement first. We review dates and preferences before sharing options and pricing.'
          )}
          <div className="grid gap-6 md:grid-cols-5">
            {howItWorks.map((item, index) => (
              <article key={item} className="glass-card rounded-[24px] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">Step {index + 1}</p>
                <h3 className="mt-5 font-headline text-2xl font-bold text-white">{item}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-24 md:px-8">
        <div className="mx-auto max-w-5xl">
          {renderSectionIntro(
            'FAQ',
            'Room Booking Questions',
            'A few quick answers to help set the right expectation before you submit a stay requirement.'
          )}
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-[22px] border border-white/10 bg-black/20 p-6">
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
        <div className="mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(239,191,4,0.08),rgba(255,255,255,0.06))] p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Need Help Before You Submit?</p>
              <h2 className="mt-4 font-headline text-4xl font-bold text-white">Use WhatsApp for Stay Questions</h2>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
                If you want to check the process first, you can message directly and then continue with the full room enquiry form.
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
                href={genericRoomWhatsApp}
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
