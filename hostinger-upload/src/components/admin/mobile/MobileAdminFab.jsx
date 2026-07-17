import React from 'react';
import { Plus } from 'lucide-react';

export default function MobileAdminFab({ onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-5 z-[95] inline-flex items-center gap-2 rounded-full bg-[#EFBF04] px-4 py-3 text-sm font-bold text-black shadow-[0_18px_34px_rgba(239,191,4,0.25)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
    >
      <Plus className="h-4 w-4" />
      <span>New</span>
    </button>
  );
}
