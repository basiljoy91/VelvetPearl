import React from 'react';

const DetailBlock = ({ title, value, className = '' }) => <section className={`rounded-[4px] border border-slate-300 p-3 ${className}`}><h3 className="text-[12px] font-bold uppercase">{title}</h3><p className="mt-1.5 whitespace-pre-wrap text-[11px] leading-4">{value || '—'}</p></section>;

export default function InvoiceFooter({ invoice = {} }) {
  return <footer className="border-b-2 border-slate-700 pb-2"><div className="grid gap-3 md:grid-cols-2"><div className="grid gap-3"><DetailBlock title="Notes" value={invoice.notes} /><DetailBlock title="Payment Methods" value={invoice.paymentMethods} /></div><section className="rounded-[4px] border border-slate-300 p-3"><DetailBlock title="Terms & Conditions" value={invoice.terms} className="border-0 p-0" /><div className="mt-4"><p className="text-[12px] font-bold uppercase">Authorized Signature</p><div className="mt-5 w-36 border-b border-slate-500" /></div></section></div></footer>;
}
