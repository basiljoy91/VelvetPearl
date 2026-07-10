import React from 'react';

export default function InvoiceActions({ onDownloadPdf, onClose }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <button type="button" onClick={onDownloadPdf} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
        Download PDF
      </button>
      <button type="button" onClick={onClose} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
        Close
      </button>
    </div>
  );
}
