import React from 'react';
import FilterChip from '../../ui/FilterChip';

export default function MobileActiveFilterChips({ chips }) {
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <FilterChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
      ))}
    </div>
  );
}
