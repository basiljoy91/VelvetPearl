import React from 'react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatCurrency = (value) => (typeof value === 'number' && Number.isFinite(value) ? currencyFormatter.format(value) : '—');

export default function PaymentSummary({ invoice = {} }) {
  const rows = [['1', 'Base Fare', invoice.baseFare], ['2', 'Extra Charges', invoice.extraCharges], ['3', 'GST', invoice.gst]];
  return <section className="overflow-hidden rounded-[4px] border border-slate-300 bg-white text-[12px] text-slate-900">
    <div className="bg-[#3d7d1d] px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-white">Payment Summary</div>
    <table className="w-full table-fixed border-collapse"><thead className="bg-slate-50 text-[11px] uppercase"><tr><th className="w-12 border-b border-slate-200 px-3 py-2 text-center">#</th><th className="border-b border-l border-slate-200 px-3 py-2 text-left">Description</th><th className="w-[28%] border-b border-slate-200 px-3 py-2 text-right">Amount (₹)</th></tr></thead><tbody>
      {rows.map(([number, label, value]) => <tr key={label}><td className="border-b border-slate-200 px-3 py-2 text-center">{number}</td><td className="border-b border-l border-slate-200 px-3 py-2">{label}</td><td className="border-b border-slate-200 px-3 py-2 text-right font-medium">{formatCurrency(value)}</td></tr>)}
      <tr><td colSpan="2" className="border-b border-dashed border-slate-400 px-3 py-2 font-medium uppercase">Subtotal</td><td className="border-b border-dashed border-slate-400 px-3 py-2 text-right font-medium">{formatCurrency(invoice.subtotal)}</td></tr>
      <tr><td colSpan="2" className="border-b border-slate-200 px-3 py-2 text-[14px] font-extrabold uppercase">Grand Total</td><td className="border-b border-slate-200 px-3 py-2 text-right text-[14px] font-extrabold">{formatCurrency(invoice.grandTotal)}</td></tr>
      <tr><td colSpan="2" className="border-b border-slate-200 px-3 py-2 font-medium uppercase">Advance Payment</td><td className="border-b border-slate-200 px-3 py-2 text-right font-medium">{formatCurrency(invoice.advancePayment)}</td></tr>
      <tr className="bg-[#edf7e7]"><td colSpan="2" className="px-3 py-2 text-[14px] font-extrabold uppercase text-[#356c1a]">Balance Due</td><td className="px-3 py-2 text-right text-[14px] font-extrabold text-[#356c1a]">{formatCurrency(invoice.balanceDue)}</td></tr>
    </tbody></table>
  </section>;
}
