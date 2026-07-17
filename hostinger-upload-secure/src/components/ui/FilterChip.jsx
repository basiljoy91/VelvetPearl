import React from 'react';
import { X } from 'lucide-react';

export default function FilterChip({ label, onRemove }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 rounded-full border border-[#EFBF04]/25 bg-[#EFBF04]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#EFBF04]"
    >
      <span>{label}</span>
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
