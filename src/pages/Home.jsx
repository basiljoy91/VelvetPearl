import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RouteMap from '../components/routes/RouteMap';
import { countries } from '../data/countries';


export default function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: 'India',
    code: '91',
    phone: '',
    service: 'cab'
  });
  const selectedCountry = countries.find((country) => country.name === formData.country);

  const handleQuickBook = (e) => {
    e.preventDefault();
    navigate(`/book/${formData.service}`, { state: formData });
  };

  const handleHeroBook = () => {
    navigate('/book/cab');
  };

  const handleExplore = () => {
    navigate('/services');
  };

  const handleRouteBook = (route) => {
    navigate('/book/cab', { state: { ...formData, route } });
  };

  return (
    <main className="pt-20">
      <section className="relative min-h-[921px] flex items-center px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
          <img className="w-full h-full object-cover" alt="Luxury sedan driving on a scenic South Indian coastal road" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ85db9nJGv2vTyFqfH46Vv596_GKcDdoRSoOKpOrMOHn4PQEjTTw47L5-EZMEFpl3w4Ln18d2wUZuQDWabAt2hlqzsRoAcC3NOKEQGvqMn5GjPnE0W_nRD5Hied4Xc-oEDlNAKQ7gdjpmRIeOT8N5sYSsjFZ1uKSTr-ZGwEDX6RjrRGjNz7GEF3ONqlrjhouVk9enVFc0maKbROjO_-oKgR3J0knqoJbvb4mWh3S0AxyLBOjsbXwY0cl_qyK0oV0Hexmuto_lEZHY" />
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/10 blur-[120px] rounded-full"></div>
        </div>
        <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="font-headline text-5xl md:text-7xl font-light tracking-tighter leading-none text-white max-w-xl">
                We create <span className="font-bold italic text-primary">journeys</span>, not just trips
              </h1>
              <h2 className="text-2xl font-headline font-light text-secondary">
                Now book your Velvet Pearl cab anywhere in Tamil Nadu.
              </h2>
              <p className="text-on-surface-variant max-w-md text-lg leading-relaxed">
                Your one-stop solution for Tours, Room Bookings, Cabs, and Event Planning.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="bg-primary-container text-white px-8 py-4 rounded-md font-bold font-jakarta text-sm uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center gap-2" onClick={handleHeroBook}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>local_taxi</span>
                Book a Cab
              </button>
              <button className="border border-secondary text-secondary px-8 py-4 rounded-md font-bold font-jakarta text-sm uppercase tracking-widest hover:bg-secondary/10 transition-all" onClick={handleExplore}>
                Explore Services
              </button>
            </div>
          </div>
          {/* Multi-step Glass Booking Card */}
          <div className="glass-panel border border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 0" }}>diamond</span>
            </div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline text-2xl text-white font-bold flex items-center gap-3">
                <span className="w-8 h-[1px] bg-secondary"></span>
                Quick Booking
              </h3>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <div className="w-2 h-2 rounded-full bg-white/20"></div>
              </div>
            </div>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleQuickBook}>
              <div className="col-span-1">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-bold">Full Name <span className="text-secondary">*</span></label>
                <input className="w-full bg-white/5 border border-white/10 focus:border-secondary focus:ring-0 text-on-surface p-3 transition-all rounded-sm text-sm outline-none" placeholder="John Doe" required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <p className="text-[10px] text-on-surface-variant/60 mt-1">Please enter your legal name</p>
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-bold">Email Address <span className="text-secondary">*</span></label>
                <input className="w-full bg-white/5 border border-white/10 focus:border-secondary focus:ring-0 text-on-surface p-3 transition-all rounded-sm text-sm outline-none" placeholder="john@example.com" required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-bold">Country <span className="text-secondary">*</span></label>
                <select
                  className="w-full bg-white/5 border border-white/10 focus:border-secondary focus:ring-0 text-on-surface p-3 transition-all rounded-sm text-sm outline-none"
                  required
                  value={formData.country}
                  onChange={(e) => {
                    const country = countries.find(
                      (c) => c.name === e.target.value
                    );

                    setFormData({
                      ...formData,
                      country: e.target.value,
                      code: country?.dialCode || ''
                    });
                  }}
                >
                  <option value="">Select Country</option>

                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-bold">Phone Number <span className="text-secondary">*</span></label>
                <div className="flex gap-2">
                  <input className="w-16 bg-white/5 border border-white/10 focus:border-secondary focus:ring-0 text-on-surface p-3 rounded-sm text-center text-sm outline-none" placeholder="91" required type="number" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                  <input className="flex-1 bg-white/5 border border-white/10 focus:border-secondary focus:ring-0 text-on-surface p-3 transition-all rounded-sm text-sm outline-none" placeholder={
                    selectedCountry
                      ? `${selectedCountry.length}-digit number`
                      : "Enter phone number"
                  } required type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />

                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-bold">Select Service <span className="text-secondary">*</span></label>
                <div className="relative">
                  <select className="w-full bg-[#1c1b1c] border border-white/10 focus:border-secondary focus:ring-0 text-white p-3 rounded-sm text-sm appearance-none outline-none" required value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })}>
                    <option value="cab">Cab Services (Premium Sedans & SUVs)</option>
                    <option value="tour">Tailored Tours & Itineraries</option>
                    <option value="room">Luxury Room Bookings</option>
                    <option value="event">Corporate Event Planning</option>
                  </select>
                  <span className="absolute right-3 top-3 material-symbols-outlined text-secondary pointer-events-none" style={{ fontVariationSettings: "'FILL' 0" }}>expand_more</span>
                </div>
              </div>
              <button className="col-span-2 bg-primary-container text-white font-bold py-4 rounded-md uppercase tracking-widest text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 group/btn" type="submit">
                Continue to Details
                <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      </section>



      {/* Services Bento */}
      <section className="py-24 px-8 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="max-w-xl">
              <span className="text-secondary font-bold uppercase tracking-[0.3em] text-xs">Excellence in Service</span>
              <h2 className="font-headline text-4xl md:text-5xl font-light text-white mt-4">Curated services for the discerning traveler</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
            {/* Primary: Cab Services */}
            <div className="md:col-span-7 bg-primary-container relative rounded-xl overflow-hidden group cursor-pointer">
              <img className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" data-alt="Chauffeur opening door of a luxury black car" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4WHaVJDBNpcyIZB9wgg1xBUVJV4b55JI7-pV4DAGxpnf77guWHlhg6xTjJbXkqy3VLVxaHzbKyGql7wCqAm2XQwmSoaALi9H396TdikmsTM-eGzI6ZKfauzofmJikvZMJIzE08xMmZDjxVfwPMY3TXZKEWAbTk46MZEC1KvC0kQ-BTsPesD8VkEZH4VPx923F3ZmubOXVDY0bZ5T7ltFMpXbvN7dBRZB6ERK4m3DhSASDaySCebfOnsV5sAnbBYPmQdO-0n3wiYO-" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-10">
                <span className="material-symbols-outlined text-5xl mb-4 text-white" style={{ fontVariationSettings: "'FILL' 1" }}>local_taxi</span>
                <h3 className="font-headline text-3xl font-bold text-white mb-2">Cab Services</h3>
                <p className="text-white/80 max-w-xs">Premium point-to-point and hourly rentals with professional chauffeurs.</p>
              </div>
            </div>
            {/* Side Grid */}
            <div className="md:col-span-5 grid grid-cols-1 gap-6">
              <div className="bg-surface-container-high rounded-xl p-8 relative overflow-hidden group cursor-pointer">
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-secondary text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 0" }}>explore</span>
                  <h3 className="font-headline text-xl font-bold text-white mb-1">Tailored Tours</h3>
                  <p className="text-on-surface-variant text-sm">Bespoke itineraries through the soul of Tamil Nadu.</p>
                </div>
              </div>
              <div className="bg-surface-container-high rounded-xl p-8 relative overflow-hidden group cursor-pointer">
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-secondary text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 0" }}>bed</span>
                  <h3 className="font-headline text-xl font-bold text-white mb-1">Room Bookings</h3>
                  <p className="text-on-surface-variant text-sm">Preferred rates at the finest luxury properties.</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-12 bg-surface-container-high rounded-xl p-8 flex items-center gap-6 group cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>event</span>
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold text-white mb-1">Event Planning</h3>
                <p className="text-on-surface-variant text-sm">Corporate events and destination weddings handled with precision.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <RouteMap />
      {/* Popular Routes */}
      <section className="py-24 px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-8">
            <h2 className="font-headline text-4xl font-bold text-white tracking-tight">Popular Routes</h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-outline-variant/10">
            <table className="min-w-[900px] w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  <th className="px-8 py-6 font-label text-[10px] uppercase tracking-[0.2em] text-outline font-bold">Route & Distance</th>
                  <th className="px-8 py-6 font-label text-[10px] uppercase tracking-[0.2em] text-outline font-bold">Est. Duration</th>
                  <th className="px-8 py-6 font-label text-[10px] uppercase tracking-[0.2em] text-outline font-bold">Vehicle</th>
                  <th className="px-8 py-6 font-label text-[10px] uppercase tracking-[0.2em] text-outline font-bold">Starting Price</th>
                  <th className="px-8 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                <tr className="glass-panel group transition-all duration-300 hover:bg-surface-container-high/60">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-primary-container/20 flex items-center justify-center text-primary-fixed-dim">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>route</span>
                      </div>
                      <div>
                        <p className="font-headline font-bold text-lg text-white">Chennai <span className="text-secondary">→</span> Pondicherry</p>
                        <p className="text-xs text-outline font-label tracking-widest uppercase">155 KM • ECR Scenic Road</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-sm opacity-60" style={{ fontVariationSettings: "'FILL' 0" }}>schedule</span>
                      <span className="font-body font-medium whitespace-nowrap">3h 15m</span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className="bg-surface-container-highest text-[10px] font-label font-bold uppercase tracking-widest px-3 py-1 rounded border border-outline-variant/30 whitespace-nowrap inline-block">Executive Sedan</span>
                  </td>
                  <td className="px-8 py-8">
                    <p className="text-2xl font-headline font-bold text-white">₹4,500</p>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <button className="bg-primary-container text-white px-8 py-3 font-label text-xs uppercase tracking-widest font-black rounded transition-all duration-300 hover:bg-[#294edf] hover:shadow-[0_0_20px_rgba(34,73,219,0.4)] active:scale-95" onClick={() => handleRouteBook('Chennai → Pondicherry')}>Book</button>
                  </td>
                </tr>
                <tr className="glass-panel group transition-all duration-300 hover:bg-surface-container-high/60">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-primary-container/20 flex items-center justify-center text-primary-fixed-dim">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>route</span>
                      </div>
                      <div>
                        <p className="font-headline font-bold text-lg text-white">Coimbatore <span className="text-secondary">→</span> Ooty</p>
                        <p className="text-xs text-outline font-label tracking-widest uppercase">86 KM • Hairpin Bends</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-sm opacity-60" style={{ fontVariationSettings: "'FILL' 0" }}>schedule</span>
                      <span className="font-body font-medium whitespace-nowrap">2h 45m</span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className="bg-surface-container-highest text-[10px] font-label font-bold uppercase tracking-widest px-3 py-1 rounded border border-outline-variant/30 whitespace-nowrap inline-block">Premium SUV</span>
                  </td>
                  <td className="px-8 py-8">
                    <p className="text-2xl font-headline font-bold text-white">₹3,200</p>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <button className="bg-primary-container text-white px-8 py-3 font-label text-xs uppercase tracking-widest font-black rounded transition-all duration-300 hover:bg-[#294edf] hover:shadow-[0_0_20px_rgba(34,73,219,0.4)] active:scale-95" onClick={() => handleRouteBook('Coimbatore → Ooty')}>Book</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
            <h2 className="font-headline text-4xl font-bold text-white tracking-tight">Client Perspectives</h2>
            <div className="h-px flex-grow mx-8 bg-gradient-to-r from-secondary/50 to-transparent hidden md:block"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-xl relative">
              <span className="material-symbols-outlined absolute top-6 right-8 text-secondary/20 scale-150" style={{ fontVariationSettings: "'FILL' 0" }}>format_quote</span>
              <p className="text-on-surface-variant italic mb-8 relative z-10 leading-relaxed">"The level of professionalism in their cab service is unmatched in the region. Impeccable timing and luxury vehicles."</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Rajesh Kumar</h4>
                  <p className="text-[10px] font-label uppercase text-secondary">Corporate Traveler</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-8 rounded-xl relative">
              <span className="material-symbols-outlined absolute top-6 right-8 text-secondary/20 scale-150" style={{ fontVariationSettings: "'FILL' 0" }}>format_quote</span>
              <p className="text-on-surface-variant italic mb-8 relative z-10 leading-relaxed">"Their regional expertise made our family temple tour effortless. They know the hidden gems of Tamil Nadu."</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Ananya Iyer</h4>
                  <p className="text-[10px] font-label uppercase text-secondary">Family Vacation</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-8 rounded-xl relative">
              <span className="material-symbols-outlined absolute top-6 right-8 text-secondary/20 scale-150" style={{ fontVariationSettings: "'FILL' 0" }}>format_quote</span>
              <p className="text-on-surface-variant italic mb-8 relative z-10 leading-relaxed">"The bookings process was so straightforward, and the vehicles arrived well before time. Extremely satisfied."</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Karthik Raja</h4>
                  <p className="text-[10px] font-label uppercase text-secondary">Frequent Booker</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-8 bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-secondary/10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>badge</span>
            </div>
            <h5 className="text-white font-headline font-bold mb-2">Professional Drivers</h5>
            <p className="text-on-surface-variant text-sm">Background verified, highly trained multilingual chauffeurs.</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-secondary/10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>receipt_long</span>
            </div>
            <h5 className="text-white font-headline font-bold mb-2">Transparent Pricing</h5>
            <p className="text-on-surface-variant text-sm">Zero hidden charges. What you see is exactly what you pay.</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-secondary/10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
            </div>
            <h5 className="text-white font-headline font-bold mb-2">24/7 Support</h5>
            <p className="text-on-surface-variant text-sm italic">WhatsApp: +91-9943139353</p>
            <p className="text-on-surface-variant text-xs mt-1">Always available for your safety.</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-secondary/10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>airline_seat_recline_extra</span>
            </div>
            <h5 className="text-white font-headline font-bold mb-2">Luxury & Comfort</h5>
            <p className="text-on-surface-variant text-sm">Pristine vehicles equipped with premium amenities.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
