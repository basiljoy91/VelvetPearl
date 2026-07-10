import React from 'react';
import { Globe2, Mail, MapPin, Phone } from 'lucide-react';
import logoSrc from '../../assets/branding/velvet-pearl/velvet-pearl-banner-clean.png';

const display = (item) => item || '—';

export default function InvoiceHeader({ invoice = {} }) {
  const invoiceRows = [
    ['Invoice No.', invoice.invoiceNumber], ['Invoice Date', invoice.invoiceDate], ['Booking ID', invoice.bookingId],
    ['Payment Status', invoice.paymentStatus], ['Due Date', invoice.dueDate],
  ];
  const companyDetails = [
    [MapPin, '123, Business Park, Sector 62, Noida, Uttar Pradesh - 201301'],
    [Phone, '+91 78450 39353'], [Mail, 'velvetpearl2026@gmail.com'], [Globe2, 'www.velvetpearl.in'],
  ];

  const paymentStatusClass = ['complete', 'paid'].includes(String(invoice.paymentStatus).toLowerCase())
    ? 'border-emerald-500 text-emerald-700'
    : 'border-amber-500 text-amber-700';

  return <header className="border-b-2 border-slate-700 pb-3">
    <div className="grid gap-4 sm:grid-cols-[1.18fr_0.82fr] sm:gap-7">
      <div className="border-b border-slate-300 pb-3 sm:border-b-0 sm:border-r sm:pr-7">
        <img src={logoSrc} alt="Velvet Pearl" className="h-auto w-full max-w-[390px] object-contain object-left" />
        <div className="mt-3.5 space-y-1.5 text-[12px] leading-5 text-slate-900">
          {companyDetails.map(([Icon, item]) => <div key={item} className="flex items-start gap-2.5"><Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[2.5]" /><span>{item}</span></div>)}
        </div>
      </div>
      <div className="pt-0.5">
        <h1 className="text-[26px] font-extrabold tracking-tight text-slate-950 sm:text-[30px]">TAX INVOICE</h1>
        <div className="mt-3.5 border-t border-slate-300 pt-2 text-[12px] leading-5">
          {invoiceRows.map(([label, item]) => <div key={label} className="grid grid-cols-[minmax(106px,1fr)_10px_minmax(0,1fr)] gap-1.5 py-0.5"><span className="font-bold text-slate-900">{label}</span><span className="font-semibold">:</span>{label === 'Payment Status' && item ? <span className={`w-fit border px-1.5 font-semibold leading-5 ${paymentStatusClass}`}>{item}</span> : <span className="font-semibold text-slate-900">{display(item)}</span>}</div>)}
        </div>
      </div>
    </div>
  </header>;
}
