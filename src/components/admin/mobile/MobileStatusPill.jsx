import React from 'react';

export default function MobileStatusPill({ status, getStatusClasses }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${getStatusClasses(status)}`}>
      {status}
    </span>
  );
}
