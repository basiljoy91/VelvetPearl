import React, { useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { featuredDestinations, featuredPackages } from '../content/travelCatalog';

const travelInterestOptions = [
  'Nature',
  'Adventure',
  'Honeymoon',
  'Family trip',
  'Wildlife',
  'Waterfalls',
  'Trekking',
  'Culture / local experience',
];

const featuredPackageCards = featuredPackages;

const destinationHighlights = featuredDestinations;

const itineraryBlocks = [
  {
    title: 'Sample Day 1',
    description: 'Arrival, pickup coordination, local sightseeing, and stay check-in planning based on your dates and route.',
  },
  {
    title: 'Sample Day 2',
    description: 'Destination visits shaped around your interests such as waterfalls, wildlife, viewpoints, or family stops.',
  },
  {
    title: 'Custom Add-Ons',
    description: 'Airport transfer, additional sightseeing, stay changes, or flexible timing can be reviewed manually.',
  },
];

const faqs = [
  {
    question: 'Is my tour enquiry a confirmed package booking?',
    answer: 'No. We review the requirement manually and share itinerary ideas, availability, and pricing before any confirmation.',
  },
  {
    question: 'Can I ask for a custom package?',
    answer: 'Yes. You can submit destination, date, and budget details here, or use the custom trip form for broader requirements.',
  },
  {
    question: 'Can I include cab and stay in the same package enquiry?',
    answer: 'Yes. Use the form fields for cab need, hotel level, and budget so we can review the full requirement together.',
  },
  {
    question: 'Do you show final prices on the website?',
    answer: 'No. Final pricing is shared after manual review based on date, route, cab need, hotel preference, and availability.',
  },
];

const renderSectionIntro = (eyebrow, title, description) => (
  <div className="mb-10 max-w-3xl space-y-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>
    <h2 className="font-headline text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h2>
    <p className="text-lg leading-relaxed text-on-surface-variant">{description}</p>
  </div>
);

export default function TourBooking() {
  const { state } = useLocation();

  const initialFormData = useMemo(() => ({
    customer_name: state?.name || '',
    phone_number: state?.phone || '',
    whatsapp_number: state?.phone || '',
    use_different_whatsapp: false,
    email: state?.email || '',
    preferred_contact_method: 'whatsapp',
    consent_to_contact: false,
    destination_package_name: state?.packageName || state?.destination || '',
    travel_start_date: '',
    travel_end_date: '',
    flexible_dates: 'No',
    adults: '2',
    children: '0',
    trip_duration: state?.packageDuration || '',
    pickup_city_location: '',
    cab_required: 'Not sure',
    hotel_level: 'Not sure',
    budget_range: '',
    travel_interests: [],
    must_visit_places: state?.mustVisitPlaces || '',
    notes_special_requests: '',
  }), [state?.destination, state?.email, state?.mustVisitPlaces, state?.name, state?.packageDuration, state?.packageName, state?.phone]);

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

  const handleInterestToggle = (interest) => {
    setFormData((current) => ({
      ...current,
      travel_interests: current.travel_interests.includes(interest)
        ? current.travel_interests.filter((item) => item !== interest)
        : [...current.travel_interests, interest],
    }));
  };

  const applyPackageToForm = (pkg) => {
    setFormData((current) => ({
      ...current,
      destination_package_name: pkg.title,
      trip_duration: pkg.duration,
      must_visit_places: pkg.highlights.join(', '),
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyDestinationToForm = (destination) => {
    setFormData((current) => ({
      ...current,
      destination_package_name: destination.name,
      must_visit_places: destination.name,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateForm = () => {
    const nextErrors = {
      ...validateCommonFields(formData),
    };

    if (!formData.destination_package_name.trim()) nextErrors.destination_package_name = 'Destination or package name is required.';
    if (!formData.travel_start_date) nextErrors.travel_start_date = 'Travel start date is required.';
    if (!formData.travel_end_date) nextErrors.travel_end_date = 'Travel end date is required.';
    if (formData.travel_start_date && formData.travel_end_date && formData.travel_end_date < formData.travel_start_date) {
      nextErrors.travel_end_date = 'Travel end date must be after the start date.';
    }
    if (!formData.adults || Number(formData.adults) < 1) nextErrors.adults = 'At least one adult is required.';
    if (!formData.trip_duration.trim()) nextErrors.trip_duration = 'Enter trip duration like 2 days or 3 days / 2 nights.';
    if (!formData.pickup_city_location.trim()) nextErrors.pickup_city_location = 'Pickup city or location is required.';

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
        service_type: 'tour',
        source_page: 'tour',
        travel_date: formData.travel_start_date,
        requirement_notes: formData.notes_special_requests || `${formData.destination_package_name} tour enquiry`,
        enquiry_details: {
          destination: formData.destination_package_name,
          package_name: formData.destination_package_name,
          travel_window_start: formData.travel_start_date,
          travel_window_end: formData.travel_end_date,
          flexible_dates: formData.flexible_dates,
          adults: formData.adults,
          children: formData.children,
          group_size: String(Number(formData.adults) + Number(formData.children || 0)),
          duration: formData.trip_duration,
          pickup_city: formData.pickup_city_location,
          cab_required: formData.cab_required,
          hotel_preference: formData.hotel_level,
          budget: formData.budget_range,
          travel_interests: formData.travel_interests,
          must_visit_places: formData.must_visit_places,
          notes: formData.notes_special_requests,
        },
      });

      setSubmittedEnquiry(createdEnquiry);
    } catch (error) {
      setApiError(error.message || 'Sorry, we could not submit your enquiry. Please try again or contact us on WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const genericTourWhatsApp = buildWhatsAppLink({
    phone: DEFAULT_WHATSAPP_PHONE,
    message: 'Hi, I want help planning a custom trip. Please guide me with options and pricing.',
  });

  const successWhatsAppHref = buildWhatsAppHref(
    `Hi, I submitted an enquiry. My reference ID is ${submittedEnquiry?.reference_id || 'TOUR-REF-PENDING'}. Please help me with the next steps.`
  );

  return (
    <>
      <FormShell
        aside={(
          <div className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-6">
            <h3 className="font-headline text-2xl text-white">Tour Package Support</h3>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Share your destination, dates, and package preferences. We&apos;ll review the requirement manually before sharing pricing and availability.
            </p>
            <a
              className="inline-flex rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
              href={genericTourWhatsApp}
              rel="noreferrer"
              target="_blank"
            >
              Chat on WhatsApp
            </a>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li>Use this page for both named package ideas and custom itinerary planning.</li>
              <li>Cab requirement, hotel level, and budget can be reviewed together.</li>
              <li>Final confirmation happens only after manual review and discussion.</li>
            </ul>
          </div>
        )}
        description="Share your travel window, group details, destination interests, and budget so we can prepare a manual itinerary and quote."
        eyebrow="Tour Package Page"
        title="Plan a Tour That Fits Your Requirement"
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
              description="Tell us how you prefer to hear back so we can follow up on this tour enquiry quickly."
              step="01"
              title="Customer Details"
            />
            <CustomerDetailsFields errors={errors} formData={formData} onChange={handleChange} />

            <SectionHeading
              description="These details help us review package suitability, cab need, hotel preference, and budget."
              step="02"
              title="Tour Enquiry Form"
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className={labelClassName}>Destination / Package Name <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'destination_package_name')} name="destination_package_name" onChange={handleChange} type="text" value={formData.destination_package_name} />
                <FieldError error={errors.destination_package_name} />
              </div>
              <div>
                <label className={labelClassName}>Trip Duration <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'trip_duration')} name="trip_duration" onChange={handleChange} placeholder="Examples: 2 days, 3 days / 2 nights" type="text" value={formData.trip_duration} />
                <p className="mt-2 text-xs text-on-surface-variant">Use simple formats like `2 days`, `3 days / 2 nights`, or `Flexible`.</p>
                <FieldError error={errors.trip_duration} />
              </div>
              <div>
                <label className={labelClassName}>Travel Start Date <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'travel_start_date')} name="travel_start_date" onChange={handleChange} type="date" value={formData.travel_start_date} />
                <FieldError error={errors.travel_start_date} />
              </div>
              <div>
                <label className={labelClassName}>Travel End Date <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'travel_end_date')} name="travel_end_date" onChange={handleChange} type="date" value={formData.travel_end_date} />
                <FieldError error={errors.travel_end_date} />
              </div>
              <div>
                <label className={labelClassName}>Flexible Dates</label>
                <select className={inputClassName(errors, 'flexible_dates')} name="flexible_dates" onChange={handleChange} value={formData.flexible_dates}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}>Pickup City / Location <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'pickup_city_location')} name="pickup_city_location" onChange={handleChange} type="text" value={formData.pickup_city_location} />
                <FieldError error={errors.pickup_city_location} />
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
                <label className={labelClassName}>Cab Required</label>
                <select className={inputClassName(errors, 'cab_required')} name="cab_required" onChange={handleChange} value={formData.cab_required}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}>Hotel Level</label>
                <select className={inputClassName(errors, 'hotel_level')} name="hotel_level" onChange={handleChange} value={formData.hotel_level}>
                  <option value="Budget">Budget</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="Resort">Resort</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>Budget Range</label>
                <input className={inputClassName(errors, 'budget_range')} name="budget_range" onChange={handleChange} placeholder="Share your approximate budget range" type="text" value={formData.budget_range} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>Travel Interests</label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {travelInterestOptions.map((interest) => (
                    <label
                      key={interest}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${
                        formData.travel_interests.includes(interest)
                          ? 'border-secondary bg-secondary/10 text-white'
                          : 'border-white/10 bg-black/20 text-on-surface-variant'
                      }`}
                    >
                      <input
                        checked={formData.travel_interests.includes(interest)}
                        className="sr-only"
                        onChange={() => handleInterestToggle(interest)}
                        type="checkbox"
                      />
                      <span>{interest}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>Must-Visit Places</label>
                <textarea className={inputClassName(errors, 'must_visit_places')} name="must_visit_places" onChange={handleChange} rows="3" value={formData.must_visit_places}></textarea>
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>Notes / Special Requests</label>
                <textarea className={inputClassName(errors, 'notes_special_requests')} name="notes_special_requests" onChange={handleChange} rows="4" value={formData.notes_special_requests}></textarea>
              </div>
            </div>

            <LoadingButton
              idleLabel="Submit Tour Enquiry"
              isLoading={isLoading}
              loadingLabel="Submitting Enquiry..."
            />
          </form>
        )}
      </FormShell>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {renderSectionIntro(
            'Featured Packages',
            'Tour Package Ideas',
            'These package cards are starting points for planning. Final availability, route, and pricing are reviewed manually after your enquiry.'
          )}
          <div className="grid gap-6 xl:grid-cols-3">
            {featuredPackageCards.map((pkg) => (
              <article key={pkg.title} className="overflow-hidden rounded-[28px] border border-white/10 bg-black/20">
                <img alt={pkg.title} className="h-56 w-full object-cover" decoding="async" height="672" loading="lazy" src={pkg.image} width="1200" />
                <div className="space-y-5 p-6">
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-white">{pkg.title}</h3>
                    <p className="mt-2 text-sm font-semibold text-secondary">{pkg.duration}</p>
                  </div>
                  <div className="space-y-2 text-sm leading-relaxed text-on-surface-variant">
                    <p><span className="font-bold text-white">Suitable for:</span> {pkg.suitableFor}</p>
                    <p><span className="font-bold text-white">Highlights:</span> {pkg.highlights.join(', ')}</p>
                    <p><span className="font-bold text-white">Inclusions:</span> {pkg.inclusions.join(', ')}</p>
                    <p><span className="font-bold text-white">Exclusions:</span> {pkg.exclusions.join(', ')}</p>
                    <p><span className="font-bold text-white">Pricing:</span> {pkg.priceNote}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      className="w-full rounded-xl bg-primary-container px-5 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
                      onClick={() => applyPackageToForm(pkg)}
                      type="button"
                    >
                      Get Quote
                    </button>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link
                        className="flex-1 rounded-xl border border-white/10 px-5 py-3 text-center text-sm font-bold text-white transition-all hover:border-secondary hover:bg-white/5"
                        to={`/packages/${pkg.slug}`}
                      >
                        View Details
                      </Link>
                      <a
                        className="flex-1 rounded-xl border border-secondary px-5 py-3 text-center text-sm font-bold text-secondary transition-all hover:bg-secondary/10"
                        href={buildWhatsAppLink({ phone: DEFAULT_WHATSAPP_PHONE, message: pkg.whatsappMessage })}
                        rel="noreferrer"
                        target="_blank"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {renderSectionIntro(
            'Destination Highlights',
            'Places Often Included in Enquiry Planning',
            'Destination highlights can help you describe the kind of tour you want, even if you need a custom route or timing.'
          )}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {destinationHighlights.map((item) => (
              <article key={item.name} className="overflow-hidden rounded-[24px] border border-white/10 bg-surface-container">
                <img alt={item.name} className="h-48 w-full object-cover" decoding="async" height="432" loading="lazy" src={item.image} width="900" />
                <div className="space-y-4 p-6">
                  <h3 className="font-headline text-2xl font-bold text-white">{item.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{item.location}</p>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{item.shortDescription}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[11px] font-bold text-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white transition-all hover:border-secondary hover:bg-white/5"
                      onClick={() => applyDestinationToForm(item)}
                      type="button"
                    >
                      Use in Enquiry
                    </button>
                    <a
                      className="rounded-xl border border-secondary px-4 py-3 text-center text-sm font-bold text-secondary transition-all hover:bg-secondary/10"
                      href={buildWhatsAppLink({ phone: DEFAULT_WHATSAPP_PHONE, message: item.ctaMessage })}
                      rel="noreferrer"
                      target="_blank"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {renderSectionIntro(
            'Sample Itinerary',
            'How a Manual Plan Can Be Shaped',
            'These are example itinerary blocks, not fixed promises. The final plan changes based on dates, interests, route, and availability.'
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {itineraryBlocks.map((item) => (
              <article key={item.title} className="glass-card rounded-[24px] p-6">
                <h3 className="font-headline text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-24 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <article className="rounded-[28px] border border-white/10 bg-surface-container p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Inclusions</p>
            <h3 className="mt-4 font-headline text-3xl font-bold text-white">What Usually Gets Reviewed</h3>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-on-surface-variant">
              <li>Tour route and destination planning</li>
              <li>Cab requirement discussion</li>
              <li>Stay style or hotel level preference</li>
              <li>Budget and group-size review</li>
            </ul>
          </article>
          <article className="rounded-[28px] border border-white/10 bg-surface-container p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Exclusions</p>
            <h3 className="mt-4 font-headline text-3xl font-bold text-white">What Is Not Auto-Included</h3>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-on-surface-variant">
              <li>Final confirmed pricing before review</li>
              <li>Entry tickets or paid activities unless discussed</li>
              <li>Hotel or vehicle confirmation without manual follow-up</li>
              <li>Online payment or instant confirmation in this phase</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto max-w-5xl">
          {renderSectionIntro(
            'FAQ',
            'Tour Package Questions',
            'A few quick answers about custom packages, pricing, and what happens after you submit the form.'
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

      <section className="bg-background px-6 pb-24 pt-8 md:px-8">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,73,219,0.12),rgba(239,191,4,0.08))] p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Need Something More Flexible?</p>
              <h2 className="mt-4 font-headline text-4xl font-bold text-white">Use WhatsApp for a Custom Package Conversation</h2>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
                If you want a custom route, different mix of destinations, or a special travel plan, message directly and then continue with the full enquiry form.
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
                href={genericTourWhatsApp}
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
