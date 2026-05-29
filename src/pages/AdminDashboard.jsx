import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  addBooking,
  addDriver,
  addFleet,
  archiveEnquiryRecord,
  assignDriverToEnquiry,
  assignPackageToEnquiry,
  assignRoomToEnquiry,
  assignVehicleToEnquiry,
  getDrivers,
  getEnquiries,
  getEnquiryById,
  getFleet,
  updateEnquiry,
  updateEnquiryNotes,
  updateEnquiryQuote,
  updateEnquiryStatus,
} from '../services/dataService';
import AdminForms from '../components/admin/AdminForms';
import {
  changePassword,
  generateAdminSetupKey,
  getAdminProfile,
  logoutAdmin,
} from '../services/authService';
import { buildWhatsAppLink } from '../utils/whatsapp';

const STATUS_OPTIONS = [
  'New',
  'Contacted',
  'Quoted',
  'Awaiting Customer',
  'Assigned',
  'Confirmed',
  'Completed',
  'Rejected',
  'Cancelled',
];

const TYPE_OPTIONS = ['all', 'cab', 'room', 'tour', 'general', 'custom'];

const TYPE_LABELS = {
  cab: 'Cab enquiries',
  room: 'Room enquiries',
  tour: 'Tour package enquiries',
  general: 'General enquiries',
  custom: 'Custom trip requests',
};

const inputClassName = 'w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#EFBF04]/50';
const labelClassName = 'text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500';

const getStatusClasses = (status) => {
  switch (status) {
    case 'Completed':
    case 'Confirmed':
      return 'bg-emerald-500/15 text-emerald-300';
    case 'Assigned':
      return 'bg-sky-500/15 text-sky-300';
    case 'Quoted':
    case 'Awaiting Customer':
      return 'bg-violet-500/15 text-violet-200';
    case 'Contacted':
      return 'bg-amber-500/15 text-amber-300';
    case 'Rejected':
    case 'Cancelled':
      return 'bg-rose-500/15 text-rose-300';
    case 'New':
      return 'bg-white/10 text-gray-200';
    default:
      return 'bg-white/10 text-gray-300';
  }
};

const parseEnquiryDetails = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const getEnquiryType = (enquiry = {}) => String(enquiry.enquiry_type || enquiry.service_type || 'general').toLowerCase();
const getCustomerName = (enquiry = {}) => enquiry.customer_name || enquiry.customer || 'Unknown customer';
const getPhoneNumber = (enquiry = {}) => enquiry.phone_number || enquiry.phone || 'Not shared';
const getWhatsAppNumber = (enquiry = {}) => enquiry.whatsapp_number || enquiry.phone_number || enquiry.phone || '';

const getServiceLabel = (enquiry = {}) => {
  const type = getEnquiryType(enquiry);
  return {
    cab: 'Cab booking enquiry',
    room: 'Room/stay enquiry',
    tour: 'Tour package enquiry',
    custom: 'Custom trip enquiry',
    general: 'General travel enquiry',
  }[type] || 'Travel enquiry';
};

