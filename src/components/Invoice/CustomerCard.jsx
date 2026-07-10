import React from 'react';
import { Mail, Phone, UserRound } from 'lucide-react';

export default function CustomerCard({ invoice = {} }) {
  return <section className="h-full rounded-[4px] border border-slate-300"><h2 className="flex items-center gap-3 border-b border-slate-300 bg-slate-50 py-2 pr-3 text-[14px] font-bold uppercase"><span className="bg-[#4b9525] p-2 text-white"><UserRound className="h-4 w-4" /></span>Bill To</h2><div className="flex min-h-[136px] flex-col space-y-2.5 p-4 text-[13px]"><p className="text-[16px] font-bold">{invoice.customerName || '—'}</p><p className="flex items-center gap-2.5 break-all"><Phone className="h-3.5 w-3.5 shrink-0" />{invoice.phoneNumber || '—'}</p><p className="flex items-center gap-2.5 break-all"><Mail className="h-3.5 w-3.5 shrink-0" />{invoice.email || '—'}</p><div className="mt-auto border-b border-slate-300" /></div></section>;
}
