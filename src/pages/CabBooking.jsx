import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addBooking } from '../services/dataService';

export default function CabBooking() {
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
    const pickup = formData.get('pickup') || 'Unknown';
    const dropoff = formData.get('dropoff') || 'Unknown';
    const vehicle = formData.get('vehicle') || 'Cab';
    const date = formData.get('date') || '';
    const time = formData.get('time') || '';

    try {
      await addBooking({
        customer,
        phone,
        service: `Cab: ${pickup} ➔ ${dropoff}`,
        details: vehicle,
        schedule: `${date} - ${time}`
      });
      setIsBooked(true);
    } catch (err) {
      setError(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="pt-20 min-h-screen relative overflow-hidden bg-background pb-24">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 blur-[100px] rounded-full"></div>
      
      {/* Hero Section & Form Canvas */}
      <div className="max-w-7xl mx-auto px-8 py-16 lg:grid lg:grid-cols-12 gap-12 relative z-10">
        
        {/* Headline Column */}
        <div className="lg:col-span-5 flex flex-col justify-center mb-12 lg:mb-0">
          <span className="font-label text-secondary uppercase tracking-[0.2em] text-xs mb-4">Elite Transportation</span>
          <h1 className="font-headline text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] text-on-surface mb-8">
            Cab <br/><span className="text-primary-container text-glow">Services</span>
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
            Experience the pinnacle of South Indian hospitality. From executive sedans to luxury coaches, we curate every mile of your journey.
          </p>
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface-container-low group-hover:border-secondary transition-colors">
                <span className="material-symbols-outlined text-secondary">verified_user</span>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-on-surface">Vetted Chauffeurs</p>
                <p className="text-xs text-on-surface-variant">Background checked & trained for luxury service.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full border border-outline-variant/30 flex items-center justify-center bg-surface-container-low group-hover:border-primary-container transition-colors">
                <span className="material-symbols-outlined text-primary">schedule</span>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-on-surface">Precision Arrival</p>
                <p className="text-xs text-on-surface-variant">Real-time tracking and zero-wait guarantee.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form Column */}
        <div className="lg:col-span-7 relative">
          <div className="absolute -top-6 -right-6 w-32 h-32 border-t-2 border-r-2 border-secondary/20 rounded-tr-3xl hidden md:block"></div>
          <div className="glass-panel rounded-xl p-8 md:p-10 border border-white/10 shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
            {isBooked ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-green-500 text-4xl">check_circle</span>
                </div>
                <h3 className="font-headline text-3xl font-bold text-white mb-4">Cab Confirmed!</h3>
                <p className="text-on-surface-variant max-w-sm mb-8">
                  Your premium velvet pearl cab journey has been successfully booked. Our concierge will contact you shortly on WhatsApp.
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
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center font-body">
                      {error}
                    </div>
                  )}
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">01. Guest Identification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <input name="customer" defaultValue={state?.name || ''} className="w-full bg-surface-container-highest/50 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 placeholder:text-outline-variant transition-all border-l-0 focus:border-l-2 focus:border-secondary outline-none" placeholder="Full Name" type="text" required/>
                      </div>
                      <div className="relative group">
                        <input name="email" defaultValue={state?.email || ''} className="w-full bg-surface-container-highest/50 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 placeholder:text-outline-variant transition-all border-l-0 focus:border-l-2 focus:border-secondary outline-none" placeholder="Email Address" type="email" required/>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                        <input name="country" defaultValue={state?.country || ''} className="w-full bg-surface-container-highest/50 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 placeholder:text-outline-variant transition-all border-l-0 focus:border-l-2 focus:border-secondary outline-none" placeholder="Country" type="text" required/>
                      </div>
                      <div className="flex gap-2 md:col-span-2">
                        <input name="countryCode" className="w-20 bg-surface-container-highest/50 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 placeholder:text-outline-variant outline-none" defaultValue="91" placeholder="+91" type="number"/>
                        <input name="phone" defaultValue={state?.phone || ''} className="flex-1 bg-surface-container-highest/50 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 placeholder:text-outline-variant transition-all border-l-0 focus:border-l-2 focus:border-secondary outline-none" placeholder="Contact Phone" type="tel" required/>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">02. Route Logic</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-sm">my_location</span>
                        <input name="pickup" className="w-full bg-surface-container-highest/50 border-none rounded-sm pl-11 pr-4 py-3 text-on-surface focus:ring-0 placeholder:text-outline-variant transition-all border-l-0 focus:border-l-2 focus:border-primary-container outline-none" placeholder="Pickup Location" type="text" required/>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-sm">location_on</span>
                        <input name="dropoff" className="w-full bg-surface-container-highest/50 border-none rounded-sm pl-11 pr-4 py-3 text-on-surface focus:ring-0 placeholder:text-outline-variant transition-all border-l-0 focus:border-l-2 focus:border-primary-container outline-none" placeholder="Dropoff Location" type="text" required/>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative">
                        <input name="date" className="w-full bg-surface-container-highest/50 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 outline-none" type="date" required/>
                      </div>
                      <div className="relative">
                        <input name="time" className="w-full bg-surface-container-highest/50 border-none rounded-sm px-4 py-3 text-on-surface focus:ring-0 outline-none" type="time" required/>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">03. Fleet Selection</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <label className="cursor-pointer group">
                        <input className="hidden peer" name="vehicle" type="radio" value="Sedan" defaultChecked/>
                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low peer-checked:border-secondary peer-checked:bg-secondary/10 transition-all">
                          <span className="material-symbols-outlined text-on-surface mb-2">directions_car</span>
                          <span className="text-[10px] uppercase font-bold tracking-tighter">Sedan</span>
                        </div>
                      </label>
                      <label className="cursor-pointer group">
                        <input className="hidden peer" name="vehicle" type="radio" value="SUV"/>
                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low peer-checked:border-secondary peer-checked:bg-secondary/10 transition-all">
                          <span className="material-symbols-outlined text-on-surface mb-2">electric_car</span>
                          <span className="text-[10px] uppercase font-bold tracking-tighter">SUV</span>
                        </div>
                      </label>
                      <label className="cursor-pointer group">
                        <input className="hidden peer" name="vehicle" type="radio" value="Mini"/>
                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low peer-checked:border-secondary peer-checked:bg-secondary/10 transition-all">
                          <span className="material-symbols-outlined text-on-surface mb-2">airport_shuttle</span>
                          <span className="text-[10px] uppercase font-bold tracking-tighter">Mini</span>
                        </div>
                      </label>
                      <label className="cursor-pointer group">
                        <input className="hidden peer" name="vehicle" type="radio" value="Tempo"/>
                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low peer-checked:border-secondary peer-checked:bg-secondary/10 transition-all">
                          <span className="material-symbols-outlined text-on-surface mb-2">group</span>
                          <span className="text-[10px] uppercase font-bold tracking-tighter">Tempo</span>
                        </div>
                      </label>
                      <label className="cursor-pointer group">
                        <input className="hidden peer" name="vehicle" type="radio" value="Luxury"/>
                        <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-outline-variant/20 bg-surface-container-low peer-checked:border-secondary peer-checked:bg-secondary/10 transition-all">
                          <span className="material-symbols-outlined text-on-surface mb-2">stars</span>
                          <span className="text-[10px] uppercase font-bold tracking-tighter">Luxury</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  <button disabled={isLoading} className="w-full bg-primary-container text-white font-headline font-bold py-5 rounded-sm uppercase tracking-[0.2em] shadow-lg shadow-primary-container/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-none disabled:opacity-50 disabled:cursor-not-allowed" type="submit">
                    {isLoading ? 'Processing...' : 'Confirm Cab Booking'}
                    {!isLoading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                  </button>
                </form>
            )}
            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Instant Confirmation Available</span>
              </div>
              <a className="flex items-center gap-2 text-[#EFBF04] hover:text-white transition-colors group" href="https://wa.me/919943139353" target="_blank" rel="noreferrer">
                <span className="material-symbols-outlined text-lg">chat_bubble</span>
                <span className="text-sm font-medium">WhatsApp: +91-9943139353</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
