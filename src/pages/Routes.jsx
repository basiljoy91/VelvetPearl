import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Routes() {

  const baseRoutes = [
    { from: 'Chennai', to: 'Ooty', distance: '550 KM', via: 'NH 44 & 275', duration: '9h 30m', defaultVehicle: 'Premium SUV', basePrice: 10000 },
    { from: 'Bangalore', to: 'Mysore', distance: '145 KM', via: 'NH 275 (Expressway)', duration: '2h 15m', defaultVehicle: 'Executive Sedan', basePrice: 3500 },
    { from: 'Coimbatore', to: 'Kodaikanal', distance: '175 KM', via: 'Palani Road', duration: '4h 30m', defaultVehicle: 'Premium SUV', basePrice: 5000 },
    { from: 'Hyderabad', to: 'Coorg', distance: '820 KM', via: 'NH 44', duration: '14h 00m', defaultVehicle: 'Luxury Traveler', basePrice: 18000 },
    { from: 'Kochi', to: 'Munnar', distance: '130 KM', via: 'NH 85', duration: '3h 45m', defaultVehicle: 'Premium SUV', basePrice: 3500 },
    { from: 'Chennai', to: 'Pondicherry', distance: '155 KM', via: 'ECR Scenic Road', duration: '3h 15m', defaultVehicle: 'Executive Sedan', basePrice: 4000 },
    { from: 'Madurai', to: 'Rameshwaram', distance: '175 KM', via: 'NH 87', duration: '3h 15m', defaultVehicle: 'Executive Sedan', basePrice: 4200 },
    { from: 'Bangalore', to: 'Wayanad', distance: '275 KM', via: 'Bandipur Forest', duration: '5h 45m', defaultVehicle: 'Luxury Traveler', basePrice: 8500 },
    { from: 'Trivandrum', to: 'Kanyakumari', distance: '90 KM', via: 'NH 66', duration: '2h 30m', defaultVehicle: 'Executive Sedan', basePrice: 2500 }
  ];

  const origins = ['Chennai', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Kochi', 'Madurai', 'Trivandrum'];
  const destinations = ['Ooty', 'Mysore', 'Kodaikanal', 'Coorg', 'Munnar', 'Pondicherry', 'Rameshwaram', 'Wayanad', 'Kanyakumari'];

  const allRoutes = [];
  origins.forEach(origin => {
    destinations.forEach(dest => {
      const str = origin + dest;
      let hash = 0;
      for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
      const distanceVal = 100 + (Math.abs(hash) % 700);
      const hours = Math.floor(distanceVal / 50);
      const mins = Math.floor(((distanceVal % 50) / 50) * 60);
      
      allRoutes.push({
        from: origin,
        to: dest,
        distance: `${distanceVal} KM`,
        via: `NH ${10 + (Math.abs(hash) % 80)}`,
        duration: `${hours}h ${mins}m`,
        defaultVehicle: 'Executive Sedan',
        basePrice: distanceVal * 16 // approx base pricing
      });
    });
  });

  // Override generated routes with baseRoutes to preserve custom popular routes details
  const routeMap = {};
  allRoutes.forEach(r => routeMap[`${r.from}-${r.to}`] = r);
  baseRoutes.forEach(r => routeMap[`${r.from}-${r.to}`] = r);
  const finalAllRoutes = Object.values(routeMap);

  const getVehiclePrice = (basePrice, vehicleType) => {
    if (vehicleType === 'Executive Sedan') return basePrice;
    if (vehicleType === 'Premium SUV') return Math.round(basePrice * 1.3);
    if (vehicleType === 'Luxury Traveler') return Math.round(basePrice * 1.8);
    return basePrice;
  };

  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const isSearching = filterFrom || filterTo;
  const activeRoutePool = isSearching ? finalAllRoutes : baseRoutes;

  const filteredRoutes = activeRoutePool
    .filter(route => {
      const matchFrom = !filterFrom || route.from === filterFrom;
      const matchTo = !filterTo || route.to === filterTo;
      return matchFrom && matchTo;
    })
    .flatMap(route => {
      if (filterVehicle) {
        return [{
          ...route,
          vehicle: filterVehicle,
          price: getVehiclePrice(route.basePrice, filterVehicle).toLocaleString('en-IN')
        }];
      } else if (isSearching) {
        return ['Executive Sedan', 'Premium SUV', 'Luxury Traveler'].map(vType => ({
          ...route,
          vehicle: vType,
          price: getVehiclePrice(route.basePrice, vType).toLocaleString('en-IN')
        }));
      } else {
        return [{
          ...route,
          vehicle: route.defaultVehicle,
          price: getVehiclePrice(route.basePrice, route.defaultVehicle).toLocaleString('en-IN')
        }];
      }
    });

  return (
    <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <header className="mb-16 relative">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
        <h1 className="font-headline font-light text-6xl md:text-8xl tracking-tighter mb-4 text-white">
          Popular <span className="font-bold text-primary-fixed-dim block md:inline">Routes.</span>
        </h1>
        <p className="font-label text-xs uppercase tracking-[0.3em] text-secondary font-semibold">Curated South Indian Expeditions</p>
        
        {/* Information Notice */}
        <div className="mt-8 inline-flex items-center gap-3 bg-surface-container-low px-5 py-3 rounded-xl border border-secondary/20 shadow-lg shadow-black/20">
          <span className="material-symbols-outlined text-secondary text-lg">info</span>
          <p className="font-label text-[10px] sm:text-xs uppercase tracking-[0.15em] text-gray-300 font-bold">
            Currently we are providing travel routes mainly across <span className="text-secondary">South India</span> destinations.
          </p>
        </div>
      </header>

      {/* Filters Section */}
      <section className="mb-12 glass-panel p-8 rounded-xl border border-outline-variant/20 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-[#8e90a1] ml-1 font-bold">From</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary-fixed-dim text-sm">location_on</span>
              <select 
                value={filterFrom} 
                onChange={(e) => setFilterFrom(e.target.value)}
                className="w-full bg-surface-container-highest border-none text-on-surface pl-10 pr-4 py-3 text-sm rounded focus:ring-1 focus:ring-secondary appearance-none outline-none"
              >
                <option value="">Any Origin</option>
                <option value="Chennai">Chennai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Kochi">Kochi</option>
                <option value="Madurai">Madurai</option>
                <option value="Trivandrum">Trivandrum</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-[#8e90a1] ml-1 font-bold">To</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary-fixed-dim text-sm">map</span>
              <select 
                value={filterTo} 
                onChange={(e) => setFilterTo(e.target.value)}
                className="w-full bg-surface-container-highest border-none text-on-surface pl-10 pr-4 py-3 text-sm rounded focus:ring-1 focus:ring-secondary appearance-none outline-none"
              >
                <option value="">Any Destination</option>
                <option value="Ooty">Ooty</option>
                <option value="Mysore">Mysore</option>
                <option value="Kodaikanal">Kodaikanal</option>
                <option value="Coorg">Coorg</option>
                <option value="Munnar">Munnar</option>
                <option value="Pondicherry">Pondicherry</option>
                <option value="Rameshwaram">Rameshwaram</option>
                <option value="Wayanad">Wayanad</option>
                <option value="Kanyakumari">Kanyakumari</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-[#8e90a1] ml-1 font-bold">Vehicle Type</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary-fixed-dim text-sm">directions_car</span>
              <select 
                value={filterVehicle} 
                onChange={(e) => setFilterVehicle(e.target.value)}
                className="w-full bg-surface-container-highest border-none text-on-surface pl-10 pr-4 py-3 text-sm rounded focus:ring-1 focus:ring-secondary appearance-none outline-none"
              >
                <option value="">Any Vehicle</option>
                <option value="Executive Sedan">Executive Sedan</option>
                <option value="Premium SUV">Premium SUV</option>
                <option value="Luxury Traveler">Luxury Traveler</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label text-[10px] uppercase tracking-widest text-[#8e90a1] ml-1 font-bold">Date</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary-fixed-dim text-sm">calendar_month</span>
              <input 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-surface-container-highest border-none text-on-surface pl-10 pr-4 py-3 text-sm rounded focus:ring-1 focus:ring-secondary outline-none inven-invert" 
                type="date"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Route Listings Grid */}
      <section className="mb-16">
        {filteredRoutes.length === 0 ? (
          <div className="glass-panel p-16 rounded-2xl flex flex-col items-center justify-center text-center border border-outline-variant/20">
            <span className="material-symbols-outlined text-6xl text-secondary/30 mb-4">route_off</span>
            <h3 className="text-2xl font-headline font-bold text-white mb-2">No routes found</h3>
            <p className="text-[#8e90a1] text-sm">Try adjusting your filters or search criteria to find available routes.</p>
            <button 
              onClick={() => {
                setFilterFrom('');
                setFilterTo('');
                setFilterVehicle('');
                setFilterDate('');
              }}
              className="mt-6 px-6 py-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutes.map((route, index) => (
              <div key={index} className="glass-panel p-6 rounded-2xl border border-outline-variant/20 hover:border-secondary/40 transition-all duration-300 group flex flex-col h-full bg-surface-container-low/50 hover:bg-surface-container-low shadow-xl">
                
                {/* Top part: From -> To */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <p className="font-label text-[10px] uppercase tracking-widest text-[#8e90a1] mb-1">Departure</p>
                    <h3 className="font-headline font-bold text-xl text-white">{route.from}</h3>
                  </div>
                  <div className="px-4 flex flex-col items-center justify-center pt-2">
                    <span className="text-secondary text-[10px] font-bold tracking-widest uppercase bg-secondary/10 px-2 py-0.5 rounded-full">{route.distance}</span>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent my-2"></div>
                    <span className="material-symbols-outlined text-secondary text-lg">directions_car</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-label text-[10px] uppercase tracking-widest text-[#8e90a1] mb-1">Arrival</p>
                    <h3 className="font-headline font-bold text-xl text-white">{route.to}</h3>
                  </div>
                </div>
                
                {/* Middle part: Details */}
                <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
                  <div className="bg-surface-container-highest/40 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">route</span>
                      <p className="text-[10px] text-[#8e90a1] uppercase tracking-widest font-bold">Via Route</p>
                    </div>
                    <p className="text-xs text-white font-medium truncate" title={route.via}>{route.via}</p>
                  </div>
                  <div className="bg-surface-container-highest/40 p-3 rounded-lg border border-white/5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-primary-fixed-dim text-[16px]">schedule</span>
                      <p className="text-[10px] text-[#8e90a1] uppercase tracking-widest font-bold">Duration</p>
                    </div>
                    <p className="text-xs text-white font-medium">{route.duration}</p>
                  </div>
                </div>
                
                {/* Bottom part: Price & Book */}
                <div className="flex items-end justify-between pt-5 border-t border-outline-variant/10 mt-auto">
                  <div>
                    <span className="bg-primary-container/20 border border-primary-container/30 text-primary-fixed-dim text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded mb-2 inline-block">
                      {route.vehicle}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-headline font-bold text-white">₹{route.price}</p>
                    </div>
                    <p className="text-[10px] text-[#8e90a1] uppercase tracking-widest mt-0.5">Starting Price</p>
                  </div>
                  
                  <Link 
                    to={`/book/cab?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&vehicle=${encodeURIComponent(route.vehicle)}${filterDate ? `&date=${encodeURIComponent(filterDate)}` : ''}`} 
                    className="bg-primary-container text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-secondary hover:text-black group-hover:scale-110 shadow-lg shrink-0"
                  >
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Promotional Cards */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-surface-container-low p-10 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
            <span className="material-symbols-outlined text-8xl text-secondary/5">verified</span>
          </div>
          <div className="relative z-10 max-w-md">
            <span className="inline-block bg-[#EFBF04] text-[#241a00] text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-6">Velvet Privilege</span>
            <h3 className="font-headline text-3xl font-bold text-white mb-4 leading-tight">Round-trip Savings & Premium Upgrades.</h3>
            <p className="font-body text-[#8e90a1] leading-relaxed mb-8">Secure your return journey today and enjoy an immediate 15% discount or a complimentary upgrade to our Executive Fleet.</p>
            <Link className="text-secondary font-label text-xs uppercase tracking-widest font-bold flex items-center gap-2 group-hover:gap-4 transition-all" to="/services">
              Learn more about packages <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
        <div className="bg-primary-container p-10 rounded-xl flex flex-col justify-between text-white shadow-2xl shadow-blue-900/40">
          <div className="space-y-4">
            <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>support_agent</span>
            <h4 className="font-headline text-xl font-bold">Priority Support</h4>
            <p className="font-body text-primary-fixed-dim text-sm leading-relaxed">Dedicated concierge for all your route planning and personalized stopovers.</p>
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
