import React, { useState } from 'react';
import BottomSheet from '../../ui/BottomSheet';

const inputClassName = 'mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600';
const labelClassName = 'text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500';

export default function MobileFilterSheet({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  typeOptions,
  typeLabels,
  statusOptions,
}) {
  const [draft, setDraft] = useState(filters);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filter enquiries"
      subtitle="Apply only the filters you need so the inbox stays easy to scan."
      footer={(
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              const reset = { type: 'all', status: 'all', submittedFrom: '', submittedTo: '', travelDate: '', search: '' };
              setDraft(reset);
              onReset();
            }}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="rounded-2xl bg-[#EFBF04] px-4 py-3 text-sm font-semibold text-black"
          >
            Apply
          </button>
        </div>
      )}
    >
      <div className="space-y-5">
        <div>
          <label className={labelClassName}>Search</label>
          <input
            type="text"
            value={draft.search}
            onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
            placeholder="Name, phone, or reference ID"
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName}>Enquiry type</label>
          <select
            value={draft.type}
            onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
            className={inputClassName}
          >
            {typeOptions.map((option) => (
              <option key={option} value={option} className="bg-[#0A0A0A]">
                {option === 'all' ? 'All enquiry types' : typeLabels[option]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClassName}>Status</label>
          <select
            value={draft.status}
            onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
            className={inputClassName}
          >
            <option value="all" className="bg-[#0A0A0A]">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status} className="bg-[#0A0A0A]">
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClassName}>Travel date</label>
            <input
              type="date"
              value={draft.travelDate}
              onChange={(event) => setDraft((current) => ({ ...current, travelDate: event.target.value }))}
              className={inputClassName}
            />
          </div>
          <div>
            <label className={labelClassName}>Submitted from</label>
            <input
              type="date"
              value={draft.submittedFrom}
              onChange={(event) => setDraft((current) => ({ ...current, submittedFrom: event.target.value }))}
              className={inputClassName}
            />
          </div>
        </div>
        <div>
          <label className={labelClassName}>Submitted to</label>
          <input
            type="date"
            value={draft.submittedTo}
            onChange={(event) => setDraft((current) => ({ ...current, submittedTo: event.target.value }))}
            className={inputClassName}
          />
        </div>
      </div>
    </BottomSheet>
  );
}
