import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function MobileDetailAccordion({
  title,
  description,
  defaultOpen = true,
  children,
  actions = null,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.045] shadow-[0_18px_80px_rgba(0,0,0,0.24)]">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left"
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && <p className="mt-1 text-sm leading-relaxed text-gray-400">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {actions}
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300">
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-white/10 px-5 py-5">
          {children}
        </div>
      )}
    </section>
  );
}