const formatDate = (value) => {
  if (!value) return 'Not shared';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (value) => {
  if (!value) return 'Not shared';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDateTimeInput = (value) => (value ? String(value).slice(0, 16) : '');

const getTravelDateLabel = (enquiry = {}) => enquiry.travel_date || parseEnquiryDetails(enquiry.enquiry_details || enquiry.service_details_json).pickup_date || '';

const getAssignedResourceSummary = (enquiry = {}) => {
  const parts = [];

  if (enquiry.assigned_driver_name) {
    parts.push(`Driver: ${enquiry.assigned_driver_name}`);
  } else if (enquiry.assigned_driver_id) {
    parts.push(`Driver: ${enquiry.assigned_driver_id}`);
  }

  if (enquiry.assigned_vehicle_id) parts.push(`Vehicle: ${enquiry.assigned_vehicle_id}`);
  if (enquiry.assigned_room_id) parts.push(`Room: ${enquiry.assigned_room_id}`);
  if (enquiry.assigned_package_id) parts.push(`Package: ${enquiry.assigned_package_id}`);
  if (enquiry.assigned_hotel_option) parts.push(`Stay: ${enquiry.assigned_hotel_option}`);
  if (enquiry.assigned_owner_id) parts.push(`Owner: ${enquiry.assigned_owner_id}`);

  return parts.length ? parts.join(' • ') : 'Pending assignment';
};

const summarizeEnquiry = (enquiry = {}) => {
  const details = parseEnquiryDetails(enquiry.enquiry_details || enquiry.service_details_json);
  const type = getEnquiryType(enquiry);

  switch (type) {
    case 'cab':
      return [details.trip_type, details.pickup, details.dropoff, details.passengers && `${details.passengers} passengers`].filter(Boolean).join(' • ');
    case 'room':
      return [details.destination_city, details.check_in, details.check_out, details.room_type].filter(Boolean).join(' • ');
    case 'tour':
      return [details.destination, details.travel_window_start, details.travel_window_end, details.group_size && `${details.group_size} travellers`].filter(Boolean).join(' • ');
    case 'custom':
      return [details.custom_category, details.location, details.travel_window, details.group_size && `${details.group_size} people`].filter(Boolean).join(' • ');
    default:
      return details.message || details.topic || enquiry.requirement_notes || 'General travel enquiry';
  }
};

const getServiceDetailEntries = (enquiry = {}) => {
  const details = parseEnquiryDetails(enquiry.enquiry_details || enquiry.service_details_json);
  const type = getEnquiryType(enquiry);

  switch (type) {
    case 'cab':
      return [
        ['Trip type', details.trip_type || 'Not shared'],
        ['Pickup location', details.pickup || 'Not shared'],
        ['Drop location', details.dropoff || 'Not shared'],
        ['Pickup date', details.pickup_date || enquiry.travel_date || 'Not shared'],
        ['Pickup time', details.pickup_time || enquiry.travel_time || 'Not shared'],
        ['Return date', details.return_date || 'Not shared'],
        ['Return time', details.return_time || 'Not shared'],
        ['Passengers', details.passengers || 'Not shared'],
        ['Luggage', details.luggage || 'Not shared'],
        ['Vehicle preference', details.vehicle_preference || 'Not shared'],
        ['Child seat required', details.child_seat_required || 'Not shared'],
        ['Special requests', details.special_requests || 'Not shared'],
      ];
    case 'room':
      return [
        ['Destination/city', details.destination_city || 'Not shared'],
        ['Preferred area', details.location_preference || 'Not shared'],
        ['Check-in', details.check_in || enquiry.travel_date || 'Not shared'],
        ['Check-out', details.check_out || 'Not shared'],
        ['Adults', details.adults || 'Not shared'],
        ['Children', details.children || 'Not shared'],
        ['Rooms', details.room_count || 'Not shared'],
        ['Room type', details.room_type || 'Not shared'],
        ['Meal preference', details.meal_preference || 'Not shared'],
        ['Budget', details.budget || 'Not shared'],
        ['Pickup required', details.pickup_required || 'Not shared'],
        ['Early check-in', details.early_check_in_required || 'Not shared'],
        ['Late checkout', details.late_checkout_required || 'Not shared'],
        ['Special requirements', details.special_requirements || 'Not shared'],
      ];
    case 'tour':
      return [
        ['Destination/package', details.destination || details.package_name || 'Not shared'],
        ['Travel start', details.travel_window_start || enquiry.travel_date || 'Not shared'],
        ['Travel end', details.travel_window_end || 'Not shared'],
        ['Flexible dates', details.flexible_dates || 'Not shared'],
        ['Adults', details.adults || 'Not shared'],
        ['Children', details.children || 'Not shared'],
        ['Trip duration', details.trip_duration || 'Not shared'],
        ['Pickup city', details.pickup_location || 'Not shared'],
        ['Cab required', details.cab_required || 'Not shared'],
        ['Hotel level', details.hotel_preference || 'Not shared'],
        ['Budget range', details.budget || 'Not shared'],
        ['Travel interests', Array.isArray(details.travel_interests) ? details.travel_interests.join(', ') : (details.travel_interests || 'Not shared')],
        ['Must-visit places', details.must_visit_places || 'Not shared'],
        ['Notes', details.notes || details.special_requests || 'Not shared'],
      ];
    case 'custom':
      return [
        ['Requirement type', details.custom_category || 'Not shared'],
        ['Destination/travel area', details.location || 'Not shared'],
        ['Travel window', details.travel_window || enquiry.travel_date || 'Not shared'],
        ['Number of people', details.group_size || 'Not shared'],
        ['Services needed', Array.isArray(details.services_needed) ? details.services_needed.join(', ') : (details.services_needed || 'Not shared')],
        ['Approximate budget', details.budget || 'Not shared'],
        ['Requirement details', details.requirement_details || enquiry.requirement_notes || 'Not shared'],
      ];
    default:
      return [
        ['Topic', details.topic || 'General travel enquiry'],
        ['Message', details.message || enquiry.requirement_notes || 'Not shared'],
      ];
  }
};

const buildCustomerReplyHref = (enquiry = {}) => {
  const whatsappNumber = String(getWhatsAppNumber(enquiry)).replace(/\D/g, '');
  if (!whatsappNumber) return null;

  return buildWhatsAppLink({
    phone: whatsappNumber,
    message: `Hi ${getCustomerName(enquiry)}, thank you for your ${getServiceLabel(enquiry).toLowerCase()}. We received your request and will share availability and pricing shortly.`,
  });
};

const buildEnquiryDraft = (enquiry = {}) => ({
  status: enquiry.status || 'New',
  admin_notes: enquiry.admin_notes || '',
  quote_amount: enquiry.quote_amount || '',
  last_contacted_at: formatDateTimeInput(enquiry.last_contacted_at),
  follow_up_at: formatDateTimeInput(enquiry.follow_up_at),
  assigned_driver_id: enquiry.assigned_driver_id || '',
  assigned_vehicle_id: enquiry.assigned_vehicle_id || '',
  assigned_room_id: enquiry.assigned_room_id || '',
  assigned_package_id: enquiry.assigned_package_id || '',
  assigned_hotel_option: enquiry.assigned_hotel_option || '',
  assigned_owner_id: enquiry.assigned_owner_id || '',
});

function EnquiryQuickActions({ enquiry, onOpenDetail, onMarkContacted, align = 'start' }) {
  const replyHref = buildCustomerReplyHref(enquiry);

  return (
    <div className={`flex flex-wrap gap-2 ${align === 'end' ? 'justify-start md:justify-end' : 'justify-start'}`}>
      <button
        type="button"
        onClick={() => onOpenDetail(enquiry.id)}
        className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white"
      >
        View
      </button>
      {replyHref && (
        <a
          href={replyHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-300"
        >
          WhatsApp
        </a>
      )}
      {enquiry.status === 'New' && (
        <button
          type="button"
          onClick={() => onMarkContacted(enquiry.id)}
          className="rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300"
        >
          Mark contacted
        </button>
      )}
    </div>
  );
}

function EnquiryCard({ enquiry, onOpenDetail, onMarkContacted }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs text-[#EFBF04]">{enquiry.reference_id || enquiry.id}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{getCustomerName(enquiry)}</h3>
            <p className="mt-1 text-sm text-gray-400">{getServiceLabel(enquiry)}</p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold ${getStatusClasses(enquiry.status)}`}>
            {enquiry.status}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-black/20 p-4">
            <p className={labelClassName}>Phone</p>
            <p className="mt-2 text-sm text-white">{getPhoneNumber(enquiry)}</p>
          </div>
          <div className="rounded-2xl bg-black/20 p-4">
            <p className={labelClassName}>WhatsApp</p>
            <p className="mt-2 text-sm text-white">{getWhatsAppNumber(enquiry) || 'Not shared'}</p>
          </div>
          <div className="rounded-2xl bg-black/20 p-4">
            <p className={labelClassName}>Travel date</p>
            <p className="mt-2 text-sm text-white">{formatDate(getTravelDateLabel(enquiry))}</p>
          </div>
          <div className="rounded-2xl bg-black/20 p-4">
            <p className={labelClassName}>Submitted</p>
            <p className="mt-2 text-sm text-white">{formatDateTime(enquiry.submitted_at || enquiry.created_at)}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-black/20 p-4">
          <p className={labelClassName}>Service details</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-white">{summarizeEnquiry(enquiry)}</p>
        </div>

        <div className="rounded-2xl bg-black/20 p-4">
          <p className={labelClassName}>Assigned resource</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-white">{getAssignedResourceSummary(enquiry)}</p>
        </div>

        <EnquiryQuickActions enquiry={enquiry} onMarkContacted={onMarkContacted} onOpenDetail={onOpenDetail} />
      </div>
    </article>
  );
}

function EnquiryDetailModal({
  enquiry,
  draft,
  drivers,
  fleet,
  isLoading,
  savingAction,
  onClose,
  onDraftChange,
  onSaveStatus,
  onSaveNotes,
  onSaveQuote,
  onSaveFollowUp,
  onSaveDriver,
  onSaveVehicle,
  onSaveRoom,
  onSavePackage,
  onArchive,
}) {
  if (!enquiry || !draft) return null;

  const enquiryType = getEnquiryType(enquiry);
  const detailEntries = getServiceDetailEntries(enquiry);
  const replyHref = buildCustomerReplyHref(enquiry);
  const vehicleSuggestions = fleet.map((vehicle) => vehicle.id || vehicle.plate).filter(Boolean);
  const showDriverFields = ['cab', 'tour', 'custom'].includes(enquiryType);
  const showVehicleFields = ['cab', 'tour', 'custom'].includes(enquiryType);
  const showRoomFields = ['room', 'tour', 'custom'].includes(enquiryType);
  const showPackageFields = ['tour', 'custom'].includes(enquiryType);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-white/10 bg-[#0A0A0A] shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0A0A0A]/95 px-6 py-5 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#EFBF04]">{getServiceLabel(enquiry)}</p>
              <h3 className="mt-1 text-2xl font-bold text-white">{enquiry.reference_id || `ENQ-${enquiry.id}`}</h3>
              <p className="mt-2 text-sm text-gray-400">{summarizeEnquiry(enquiry)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${getStatusClasses(enquiry.status)}`}>
                {enquiry.status}
              </span>
              {replyHref && (
                <a
                  href={replyHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-300"
                >
                  Reply on WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          {isLoading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
              Loading enquiry details...
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h4 className="text-lg font-semibold text-white">Customer details</h4>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className={labelClassName}>Full name</p>
                    <p className="mt-1 text-sm text-white">{getCustomerName(enquiry)}</p>
                  </div>
                  <div>
                    <p className={labelClassName}>Phone number</p>
                    <p className="mt-1 text-sm text-white">{getPhoneNumber(enquiry)}</p>
                  </div>
                  <div>
                    <p className={labelClassName}>WhatsApp number</p>
                    <p className="mt-1 text-sm text-white">{getWhatsAppNumber(enquiry) || 'Not shared'}</p>
                  </div>
                  <div>
                    <p className={labelClassName}>Email</p>
                    <p className="mt-1 text-sm text-white">{enquiry.email || 'Not shared'}</p>
                  </div>
                  <div>
                    <p className={labelClassName}>Preferred contact</p>
                    <p className="mt-1 text-sm capitalize text-white">{enquiry.preferred_contact_method || 'Not shared'}</p>
                  </div>
                  <div>
                    <p className={labelClassName}>Consent to contact</p>
                    <p className="mt-1 text-sm text-white">{enquiry.consent_to_contact ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h4 className="text-lg font-semibold text-white">Requirement details</h4>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {detailEntries.map(([label, value]) => (
                    <div key={label}>
                      <p className={labelClassName}>{label}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-white">{value || 'Not shared'}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h4 className="text-lg font-semibold text-white">Manual review and follow-up</h4>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClassName}>Status</label>
                    <select
                      className={`${inputClassName} mt-2`}
                      value={draft.status}
                      onChange={(event) => onDraftChange('status', event.target.value)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status} className="bg-[#0A0A0A]">
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={onSaveStatus}
                      disabled={savingAction === 'status'}
                      className="mt-3 rounded-xl bg-[#EFBF04] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black disabled:opacity-60"
                    >
                      {savingAction === 'status' ? 'Saving...' : 'Save status'}
                    </button>
                  </div>
                  <div>
                    <label className={labelClassName}>Internal owner</label>
                    <input
                      type="text"
                      className={`${inputClassName} mt-2`}
                      value={draft.assigned_owner_id}
                      onChange={(event) => onDraftChange('assigned_owner_id', event.target.value)}
                      placeholder="Staff/admin owner"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Last contacted at</label>
                    <input
                      type="datetime-local"
                      className={`${inputClassName} mt-2`}
                      value={draft.last_contacted_at}
                      onChange={(event) => onDraftChange('last_contacted_at', event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Follow-up at</label>
                    <input
                      type="datetime-local"
                      className={`${inputClassName} mt-2`}
                      value={draft.follow_up_at}
                      onChange={(event) => onDraftChange('follow_up_at', event.target.value)}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSaveFollowUp}
                  disabled={savingAction === 'follow_up'}
                  className="mt-4 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white disabled:opacity-60"
                >
                  {savingAction === 'follow_up' ? 'Saving...' : 'Save follow-up details'}
                </button>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-white">Admin notes</h4>
                    <p className="mt-1 text-sm text-gray-400">
                      Example: Customer wants SUV, pickup at 7 AM, budget around 5000. Waiting for confirmation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onSaveNotes}
                    disabled={savingAction === 'notes'}
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white disabled:opacity-60"
                  >
                    {savingAction === 'notes' ? 'Saving...' : 'Save notes'}
                  </button>
                </div>
                <textarea
                  rows="5"
                  className={`${inputClassName} mt-4`}
                  value={draft.admin_notes}
                  onChange={(event) => onDraftChange('admin_notes', event.target.value)}
                  placeholder="Add customer preferences, quote notes, itinerary notes, pickup instructions, or follow-up context."
                />
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h4 className="text-lg font-semibold text-white">Request metadata</h4>
                <div className="mt-4 space-y-3 text-sm text-gray-200">
                  <p><span className="text-gray-500">Source page:</span> {enquiry.source_page || 'Not shared'}</p>
                  <p><span className="text-gray-500">Travel date:</span> {formatDate(getTravelDateLabel(enquiry))}</p>
                  <p><span className="text-gray-500">Submitted:</span> {formatDateTime(enquiry.submitted_at || enquiry.created_at)}</p>
                  <p><span className="text-gray-500">Admin WhatsApp:</span> {enquiry.admin_whatsapp_notification_status || 'not_enabled'}</p>
                  <p><span className="text-gray-500">Customer WhatsApp:</span> {enquiry.customer_whatsapp_notification_status || 'not_enabled'}</p>
                  {enquiry.whatsapp_error_message && (
                    <p className="text-rose-300"><span className="text-rose-400">WhatsApp error:</span> {enquiry.whatsapp_error_message}</p>
                  )}
                </div>
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className={labelClassName}>Audit trail</p>
                  {Array.isArray(enquiry.audit_trail) && enquiry.audit_trail.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {enquiry.audit_trail.slice(0, 8).map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-white/5 bg-white/5 p-3 text-sm text-gray-200">
                          <p className="font-semibold text-white">{entry.action_type.replace(/_/g, ' ')}</p>
                          <p className="mt-1 text-xs text-gray-400">{formatDateTime(entry.created_at)}</p>
                          {entry.field_name && <p className="mt-2"><span className="text-gray-500">Field:</span> {entry.field_name}</p>}
                          {entry.previous_value && <p><span className="text-gray-500">From:</span> {entry.previous_value}</p>}
                          {entry.next_value && <p><span className="text-gray-500">To:</span> {entry.next_value}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gray-400">No audit entries yet for this enquiry.</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h4 className="text-lg font-semibold text-white">Assignment and quote</h4>
                <p className="mt-1 text-sm text-gray-400">
                  Assign the resources needed for manual fulfilment based on this enquiry type.
                </p>

                <div className="mt-4 space-y-4">
                  {showDriverFields && (
                    <div>
                      <label className={labelClassName}>Driver</label>
                      <select
                        className={`${inputClassName} mt-2`}
                        value={draft.assigned_driver_id}
                        onChange={(event) => onDraftChange('assigned_driver_id', event.target.value)}
                      >
                        <option value="" className="bg-[#0A0A0A]">Select driver</option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id} className="bg-[#0A0A0A]">
                            {driver.name} ({driver.id})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={onSaveDriver}
                        disabled={savingAction === 'driver' || !draft.assigned_driver_id}
                        className="mt-3 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white disabled:opacity-60"
                      >
                        {savingAction === 'driver' ? 'Saving...' : 'Assign driver'}
                      </button>
                    </div>
                  )}

                  {showVehicleFields && (
                    <div>
                      <label className={labelClassName}>Vehicle</label>
                      <input
                        list="vehicle-suggestions"
                        type="text"
                        className={`${inputClassName} mt-2`}
                        value={draft.assigned_vehicle_id}
                        onChange={(event) => onDraftChange('assigned_vehicle_id', event.target.value)}
                        placeholder="Vehicle ID"
                      />
                      <datalist id="vehicle-suggestions">
                        {vehicleSuggestions.map((vehicleId) => (
                          <option key={vehicleId} value={vehicleId} />
                        ))}
                      </datalist>
                      <button
                        type="button"
                        onClick={onSaveVehicle}
                        disabled={savingAction === 'vehicle' || !draft.assigned_vehicle_id}
                        className="mt-3 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white disabled:opacity-60"
                      >
                        {savingAction === 'vehicle' ? 'Saving...' : 'Assign vehicle'}
                      </button>
                    </div>
                  )}

                  {showRoomFields && (
                    <div className="grid gap-4">
                      <div>
                        <label className={labelClassName}>Room or stay option</label>
                        <input
                          type="text"
                          className={`${inputClassName} mt-2`}
                          value={draft.assigned_room_id}
                          onChange={(event) => onDraftChange('assigned_room_id', event.target.value)}
                          placeholder="Room ID or stay option"
                        />
                      </div>
                      <div>
                        <label className={labelClassName}>Hotel name or stay label</label>
                        <input
                          type="text"
                          className={`${inputClassName} mt-2`}
                          value={draft.assigned_hotel_option}
                          onChange={(event) => onDraftChange('assigned_hotel_option', event.target.value)}
                          placeholder="Hotel name, resort, or stay option"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={onSaveRoom}
                        disabled={savingAction === 'room' || (!draft.assigned_room_id && !draft.assigned_hotel_option)}
                        className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white disabled:opacity-60"
                      >
                        {savingAction === 'room' ? 'Saving...' : 'Save room/stay assignment'}
                      </button>
                    </div>
                  )}

                  {showPackageFields && (
                    <div>
                      <label className={labelClassName}>Package</label>
                      <input
                        type="text"
                        className={`${inputClassName} mt-2`}
                        value={draft.assigned_package_id}
                        onChange={(event) => onDraftChange('assigned_package_id', event.target.value)}
                        placeholder="Package ID or package label"
                      />
                      <button
                        type="button"
                        onClick={onSavePackage}
                        disabled={savingAction === 'package' || !draft.assigned_package_id}
                        className="mt-3 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white disabled:opacity-60"
                      >
                        {savingAction === 'package' ? 'Saving...' : 'Assign package'}
                      </button>
                    </div>
                  )}

                  <div>
                    <label className={labelClassName}>Quote amount</label>
                    <input
                      type="text"
                      className={`${inputClassName} mt-2`}
                      value={draft.quote_amount}
                      onChange={(event) => onDraftChange('quote_amount', event.target.value)}
                      placeholder="Final quote after review"
                    />
                    <button
                      type="button"
                      onClick={onSaveQuote}
                      disabled={savingAction === 'quote' || !draft.quote_amount}
                      className="mt-3 rounded-xl bg-[#EFBF04] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black disabled:opacity-60"
                    >
                      {savingAction === 'quote' ? 'Saving...' : 'Save quote'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-5">
                <h4 className="text-lg font-semibold text-white">Archive enquiry</h4>
                <p className="mt-1 text-sm text-rose-100/80">
                  Use archive when the enquiry is no longer active in the manual workflow.
                </p>
                <button
                  type="button"
                  onClick={onArchive}
                  disabled={savingAction === 'archive'}
                  className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-200 disabled:opacity-60"
                >
                  {savingAction === 'archive' ? 'Archiving...' : 'Archive enquiry'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [isPwdLoading, setIsPwdLoading] = useState(false);

  const [enquiries, setEnquiries] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);
  const [dashboardError, setDashboardError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [setupKeyData, setSetupKeyData] = useState(null);
  const [isSetupKeyLoading, setIsSetupKeyLoading] = useState(false);

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [detailDraft, setDetailDraft] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [savingAction, setSavingAction] = useState('');

  const [enquiryFilters, setEnquiryFilters] = useState({
    type: 'all',
    status: 'all',
    submittedFrom: '',
    submittedTo: '',
    travelDate: '',
    search: '',
  });

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: 'dashboard' },
    { id: 'bookings', label: 'Enquiries', icon: 'calendar_month' },
    { id: 'drivers', label: 'Drivers', icon: 'person_pin' },
    { id: 'fleet', label: 'Fleet', icon: 'directions_car' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const syncOperationalData = async ({ showLoader = false } = {}) => {
    if (showLoader) setIsLoading(true);

    try {
      const [nextEnquiries, nextFleet, nextDrivers] = await Promise.all([
        getEnquiries(),
        getFleet(),
        getDrivers(),
      ]);

      setEnquiries(nextEnquiries);
      setFleet(nextFleet);
      setDrivers(nextDrivers);
      setDashboardError('');
    } catch (error) {
      console.error('Admin dashboard load error:', error);
      setDashboardError('Unable to load enquiries. Please refresh or try again.');
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    syncOperationalData({ showLoader: true });
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadAdminProfile = async () => {
      try {
        const profile = await getAdminProfile();
        if (!ignore) setAdminProfile(profile);
      } catch {
        if (!ignore) setAdminProfile(null);
      }
    };

    loadAdminProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const refreshSelectedEnquiry = async (enquiryId) => {
    try {
      const nextEnquiry = await getEnquiryById(enquiryId);
      setSelectedEnquiry(nextEnquiry);
      setDetailDraft(buildEnquiryDraft(nextEnquiry));
    } catch (error) {
      console.error('Failed to refresh selected enquiry:', error);
    }
  };

  const runEnquiryAction = async (actionKey, callback, { closeAfter = false } = {}) => {
    if (!selectedEnquiry) return;

    setSavingAction(actionKey);
    setDashboardError('');

    try {
      await callback();
      await syncOperationalData();

      if (closeAfter) {
        setSelectedEnquiry(null);
        setDetailDraft(null);
      } else {
        await refreshSelectedEnquiry(selectedEnquiry.id);
      }
    } catch (error) {
      setDashboardError(error.message || 'Unable to update enquiry. Please try again.');
    } finally {
      setSavingAction('');
    }
  };

  const openEnquiryDetail = async (enquiryId) => {
    const fallback = enquiries.find((entry) => String(entry.id) === String(enquiryId));
    if (fallback) {
      setSelectedEnquiry(fallback);
      setDetailDraft(buildEnquiryDraft(fallback));
    }

    setIsDetailLoading(true);
    setDashboardError('');

    try {
      const enquiry = await getEnquiryById(enquiryId);
      setSelectedEnquiry(enquiry);
      setDetailDraft(buildEnquiryDraft(enquiry));
    } catch (error) {
      console.error('Failed to load enquiry detail:', error);
      setDashboardError('Unable to load enquiries. Please refresh or try again.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin');
  };

  const handleAddEntry = async (newEntry) => {
    setDashboardError('');

    try {
      if (activeTab === 'bookings') {
        await addBooking(newEntry);
      } else if (activeTab === 'fleet') {
        await addFleet(newEntry);
      } else if (activeTab === 'drivers') {
        await addDriver(newEntry);
      }

      await syncOperationalData();
    } catch (error) {
      setDashboardError(error.message || 'Unable to save the new record.');
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPwdError('');
    setPwdMessage('');
    setIsPwdLoading(true);

    try {
      await changePassword(oldPassword, newPassword, confirmPassword);
      setPwdMessage('Password updated successfully. You can use it on your next login.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPwdError(error.message || 'Failed to update password');
    } finally {
      setIsPwdLoading(false);
    }
  };

  const handleGenerateSetupKey = async () => {
    setDashboardError('');
    setIsSetupKeyLoading(true);

    try {
      const result = await generateAdminSetupKey();
      setSetupKeyData(result);
    } catch (error) {
      setDashboardError(error.message || 'Failed to generate setup key.');
    } finally {
      setIsSetupKeyLoading(false);
    }
  };

  const filteredEnquiries = useMemo(() => {
    const normalizedSearch = enquiryFilters.search.trim().toLowerCase();

    return enquiries.filter((enquiry) => {
      const type = getEnquiryType(enquiry);
      const submittedDate = enquiry.submitted_at ? new Date(enquiry.submitted_at) : null;
      const travelDate = getTravelDateLabel(enquiry);
      const matchesType = enquiryFilters.type === 'all' || type === enquiryFilters.type;
      const matchesStatus = enquiryFilters.status === 'all' || enquiry.status === enquiryFilters.status;
      const matchesTravelDate = !enquiryFilters.travelDate || String(travelDate || '').slice(0, 10) === enquiryFilters.travelDate;

      const matchesSubmittedFrom = !enquiryFilters.submittedFrom
        || (submittedDate && submittedDate >= new Date(`${enquiryFilters.submittedFrom}T00:00:00`));
      const matchesSubmittedTo = !enquiryFilters.submittedTo
        || (submittedDate && submittedDate <= new Date(`${enquiryFilters.submittedTo}T23:59:59`));

      const searchableValues = [
        enquiry.reference_id,
        getCustomerName(enquiry),
        getPhoneNumber(enquiry),
        getWhatsAppNumber(enquiry),
      ];
      const matchesSearch = !normalizedSearch || searchableValues.some((value) => String(value || '').toLowerCase().includes(normalizedSearch));

      return matchesType && matchesStatus && matchesTravelDate && matchesSubmittedFrom && matchesSubmittedTo && matchesSearch;
    });
  }, [enquiries, enquiryFilters]);

  const filteredFleet = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    if (!normalizedSearch) return fleet;

    return fleet.filter((vehicle) => [
      vehicle.id,
      vehicle.model,
      vehicle.plate,
      vehicle.type,
      vehicle.status,
      vehicle.insurance_status,
    ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch)));
  }, [fleet, searchQuery]);

  const filteredDrivers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    if (!normalizedSearch) return drivers;

    return drivers.filter((driver) => [
      driver.id,
      driver.name,
      driver.phone,
      driver.status,
      driver.assigned_vehicle,
    ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch)));
  }, [drivers, searchQuery]);

  const overviewCounts = useMemo(() => ({
    New: enquiries.filter((item) => item.status === 'New').length,
    Contacted: enquiries.filter((item) => item.status === 'Contacted').length,
    Quoted: enquiries.filter((item) => item.status === 'Quoted').length,
    'Awaiting Customer': enquiries.filter((item) => item.status === 'Awaiting Customer').length,
    Assigned: enquiries.filter((item) => item.status === 'Assigned').length,
    Confirmed: enquiries.filter((item) => item.status === 'Confirmed').length,
    Completed: enquiries.filter((item) => item.status === 'Completed').length,
    'Cancelled / Rejected': enquiries.filter((item) => ['Cancelled', 'Rejected'].includes(item.status)).length,
  }), [enquiries]);

  const categoryCounts = useMemo(() => ({
    cab: enquiries.filter((item) => getEnquiryType(item) === 'cab').length,
    room: enquiries.filter((item) => getEnquiryType(item) === 'room').length,
    tour: enquiries.filter((item) => getEnquiryType(item) === 'tour').length,
    general: enquiries.filter((item) => getEnquiryType(item) === 'general').length,
    custom: enquiries.filter((item) => getEnquiryType(item) === 'custom').length,
  }), [enquiries]);

  const recentEnquiries = useMemo(
    () => [...enquiries]
      .sort((left, right) => new Date(right.submitted_at || 0) - new Date(left.submitted_at || 0))
      .slice(0, 6),
    [enquiries]
  );

  const headerSearchValue = ['dashboard', 'bookings'].includes(activeTab) ? enquiryFilters.search : searchQuery;
  const headerSearchPlaceholder = ['dashboard', 'bookings'].includes(activeTab)
    ? 'Search name, phone, or reference ID'
    : `Search ${activeTab}`;

  const markEnquiryContacted = async (enquiryId) => {
    try {
      await updateEnquiryStatus(enquiryId, 'Contacted');
      await syncOperationalData();
    } catch (error) {
      setDashboardError(error.message || 'Unable to update enquiry. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#050505] pb-24 text-white lg:pb-0">
      <aside className="hidden w-72 shrink-0 border-r border-white/5 bg-[#0F0F0F] lg:flex lg:flex-col">
        <div className="border-b border-white/5 px-8 py-8">
          <button type="button" onClick={() => navigate('/')} className="text-left">
            <p className="text-xl font-bold text-[#EFBF04]">Velvet Pearl</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.28em] text-gray-500">Manual travel operations</p>
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition ${
                activeTab === item.id
                  ? 'bg-[#EFBF04]/10 text-[#EFBF04]'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-white/5 p-6">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFBF04]/15 text-[#EFBF04]">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{adminProfile?.isMainAdmin ? 'Main Admin' : 'Admin Panel'}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">Logout</p>
            </div>
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#050505]/90 backdrop-blur">
          <div className="flex flex-col gap-5 px-6 py-6 xl:flex-row xl:items-center xl:justify-between xl:px-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gray-500">Operational control center</p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                {activeTab === 'dashboard' ? 'Enquiry Overview' : navItems.find((item) => item.id === activeTab)?.label}
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Manual review, assignment, notes, quotes, and customer follow-up in one place.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="material-symbols-outlined text-gray-500">search</span>
                <input
                  type="text"
                  value={headerSearchValue}
                  onChange={(event) => {
                    if (['dashboard', 'bookings'].includes(activeTab)) {
                      setEnquiryFilters((current) => ({ ...current, search: event.target.value }));
                    } else {
                      setSearchQuery(event.target.value);
                    }
                  }}
                  className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-gray-600 sm:w-64"
                  placeholder={headerSearchPlaceholder}
                />
              </div>
              <button
                type="button"
                onClick={() => ['bookings', 'fleet', 'drivers'].includes(activeTab) && setIsEntryModalOpen(true)}
                disabled={!['bookings', 'fleet', 'drivers'].includes(activeTab)}
                className="rounded-2xl bg-[#EFBF04] px-5 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                New Entry
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto px-6 pb-4 lg:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition ${
                  activeTab === item.id
                    ? 'border-[#EFBF04] bg-[#EFBF04]/10 text-[#EFBF04]'
                    : 'border-white/10 bg-white/5 text-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <div className="space-y-8 px-6 py-8 xl:px-10">
          {dashboardError && (
            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {dashboardError}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-white">Overview</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {Object.entries(overviewCounts).map(([label, value]) => (
                    <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">{label}</p>
                      <p className="mt-3 text-3xl font-bold text-white">{isLoading ? '-' : value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white">Enquiry categories</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setActiveTab('bookings');
                        setEnquiryFilters((current) => ({ ...current, type: key }));
                      }}
                      className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-[#EFBF04]/40 hover:bg-[#EFBF04]/5"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">{label}</p>
                      <p className="mt-3 text-3xl font-bold text-white">{isLoading ? '-' : categoryCounts[key]}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-[32px] border border-white/10 bg-white/5">
                <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Recent enquiries</h2>
                    <p className="mt-1 text-sm text-gray-400">Latest customer requirements waiting in the manual workflow.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bookings')}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-200"
                  >
                    Open enquiry table
                  </button>
                </div>

                {enquiries.length === 0 && !isLoading ? (
                  <div className="px-6 py-12 text-center text-sm text-gray-300">
                    No enquiries yet. New customer enquiries will appear here after form submission.
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 px-6 py-6 md:hidden">
                      {recentEnquiries.map((enquiry) => (
                        <EnquiryCard
                          key={enquiry.id}
                          enquiry={enquiry}
                          onMarkContacted={markEnquiryContacted}
                          onOpenDetail={openEnquiryDetail}
                        />
                      ))}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-black/30 text-[11px] uppercase tracking-[0.22em] text-gray-500">
                        <tr>
                          <th className="px-6 py-4">Reference</th>
                          <th className="px-4 py-4">Customer</th>
                          <th className="px-4 py-4">Type</th>
                          <th className="px-4 py-4">Travel date</th>
                          <th className="px-4 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {recentEnquiries.map((enquiry) => (
                          <tr key={enquiry.id} className="hover:bg-white/5">
                            <td className="px-6 py-4 font-mono text-xs text-[#EFBF04]">{enquiry.reference_id || enquiry.id}</td>
                            <td className="px-4 py-4">
                              <p className="font-semibold text-white">{getCustomerName(enquiry)}</p>
                              <p className="text-xs text-gray-500">{getPhoneNumber(enquiry)}</p>
                            </td>
                            <td className="px-4 py-4 text-gray-200">{getServiceLabel(enquiry)}</td>
                            <td className="px-4 py-4 text-gray-300">{formatDate(getTravelDateLabel(enquiry))}</td>
                            <td className="px-4 py-4">
                              <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${getStatusClasses(enquiry.status)}`}>
                                {enquiry.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <EnquiryQuickActions enquiry={enquiry} onMarkContacted={markEnquiryContacted} onOpenDetail={openEnquiryDetail} align="end" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </>
                )}
              </section>
            </div>
          )}

          {activeTab === 'bookings' && (
            <section className="space-y-6">
              <div className="rounded-[32px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Enquiry table</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      Reference ID, customer details, status, assignment, and quick WhatsApp actions for manual fulfilment.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnquiryFilters({ type: 'all', status: 'all', submittedFrom: '', submittedTo: '', travelDate: '', search: '' })}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-200"
                  >
                    Reset filters
                  </button>
                </div>

                <details className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 md:hidden">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-white">
                    Filters
                  </summary>
                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className={labelClassName}>Enquiry type</label>
                      <select
                        className={`${inputClassName} mt-2`}
                        value={enquiryFilters.type}
                        onChange={(event) => setEnquiryFilters((current) => ({ ...current, type: event.target.value }))}
                      >
                        {TYPE_OPTIONS.map((option) => (
                          <option key={option} value={option} className="bg-[#0A0A0A]">
                            {option === 'all' ? 'All enquiry types' : TYPE_LABELS[option]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClassName}>Status</label>
                      <select
                        className={`${inputClassName} mt-2`}
                        value={enquiryFilters.status}
                        onChange={(event) => setEnquiryFilters((current) => ({ ...current, status: event.target.value }))}
                      >
                        <option value="all" className="bg-[#0A0A0A]">All statuses</option>
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status} className="bg-[#0A0A0A]">
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClassName}>Submitted from</label>
                      <input
                        type="date"
                        className={`${inputClassName} mt-2`}
                        value={enquiryFilters.submittedFrom}
                        onChange={(event) => setEnquiryFilters((current) => ({ ...current, submittedFrom: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={labelClassName}>Submitted to</label>
                      <input
                        type="date"
                        className={`${inputClassName} mt-2`}
                        value={enquiryFilters.submittedTo}
                        onChange={(event) => setEnquiryFilters((current) => ({ ...current, submittedTo: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={labelClassName}>Travel date</label>
                      <input
                        type="date"
                        className={`${inputClassName} mt-2`}
                        value={enquiryFilters.travelDate}
                        onChange={(event) => setEnquiryFilters((current) => ({ ...current, travelDate: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={labelClassName}>Name / phone / reference</label>
                      <input
                        type="text"
                        className={`${inputClassName} mt-2`}
                        value={enquiryFilters.search}
                        onChange={(event) => setEnquiryFilters((current) => ({ ...current, search: event.target.value }))}
                        placeholder="Search enquiry"
                      />
                    </div>
                  </div>
                </details>

                <div className="mt-5 hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-6">
                  <div>
                    <label className={labelClassName}>Enquiry type</label>
                    <select
                      className={`${inputClassName} mt-2`}
                      value={enquiryFilters.type}
                      onChange={(event) => setEnquiryFilters((current) => ({ ...current, type: event.target.value }))}
                    >
                      {TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option} className="bg-[#0A0A0A]">
                          {option === 'all' ? 'All enquiry types' : TYPE_LABELS[option]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClassName}>Status</label>
                    <select
                      className={`${inputClassName} mt-2`}
                      value={enquiryFilters.status}
                      onChange={(event) => setEnquiryFilters((current) => ({ ...current, status: event.target.value }))}
                    >
                      <option value="all" className="bg-[#0A0A0A]">All statuses</option>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status} className="bg-[#0A0A0A]">
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClassName}>Submitted from</label>
                    <input
                      type="date"
                      className={`${inputClassName} mt-2`}
                      value={enquiryFilters.submittedFrom}
                      onChange={(event) => setEnquiryFilters((current) => ({ ...current, submittedFrom: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Submitted to</label>
                    <input
                      type="date"
                      className={`${inputClassName} mt-2`}
                      value={enquiryFilters.submittedTo}
                      onChange={(event) => setEnquiryFilters((current) => ({ ...current, submittedTo: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Travel date</label>
                    <input
                      type="date"
                      className={`${inputClassName} mt-2`}
                      value={enquiryFilters.travelDate}
                      onChange={(event) => setEnquiryFilters((current) => ({ ...current, travelDate: event.target.value }))}
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Name / phone / reference</label>
                    <input
                      type="text"
                      className={`${inputClassName} mt-2`}
                      value={enquiryFilters.search}
                      onChange={(event) => setEnquiryFilters((current) => ({ ...current, search: event.target.value }))}
                      placeholder="Search enquiry"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEnquiryFilters((current) => ({ ...current, type: key }))}
                    className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${
                      enquiryFilters.type === key
                        ? 'border-[#EFBF04] bg-[#EFBF04]/10 text-[#EFBF04]'
                        : 'border-white/10 bg-white/5 text-gray-200'
                    }`}
                  >
                    {label} ({categoryCounts[key]})
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5">
                <div className="space-y-4 p-4 md:hidden">
                  {filteredEnquiries.length > 0 ? filteredEnquiries.map((enquiry) => (
                    <EnquiryCard
                      key={enquiry.id}
                      enquiry={enquiry}
                      onMarkContacted={markEnquiryContacted}
                      onOpenDetail={openEnquiryDetail}
                    />
                  )) : (
                    <div className="px-2 py-6 text-center text-sm text-gray-300">
                      {enquiries.length === 0
                        ? 'No enquiries yet. New customer enquiries will appear here after form submission.'
                        : 'No enquiries match the current filters.'}
                    </div>
                  )}
                </div>
                <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-black/30 text-[11px] uppercase tracking-[0.22em] text-gray-500">
                      <tr>
                        <th className="px-6 py-4">Reference ID</th>
                        <th className="px-4 py-4">Customer name</th>
                        <th className="px-4 py-4">Phone</th>
                        <th className="px-4 py-4">WhatsApp</th>
                        <th className="px-4 py-4">Enquiry type</th>
                        <th className="px-4 py-4">Travel date</th>
                        <th className="px-4 py-4">Submitted</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Assigned resource</th>
                        <th className="px-6 py-4 text-right">Quick actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredEnquiries.map((enquiry) => {
                        return (
                          <tr key={enquiry.id} className="align-top hover:bg-white/5">
                            <td className="px-6 py-5 font-mono text-xs text-[#EFBF04]">{enquiry.reference_id || enquiry.id}</td>
                            <td className="px-4 py-5">
                              <p className="font-semibold text-white">{getCustomerName(enquiry)}</p>
                              <p className="mt-1 max-w-[240px] text-xs text-gray-500">{summarizeEnquiry(enquiry)}</p>
                            </td>
                            <td className="px-4 py-5 text-gray-200">{getPhoneNumber(enquiry)}</td>
                            <td className="px-4 py-5 text-gray-200">{getWhatsAppNumber(enquiry) || 'Not shared'}</td>
                            <td className="px-4 py-5 text-gray-200">{getServiceLabel(enquiry)}</td>
                            <td className="px-4 py-5 text-gray-300">{formatDate(getTravelDateLabel(enquiry))}</td>
                            <td className="px-4 py-5 text-gray-300">{formatDateTime(enquiry.submitted_at || enquiry.created_at)}</td>
                            <td className="px-4 py-5">
                              <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${getStatusClasses(enquiry.status)}`}>
                                {enquiry.status}
                              </span>
                            </td>
                            <td className="px-4 py-5 text-gray-300">{getAssignedResourceSummary(enquiry)}</td>
                            <td className="px-6 py-5">
                              <EnquiryQuickActions enquiry={enquiry} onMarkContacted={markEnquiryContacted} onOpenDetail={openEnquiryDetail} align="end" />
                            </td>
                          </tr>
                        );
                      })}

                      {filteredEnquiries.length === 0 && (
                        <tr>
                          <td colSpan="10" className="px-6 py-12 text-center text-sm text-gray-300">
                            {enquiries.length === 0
                              ? 'No enquiries yet. New customer enquiries will appear here after form submission.'
                              : 'No enquiries match the current filters.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'drivers' && (
            <section className="grid gap-6 lg:grid-cols-2">
              {filteredDrivers.map((driver) => (
                <article key={driver.id} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold text-white">{driver.name}</p>
                      <p className="mt-1 text-sm text-gray-400">{driver.phone}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${getStatusClasses(driver.status)}`}>
                      {driver.status}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className={labelClassName}>Driver ID</p>
                      <p className="mt-2 text-sm text-white">{driver.id}</p>
                    </div>
                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className={labelClassName}>Assigned vehicle</p>
                      <p className="mt-2 text-sm text-white">{driver.assigned_vehicle || 'Not assigned'}</p>
                    </div>
                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className={labelClassName}>Experience</p>
                      <p className="mt-2 text-sm text-white">{driver.experience || 'Not shared'}</p>
                    </div>
                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className={labelClassName}>Licence status</p>
                      <p className="mt-2 text-sm text-white">{driver.licence_status || 'Pending'}</p>
                    </div>
                  </div>
                </article>
              ))}

              {filteredDrivers.length === 0 && (
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-sm text-gray-300">
                  No drivers match the current search.
                </div>
              )}
            </section>
          )}

          {activeTab === 'fleet' && (
            <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {filteredFleet.map((vehicle) => (
                <article key={vehicle.id} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold text-white">{vehicle.model}</p>
                      <p className="mt-1 text-sm text-gray-400">{vehicle.plate}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${getStatusClasses(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className={labelClassName}>Vehicle ID</p>
                      <p className="mt-2 text-sm text-white">{vehicle.id}</p>
                    </div>
                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className={labelClassName}>Type</p>
                      <p className="mt-2 text-sm text-white">{vehicle.type || 'Not shared'}</p>
                    </div>
                    <div className="rounded-2xl bg-black/20 p-4">
                      <p className={labelClassName}>Insurance expiry</p>
                      <p className="mt-2 text-sm text-white">{formatDate(vehicle.insurance_expiry)}</p>
                    </div>
                  </div>
                </article>
              ))}

              {filteredFleet.length === 0 && (
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-sm text-gray-300">
                  No fleet records match the current search.
                </div>
              )}
            </section>
          )}

          {activeTab === 'settings' && (
            <div className="mx-auto max-w-4xl space-y-8">
              <section className="rounded-[32px] border border-white/10 bg-white/5 p-8">
                <h2 className="text-2xl font-semibold text-white">Security and authentication</h2>
                <p className="mt-2 text-sm text-gray-400">Manage your admin password and onboarding access.</p>

                <form onSubmit={handlePasswordChange} className="mt-6 space-y-5">
                  {pwdError && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{pwdError}</div>}
                  {pwdMessage && <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{pwdMessage}</div>}

                  <div>
                    <label className={labelClassName}>Current password</label>
                    <input type="password" className={`${inputClassName} mt-2`} value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} required />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClassName}>New password</label>
                      <input type="password" className={`${inputClassName} mt-2`} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={6} required />
                    </div>
                    <div>
                      <label className={labelClassName}>Confirm password</label>
                      <input type="password" className={`${inputClassName} mt-2`} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
                    </div>
                  </div>

                  <button type="submit" disabled={isPwdLoading} className="rounded-2xl bg-[#EFBF04] px-5 py-3 text-sm font-bold text-black disabled:opacity-60">
                    {isPwdLoading ? 'Updating...' : 'Update password'}
                  </button>
                </form>
              </section>

              <section className="rounded-[32px] border border-white/10 bg-white/5 p-8">
                <h2 className="text-2xl font-semibold text-white">Admin onboarding keys</h2>
                <p className="mt-2 text-sm text-gray-400">Generate a one-time setup key for another admin when needed.</p>

                {adminProfile?.isMainAdmin ? (
                  <div className="mt-6 space-y-5">
                    <button
                      type="button"
                      onClick={handleGenerateSetupKey}
                      disabled={isSetupKeyLoading}
                      className="rounded-2xl bg-[#EFBF04] px-5 py-3 text-sm font-bold text-black disabled:opacity-60"
                    >
                      {isSetupKeyLoading ? 'Generating...' : 'Generate setup key'}
                    </button>
                    {setupKeyData?.setupKey && (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                        <p className={labelClassName}>Generated setup key</p>
                        <p className="mt-3 break-all font-mono text-lg text-white">{setupKeyData.setupKey}</p>
                        <p className="mt-2 text-sm text-emerald-200">Expires: {formatDateTime(setupKeyData.expiresAt)}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-300">
                    Setup key generation is restricted to the main admin account.
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>

      <AdminForms
        type={activeTab === 'bookings' ? 'bookings' : activeTab}
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSubmit={handleAddEntry}
      />

      <EnquiryDetailModal
        enquiry={selectedEnquiry}
        draft={detailDraft}
        drivers={drivers}
        fleet={fleet}
        isLoading={isDetailLoading}
        savingAction={savingAction}
        onClose={() => {
          setSelectedEnquiry(null);
          setDetailDraft(null);
          setIsDetailLoading(false);
        }}
        onDraftChange={(field, value) => setDetailDraft((current) => ({ ...current, [field]: value }))}
        onSaveStatus={() => runEnquiryAction('status', () => updateEnquiryStatus(selectedEnquiry.id, detailDraft.status))}
        onSaveNotes={() => runEnquiryAction('notes', () => updateEnquiryNotes(selectedEnquiry.id, detailDraft.admin_notes))}
        onSaveQuote={() => runEnquiryAction('quote', () => updateEnquiryQuote(selectedEnquiry.id, detailDraft.quote_amount))}
        onSaveFollowUp={() => runEnquiryAction('follow_up', () => updateEnquiry(selectedEnquiry.id, {
          last_contacted_at: detailDraft.last_contacted_at || null,
          follow_up_at: detailDraft.follow_up_at || null,
          assigned_owner_id: detailDraft.assigned_owner_id || '',
        }))}
        onSaveDriver={() => runEnquiryAction('driver', () => assignDriverToEnquiry(selectedEnquiry.id, {
          driver_id: detailDraft.assigned_driver_id,
        }))}
        onSaveVehicle={() => runEnquiryAction('vehicle', () => assignVehicleToEnquiry(selectedEnquiry.id, {
          vehicle_id: detailDraft.assigned_vehicle_id,
        }))}
        onSaveRoom={() => runEnquiryAction('room', () => assignRoomToEnquiry(selectedEnquiry.id, {
          room_id: detailDraft.assigned_room_id || '',
          hotel_option: detailDraft.assigned_hotel_option || '',
        }))}
        onSavePackage={() => runEnquiryAction('package', () => assignPackageToEnquiry(selectedEnquiry.id, {
          package_id: detailDraft.assigned_package_id,
        }))}
        onArchive={() => runEnquiryAction('archive', () => archiveEnquiryRecord(selectedEnquiry.id, 'Archived from admin dashboard'), { closeAfter: true })}
      />
    </div>
  );
}
