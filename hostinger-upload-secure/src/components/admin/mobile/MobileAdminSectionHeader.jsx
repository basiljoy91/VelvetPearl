import React from 'react';

export default function MobileAdminSectionHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-gray-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
