import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addBooking } from '../services/dataService';

export default function TourBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isBooked, setIsBooked] = useState(false);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const customer = formData.get('customer') || 'Guest';
    const phone = formData.get('phone') || 'N/A';
    const destination = formData.get('destination') || 'Unknown Tour';
    const date = formData.get('date') || '';
    const duration = formData.get('duration') || '';
    const budget = formData.get('budget') || 'Standard';

    addBooking({
      customer,
      phone,
      service: `Tour: ${destination}`,
      details: `${budget} Package (${duration} Days)`,
      schedule: date
    });

    setIsBooked(true);
  };

  return (
    <main className="pt-20 min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <section className="relative h-[614px] flex items-center px-8 md:px-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10"></div>
          <img alt="Luxury South Indian Temple" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-Yxkp5f9HGh58U8ZH-Krh8ba62aNDZc8REQfVqSHOB0NOEoI0mgpviyTya9unKbAti8WBTntDD--5bAstuBJWVpMTWts7pZr-Qs1JRQ8vFW6_Yv_sj1_JH8TS1u47ZwF2Ki9N8psykHtL6gFAhjbdr9qR1OFZ2-2M9AxxMZ2qpN0_TOZnCvkvJgeuOIDNWXjhpJYCvzkASy5Re051OtNQ8oF3CrujX8bhMfi3jJuKXLCj68zssrocatpF6G5Iq0gBwLHZx8t0Yevp"/>
        </div>
        <div className="relative z-20 max-w-2xl">
          <span className="font-label text-secondary uppercase tracking-[0.3em] text-xs mb-4 block">Bespoke Journeys</span>
          <h1 className="font-headline text-6xl md:text-8xl font-black text-on-surface tracking-tighter leading-none mb-6">
            Explore <br/> <span className="text-secondary italic font-light drop-shadow-lg">Tours</span>
          </h1>
          <p className="text-on-surface-variant max-w-md text-lg leading-relaxed font-light">
            Every journey is a curated masterpiece. Experience South India through a lens of absolute luxury and local authority.
          </p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="relative z-30 px-4 md:px-20 -mt-24 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Glass Form Card */}
          <div className="lg:col-span-8 glass-panel border border-white/10 shadow-2xl p-8 md:p-12 rounded-xl">
            <div className="mb-10">
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">Curate Your Experience</h2>
              <div className="h-1 w-12 bg-secondary rounded-full"></div>
            </div>
            
            {isBooked ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
                </div>
                <h3 className="font-headline text-3xl font-bold text-white mb-4">Tour Requested!</h3>
                <p className="text-on-surface-variant max-w-sm mb-8">
                  Your luxury tour quote has been successfully requested. Our concierge will contact you shortly on WhatsApp to finalize your itinerary.
                </p>
                <button
                  className="bg-primary-container text-white px-8 py-4 rounded-md font-bold font-jakarta text-[10px] uppercase tracking-widest hover:brightness-110 transition-all border-none"
                  onClick={() => navigate('/')}
                >
                  Return to Home
                </button>
              </div>
            ) : (
              <form className="space-y-8" onSubmit={handleBookingSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Full Name</label>
                    <input name="customer" defaultValue={state?.name || ''} className="w-full bg-black/40 border-0 outline-none focus:ring-0 focus:border-l-2 focus:border-secondary transition-all p-4 text-on-surface font-medium rounded-sm" placeholder="Alexander Vance" type="text" required/>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Email Address</label>
                    <input name="email" defaultValue={state?.email || ''} className="w-full bg-black/40 border-0 outline-none focus:ring-0 focus:border-l-2 focus:border-secondary transition-all p-4 text-on-surface font-medium rounded-sm" placeholder="alex@example.com" type="email" required/>
                  </div>
                  <div className="grid grid-cols-4 gap-4 md:col-span-2">
                    <div className="col-span-1 space-y-2">
                      <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Code</label>
                      <input className="w-full bg-black/40 border-0 outline-none focus:ring-0 transition-all p-4 text-on-surface font-medium text-center rounded-sm" defaultValue="91" placeholder="+91" type="number"/>
                    </div>
                    <div className="col-span-3 space-y-2">
                      <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Contact Phone</label>
                      <input name="phone" defaultValue={state?.phone || ''} className="w-full bg-black/40 border-0 outline-none focus:ring-0 focus:border-l-2 focus:border-secondary transition-all p-4 text-on-surface font-medium rounded-sm" placeholder="99431 39353" type="tel" required/>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Origin Country</label>
                    <input name="country" defaultValue={state?.country || ''} className="w-full bg-black/40 border-0 outline-none focus:ring-0 focus:border-l-2 focus:border-secondary transition-all p-4 text-on-surface font-medium rounded-sm" placeholder="United Kingdom" type="text" required/>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Tour Destination</label>
                    <select name="destination" className="w-full bg-black/40 border-0 outline-none focus:ring-0 focus:border-l-2 focus:border-secondary transition-all p-4 text-on-surface font-medium appearance-none rounded-sm" required>
                      <option value="">Select Package</option>
                      <option value="The Temple Trail (Madurai & Thanjavur)">The Temple Trail (Madurai & Thanjavur)</option>
                      <option value="Coastal Serenity (Pondicherry & Mahabalipuram)">Coastal Serenity (Pondicherry & Mahabalipuram)</option>
                      <option value="Royal Nilgiris (Ooty & Coonoor)">Royal Nilgiris (Ooty & Coonoor)</option>
                      <option value="Custom Itinerary">Custom Itinerary</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Start Date</label>
                    <input name="date" className="w-full bg-black/40 border-0 outline-none focus:ring-0 focus:border-l-2 focus:border-secondary transition-all p-4 text-on-surface font-medium rounded-sm" type="date" required/>
                  </div>
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Duration (Days)</label>
                    <input name="duration" className="w-full bg-black/40 border-0 outline-none focus:ring-0 focus:border-l-2 focus:border-secondary transition-all p-4 text-on-surface font-medium rounded-sm" placeholder="7" type="number" required/>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Budget Bracket</label>
                    <div className="flex gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input className="hidden peer" name="budget" type="radio" value="Economy"/>
                        <div className="p-4 text-center bg-black/40 rounded-sm text-[10px] font-bold peer-checked:bg-secondary peer-checked:text-on-secondary transition-colors">ECONOMY</div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <input className="hidden peer" name="budget" type="radio" value="Standard" defaultChecked/>
                        <div className="p-4 text-center bg-black/40 rounded-sm text-[10px] font-bold peer-checked:bg-secondary peer-checked:text-on-secondary transition-colors">STANDARD</div>
                      </label>
                      <label className="flex-1 cursor-pointer">
                        <input className="hidden peer" name="budget" type="radio" value="Premium"/>
                        <div className="p-4 text-center bg-black/40 rounded-sm text-[10px] font-bold peer-checked:bg-secondary peer-checked:text-on-secondary transition-colors">PREMIUM</div>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <a className="flex items-center gap-3 text-secondary hover:text-white transition-colors group" href="https://wa.me/919943139353" target="_blank" rel="noreferrer">
                    <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">chat</span>
                    <div>
                      <div className="text-[10px] font-bold tracking-widest">WHATSAPP SUPPORT</div>
                      <div className="text-sm">+91-9943139353</div>
                    </div>
                  </a>
                  <button className="w-full md:w-auto px-12 py-5 bg-primary-container text-white font-headline font-bold text-xs uppercase tracking-[0.2em] rounded-md shadow-xl shadow-primary-container/20 hover:brightness-110 transition-all border-none" type="submit">
                    Request Tour Quote
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {/* Contextual Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 bg-surface-container-low rounded-xl border-l-2 border-primary-container/50">
              <h3 className="font-headline text-lg font-bold mb-4 text-white">The Digital Curator</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                Our advisors typically respond within <span className="text-secondary font-bold">2 hours</span> with a preliminary itinerary and pricing estimate based on your preferences.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary-container">verified</span>
                  <span className="text-xs text-white tracking-wide">Verified Professional Chauffeurs</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary-container">hotel</span>
                  <span className="text-xs text-white tracking-wide">Elite Hotel Partnerships</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary-container">map</span>
                  <span className="text-xs text-white tracking-wide">Exclusive Off-Route Access</span>
                </li>
              </ul>
            </div>
            <div className="relative group rounded-xl overflow-hidden h-64 border border-white/5">
              <img alt="Luxury View" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGgjH2XUmeClfGIYnWTeBVz-mKYOUO47pOy775DNFcIp4tb2qQE9K5yVS9Fbt2V6-yrq9N8eD24DyToLAIZ_cK1BKMbfRX3N-aRNVzLwxP0R1xy_cjibbuaMgoToc0aVfIq-v0m7r4OrGzNQB_eBhDYpPXP_GBkZrakhrysw02gk-tK013r1KaPKAwsVZuYp2AgXNrwepU5mtycVxW3gxE5aXcLOJuqxj03niYSvMrm_JOmw_9AnTQ8hfNm-8fP3o-WOGrRMKOtoHz"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-6 flex flex-col justify-end">
                <span className="font-label text-[10px] text-secondary tracking-widest">VEHICLE FLEET</span>
                <div className="text-lg font-bold text-white">THE IMPERIAL SEDAN</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
