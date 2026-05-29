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

const serviceOptions = [
  'Cab',
  'Room',
  'Tour package',
  'Guide',
  'Airport transfer',
  'Custom planning',
];

export default function EventBooking() {
  const { state } = useLocation();

  const initialFormData = useMemo(() => ({
    customer_name: state?.name || '',
    phone_number: state?.phone || '',
    whatsapp_number: state?.phone || '',
    email: state?.email || '',
    preferred_contact_method: 'whatsapp',
    consent_to_contact: false,
    requirement_type: 'Custom trip',
    destination_or_travel_area: '',
    travel_date_window: '',
    number_of_people: '1',
    services_needed: [],
    approximate_budget: '',
    full_requirement_details: '',
  }), [state?.email, state?.name, state?.phone]);

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
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData((current) => ({
      ...current,
      services_needed: current.services_needed.includes(service)
        ? current.services_needed.filter((item) => item !== service)
        : [...current.services_needed, service],
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      ...validateCommonFields(formData),
    };

    if (!formData.requirement_type) nextErrors.requirement_type = 'Requirement type is required.';
    if (!formData.destination_or_travel_area.trim()) nextErrors.destination_or_travel_area = 'Destination or travel area is required.';
    if (!formData.travel_date_window.trim()) nextErrors.travel_date_window = 'Travel date or window is required.';
    if (!formData.number_of_people || Number(formData.number_of_people) < 1) nextErrors.number_of_people = 'Enter the number of people.';
    if (!formData.full_requirement_details.trim()) nextErrors.full_requirement_details = 'Please share the full requirement details.';

    return nextErrors;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setApiError('');
    setSubmittedEnquiry(null);
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
        service_type: 'custom',
        source_page: 'custom',
        travel_date: formData.travel_date_window,
        requirement_notes: formData.full_requirement_details,
        enquiry_details: {
          custom_category: formData.requirement_type,
          location: formData.destination_or_travel_area,
          travel_window: formData.travel_date_window,
          group_size: formData.number_of_people,
          services_needed: formData.services_needed,
          budget: formData.approximate_budget,
          notes: formData.full_requirement_details,
        },
      });

      setSubmittedEnquiry(createdEnquiry);
    } catch (error) {
      setApiError(error.message || 'Sorry, we could not submit your enquiry. Please try again or contact us on WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const whatsappHref = buildWhatsAppHref(
    `Hi, I submitted an enquiry. My reference ID is ${submittedEnquiry?.reference_id || 'CUSTOM-REF-PENDING'}. Please help me with the next steps.`
  );

  return (
    <FormShell
      aside={(
        <div className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-6">
          <h3 className="font-headline text-2xl text-white">Custom Enquiry Notes</h3>
          <ul className="space-y-3 text-sm text-on-surface-variant">
            <li>Use this form for trip plans that do not fit a standard cab, room, or package request.</li>
            <li>You can mention multiple services in one enquiry.</li>
            <li>Our team will review the requirement manually before sharing options and pricing.</li>
          </ul>
        </div>
      )}
      description="Share your destination, travel window, group size, required services, and full trip brief so we can review the request manually."
      eyebrow="Custom Trip Enquiry"
      title="Build a Custom Travel Request"
    >
      {submittedEnquiry ? (
        <EnquirySuccess
          message="Our team will review your request and contact you shortly with availability and pricing. Final confirmation will happen after manual review."
          onReset={resetForm}
          referenceId={submittedEnquiry.reference_id}
          whatsappHref={whatsappHref}
        />
      ) : (
        <form className="space-y-10" noValidate onSubmit={handleSubmit}>
          {apiError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {apiError}
            </div>
          )}

          <SectionHeading
            description="Tell us how you want us to follow up once we review this custom requirement."
            step="01"
            title="Customer Details"
          />
          <CustomerDetailsFields errors={errors} formData={formData} onChange={handleChange} />

          <SectionHeading
            description="These details help us understand the trip scope and decide what needs to be arranged manually."
            step="02"
            title="Requirement Details"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelClassName}>Requirement Type <span className="text-secondary">*</span></label>
              <select className={inputClassName(errors, 'requirement_type')} name="requirement_type" onChange={handleChange} value={formData.requirement_type}>
                <option value="Custom trip">Custom trip</option>
                <option value="Family trip">Family trip</option>
                <option value="Group trip">Group trip</option>
                <option value="Corporate trip">Corporate trip</option>
                <option value="Event travel">Event travel</option>
                <option value="Other">Other</option>
              </select>
              <FieldError error={errors.requirement_type} />
            </div>
            <div>
              <label className={labelClassName}>Number of People <span className="text-secondary">*</span></label>
              <input className={inputClassName(errors, 'number_of_people')} min="1" name="number_of_people" onChange={handleChange} type="number" value={formData.number_of_people} />
              <FieldError error={errors.number_of_people} />
            </div>
            <div>
              <label className={labelClassName}>Destination or Travel Area <span className="text-secondary">*</span></label>
              <input className={inputClassName(errors, 'destination_or_travel_area')} name="destination_or_travel_area" onChange={handleChange} type="text" value={formData.destination_or_travel_area} />
              <FieldError error={errors.destination_or_travel_area} />
            </div>
            <div>
              <label className={labelClassName}>Travel Date / Window <span className="text-secondary">*</span></label>
              <input className={inputClassName(errors, 'travel_date_window')} name="travel_date_window" onChange={handleChange} placeholder="10 Jun to 14 Jun 2026 / Flexible in July" type="text" value={formData.travel_date_window} />
              <FieldError error={errors.travel_date_window} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClassName}>Services Needed</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {serviceOptions.map((service) => (
                  <label
                    key={service}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${
                      formData.services_needed.includes(service)
                        ? 'border-secondary bg-secondary/10 text-white'
                        : 'border-white/10 bg-black/20 text-on-surface-variant'
                    }`}
                  >
                    <input
                      checked={formData.services_needed.includes(service)}
                      className="sr-only"
                      onChange={() => handleServiceToggle(service)}
                      type="checkbox"
                    />
                    <span>{service}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelClassName}>Approximate Budget</label>
              <input className={inputClassName(errors, 'approximate_budget')} name="approximate_budget" onChange={handleChange} type="text" value={formData.approximate_budget} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClassName}>Full Requirement Details <span className="text-secondary">*</span></label>
              <textarea className={inputClassName(errors, 'full_requirement_details')} name="full_requirement_details" onChange={handleChange} rows="5" value={formData.full_requirement_details}></textarea>
              <FieldError error={errors.full_requirement_details} />
            </div>
          </div>

          <button className="w-full rounded-xl bg-primary-container px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all hover:brightness-110 disabled:opacity-60" disabled={isLoading} type="submit">
            {isLoading ? 'Submitting...' : 'Submit Custom Enquiry'}
          </button>
        </form>
      )}
    </FormShell>
  );
}
