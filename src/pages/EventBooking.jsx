import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function EventBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isBooked, setIsBooked] = useState(false);

  return (
    <main className="pt-20 pb-24 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[614px] flex items-center px-8 md:px-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img className="w-full h-full object-cover opacity-40" data-alt="Luxury gala event ballroom with golden lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDW8JKcTCeHoTAUC6eZ0iDYXVKDstdSlSaBrTADlI1LNoC-uAR74wUx8PpfhINZy0ujycO89AcBDmdhq0C-MQLsXK8SZDsWQ_4DcPvw7SZ8WAZn_p8c0oZDro-iWb_cbiDHk34Jb0vDnmDaNL4F2I2tl5jW81U9atl0C9xzd8ccPX2m7KCr09Za7ItuoLEVPdNvk8RNeuUvBfo0itnkUxIwUJ2s114c-nRewt-jJDUXY4w60IcyBNGmlsg1580tJhAEHLgLSJFOXRul" alt="Event Planning"/>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="font-label uppercase tracking-[0.2em] text-secondary text-xs mb-4 block">Bespoke Experiences</span>
          <h1 className="font-headline text-5xl md:text-7xl font-black text-on-surface tracking-tighter leading-none mb-6">
            Event <br/><span className="text-glow text-primary-container">Planning</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md font-light leading-relaxed">
            Transforming visions into atmospheric realities. From intimate gatherings to monumental celebrations across South India.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="px-6 -mt-32 relative z-20 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
        
        {/* Information Panel (Asymmetric) */}
        <div className="lg:col-span-4 space-y-12 pt-40 hidden lg:block">
          <div>
            <h3 className="font-headline text-2xl font-bold mb-4">The Standard</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">Every event is curated by our Lead Digital Concierge to ensure seamless integration of logistics, decor, and AV tech.</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full border border-secondary/20 flex items-center justify-center text-secondary group-hover:bg-secondary/10 transition-colors">
                <span className="material-symbols-outlined text-lg">verified</span>
              </div>
              <span className="font-label text-xs uppercase tracking-widest text-[#E5E2E3]">Premium Vendor Access</span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full border border-secondary/20 flex items-center justify-center text-secondary group-hover:bg-secondary/10 transition-colors">
                <span className="material-symbols-outlined text-lg">schedule</span>
              </div>
              <span className="font-label text-xs uppercase tracking-widest text-[#E5E2E3]">24/7 Logistics Support</span>
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-8 glass-panel rounded-xl p-8 md:p-12 shadow-[0_24px_48px_rgba(0,0,0,0.5)] border border-outline-variant/10">
          {isBooked ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
              </div>
              <h3 className="font-headline text-3xl font-bold text-white mb-4">Inquiry Received!</h3>
              <p className="text-on-surface-variant max-w-sm mb-8">
                Your event planning requirements have been securely logged. Our Lead Digital Concierge will be in touch shortly via WhatsApp to begin curation.
              </p>
              <button
                className="bg-primary-container text-white px-8 py-4 rounded-md font-bold font-jakarta text-[10px] uppercase tracking-widest hover:brightness-110 transition-all border-none"
                onClick={() => navigate('/')}
              >
                Return to Home
              </button>
            </div>
          ) : (
            <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setIsBooked(true); }}>
              {/* Section: Personal Info */}
              <div>
                <h2 className="font-headline text-xl font-bold mb-6 text-secondary flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-secondary/30"></span>
                  Client Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Full Name</label>
                    <input defaultValue={state?.name || ''} className="w-full bg-black/40 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 focus:border-l-2 focus:border-secondary transition-all outline-none" placeholder="Enter name" type="text" required/>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Email</label>
                    <input defaultValue={state?.email || ''} className="w-full bg-black/40 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 focus:border-l-2 focus:border-secondary transition-all outline-none" placeholder="email@example.com" type="email" required/>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/3 space-y-2">
                      <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Code</label>
                      <input className="w-full bg-black/40 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 focus:border-l-2 focus:border-secondary transition-all outline-none" defaultValue="91" placeholder="+91" type="number" required/>
                    </div>
                    <div className="w-2/3 space-y-2">
                      <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Contact Phone</label>
                      <input defaultValue={state?.phone || ''} className="w-full bg-black/40 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 focus:border-l-2 focus:border-secondary transition-all outline-none" placeholder="99999 99999" type="tel" required/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Country</label>
                    <input defaultValue={state?.country || ''} className="w-full bg-black/40 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 focus:border-l-2 focus:border-secondary transition-all outline-none" placeholder="United Kingdom" type="text" required/>
                  </div>
                </div>
              </div>

              {/* Section: Event Specs */}
              <div>
                <h2 className="font-headline text-xl font-bold mb-6 text-secondary flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-secondary/30"></span>
                  Event Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Event Type</label>
                    <select className="w-full bg-black/40 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 focus:border-l-2 focus:border-secondary transition-all outline-none appearance-none" required>
                      <option>Wedding</option>
                      <option>Conference</option>
                      <option>Party</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Event Date</label>
                    <input className="w-full bg-black/40 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 focus:border-l-2 focus:border-secondary transition-all outline-none" type="date" required/>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Venue Location</label>
                    <input className="w-full bg-black/40 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 focus:border-l-2 focus:border-secondary transition-all outline-none" placeholder="Preferred City/Area" type="text" required/>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">Estimated Guests</label>
                    <input className="w-full bg-black/40 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 focus:border-l-2 focus:border-secondary transition-all outline-none" min="1" placeholder="No. of attendees" type="number" required/>
                  </div>
                </div>
              </div>

              {/* Section: Required Services */}
              <div>
                <label className="font-label text-[10px] uppercase tracking-[0.15em] text-on-surface-variant mb-4 block">Services Required</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Catering', 'AV', 'Decor', 'Logistics'].map((service) => (
                    <label key={service} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input className="peer hidden" type="checkbox"/>
                        <div className="w-5 h-5 border border-outline rounded-sm bg-surface-container peer-checked:bg-primary-container peer-checked:border-primary transition-all"></div>
                        <span className="material-symbols-outlined text-xs text-white absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100">check</span>
                      </div>
                      <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <a className="flex items-center gap-3 text-secondary hover:text-white transition-colors" href="https://wa.me/919943139353" target="_blank" rel="noreferrer">
                  <span className="material-symbols-outlined">chat</span>
                  <span className="font-label text-xs uppercase tracking-widest font-bold">+91 99431 39353</span>
                </a>
                <button type="submit" className="w-full md:w-auto px-10 py-4 bg-primary-container text-white font-headline font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-inverse-primary transition-all active:scale-95 shadow-xl shadow-primary-container/20 border-none">
                  Consult with Event Team
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
