import React from 'react';

export default function MobileQuickActions({
  viewLabel = 'View',
  onView,
  whatsappHref,
  onMarkContacted,
  markLabel = 'Mark Contacted',
  compact = false,
}) {
  const buttonClass = compact
    ? 'rounded-full border px-3 py-2 text-[10px] font-semibold tracking-[0.14em]'
    : 'rounded-2xl border px-4 py-3 text-[11px] font-semibold tracking-[0.14em]';

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onView}
        className={`${buttonClass} border-white/10 bg-white/8 text-white`}
      >
        {viewLabel}
      </button>
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className={`${buttonClass} border-sky-400/25 bg-sky-500/10 text-sky-300`}
        >
          WhatsApp
        </a>
      )}
      {onMarkContacted && (
        <button
          type="button"
          onClick={onMarkContacted}
          className={`${buttonClass} border-amber-400/30 bg-amber-500/10 text-amber-300`}
        >
          {markLabel}
        </button>
      )}
    </div>
  );
}
