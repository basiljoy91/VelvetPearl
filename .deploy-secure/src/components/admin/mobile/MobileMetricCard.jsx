import React from 'react';

export default function MobileMetricCard({ label, value, onClick, highlight = false }) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-[22px] border px-4 py-4 text-left ${highlight ? 'border-[#EFBF04]/30 bg-[#EFBF04]/8' : 'border-white/10 bg-white/5'} ${onClick ? 'transition hover:border-[#EFBF04]/40 hover:bg-white/8' : ''}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </Component>
  );
}
