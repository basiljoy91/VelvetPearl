import React from 'react';
import { Link } from 'react-router-dom';

export default function Routes() {
  const routes = [
    {
      from: 'Chennai',
      to: 'Pondicherry',
      distance: '155 KM',
      via: 'ECR Scenic Road',
      duration: '3h 15m',
      vehicle: 'Executive Sedan',
      price: 'Starting from price will be updated soon'
    },
    {
      from: 'Coimbatore',
      to: 'Ooty',
      distance: '86 KM',
      via: 'Hairpin Bends',
      duration: '2h 45m',
      vehicle: 'Premium SUV',
      price: 'Starting from price will be updated soon'
    },
    {
      from: 'Madurai',
      to: 'Kodaikanal',
      distance: '115 KM',
      via: 'Mist Hills',
      duration: '3h 30m',
      vehicle: 'Luxury Traveler',
      price: 'Starting from price will be updated soon'
    }
  ];

  return (
    <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <header className="mb-16 relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
        <h1 className="font-headline font-light text-6xl md:text-8xl tracking-tighter mb-4 text-white">
          Popular <span className="font-bold text-primary-fixed-dim block md:inline">Routes.</span>
        </h1>
        <p className="font-label text-xs uppercase tracking-[0.3em] text-secondary font-semibold">Editable Route Examples</p>
      </header>

      {/* Filters Section */}
      <section className="mb-12 glass-panel p-8 rounded-xl border border-outline-variant/20 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-[#8e90a1] ml-1 font-bold">From</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary-fixed-dim text-sm">location_on</span>
              <select className="w-full bg-surface-container-highest border-none text-on-surface pl-10 pr-4 py-3 text-sm rounded focus:ring-1 focus:ring-secondary appearance-none outline-none">
                <option>Chennai (MAA)</option>
                <option>Madurai</option>
                <option>Coimbatore</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-[#8e90a1] ml-1 font-bold">To</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary-fixed-dim text-sm">map</span>
              <select className="w-full bg-surface-container-highest border-none text-on-surface pl-10 pr-4 py-3 text-sm rounded focus:ring-1 focus:ring-secondary appearance-none outline-none">
                <option>Pondicherry</option>
                <option>Ooty</option>
                <option>Kodaikanal</option>
                <option>Thanjavur</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-[#8e90a1] ml-1 font-bold">Vehicle Type</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary-fixed-dim text-sm">directions_car</span>
              <select className="w-full bg-surface-container-highest border-none text-on-surface pl-10 pr-4 py-3 text-sm rounded focus:ring-1 focus:ring-secondary appearance-none outline-none">
                <option>Executive Sedan</option>
                <option>Premium SUV</option>
                <option>Luxury Traveler</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-[#8e90a1] ml-1 font-bold">Date</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary-fixed-dim text-sm">calendar_month</span>
              <input className="w-full bg-surface-container-highest border-none text-on-surface pl-10 pr-4 py-3 text-sm rounded focus:ring-1 focus:ring-secondary outline-none" type="date"/>
            </div>
          </div>
        </div>
      </section>

      {/* Route Listings Table */}
      <section className="space-y-4">
        <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20">
                <th className="px-8 py-6 font-label text-[10px] uppercase tracking-[0.2em] text-[#8e90a1] font-bold">Route & Distance</th>
                <th className="px-8 py-6 font-label text-[10px] uppercase tracking-[0.2em] text-[#8e90a1] font-bold">Est. Duration</th>
                <th className="px-8 py-6 font-label text-[10px] uppercase tracking-[0.2em] text-[#8e90a1] font-bold">Vehicle</th>
                <th className="px-8 py-6 font-label text-[10px] uppercase tracking-[0.2em] text-[#8e90a1] font-bold">Pricing Note</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {routes.map((route, index) => (
                <tr key={index} className="glass-panel group transition-all duration-300 hover:bg-surface-container-high/60">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-primary-container/20 flex items-center justify-center text-primary-fixed-dim">
                        <span className="material-symbols-outlined">route</span>
                      </div>
                      <div>
                        <p className="font-headline font-bold text-lg text-white">{route.from} <span className="text-secondary">→</span> {route.to}</p>
                        <p className="text-xs text-[#8e90a1] font-label tracking-widest uppercase">{route.distance} • {route.via}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-2 text-on-surface font-body">
                      <span className="material-symbols-outlined text-sm opacity-60">schedule</span>
                      <span className="font-medium">{route.duration}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className="bg-surface-container-highest text-[10px] font-label font-bold uppercase tracking-widest px-3 py-1 rounded border border-outline-variant/30 text-white">{route.vehicle}</span>
                  </td>
                  <td className="px-8 py-8">
                    <p className="text-lg font-headline font-bold text-white leading-snug">{route.price}</p>
                    <p className="text-[10px] text-[#8e90a1] font-label tracking-widest uppercase mt-2">Submit your requirement to get the best available quote</p>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <Link to="/book/cab" className="inline-block bg-primary-container text-white px-8 py-3 font-label text-xs uppercase tracking-widest font-black rounded transition-all duration-300 hover:bg-on-primary-fixed-variant hover:shadow-[0_0_20px_rgba(34,73,219,0.4)] active:scale-95">
                      Enquire
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Promotional Cards */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-surface-container-low p-10 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
            <span className="material-symbols-outlined text-8xl text-secondary/5">verified</span>
          </div>
          <div className="relative z-10 max-w-md">
            <span className="inline-block bg-[#EFBF04] text-[#241a00] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-6">Editable Pricing Note</span>
            <h3 className="font-headline text-3xl font-bold text-white mb-4 leading-tight">Need a custom round trip?</h3>
            <p className="font-body text-[#8e90a1] leading-relaxed mb-8">Share your pickup, return timing, and vehicle preference. Final pricing is shared after manual review.</p>
            <Link className="text-secondary font-label text-xs uppercase tracking-widest font-bold flex items-center gap-2 group-hover:gap-4 transition-all" to="/services">
              Learn more about enquiry options <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
        <div className="bg-primary-container p-10 rounded-xl flex flex-col justify-between text-white shadow-2xl shadow-blue-900/40">
          <div className="space-y-4">
            <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>support_agent</span>
            <h4 className="font-headline text-xl font-bold">WhatsApp Follow-Up</h4>
            <p className="font-body text-primary-fixed-dim text-sm leading-relaxed">Contact our team for route clarification, timing review, and service follow-up after enquiry submission.</p>
          </div>
          <div className="pt-8">
            <p className="font-label text-[10px] uppercase tracking-widest text-primary-fixed-dim opacity-70 mb-1">WhatsApp concierge</p>
            <p className="text-xl font-bold font-headline tracking-tighter">+91-9943139353</p>
          </div>
        </div>
      </section>
    </main>
  );
}
