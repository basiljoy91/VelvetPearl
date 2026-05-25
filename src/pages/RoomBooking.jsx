import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addBooking } from '../services/dataService';

export default function RoomBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const customer = formData.get('customer') || 'Guest';
    const phone = formData.get('phone') || 'N/A';
    const hotel = formData.get('hotel') || 'Velvet Pearl';
    const checkin = formData.get('checkin') || '';
    const checkout = formData.get('checkout') || '';
    const roomType = formData.get('roomType') || 'Standard';
    const guests = formData.get('guests') || '1';

    try {
      await addBooking({
        customer,
        phone,
        service: `Room: ${hotel}`,
        details: `${roomType} (${guests} Guests)`,
        schedule: `${checkin} to ${checkout}`
      });
      setIsBooked(true);
    } catch (err) {
      setError(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="pt-20 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[614px] flex items-center px-8 md:px-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Luxury hotel suite" className="w-full h-full object-cover opacity-40" data-alt="Ultra luxury hotel suite with warm ambient lighting at dusk" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDl6NWWoNhD8FtKPVQh1tJC3P20ixAWvQ1CsT-gZV7LtuDtlNtXILNHtkEwXKeEJsdZ_No5_pu5TucYMfudzwjxjoqXmN5iJrbHk8s-wPacmVQU2zdODrC4D_C3q0saSpkT3EJnQKZLfr6Fcsb2ErDrR2EhFKc5jWOdrMZtyz0w6h0f-F-ZHVfOm4pdXYUf8ftFAp3_t-ALRQ72Y8oMdbJlaCsqZFNJSsHkmqXjkPNF1IqP3zl1ecHMy4Tv4LRKJNHvsWk0nnOPu2u"/>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="font-label text-secondary uppercase tracking-[0.3em] text-xs mb-4 block">Midnight Meridian Collection</span>
          <h1 className="font-headline text-5xl md:text-7xl font-black text-on-surface tracking-tighter leading-none mb-6">
            LUXURY ROOM <br/><span className="text-primary-container text-glow">BOOKINGS</span>
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-lg">
            Experience the architectural precision and bespoke hospitality of South India's most exclusive sanctuaries. Curated for the discerning traveler.
          </p>
        </div>
        {/* Decorative Glow */}
        <div className="absolute -right-24 top-1/4 w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[120px]"></div>
      </section>
      
      {/* Booking Form Section */}
      <section className="px-8 md:px-24 -mt-32 pb-24 relative z-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Card */}
          <div className="lg:col-span-8 glass-panel rounded-xl p-8 md:p-12 shadow-2xl border border-white/5">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">Reservation Details</h2>
                <p className="text-on-surface-variant font-label text-sm uppercase tracking-wider">Secure your stay at Velvet Pearl</p>
              </div>
              <div className="bg-surface-container-highest px-4 py-2 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-sm">verified_user</span>
                <span className="text-xs font-label uppercase text-on-surface">Secure Encrypted Booking</span>
              </div>
            </div>
            
            {isBooked ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
                </div>
                <h3 className="font-headline text-3xl font-bold text-white mb-4">Reservation Confirmed!</h3>
                <p className="text-on-surface-variant max-w-sm mb-8">
                  Your luxury room booking has been successfully secured. Our team will forward the confirmation details shortly.
                </p>
                <button
                  className="bg-primary-container text-on-primary px-8 py-4 rounded-md font-bold font-jakarta text-[10px] uppercase tracking-widest hover:brightness-110 transition-all border-none"
                  onClick={() => navigate('/')}
                >
                  Return to Home
                </button>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={handleBookingSubmit}>
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center font-body">
                    {error}
                  </div>
                )}
                {/* Name & Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant ml-1">Full Name</label>
                    <input name="customer" defaultValue={state?.name || ''} className="w-full bg-black/40 border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-3 text-on-surface outline-none text-sm rounded-sm" placeholder="Alexander Vestige" type="text" required/>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant ml-1">Email Address</label>
                    <input name="email" defaultValue={state?.email || ''} className="w-full bg-black/40 border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-3 text-on-surface outline-none text-sm rounded-sm" placeholder="concierge@example.com" type="email" required/>
                  </div>
                </div>
                {/* Phone & Country */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant ml-1">Country Code</label>
                    <input className="w-full bg-black/40 border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-3 text-on-surface outline-none text-sm rounded-sm" defaultValue="91" placeholder="+91" type="number" required/>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant ml-1">Contact Phone</label>
                    <input name="phone" defaultValue={state?.phone || ''} className="w-full bg-black/40 border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-3 text-on-surface outline-none text-sm rounded-sm" placeholder="99431 39353" type="tel" required/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant ml-1">Country</label>
                  <input name="country" defaultValue={state?.country || ''} className="w-full bg-black/40 border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-3 text-on-surface outline-none text-sm rounded-sm" placeholder="United Kingdom" type="text" required/>
                </div>
                {/* Dates & Logistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant ml-1">Check-In</label>
                      <input name="checkin" className="w-full bg-black/40 border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-3 text-on-surface text-sm rounded-sm outline-none" type="date" required/>
                    </div>
                    <div className="space-y-2">
                      <label className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant ml-1">Check-Out</label>
                      <input name="checkout" className="w-full bg-black/40 border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-3 text-on-surface text-sm rounded-sm outline-none" type="date" required/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant ml-1">Room Type</label>
                    <select name="roomType" className="w-full bg-black/40 border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-3 text-on-surface text-sm rounded-sm outline-none appearance-none" required>
                      <option value="">Select Tier</option>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Suite">Suite</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant ml-1">Number of Guests</label>
                    <input name="guests" className="w-full bg-black/40 border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-3 text-on-surface outline-none text-sm rounded-sm" min="1" placeholder="2" type="number" required/>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface-variant ml-1">Preferred Hotel / Area</label>
                    <input name="hotel" className="w-full bg-black/40 border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-3 text-on-surface outline-none text-sm rounded-sm" placeholder="ITC Grand Chola / Chennai" type="text" required/>
                  </div>
                </div>
                <div className="pt-6">
                  <button disabled={isLoading} className="w-full md:w-auto px-12 py-5 bg-primary-container text-white font-headline font-bold text-xs uppercase tracking-[0.2em] rounded-md shadow-xl shadow-primary-container/20 hover:brightness-110 active:scale-[0.98] transition-all border-none disabled:opacity-50 disabled:cursor-not-allowed" type="submit">
                    {isLoading ? 'Processing...' : 'Reserve Room'}
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* Side Info / Support */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-surface-container-low p-8 rounded-xl border-l-2 border-secondary">
              <h3 className="font-headline text-xl font-bold mb-4">Concierge Support</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                Our digital curators are standing by to personalize your stay. For immediate assistance or special requirements:
              </p>
              <a className="flex items-center gap-4 group" href="https://wa.me/919943139353" target="_blank" rel="noreferrer">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-all">
                  <span className="material-symbols-outlined">chat</span>
                </div>
                <div>
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block">WhatsApp Support</span>
                  <span className="font-headline font-bold text-lg text-secondary">+91-9943139353</span>
                </div>
              </a>
            </div>
            
            <div className="bg-surface-container-lowest p-8 rounded-xl">
              <h4 className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-6">Velvet Standard Features</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                  <span className="text-on-surface">Curated Welcome Ritual</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                  <span className="text-on-surface">Private Chauffeur Airport Pick-up</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                  <span className="text-on-surface">24/7 Digital Concierge Access</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                  <span className="text-on-surface">Exclusive Heritage Site Passes</span>
                </li>
              </ul>
            </div>
            
            {/* Asymmetric Image Highlight */}
            <div className="relative rounded-xl overflow-hidden aspect-[4/5] shadow-2xl">
              <img alt="Luxury bathroom interior" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBU_oev18GGsw8rFG4Bj0RU5FZNmw0qmYoQKkI_vwi7J2COr5skQfpyXtredwrIxWomNt1UE5eGbdSXJSq4fDvAtnKns2vCVMvdPHctsNimkb1_-rgax_IMbc_YJG6txj9pUSXV2dd8GGC-Iqo4lCrhQlKGAYf-K0xR4mfExkfqYbMcwLzlDVe1OiDpJTrm3o9-Oc8TeXkTU-16t90YI6HSiVGxZjKg-_QcITTZVbGoZmP8Bq_l1XmQ5c9z4w_dkGdqJtUaTreSIfXn"/>
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
              <div className="absolute bottom-6 left-6">
                <span className="font-headline font-bold text-white text-xl tracking-tight">The Imperial Standard</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
