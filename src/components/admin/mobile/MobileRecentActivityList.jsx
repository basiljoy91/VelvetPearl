import React from 'react';
import MobileStatusPill from './MobileStatusPill';

export default function MobileRecentActivityList({
  enquiries,
  getStatusClasses,
  getCustomerName,
  getServiceLabel,
  onOpenEnquiry,
}) {
  return (
    <div className="space-y-3">
      {enquiries.map((enquiry) => (
        <button
          key={enquiry.id}
          type="button"
          onClick={() => onOpenEnquiry(enquiry.id)}
          className="flex w-full items-start justify-between gap-4 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-[#EFBF04]/30 hover:bg-white/8"
        >
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs text-[#EFBF04]">{enquiry.reference_id || enquiry.id}</p>
            <p className="mt-2 text-base font-semibold text-white">{getCustomerName(enquiry)}</p>
            <p className="mt-1 text-sm text-gray-400">{getServiceLabel(enquiry)}</p>
          </div>
          <MobileStatusPill status={enquiry.status} getStatusClasses={getStatusClasses} />
        </button>
      ))}
    </div>
  );
}
