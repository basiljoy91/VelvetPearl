import React from 'react';
import BottomSheet from '../../ui/BottomSheet';

const labelClassName = 'text-[11px] font-semibold tracking-[0.12em] text-gray-400';

function DetailRow({ label, value, danger = false }) {
  return (
    <div className={`rounded-[18px] border px-4 py-3 ${danger ? 'border-rose-500/20 bg-rose-500/8' : 'border-white/10 bg-white/[0.04]'}`}>
      <p className={labelClassName}>{label}</p>
      <p className={`mt-2 text-sm ${danger ? 'text-rose-200' : 'text-white'}`}>{value || 'Not shared'}</p>
    </div>
  );
}

function getInsuranceAlert(expiry) {
  if (!expiry) return null;
  const date = new Date(expiry);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Insurance document has expired.';
  if (diffDays <= 30) return `Insurance expires in ${diffDays} days.`;
  return null;
}

export default function MobileFleetDetail({ vehicle, isOpen, onClose }) {
  if (!vehicle) return null;

  const insuranceAlert = getInsuranceAlert(vehicle.insurance_expiry);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={vehicle.plate || vehicle.id}
      subtitle={vehicle.model}
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
        <DetailRow label="Vehicle type" value={vehicle.type || 'Not shared'} />
        <DetailRow label="Status" value={vehicle.status} />
        <DetailRow label="Assigned driver" value={vehicle.assigned_driver || vehicle.assigned_driver_name || 'Not assigned'} />
        <DetailRow label="Insurance expiry" value={vehicle.insurance_expiry || 'Not shared'} danger={Boolean(insuranceAlert)} />
        {insuranceAlert && <DetailRow label="Attention" value={insuranceAlert} danger />}
        <DetailRow label="Fuel status" value={vehicle.fuel_status ? `${vehicle.fuel_status}%` : 'Not shared'} />
        <DetailRow label="Condition" value={vehicle.condition || 'Not shared'} />
        <DetailRow label="Notes" value={vehicle.notes || 'Not shared'} />
      </div>
    </BottomSheet>
  );
}
