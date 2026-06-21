import React, { useMemo, useState } from 'react';
import { Archive, MessageCircle, Phone } from 'lucide-react';
import BottomSheet from '../../ui/BottomSheet';
import { LoadingButton, LoadingOverlay, SkeletonBlock } from '../../ui/LoadingState';
import MobileBottomActionBar from './MobileBottomActionBar';
import MobileDetailAccordion from './MobileDetailAccordion';
import MobileStatusPill from './MobileStatusPill';

const fieldCardClassName = 'rounded-2xl border border-white/5 bg-black/20 p-4';
const labelClassName = 'text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500';
const inputClassName = 'mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none transition focus:border-[#EFBF04]/50';

function DetailSkeletonSection() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_80px_rgba(0,0,0,0.24)]">
      <SkeletonBlock className="h-7 w-44" />
      <SkeletonBlock className="mt-2 h-4 w-60" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-20 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

function hasChanged(current, next) {
  return String(current ?? '') !== String(next ?? '');
}

export default function MobileEnquiryDetail({
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
  onMarkContacted,
  helpers,
}) {
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [bulkError, setBulkError] = useState('');

  const {
    getEnquiryType,
    getCustomerName,
    getPhoneNumber,
    getWhatsAppNumber,
    getServiceLabel,
    getStatusClasses,
    getServiceDetailEntries,
    formatDate,
    formatDateTime,
    getTravelDateLabel,
    buildCustomerReplyHref,
    statusOptions,
  } = helpers;

  const enquiryType = enquiry ? getEnquiryType(enquiry) : '';
  const detailEntries = enquiry ? getServiceDetailEntries(enquiry) : [];
  const replyHref = enquiry ? buildCustomerReplyHref(enquiry) : '';
  const showDriverFields = ['cab', 'tour', 'custom'].includes(enquiryType);
  const showVehicleFields = ['cab', 'tour', 'custom'].includes(enquiryType);
  const showRoomFields = ['room', 'tour', 'custom'].includes(enquiryType);
  const showPackageFields = ['tour', 'custom'].includes(enquiryType);
  const vehicleSuggestions = fleet.map((vehicle) => vehicle.id || vehicle.plate).filter(Boolean);
  const isSavingAny = isBulkSaving || Boolean(savingAction);

  const diffState = useMemo(() => ({
    status: !enquiry || !draft ? false : hasChanged(enquiry.status, draft.status),
    notes: !enquiry || !draft ? false : hasChanged(enquiry.admin_notes, draft.admin_notes),
    quote: !enquiry || !draft ? false : hasChanged(enquiry.quote_amount, draft.quote_amount),
    followUp:
      !enquiry || !draft
        ? false
        : hasChanged(enquiry.assigned_owner_id, draft.assigned_owner_id)
      || hasChanged(String(enquiry.last_contacted_at || '').slice(0, 16), draft.last_contacted_at)
      || hasChanged(String(enquiry.follow_up_at || '').slice(0, 16), draft.follow_up_at),
    driver: !enquiry || !draft ? false : showDriverFields && hasChanged(enquiry.assigned_driver_id, draft.assigned_driver_id),
    vehicle: !enquiry || !draft ? false : showVehicleFields && hasChanged(enquiry.assigned_vehicle_id, draft.assigned_vehicle_id),
    room:
      !enquiry || !draft
        ? false
        : showRoomFields
      && (hasChanged(enquiry.assigned_room_id, draft.assigned_room_id)
      || hasChanged(enquiry.assigned_hotel_option, draft.assigned_hotel_option)),
    package: !enquiry || !draft ? false : showPackageFields && hasChanged(enquiry.assigned_package_id, draft.assigned_package_id),
  }), [draft, enquiry, showDriverFields, showPackageFields, showRoomFields, showVehicleFields]);

  const hasAnyChanges = Object.values(diffState).some(Boolean);

  if (!enquiry || !draft) return null;

  const handleSaveAll = async () => {
    if (!hasAnyChanges) return;

    setBulkError('');
    setIsBulkSaving(true);

    try {
      if (diffState.status) await onSaveStatus();
      if (diffState.followUp) await onSaveFollowUp();
      if (diffState.driver) await onSaveDriver();
      if (diffState.vehicle) await onSaveVehicle();
      if (diffState.room) await onSaveRoom();
      if (diffState.package) await onSavePackage();
      if (diffState.quote) await onSaveQuote();
      if (diffState.notes) await onSaveNotes();
    } catch (error) {
      setBulkError(error.message || 'Unable to save all enquiry updates.');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const travelSectionEntries = [
    ['Travel date', formatDate(getTravelDateLabel(enquiry))],
    ['Submitted', formatDateTime(enquiry.submitted_at || enquiry.created_at)],
    ['Last contacted', draft.last_contacted_at ? formatDateTime(draft.last_contacted_at) : 'Not shared'],
    ['Follow-up at', draft.follow_up_at ? formatDateTime(draft.follow_up_at) : 'Not shared'],
  ];

  return (
    <BottomSheet
      isOpen={Boolean(enquiry)}
      onClose={onClose}
      title={enquiry.reference_id || `ENQ-${enquiry.id}`}
      subtitle={getServiceLabel(enquiry)}
      fullScreen
      footer={(
        <MobileBottomActionBar>
          {replyHref ? (
            <a
              href={replyHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-sky-300"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-gray-500"
            >
              <Phone className="h-4 w-4" />
              No contact
            </button>
          )}
          <LoadingButton
            type="button"
            onClick={handleSaveAll}
            disabled={!hasAnyChanges}
            isLoading={isSavingAny}
            idleLabel="Save Changes"
            loadingLabel={isBulkSaving ? 'Saving Changes...' : 'Saving...'}
            className="flex-1 bg-[#EFBF04] text-black hover:brightness-100"
            spinnerClassName="text-black"
          />
        </MobileBottomActionBar>
      )}
    >
      <div className="relative space-y-4 px-5 pb-8 pt-4">
        {isLoading && <LoadingOverlay label="Loading enquiry details..." />}

        <div className="sticky top-0 z-10 rounded-[28px] border border-white/10 bg-[#0B0B0B]/95 p-5 shadow-[0_18px_80px_rgba(0,0,0,0.24)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#EFBF04]">{getServiceLabel(enquiry)}</p>
              <h3 className="mt-2 text-2xl font-bold text-white">{getCustomerName(enquiry)}</h3>
              <p className="mt-2 text-sm text-gray-400">{detailEntries[0]?.[1] || 'Manual review required'}</p>
            </div>
            <MobileStatusPill status={enquiry.status} getStatusClasses={getStatusClasses} />
          </div>

          {(enquiry.status === 'New' || bulkError) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {enquiry.status === 'New' && onMarkContacted && (
                <button
                  type="button"
                  onClick={onMarkContacted}
                  className="rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300"
                >
                  Mark Contacted
                </button>
              )}
              <button
                type="button"
                onClick={onArchive}
                className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-200"
              >
                <Archive className="h-4 w-4" />
                Archive
              </button>
            </div>
          )}

          {bulkError && (
            <div aria-live="assertive" role="alert" className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {bulkError}
            </div>
          )}
        </div>

        {isLoading ? (
          <>
            <DetailSkeletonSection />
            <DetailSkeletonSection />
            <DetailSkeletonSection />
          </>
        ) : (
          <>
            <MobileDetailAccordion title="Customer Details" description="Primary contact details for follow-up." defaultOpen>
              <div className="grid gap-3">
                {[
                  ['Phone', getPhoneNumber(enquiry)],
                  ['WhatsApp', getWhatsAppNumber(enquiry) || 'Not shared'],
                  ['Email', enquiry.email || 'Not shared'],
                  ['Preferred contact', enquiry.preferred_contact_method || 'Not shared'],
                  ['Consent to contact', enquiry.consent_to_contact ? 'Yes' : 'No'],
                ].map(([label, value]) => (
                  <div key={label} className={fieldCardClassName}>
                    <p className={labelClassName}>{label}</p>
                    <p className="mt-2 text-sm text-white">{value}</p>
                  </div>
                ))}
              </div>
            </MobileDetailAccordion>

            <MobileDetailAccordion title="Requirement" description="Service-specific details captured from the enquiry." defaultOpen>
              <div className="grid gap-3">
                {detailEntries.map(([label, value]) => (
                  <div key={label} className={fieldCardClassName}>
                    <p className={labelClassName}>{label}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-white">{value || 'Not shared'}</p>
                  </div>
                ))}
              </div>
            </MobileDetailAccordion>

            <MobileDetailAccordion title="Travel Details" description="Core trip timing and review checkpoints.">
              <div className="grid gap-3">
                {travelSectionEntries.map(([label, value]) => (
                  <div key={label} className={fieldCardClassName}>
                    <p className={labelClassName}>{label}</p>
                    <p className="mt-2 text-sm text-white">{value}</p>
                  </div>
                ))}
              </div>
            </MobileDetailAccordion>

            <MobileDetailAccordion title="Status and Assignment" description="Update workflow state, ownership, and manual assignment.">
              <div className="space-y-4">
                <div>
                  <label className={labelClassName}>Status</label>
                  <select className={inputClassName} value={draft.status} onChange={(event) => onDraftChange('status', event.target.value)}>
                    {statusOptions.map((status) => (
                      <option key={status} value={status} className="bg-[#0A0A0A]">{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClassName}>Internal owner</label>
                  <input className={inputClassName} type="text" value={draft.assigned_owner_id} onChange={(event) => onDraftChange('assigned_owner_id', event.target.value)} placeholder="Staff/admin owner" />
                </div>
                <div>
                  <label className={labelClassName}>Last contacted at</label>
                  <input className={inputClassName} type="datetime-local" value={draft.last_contacted_at} onChange={(event) => onDraftChange('last_contacted_at', event.target.value)} />
                </div>
                <div>
                  <label className={labelClassName}>Follow-up at</label>
                  <input className={inputClassName} type="datetime-local" value={draft.follow_up_at} onChange={(event) => onDraftChange('follow_up_at', event.target.value)} />
                </div>

                {showDriverFields && (
                  <div className={fieldCardClassName}>
                    <label className={labelClassName}>Driver</label>
                    <select className={inputClassName} value={draft.assigned_driver_id} onChange={(event) => onDraftChange('assigned_driver_id', event.target.value)}>
                      <option value="" className="bg-[#0A0A0A]">Select driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id} className="bg-[#0A0A0A]">
                          {driver.name} ({driver.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {showVehicleFields && (
                  <div className={fieldCardClassName}>
                    <label className={labelClassName}>Vehicle</label>
                    <input
                      list="mobile-vehicle-suggestions"
                      type="text"
                      className={inputClassName}
                      value={draft.assigned_vehicle_id}
                      onChange={(event) => onDraftChange('assigned_vehicle_id', event.target.value)}
                      placeholder="Vehicle ID"
                    />
                    <datalist id="mobile-vehicle-suggestions">
                      {vehicleSuggestions.map((vehicleId) => <option key={vehicleId} value={vehicleId} />)}
                    </datalist>
                  </div>
                )}

                {showRoomFields && (
                  <div className={fieldCardClassName}>
                    <label className={labelClassName}>Room / stay option</label>
                    <input type="text" className={inputClassName} value={draft.assigned_room_id} onChange={(event) => onDraftChange('assigned_room_id', event.target.value)} placeholder="Room ID or stay option" />
                    <label className={`${labelClassName} mt-4 block`}>Hotel name / stay label</label>
                    <input type="text" className={inputClassName} value={draft.assigned_hotel_option} onChange={(event) => onDraftChange('assigned_hotel_option', event.target.value)} placeholder="Hotel name or stay option" />
                  </div>
                )}

                {showPackageFields && (
                  <div className={fieldCardClassName}>
                    <label className={labelClassName}>Package</label>
                    <input type="text" className={inputClassName} value={draft.assigned_package_id} onChange={(event) => onDraftChange('assigned_package_id', event.target.value)} placeholder="Package ID or package label" />
                  </div>
                )}
              </div>
            </MobileDetailAccordion>

            <MobileDetailAccordion title="Quote" description="Record the current quote shared with the customer.">
              <div className={fieldCardClassName}>
                <label className={labelClassName}>Quote amount</label>
                <input type="text" className={inputClassName} value={draft.quote_amount} onChange={(event) => onDraftChange('quote_amount', event.target.value)} placeholder="Quote after review" />
              </div>
            </MobileDetailAccordion>

            <MobileDetailAccordion title="Notes" description="Internal context, customer preferences, and follow-up notes.">
              <textarea rows="6" className={inputClassName} value={draft.admin_notes} onChange={(event) => onDraftChange('admin_notes', event.target.value)} placeholder="Add notes for the team." />
            </MobileDetailAccordion>

            <MobileDetailAccordion title="Activity Log / Audit Trail" description="Submission timing, source, notification state, and recent history.">
              <div className="grid gap-3">
                {[
                  ['Source page', enquiry.source_page || 'Not shared'],
                  ['Travel date', formatDate(getTravelDateLabel(enquiry))],
                  ['Submitted', formatDateTime(enquiry.submitted_at || enquiry.created_at)],
                  ['Admin WhatsApp', enquiry.admin_whatsapp_notification_status || 'not_enabled'],
                  ['Customer WhatsApp', enquiry.customer_whatsapp_notification_status || 'not_enabled'],
                ].map(([label, value]) => (
                  <div key={label} className={fieldCardClassName}>
                    <p className={labelClassName}>{label}</p>
                    <p className="mt-2 text-sm text-white">{value}</p>
                  </div>
                ))}

                {Array.isArray(enquiry.audit_trail) && enquiry.audit_trail.length > 0 && (
                  <div className="space-y-3">
                    {enquiry.audit_trail.slice(0, 6).map((entry) => (
                      <div key={entry.id} className={fieldCardClassName}>
                        <p className="text-sm font-semibold capitalize text-white">{entry.action_type.replace(/_/g, ' ')}</p>
                        <p className="mt-1 text-xs text-gray-400">{formatDateTime(entry.created_at)}</p>
                        {entry.field_name && <p className="mt-2 text-xs text-gray-500">Field: {entry.field_name}</p>}
                        {entry.previous_value && <p className="mt-1 text-sm text-gray-300">From: {entry.previous_value}</p>}
                        {entry.next_value && <p className="mt-1 text-sm text-gray-300">To: {entry.next_value}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </MobileDetailAccordion>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
