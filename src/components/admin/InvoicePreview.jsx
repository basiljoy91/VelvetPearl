import React from 'react';
import CustomerDetails from '../Invoice/CustomerCard';
import InvoiceFooter from '../Invoice/InvoiceFooter';
import InvoiceHeader from '../Invoice/Header';
import JourneyDetails from '../Invoice/JourneyCard';
import PaymentSummary from '../Invoice/PaymentSummary';

export default function InvoicePreview({ invoice }) {
  return (
    <div className="flex justify-center bg-white print:block">
      <article className="w-full border border-slate-400 bg-white text-slate-950 shadow-sm print:border-0 print:shadow-none">
        <div className="p-3 sm:p-4 print:p-3">
          <InvoiceHeader invoice={invoice} />
          <div className="mt-3 grid items-stretch gap-3 md:grid-cols-2"><CustomerDetails invoice={invoice} /><JourneyDetails invoice={invoice} /></div>
          <div className="mt-3"><PaymentSummary invoice={invoice} /></div>
          <div className="mt-3"><InvoiceFooter invoice={invoice} /></div>
        </div>
      </article>
    </div>
  );
}
