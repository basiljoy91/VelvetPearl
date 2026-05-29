import React, { useMemo, useState } from 'react';
import { addEnquiry } from '../../services/dataService';
import {
  buildWhatsAppHref,
  CustomerDetailsFields,
  EnquirySuccess,
  FieldError,
  SectionHeading,
  inputClassName,
  labelClassName,
  validateCommonFields,
} from './EnquiryFormParts';

function createInitialFormData(packageData) {
  return {
    customer_name: '',
    phone_number: '',
    whatsapp_number: '',
    email: '',
    preferred_contact_method: 'whatsapp',
    consent_to_contact: false,
    destination_package_name: packageData.title,
    travel_start_date: '',
    travel_end_date: '',
    adults: '2',
    children: '0',
    trip_duration: packageData.duration,
    pickup_city_location: '',
    cab_required: 'Not sure',
    hotel_level: 'Not sure',
    budget_range: '',
    notes_special_requests: '',
  };
}

export default function TourPackageEnquiryForm({ packageData }) {
  const initialFormData = useMemo(() => createInitialFormData(packageData), [packageData]);
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

  const validateForm = () => {
    const nextErrors = {
      ...validateCommonFields(formData),
    };

    if (!formData.travel_start_date) nextErrors.travel_start_date = 'Travel start date is required.';
    if (!formData.travel_end_date) nextErrors.travel_end_date = 'Travel end date is required.';
    if (formData.travel_start_date && formData.travel_end_date && formData.travel_end_date < formData.travel_start_date) {
      nextErrors.travel_end_date = 'Travel end date must be after the start date.';
    }
    if (!formData.pickup_city_location.trim()) nextErrors.pickup_city_location = 'Pickup city or location is required.';
    if (!formData.adults || Number(formData.adults) < 1) nextErrors.adults = 'At least one adult is required.';

    return nextErrors;
  };

  const resetForm = () => {
    setFormData(createInitialFormData(packageData));
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
        service_type: 'tour',
        source_page: `package:${packageData.slug}`,
        travel_date: formData.travel_start_date,
        requirement_notes: formData.notes_special_requests || `${packageData.title} package enquiry`,
        enquiry_details: {
          destination: packageData.title,
          package_name: packageData.title,
          travel_window_start: formData.travel_start_date,
          travel_window_end: formData.travel_end_date,
          adults: formData.adults,
          children: formData.children,
          group_size: String(Number(formData.adults) + Number(formData.children || 0)),
          duration: formData.trip_duration,
          pickup_city: formData.pickup_city_location,
          cab_required: formData.cab_required,
          hotel_preference: formData.hotel_level,
          budget: formData.budget_range,
          must_visit_places: packageData.highlights.join(', '),
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

  const successWhatsAppHref = buildWhatsAppHref(
    `Hi, I submitted an enquiry for ${packageData.title}. My reference ID is ${submittedEnquiry?.reference_id || 'TOUR-REF-PENDING'}. Please help me with the next steps.`
  );

  if (submittedEnquiry) {
    return (
      <EnquirySuccess
        message="Our team will review your request and contact you shortly with availability and pricing. Final confirmation will happen after manual review."
        onReset={resetForm}
        referenceId={submittedEnquiry.reference_id}
        whatsappHref={successWhatsAppHref}
      />
    );
  }

  return (
    <form className="space-y-8" noValidate onSubmit={handleSubmit}>
      {apiError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {apiError}
        </div>
      )}

      <SectionHeading
        description="Use this form to request this package or a close variation of it. Final route, timing, and pricing are always reviewed manually."
        step="01"
        title="Customer Details"
      />
      <CustomerDetailsFields errors={errors} formData={formData} onChange={handleChange} />

      <SectionHeading
        description="These details help us turn the package idea into a usable manual enquiry for date, group size, and travel support."
        step="02"
        title="Package Enquiry"
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className={labelClassName}>Package</label>
          <input className={inputClassName({}, 'destination_package_name')} disabled type="text" value={formData.destination_package_name} />
        </div>
        <div>
          <label className={labelClassName}>Trip Duration</label>
          <input className={inputClassName({}, 'trip_duration')} disabled type="text" value={formData.trip_duration} />
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
          <label className={labelClassName}>Adults <span className="text-secondary">*</span></label>
          <input className={inputClassName(errors, 'adults')} min="1" name="adults" onChange={handleChange} type="number" value={formData.adults} />
          <FieldError error={errors.adults} />
        </div>
        <div>
          <label className={labelClassName}>Children</label>
          <input className={inputClassName(errors, 'children')} min="0" name="children" onChange={handleChange} type="number" value={formData.children} />
        </div>
        <div>
          <label className={labelClassName}>Pickup City / Location <span className="text-secondary">*</span></label>
          <input className={inputClassName(errors, 'pickup_city_location')} name="pickup_city_location" onChange={handleChange} type="text" value={formData.pickup_city_location} />
          <FieldError error={errors.pickup_city_location} />
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
        <div>
          <label className={labelClassName}>Approximate Budget</label>
          <input className={inputClassName(errors, 'budget_range')} name="budget_range" onChange={handleChange} placeholder="Share your budget range if ready" type="text" value={formData.budget_range} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClassName}>Notes / Special Requests</label>
          <textarea className={inputClassName(errors, 'notes_special_requests')} name="notes_special_requests" onChange={handleChange} rows="4" value={formData.notes_special_requests}></textarea>
        </div>
      </div>

      <button className="w-full rounded-xl bg-primary-container px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all hover:brightness-110 disabled:opacity-60" disabled={isLoading} type="submit">
        {isLoading ? 'Submitting...' : 'Submit Tour Enquiry'}
      </button>
    </form>
  );
}
