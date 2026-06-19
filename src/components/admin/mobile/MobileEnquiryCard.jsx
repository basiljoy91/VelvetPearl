import React from 'react';
import MobileStatusPill from './MobileStatusPill';
import MobileQuickActions from './MobileQuickActions';

export default function MobileEnquiryCard({
  enquiry,
  getStatusClasses,
  getCustomerName,
  getServiceLabel,
  getTravelDateLabel,
  formatDate,
  formatDateTime,
  whatsappHref,
  onView,
  onMarkContacted,
}) {
  return (
    <article className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[12px] text-[#EFBF04]">{enquiry.reference_id || enquiry.id}</p>
        <MobileStatusPill status={enquiry.status} getStatusClasses={getStatusClasses} />
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-semibold tracking-tight text-white">{getCustomerName(enquiry)}</h3>
        <p className="mt-1 text-sm text-gray-400">{getServiceLabel(enquiry)}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[16px] bg-black/20 px-3 py-3">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">Travel</p>
          <p className="mt-2 text-sm text-white">{formatDate(getTravelDateLabel(enquiry))}</p>
        </div>
        <div className="rounded-[16px] bg-black/20 px-3 py-3">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-gray-500">Submitted</p>
          <p className="mt-2 text-sm text-white">{formatDateTime(enquiry.submitted_at || enquiry.created_at)}</p>
        </div>
      </div>

      <div className="mt-4">
        <MobileQuickActions
          onView={onView}
          whatsappHref={whatsappHref}
          onMarkContacted={enquiry.status === 'New' ? onMarkContacted : null}
        />
      </div>
    </article>
  );
}
