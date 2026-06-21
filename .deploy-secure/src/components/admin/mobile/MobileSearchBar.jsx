import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function MobileSearchBar({
  value,
  onChange,
  placeholder,
  onOpenFilters,
  filterCount = 0,
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="flex min-w-0 flex-1 items-center gap-3 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-gray-500" />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
        />
      </label>
      <button
        type="button"
        onClick={onOpenFilters}
        className="relative inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/5 text-white"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {filterCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EFBF04] px-1 text-[10px] font-bold text-black">
            {filterCount}
          </span>
        )}
      </button>
    </div>
  );
}
