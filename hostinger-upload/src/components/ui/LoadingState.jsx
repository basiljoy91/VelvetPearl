import React from 'react';

export function InlineSpinner({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  );
}

export function LoadingButton({
  isLoading,
  idleLabel,
  loadingLabel = 'Loading...',
  className = '',
  spinnerClassName = '',
  ...props
}) {
  const labelReservation = String(loadingLabel).length > String(idleLabel).length
    ? loadingLabel
    : idleLabel;

  return (
    <button
      {...props}
      aria-busy={isLoading}
      aria-disabled={isLoading || props.disabled}
      disabled={isLoading || props.disabled}
      className={`inline-flex w-full items-center justify-center gap-3 rounded-xl bg-primary-container px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      type={props.type || 'submit'}
    >
      <span className="relative inline-flex items-center justify-center gap-3">
        <span aria-hidden="true" className="invisible">
          {labelReservation}
        </span>
        <span className="absolute inset-0 flex items-center justify-center gap-3 whitespace-nowrap">
          {isLoading && <InlineSpinner className={spinnerClassName} />}
          <span>{isLoading ? loadingLabel : idleLabel}</span>
        </span>
      </span>
      <span className="sr-only" aria-live="polite" role="status">
        {isLoading ? loadingLabel : ''}
      </span>
    </button>
  );
}

export function SectionLoader({ label = 'Loading...', className = '' }) {
  return (
    <div aria-live="polite" className={`rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300 ${className}`} role="status">
      <div className="flex items-center gap-3">
        <InlineSpinner className="text-gray-300" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function LoadingOverlay({ label = 'Loading...', className = '' }) {
  return (
    <div aria-live="polite" className={`absolute inset-0 z-10 flex items-center justify-center bg-black/35 backdrop-blur-[2px] ${className}`} role="status">
      <div className="rounded-2xl border border-white/10 bg-[#111111]/90 px-5 py-4 text-sm text-gray-200 shadow-xl">
        <div className="flex items-center gap-3">
          <InlineSpinner />
          <span>{label}</span>
        </div>
      </div>
    </div>
  );
}

export function SkeletonBlock({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl bg-white/10 ${className}`}
    />
  );
}
