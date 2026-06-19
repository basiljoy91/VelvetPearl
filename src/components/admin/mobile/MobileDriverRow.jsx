import React from 'react';

export default function MobileDriverRow({ driver, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white">{driver.name}</p>
            <p className="mt-1 text-sm text-gray-400">{driver.phone}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${driver.status === 'Active' ? 'bg-emerald-500/12 text-emerald-300' : 'bg-white/10 text-gray-200'}`}>
            {driver.status}
          </span>
        </div>
        <p className="mt-3 text-sm text-gray-300">
          {driver.assigned_vehicle ? `Assigned: ${driver.assigned_vehicle}` : 'No vehicle assigned'}
        </p>
      </div>
    </button>
  );
}
