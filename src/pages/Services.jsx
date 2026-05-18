import React from 'react';
import { Link } from 'react-router-dom';

export default function Services() {
  return (
    <main className="pt-32 pb-24 hero-gradient px-8">
      {/* Hero Section */}
      <header className="max-w-7xl mx-auto mb-20">
        <h1 className="font-headline font-light text-6xl md:text-8xl tracking-tighter mb-4 text-white">Our Services</h1>
        <div className="w-24 h-1 bg-secondary mb-8"></div>
        <p className="max-w-2xl font-body text-on-surface-variant text-lg leading-relaxed">
          Elevating your journey across South India with bespoke transportation, curated experiences, and elite hospitality management.
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
              Premium fleet solutions for discerning travelers. From executive arrivals to leisure explorations, we ensure every mile is defined by comfort and punctuality.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-surface-container-high p-6 rounded-lg border-l-2 border-secondary/30">
                <span className="font-label text-[10px] text-secondary uppercase tracking-widest block mb-2">Executive</span>
                <p className="text-white font-semibold">Luxury Sedan</p>
              </div>
              <div className="bg-surface-container-high p-6 rounded-lg border-l-2 border-primary-container/30">
                <span className="font-label text-[10px] text-primary-container uppercase tracking-widest block mb-2">Adventure</span>
                <p className="text-white font-semibold">Premium SUV</p>
              </div>
              <div className="bg-surface-container-high p-6 rounded-lg border-l-2 border-outline-variant/30">
                <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">Elite</span>
                <p className="text-white font-semibold">Luxury Coaches</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 font-body">
            <div className="flex gap-4 text-sm text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">airport_shuttle</span> Airport Transfers</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">distance</span> Outstation Trips</span>
            </div>
            <Link to="/book/cab" className="w-full sm:w-auto bg-primary-container text-white px-10 py-4 font-label text-sm uppercase tracking-widest rounded-md hover:brightness-110 transition-all shadow-lg shadow-blue-900/20 text-center">
              Book Cab
            </Link>
          </div>
        </section>

        {/* Tours (Vertical Accent) */}
        <section className="md:col-span-4 glass-card p-10 rounded-xl flex flex-col justify-between group overflow-hidden relative">
          <div className="relative z-10">
            <span className="material-symbols-outlined text-secondary text-4xl mb-6">travel_explore</span>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-white mb-4">Tours</h2>
            <p className="text-on-surface-variant mb-6">
              Handcrafted itineraries through Tamil Nadu and North India. Immerse yourself in the heritage of temples and the serenity of hills.
            </p>
            <ul className="space-y-4 mb-8 font-body">
              <li className="flex items-center gap-3 text-sm text-white">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span> South India Pilgrimage
              </li>
              <li className="flex items-center gap-3 text-sm text-white">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span> Golden Triangle Heritage
              </li>
            </ul>
          </div>
          <Link to="/book/tour" className="relative z-10 w-full border border-secondary text-secondary px-6 py-4 font-label text-sm uppercase tracking-widest rounded-md hover:bg-secondary hover:text-on-secondary transition-all text-center">
            Explore Tours
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
              Exclusive tie-ups with luxury stays and boutique heritage hotels across major destinations.
            </p>
          </div>
          <Link to="/book/room" className="w-full bg-surface-container-high text-white px-6 py-3 font-label text-xs uppercase tracking-widest rounded-md border border-white/5 hover:border-secondary/50 transition-all text-center font-bold">
            Book Room
          </Link>
        </section>

        {/* Event Planning */}
        <section className="md:col-span-4 glass-card p-8 rounded-xl flex flex-col justify-between group">
          <div>
            <span className="material-symbols-outlined text-secondary text-3xl mb-4">celebration</span>
            <h3 className="font-headline text-2xl font-bold text-white mb-3">Event Planning</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-body">
              Corporate conferences, grand weddings, or intimate parties—we handle logistics with precision.
            </p>
          </div>
          <Link to="/book/event" className="w-full bg-surface-container-high text-white px-6 py-3 font-label text-xs uppercase tracking-widest rounded-md border border-white/5 hover:border-secondary/50 transition-all text-center font-bold">
            Plan Event
          </Link>
        </section>

        {/* Support Card (Replacing Manpower) */}
        <section className="md:col-span-4 glass-card p-8 rounded-xl flex flex-col justify-between group relative overflow-hidden bg-primary-container/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/20 blur-[60px]"></div>
          <div>
            <span className="material-symbols-outlined text-secondary text-3xl mb-4">support_agent</span>
            <h3 className="font-headline text-2xl font-bold text-white mb-3 tracking-tight">Dedicated Support</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-body">
              Our travel specialists are available 24/7 to assist with your custom requirements and route planning.
            </p>
          </div>
          <a href="tel:+919943139353" className="w-full bg-primary-container text-white px-6 py-3 font-label text-xs uppercase tracking-widest rounded-md border border-white/5 hover:brightness-110 transition-all text-center font-bold">
            Contact Us
          </a>
        </section>
      </div>

      {/* Signature Route Map CTA Area */}
      <section className="max-w-7xl mx-auto mt-24">
        <div className="bg-surface-container-low p-12 rounded-xl relative overflow-hidden border-l-4 border-secondary">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="font-headline text-4xl font-bold text-white mb-4">Planning a custom route?</h2>
              <p className="text-on-surface-variant font-body">Our experts can map out your entire South Indian journey, from Chennai to Kanyakumari, ensuring luxury at every stop.</p>
            </div>
            <div className="flex gap-4 font-body">
              <Link to="/book/cab" className="bg-primary-container text-white px-8 py-4 font-label text-sm uppercase tracking-widest rounded-md font-bold">Start Planning</Link>
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
