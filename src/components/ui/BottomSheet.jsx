import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  fullScreen = false,
  closeLabel = 'Close',
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] md:hidden">
      <button
        type="button"
        aria-label="Dismiss sheet backdrop"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 opacity-100"
        onClick={onClose}
      />
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col overflow-hidden border-t border-white/10 bg-[#0B0B0B] shadow-[0_-24px_60px_rgba(0,0,0,0.55)] transition-all duration-300 ease-out ${fullScreen ? 'top-0 rounded-none' : 'max-h-[88vh] rounded-t-[30px]'} translate-y-0 opacity-100`}
      >
        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0B0B0B]/95 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur">
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-white/10" />
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
            </div>
            <button
              type="button"
              aria-label={closeLabel}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-200"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>

        {footer && (
          <div className="sticky bottom-0 border-t border-white/10 bg-[#0B0B0B]/95 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
