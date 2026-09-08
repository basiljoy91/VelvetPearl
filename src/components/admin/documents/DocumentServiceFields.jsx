import React from 'react';

export const SERVICE_OPTIONS = [
  { value: 'cab', label: 'Cab / Taxi' },
  { value: 'room', label: 'Room / Stay' },
  { value: 'tour', label: 'Tour Package' },
  { value: 'custom', label: 'Custom / Event Travel' },
  { value: 'general', label: 'General Travel Service' },
];

export const normalizeServiceType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (['event', 'custom_trip'].includes(normalized)) return 'custom';
  return SERVICE_OPTIONS.some((option) => option.value === normalized) ? normalized : 'general';
};

export const getServiceLabel = (value) => (
  SERVICE_OPTIONS.find((option) => option.value === normalizeServiceType(value))?.label || 'Travel Service'
);

const inputClassName = 'mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#EFBF04]/50';
const labelClassName = 'text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500';

function Field({ label, value, onChange, type = 'text', placeholder = '', className = '', rows }) {
  const common = {
    className: inputClassName,
    value: value || '',
    onChange: (event) => onChange(event.target.value),
    placeholder,
  };

  return (
    <div className={className}>
      <label className={labelClassName}>{label}</label>
      {rows ? <textarea {...common} rows={rows} /> : <input {...common} type={type} />}
    </div>
  );
}

