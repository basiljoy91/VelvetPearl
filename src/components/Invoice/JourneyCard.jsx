import React from 'react';
import { CarFront } from 'lucide-react';

export default function JourneyCard({ invoice = {} }) {
  const items = [['Pickup Location', invoice.pickupLocation], ['Drop Location', invoice.dropLocation], ['Travel Date', invoice.travelDate], ['Vehicle Type', invoice.vehicleType], ['Service Type', invoice.serviceType], ['No. of Passengers', invoice.passengers]];
  return <section className="h-full rounded-[4px] border border-slate-300"><h2 className="flex items-center gap-3 border-b border-slate-300 bg-slate-50 py-2 pr-3 text-[14px] font-bold uppercase"><span className="bg-[#4b9525] p-2 text-white"><CarFront className="h-4 w-4" /></span>Journey Details</h2><div className="px-4">{items.map(([label, item], index) => <div key={label} className={`grid grid-cols-[minmax(104px,1fr)_10px_minmax(0,1fr)] gap-1.5 py-1.5 text-[12px] ${index < items.length - 1 ? 'border-b border-slate-200' : ''}`}><span>{label}</span><span>:</span><span className="text-right font-medium">{item || '—'}</span></div>)}</div></section>;
}
