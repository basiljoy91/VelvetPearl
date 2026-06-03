import React from 'react';

function getExpiryLabel(expiry) {
  if (!expiry) return 'Insurance not shared';
  const date = new Date(expiry);
  if (Number.isNaN(date.getTime())) return expiry;
  const today = new Date();
  const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Insurance expired';
  if (diffDays <= 30) return `Insurance due in ${diffDays} days`;
  return `Insurance until ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export default function MobileFleetRow({ vehicle, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white">{vehicle.plate || vehicle.id}</p>
            <p className="mt-1 text-sm text-gray-400">{vehicle.model} • {vehicle.type || 'Vehicle'}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
            vehicle.status === 'Available'
              ? 'bg-emerald-500/12 text-emerald-300'
              : vehicle.status === 'Maintenance'
                ? 'bg-rose-500/12 text-rose-200'
                : 'bg-white/10 text-gray-200'
          }`}>
            {vehicle.status}
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-300">{getExpiryLabel(vehicle.insurance_expiry)}</p>
      </div>
    </button>
  );
}