export default function DocumentServiceFields({
  draft,
  onFieldChange,
  onDetailChange,
  documentType,
}) {
  const serviceType = normalizeServiceType(draft.service_type);
  const details = draft.service_details_json || {};
  const isInvoice = documentType === 'invoice';
  const summaryField = isInvoice ? 'trip_details' : 'service_summary';
  const vehicleField = isInvoice ? 'vehicle_details' : 'vehicle_type';

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.025] p-4 md:p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#EFBF04]">Service details</p>
          <h3 className="mt-1 text-lg font-semibold text-white">What is this document for?</h3>
        </div>
        <div className="w-full md:w-72">
          <label className={labelClassName}>Service category</label>
          <select
            className={inputClassName}
            value={serviceType}
            onChange={(event) => onFieldChange('service_type', event.target.value)}
          >
            {SERVICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#0A0A0A]">{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {serviceType === 'cab' && (
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Field label="Pickup address" value={draft.pickup} onChange={(value) => onFieldChange('pickup', value)} className="lg:col-span-2" />
          <Field label="Drop address" value={draft.dropoff} onChange={(value) => onFieldChange('dropoff', value)} className="lg:col-span-2" />
          <Field label="Journey date" type="date" value={details.journey_date || details.pickup_date} onChange={(value) => onDetailChange('journey_date', value)} />
          <Field label="Pickup time" type="time" value={details.pickup_time} onChange={(value) => onDetailChange('pickup_time', value)} />
          <Field label="Trip type" value={details.trip_type} onChange={(value) => onDetailChange('trip_type', value)} placeholder="One way, round trip, local" />
          <Field label="Passengers" type="number" value={details.passengers} onChange={(value) => onDetailChange('passengers', value)} />
          <Field label="Vehicle" value={draft[vehicleField]} onChange={(value) => onFieldChange(vehicleField, value)} placeholder="Sedan, SUV, Tempo Traveller" />
          {isInvoice && <Field label="Driver" value={draft.driver_details} onChange={(value) => onFieldChange('driver_details', value)} />}
          <Field label="Distance (km)" type="number" value={details.distance_km || details.route_estimate?.distance_km} onChange={(value) => onDetailChange('distance_km', value)} />
          <Field label="Duration" value={details.duration || details.route_estimate?.duration_text} onChange={(value) => onDetailChange('duration', value)} placeholder="3 hr 20 min" />
          <div className="md:col-span-2 lg:col-span-4">
            <Field label="Trip summary" rows={2} value={draft[summaryField]} onChange={(value) => onFieldChange(summaryField, value)} placeholder="Route, stops, inclusions, or confirmed timing" />
          </div>
        </div>
      )}

      {serviceType === 'room' && (
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Field label="Hotel / Property" value={details.property_name || details.hotel_name} onChange={(value) => onDetailChange('property_name', value)} className="lg:col-span-2" />
          <Field label="Destination" value={details.destination || details.location_preference} onChange={(value) => onDetailChange('destination', value)} className="lg:col-span-2" />
          <Field label="Check-in" type="date" value={details.check_in} onChange={(value) => onDetailChange('check_in', value)} />
          <Field label="Check-out" type="date" value={details.check_out} onChange={(value) => onDetailChange('check_out', value)} />
          <Field label="Guests" type="number" value={details.guests} onChange={(value) => onDetailChange('guests', value)} />
          <Field label="Rooms" type="number" value={details.room_count} onChange={(value) => onDetailChange('room_count', value)} />
          <Field label="Room type" value={details.room_type} onChange={(value) => onDetailChange('room_type', value)} placeholder="Deluxe, suite, family room" />
          <Field label="Meal plan" value={details.meal_plan} onChange={(value) => onDetailChange('meal_plan', value)} placeholder="Breakfast included" />
          <Field label="Confirmation no." value={details.confirmation_number} onChange={(value) => onDetailChange('confirmation_number', value)} />
          <div className="md:col-span-2 lg:col-span-4">
            <Field label="Stay summary" rows={2} value={draft[summaryField]} onChange={(value) => onFieldChange(summaryField, value)} placeholder="Property, room inclusions, and stay conditions" />
          </div>
        </div>
      )}

      {serviceType === 'tour' && (
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Field label="Package / Tour name" value={details.package_name} onChange={(value) => onDetailChange('package_name', value)} className="lg:col-span-2" />
          <Field label="Destination(s)" value={details.destination} onChange={(value) => onDetailChange('destination', value)} className="lg:col-span-2" />
          <Field label="Start date" type="date" value={details.start_date || details.travel_window_start} onChange={(value) => onDetailChange('start_date', value)} />
          <Field label="End date" type="date" value={details.end_date || details.travel_window_end} onChange={(value) => onDetailChange('end_date', value)} />
          <Field label="Travellers" type="number" value={details.travellers || details.group_size} onChange={(value) => onDetailChange('travellers', value)} />
          <Field label="Duration" value={details.duration} onChange={(value) => onDetailChange('duration', value)} placeholder="5 days / 4 nights" />
          <Field label="Transport" value={details.transport} onChange={(value) => onDetailChange('transport', value)} placeholder="Private cab" />
          <Field label="Accommodation" value={details.accommodation} onChange={(value) => onDetailChange('accommodation', value)} placeholder="3-star hotels" />
          <Field label="Pickup point" value={draft.pickup} onChange={(value) => onFieldChange('pickup', value)} />
          <div className="md:col-span-2 lg:col-span-4">
            <Field label="Tour summary / inclusions" rows={3} value={draft[summaryField]} onChange={(value) => onFieldChange(summaryField, value)} placeholder="Itinerary, inclusions, exclusions, and important notes" />
          </div>
        </div>
      )}

      {serviceType === 'custom' && (
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Field label="Service / Event" value={details.service_name || details.custom_category || details.event_type} onChange={(value) => onDetailChange('service_name', value)} className="lg:col-span-2" />
          <Field label="Location" value={details.location} onChange={(value) => onDetailChange('location', value)} className="lg:col-span-2" />
          <Field label="Service date" type="date" value={details.service_date || details.travel_window_start} onChange={(value) => onDetailChange('service_date', value)} />
          <Field label="Service time" type="time" value={details.service_time} onChange={(value) => onDetailChange('service_time', value)} />
          <Field label="Group size" type="number" value={details.group_size || details.guests} onChange={(value) => onDetailChange('group_size', value)} />
          <Field label="Reference / Venue" value={details.venue_reference} onChange={(value) => onDetailChange('venue_reference', value)} />
          <div className="md:col-span-2 lg:col-span-4">
            <Field label="Scope of service" rows={3} value={draft[summaryField]} onChange={(value) => onFieldChange(summaryField, value)} placeholder="Describe transport, stay, coordination, or other agreed services" />
          </div>
        </div>
      )}

      {serviceType === 'general' && (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Service name" value={details.service_name} onChange={(value) => onDetailChange('service_name', value)} />
          <Field label="Service date" type="date" value={details.service_date} onChange={(value) => onDetailChange('service_date', value)} />
          <div className="md:col-span-2">
            <Field label="Service description" rows={3} value={draft[summaryField]} onChange={(value) => onFieldChange(summaryField, value)} />
          </div>
        </div>
      )}
    </section>
  );
}
