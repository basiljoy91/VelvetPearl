import React from 'react';
import { Link } from 'react-router-dom';

export default function Services() {
  return (
    <main className="bg-background px-8 pb-24 pt-32">
      {/* Hero Section */}
      <header className="max-w-7xl mx-auto mb-20">
        <h1 className="font-headline font-light text-6xl md:text-8xl tracking-tighter mb-4 text-white">Our Services</h1>
        <div className="w-24 h-1 bg-secondary mb-8"></div>
        <p className="max-w-2xl font-body text-on-surface-variant text-lg leading-relaxed">
          Enquiry-first travel support across South India for cabs, tours, stays, and special requests.
        </p>
      </header>

      {/* Bento Grid Services */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Cab Services (Large Featured) */}
        <section className="md:col-span-8 glass-card p-10 rounded-xl flex flex-col justify-between min-h-[500px] group">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-secondary text-4xl">local_taxi</span>
              <h2 className="font-headline text-3xl font-bold tracking-tight text-white">Cab Services</h2>
            </div>
            <p className="text-on-surface-variant mb-8 max-w-xl text-lg">
              Cab enquiries for airport pickups, outstation travel, temple routes, and local transfers. Vehicle options and pricing are shared after manual review.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-surface-container-high p-6 rounded-lg border-l-2 border-secondary/30">
                <span className="font-label text-[10px] text-secondary uppercase tracking-widest block mb-2">Service Area</span>
                <p className="text-white font-semibold">Airport pickup/drop assistance</p>
              </div>
              <div className="bg-surface-container-high p-6 rounded-lg border-l-2 border-primary-container/30">
                <span className="font-label text-[10px] text-primary-container uppercase tracking-widest block mb-2">Service Area</span>
                <p className="text-white font-semibold">Local sightseeing support</p>
              </div>
              <div className="bg-surface-container-high p-6 rounded-lg border-l-2 border-outline-variant/30">
                <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">Service Area</span>
                <p className="text-white font-semibold">Outstation trip support</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 font-body">
            <div className="flex gap-4 text-sm text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">airport_shuttle</span> Family/group travel support</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">distance</span> Chennai and South India travel support</span>
            </div>
            <Link to="/book/cab" className="w-full sm:w-auto bg-primary-container text-white px-10 py-4 font-label text-sm uppercase tracking-widest rounded-md hover:brightness-110 transition-all shadow-lg shadow-blue-900/20 text-center">
              Submit Cab Enquiry
            </Link>
          </div>
        </section>

        {/* Tours (Vertical Accent) */}
        <section className="md:col-span-4 glass-card p-10 rounded-xl flex flex-col justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <span className="material-symbols-outlined text-secondary text-4xl mb-6">travel_explore</span>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-white mb-4">Tours</h2>
            <p className="text-on-surface-variant mb-6">
              Tell us your destination, travel window, group size, and pickup needs. We will suggest an itinerary after review.
            </p>
            <ul className="space-y-4 mb-8 font-body">
              <li className="flex items-center gap-3 text-sm text-white">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span> Tour package enquiry
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span> Custom trip enquiry
              </li>
            </ul>
          </div>
          <Link to="/book/tour" className="relative z-10 w-full border border-secondary text-secondary px-6 py-4 font-label text-sm uppercase tracking-widest rounded-md hover:bg-secondary hover:text-on-secondary transition-all text-center">
            Submit Tour Enquiry
          </Link>
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <span className="material-symbols-outlined text-[120px] text-white">temple_hindu</span>
          </div>
        </section>

        {/* Room Bookings */}
        <section className="md:col-span-4 glass-card p-8 rounded-xl flex flex-col justify-between group">
          <div>
            <span className="material-symbols-outlined text-secondary text-3xl mb-4">bed</span>
            <h3 className="font-headline text-2xl font-bold text-white mb-3">Room Bookings</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-body">
              Room or stay enquiry with manual review. Hotel partner details will be added soon.
            </p>
          </div>
          <Link to="/book/room" className="w-full bg-surface-container-high text-white px-6 py-3 font-label text-xs uppercase tracking-widest rounded-md border border-white/5 hover:border-secondary/50 transition-all text-center font-bold">
            Submit Room Enquiry
          </Link>
        </section>

        {/* Event Planning */}
        <section className="md:col-span-4 glass-card p-8 rounded-xl flex flex-col justify-between group">
          <div>
            <span className="material-symbols-outlined text-secondary text-3xl mb-4">celebration</span>
            <h3 className="font-headline text-2xl font-bold text-white mb-3">Event Planning</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-body">
              Event requirements are reviewed manually before venue support, pricing, or vendor coordination is discussed.
            </p>
          </div>
          <Link to="/book/event" className="w-full bg-surface-container-high text-white px-6 py-3 font-label text-xs uppercase tracking-widest rounded-md border border-white/5 hover:border-secondary/50 transition-all text-center font-bold">
            Submit Event Enquiry
          </Link>
        </section>

        {/* Support Card (Replacing Manpower) */}
        <section className="md:col-span-4 glass-card p-8 rounded-xl flex flex-col justify-between group relative overflow-hidden bg-primary-container/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/20 blur-[60px]"></div>
          <div>
            <span className="material-symbols-outlined text-secondary text-3xl mb-4">support_agent</span>
            <h3 className="font-headline text-2xl font-bold text-white mb-3 tracking-tight">Dedicated Support</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-body">
              Reach us on WhatsApp for quick follow-up after you submit an enquiry.
            </p>
          </div>
          <Link to="/contact" className="w-full bg-primary-container text-white px-6 py-3 font-label text-xs uppercase tracking-widest rounded-md border border-white/5 hover:brightness-110 transition-all text-center font-bold">
            Contact Us
          </Link>
        </section>
      </div>

      {/* Signature Route Map CTA Area */}
      <section className="max-w-7xl mx-auto mt-24">
        <div className="bg-surface-container-low p-12 rounded-xl relative overflow-hidden border-l-4 border-secondary">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="font-headline text-4xl font-bold text-white mb-4">Planning a custom route?</h2>
              <p className="text-on-surface-variant font-body">Our team can review your route, timing, stay preferences, and service mix before sharing a final quote.</p>
            </div>
            <div className="flex gap-4 font-body">
              <Link to="/book/cab" className="bg-primary-container text-white px-8 py-4 font-label text-sm uppercase tracking-widest rounded-md font-bold">Start Enquiry</Link>
            </div>
          </div>
          {/* Route Map Abstract Decoration */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 800 200">
              <path d="M50,100 C150,50 250,150 350,100 S550,50 650,100 S750,150 850,100" fill="none" stroke="#EFBF04" strokeDasharray="8,8" strokeWidth="2"></path>
              <circle cx="50" cy="100" fill="#2249DB" r="4"></circle>
              <circle cx="350" cy="100" fill="#2249DB" r="4"></circle>
              <circle cx="650" cy="100" fill="#2249DB" r="4"></circle>
            </svg>
          </div>
        </div>
      </section>
    </main>
  );
}
