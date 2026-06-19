import React from 'react';
import BottomSheet from '../../ui/BottomSheet';

const labelClassName = 'text-[11px] font-semibold tracking-[0.12em] text-gray-400';

function DetailRow({ label, value }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className={labelClassName}>{label}</p>
      <p className="mt-2 text-sm text-white">{value || 'Not shared'}</p>
    </div>
  );
}

export default function MobileDriverDetail({ driver, isOpen, onClose }) {
  if (!driver) return null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={driver.name}
      subtitle={driver.phone}
      fullScreen
      footer={(
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white"
        >
          Close
        </button>
      )}
    >
      <div className="space-y-4">
        <DetailRow label="Status" value={driver.status} />
        <DetailRow label="Assigned vehicle" value={driver.assigned_vehicle || 'Not assigned'} />
        <DetailRow label="Availability" value={driver.status === 'Active' ? 'Available for assignment' : 'Currently unavailable'} />
        <DetailRow label="Experience" value={driver.experience} />
        <DetailRow label="Licence status" value={driver.licence_status} />
        <DetailRow label="Address" value={driver.address} />
        <DetailRow label="Notes" value={driver.notes} />
      </div>
    </BottomSheet>
  );
}
