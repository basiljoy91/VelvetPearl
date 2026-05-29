import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { addEnquiry } from '../services/dataService';
import {
  buildWhatsAppHref,
  CustomerDetailsFields,
  EnquirySuccess,
  FieldError,
  FormShell,
  inputClassName,
  labelClassName,
  SectionHeading,
  validateCommonFields,
} from '../components/forms/EnquiryFormParts';
import { buildWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../utils/whatsapp';

const parseRoute = (route = '') => {
  const [pickup = '', drop = ''] = String(route).split('→').map((item) => item.trim());
  return { pickup, drop };
};

const tripTypes = [
  { title: 'Airport pickup / drop', description: 'Useful for arrivals, departures, and planned hotel transfers.', icon: 'flight_land' },
  { title: 'Local sightseeing', description: 'For flexible sightseeing around Chennai and nearby South India routes.', icon: 'landscape' },
  { title: 'Outstation trip', description: 'For longer routes that need travel-time and vehicle review.', icon: 'route' },
  { title: 'Family / group travel', description: 'For larger groups that may need more seats or luggage space.', icon: 'group' },
  { title: 'One-way transfer', description: 'For simple point-to-point cab requirements.', icon: 'swap_horiz' },
  { title: 'Round trip', description: 'For travel plans that need return timing and route discussion.', icon: 'sync_alt' },
];

const vehicleCategories = [
  { title: 'Sedan', seats: 'Up to 4 passengers', note: 'Suitable for airport transfers and small family travel.', luggage: 'Light to medium luggage' },
  { title: 'SUV', seats: 'Up to 6 or 7 passengers', note: 'Useful for families, groups, and hill-route travel.', luggage: 'Better for mixed luggage needs' },
  { title: 'Tempo Traveller', seats: 'Group seating', note: 'Useful for group trips and multi-person travel planning.', luggage: 'Share luggage details in the enquiry' },
  { title: 'Local transfer vehicles', seats: 'Based on requirement', note: 'Vehicle type can vary by route, timing, and availability.', luggage: 'Availability confirmed after enquiry' },
];

const howItWorks = [
  'Submit your cab requirement',
  'We check route, timing, and availability',
  'We contact you with pricing on WhatsApp or phone',
  'You confirm after discussion',
  'Driver and vehicle are assigned manually',
];

const faqs = [
  {
    question: 'Is my cab enquiry a confirmed booking?',
    answer: 'No. Submit your cab requirement and we will check availability before sharing pricing and confirmation.',
  },
  {
    question: 'Can I ask for airport pickup or drop?',
    answer: 'Yes. You can submit airport pickup or airport drop requirements through this page.',
  },
  {
    question: 'Can I request a specific vehicle type?',
    answer: 'Yes. Share your preferred vehicle category in the form. Final option depends on availability and route suitability.',
  },
  {
    question: 'Do you support family or group travel?',
    answer: 'Yes. Share passenger count and luggage details so we can review the right option manually.',
  },
];

const renderSectionIntro = (eyebrow, title, description) => (
  <div className="mb-10 max-w-3xl space-y-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>
    <h2 className="font-headline text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h2>
    <p className="text-lg leading-relaxed text-on-surface-variant">{description}</p>
  </div>
);

export default function CabBooking() {
  const { state } = useLocation();
  const routeDefaults = parseRoute(state?.route);

  const initialFormData = useMemo(() => ({
    customer_name: state?.name || '',
    phone_number: state?.phone || '',
    whatsapp_number: state?.phone || '',
    email: state?.email || '',
    preferred_contact_method: 'whatsapp',
    consent_to_contact: false,
    trip_type: 'local_sightseeing',
    pickup_location: routeDefaults.pickup,
    drop_location: routeDefaults.drop,
    pickup_date: '',
    pickup_time: '',
    return_date: '',
    return_time: '',
    passengers: '1',
    luggage_details: '',
    vehicle_preference: 'not_sure',
    child_seat_required: 'No',
    special_requests: '',
  }), [routeDefaults.drop, routeDefaults.pickup, state?.email, state?.name, state?.phone]);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState(null);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'phone_number' && !current.whatsapp_number ? { whatsapp_number: value } : {}),
      ...(name === 'trip_type' && value !== 'round_trip' ? { return_date: '', return_time: '' } : {}),
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      ...validateCommonFields(formData),
    };

    if (!formData.trip_type) nextErrors.trip_type = 'Trip type is required.';
    if (!formData.pickup_location.trim()) nextErrors.pickup_location = 'Pickup location is required.';
    if (!formData.drop_location.trim()) nextErrors.drop_location = 'Drop location is required.';
    if (!formData.pickup_date) nextErrors.pickup_date = 'Pickup date is required.';
    if (!formData.pickup_time) nextErrors.pickup_time = 'Pickup time is required.';
    if (formData.trip_type === 'round_trip' && !formData.return_date) nextErrors.return_date = 'Return date is required for round trips.';
    if (formData.trip_type === 'round_trip' && !formData.return_time) nextErrors.return_time = 'Return time is required for round trips.';
    if (!formData.passengers || Number(formData.passengers) < 1) nextErrors.passengers = 'Enter the number of passengers.';

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

    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);

    try {
      const createdEnquiry = await addEnquiry({
        customer_name: formData.customer_name,
        phone_number: formData.phone_number,
        whatsapp_number: formData.whatsapp_number,
        email: formData.email,
        preferred_contact_method: formData.preferred_contact_method,
        consent_to_contact: formData.consent_to_contact,
        service_type: 'cab',
        source_page: 'cab',
        travel_date: formData.pickup_date,
        travel_time: formData.pickup_time,
        requirement_notes: formData.special_requests || `${formData.pickup_location} to ${formData.drop_location}`,
        enquiry_details: {
          trip_type: formData.trip_type,
          pickup: formData.pickup_location,
          dropoff: formData.drop_location,
          pickup_date: formData.pickup_date,
          pickup_time: formData.pickup_time,
          return_date: formData.return_date,
          return_time: formData.return_time,
          passengers: formData.passengers,
          luggage: formData.luggage_details,
          vehicle_preference: formData.vehicle_preference,
          child_seat_required: formData.child_seat_required,
          notes: formData.special_requests,
        },
      });

      setSubmittedEnquiry(createdEnquiry);
    } catch (error) {
      setApiError(error.message || 'Sorry, we could not submit your enquiry. Please try again or contact us on WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const genericCabWhatsApp = buildWhatsAppLink({
    phone: DEFAULT_WHATSAPP_PHONE,
    message: 'Hi, I am interested in booking a cab. Please help me with availability and pricing.',
  });

  const successWhatsAppHref = buildWhatsAppHref(
    `Hi, I submitted an enquiry. My reference ID is ${submittedEnquiry?.reference_id || 'CAB-REF-PENDING'}. Please help me with the next steps.`
  );

  return (
    <>
      <FormShell
        aside={(
          <div className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-6">
            <h3 className="font-headline text-2xl text-white">Cab Support</h3>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Submit your cab requirement. We&apos;ll check availability and contact you with pricing.
            </p>
            <a
              className="inline-flex rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
              href={genericCabWhatsApp}
              rel="noreferrer"
              target="_blank"
            >
              Chat on WhatsApp
            </a>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li>Airport transfers, sightseeing, and outstation travel can all be reviewed from one form.</li>
              <li>Vehicle availability depends on route, timing, passenger count, and luggage details.</li>
              <li>Final confirmation happens only after manual review.</li>
            </ul>
          </div>
        )}
        description="Share your trip type, route, timing, and passenger details so we can review the requirement manually and contact you with availability and pricing."
        eyebrow="Cab Booking Enquiry"
        title="Travel with the Right Cab Support"
      >
        {submittedEnquiry ? (
          <EnquirySuccess
            message="Our team will review your request and contact you shortly with availability and pricing. Final confirmation will happen after manual review."
            onReset={resetForm}
            referenceId={submittedEnquiry.reference_id}
            whatsappHref={successWhatsAppHref}
          />
        ) : (
          <form className="space-y-10" noValidate onSubmit={handleSubmit}>
            {apiError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {apiError}
              </div>
            )}

            <SectionHeading
              description="Tell us how you want to be contacted so we can respond to this cab enquiry quickly."
              step="01"
              title="Customer Details"
            />
            <CustomerDetailsFields errors={errors} formData={formData} onChange={handleChange} />

            <SectionHeading
              description="These details help us check route suitability, timing, and the best available vehicle category."
              step="02"
              title="Cab Enquiry Form"
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className={labelClassName}>Trip Type <span className="text-secondary">*</span></label>
                <select className={inputClassName(errors, 'trip_type')} name="trip_type" onChange={handleChange} value={formData.trip_type}>
                  <option value="local_sightseeing">Local sightseeing</option>
                  <option value="airport_pickup">Airport pickup</option>
                  <option value="airport_drop">Airport drop</option>
                  <option value="outstation">Outstation</option>
                  <option value="one_way_transfer">One-way transfer</option>
                  <option value="round_trip">Round trip</option>
                </select>
                <FieldError error={errors.trip_type} />
              </div>
              <div>
                <label className={labelClassName}>Vehicle Preference <span className="text-secondary">*</span></label>
                <select className={inputClassName(errors, 'vehicle_preference')} name="vehicle_preference" onChange={handleChange} value={formData.vehicle_preference}>
                  <option value="hatchback">Hatchback</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="tempo_traveller">Tempo traveller</option>
                  <option value="not_sure">Not sure</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}>Pickup Location <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'pickup_location')} name="pickup_location" onChange={handleChange} type="text" value={formData.pickup_location} />
                <FieldError error={errors.pickup_location} />
              </div>
              <div>
                <label className={labelClassName}>Drop Location <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'drop_location')} name="drop_location" onChange={handleChange} type="text" value={formData.drop_location} />
                <FieldError error={errors.drop_location} />
              </div>
              <div>
                <label className={labelClassName}>Pickup Date <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'pickup_date')} name="pickup_date" onChange={handleChange} type="date" value={formData.pickup_date} />
                <FieldError error={errors.pickup_date} />
              </div>
              <div>
                <label className={labelClassName}>Pickup Time <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'pickup_time')} name="pickup_time" onChange={handleChange} type="time" value={formData.pickup_time} />
                <FieldError error={errors.pickup_time} />
              </div>
              {formData.trip_type === 'round_trip' && (
                <>
                  <div>
                    <label className={labelClassName}>Return Date <span className="text-secondary">*</span></label>
                    <input className={inputClassName(errors, 'return_date')} name="return_date" onChange={handleChange} type="date" value={formData.return_date} />
                    <FieldError error={errors.return_date} />
                  </div>
                  <div>
                    <label className={labelClassName}>Return Time <span className="text-secondary">*</span></label>
                    <input className={inputClassName(errors, 'return_time')} name="return_time" onChange={handleChange} type="time" value={formData.return_time} />
                    <FieldError error={errors.return_time} />
                  </div>
                </>
              )}
              <div>
                <label className={labelClassName}>Number of Passengers <span className="text-secondary">*</span></label>
                <input className={inputClassName(errors, 'passengers')} min="1" name="passengers" onChange={handleChange} type="number" value={formData.passengers} />
                <FieldError error={errors.passengers} />
              </div>
              <div>
                <label className={labelClassName}>Luggage Details</label>
                <input className={inputClassName(errors, 'luggage_details')} name="luggage_details" onChange={handleChange} type="text" value={formData.luggage_details} />
              </div>
              <div>
                <label className={labelClassName}>Child Seat Required</label>
                <select className={inputClassName(errors, 'child_seat_required')} name="child_seat_required" onChange={handleChange} value={formData.child_seat_required}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>Special Requests</label>
                <textarea className={inputClassName(errors, 'special_requests')} name="special_requests" onChange={handleChange} rows="4" value={formData.special_requests}></textarea>
              </div>
            </div>

            <button className="w-full rounded-xl bg-primary-container px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all hover:brightness-110 disabled:opacity-60" disabled={isLoading} type="submit">
              {isLoading ? 'Submitting...' : 'Submit Cab Enquiry'}
            </button>
          </form>
        )}
      </FormShell>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {renderSectionIntro(
            'Trip Types',
            'Cab Trip Types We Review',
            'These are common request types you can submit through the cab enquiry form. Final vehicle and schedule details are shared only after manual review.'
          )}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tripTypes.map((item) => (
              <article key={item.title} className="rounded-[24px] border border-white/10 bg-black/20 p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
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
            'Vehicle Categories',
            'Vehicle Options Based on Availability',
            'Share your group size and luggage details so we can check the most suitable option manually.'
          )}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {vehicleCategories.map((item) => (
              <article key={item.title} className="rounded-[24px] border border-white/10 bg-surface-container p-6">
                <h3 className="font-headline text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm font-semibold text-secondary">{item.seats}</p>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{item.note}</p>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{item.luggage}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-secondary">Availability confirmed after enquiry</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {renderSectionIntro(
            'How It Works',
            'How Cab Enquiry Works',
            'This page collects your requirement first. Pricing and confirmation are discussed only after we review the trip manually.'
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
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <article className="rounded-[28px] border border-white/10 bg-surface-container p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Airport Transfer Information</p>
            <h3 className="mt-4 font-headline text-3xl font-bold text-white">Airport Pickup and Drop Support</h3>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              Share your airport, pickup timing, passenger count, and luggage details. We&apos;ll review the route and contact you with the best available option and pricing.
            </p>
          </article>
          <article className="rounded-[28px] border border-white/10 bg-surface-container p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Local Sightseeing Information</p>
            <h3 className="mt-4 font-headline text-3xl font-bold text-white">Sightseeing Around Chennai and South India</h3>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              For local sightseeing, tell us your starting point, preferred stops, trip date, and how many people are travelling. We&apos;ll review availability and suggest the next step manually.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto max-w-5xl">
          {renderSectionIntro(
            'FAQ',
            'Cab Booking Questions',
            'A few quick answers to help customers understand how cab enquiry, pricing, and confirmation work.'
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
        <div className="mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,73,219,0.12),rgba(255,255,255,0.06))] p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Need Help Fast?</p>
              <h2 className="mt-4 font-headline text-4xl font-bold text-white">Use WhatsApp for a Quick Cab Conversation</h2>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
                If you already know your route or want help before filling the form, you can message directly and we&apos;ll guide you with the next steps.
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
                href={genericCabWhatsApp}
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
