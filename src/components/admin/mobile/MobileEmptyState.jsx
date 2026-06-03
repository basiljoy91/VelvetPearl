import React from 'react';

export default function MobileEmptyState({ title, description, action }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 px-5 py-6 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-2 text-sm leading-relaxed text-gray-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
