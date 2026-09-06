import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="mb-24 relative">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-secondary mb-4 block">Business Information</span>
            <h1 className="font-headline text-6xl md:text-8xl font-light tracking-tighter leading-tight text-white mb-8">
              About <span className="font-bold text-white">Velvet Pearl</span><br/>
              Tours and Travels
            </h1>
          </div>
          <div className="lg:col-span-4 pb-4">
            <p className="text-on-surface-variant text-lg leading-relaxed border-l border-secondary/30 pl-6">
              Velvet Pearl helps travellers plan cabs, stays, tours, and custom trips with direct follow-up, practical coordination, and clear confirmation before travel.
            </p>
          </div>
        </div>
      </section>

      {/* Core Solutions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
        <div className="md:col-span-2 glass-card rounded-xl p-10 border-t border-white/5 relative overflow-hidden group">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>travel_explore</span>
                <span className="font-label text-[10px] uppercase tracking-widest text-secondary">Travel Service Summary</span>
              </div>
              <h2 className="font-headline text-3xl font-bold mb-6 text-white tracking-tight">What We Arrange</h2>
              <div className="space-y-6 text-on-surface-variant max-w-xl">
                <p>Velvet Pearl supports <strong>cab booking enquiries, room or stay assistance, tour package planning, custom trip coordination, and general travel support.</strong></p>
                <p>Every request is reviewed by the team before availability, pricing, route timing, or service confirmation is shared.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-high rounded-xl p-8 border-t border-white/5 flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined text-primary mb-4" style={{fontVariationSettings: "'FILL' 0"}}>place</span>
            <h3 className="font-headline text-xl font-bold text-white mb-4">Service Area Notes</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Travel support is focused around Chennai, airport pickup and drop assistance, local sightseeing, South India outstation trips, and family or group travel requirements.</p>
          </div>
          <div className="mt-8 pt-8 border-t border-outline-variant/20">
            <p className="text-xs font-label uppercase tracking-widest text-secondary mb-2">Direct Assistance</p>
            <p className="text-sm text-on-surface-variant">For booking questions, route planning, or service verification, contact Velvet Pearl directly by phone or WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* Service Facts */}
      <section className="mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant/20 rounded-xl overflow-hidden border border-outline-variant/20">
          <div className="bg-surface p-10 flex flex-col items-center text-center">
            <span className="text-2xl font-headline font-black text-white mb-2">Cabs</span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Airport, local, and outstation travel</span>
          </div>
          <div className="bg-surface p-10 flex flex-col items-center text-center">
            <span className="text-2xl font-headline font-black text-secondary mb-2">Stays</span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Room options reviewed by requirement</span>
          </div>
          <div className="bg-surface p-10 flex flex-col items-center text-center">
            <span className="text-2xl font-headline font-black text-white mb-2">Tours</span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Itineraries shaped around travellers</span>
          </div>
          <div className="bg-surface p-10 flex flex-col items-center text-center">
            <span className="text-2xl font-headline font-black text-primary mb-2">Support</span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Phone and WhatsApp follow-up</span>
          </div>
        </div>
      </section>
      
      {/* Process */}
      <section className="mb-32">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">How We Work</h2>
          <div className="h-px flex-grow mx-8 bg-gradient-to-r from-secondary/50 to-transparent hidden md:block"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-xl relative">
            <span className="material-symbols-outlined absolute top-6 right-8 text-secondary/20 scale-150" style={{fontVariationSettings: "'FILL' 0"}}>fact_check</span>
            <p className="text-on-surface-variant mb-8 relative z-10 leading-relaxed">We review your route, timing, passenger count, stay needs, or tour preferences before suggesting the next step.</p>
            <h4 className="text-sm font-bold text-white">Requirement Review</h4>
          </div>
          <div className="glass-card p-8 rounded-xl relative">
            <span className="material-symbols-outlined absolute top-6 right-8 text-secondary/20 scale-150" style={{fontVariationSettings: "'FILL' 0"}}>support_agent</span>
            <p className="text-on-surface-variant mb-8 relative z-10 leading-relaxed">The team follows up directly with practical details, availability, and any questions needed to refine the plan.</p>
            <h4 className="text-sm font-bold text-white">Clear Follow-Up</h4>
          </div>
          <div className="glass-card p-8 rounded-xl relative">
            <span className="material-symbols-outlined absolute top-6 right-8 text-secondary/20 scale-150" style={{fontVariationSettings: "'FILL' 0"}}>verified</span>
            <p className="text-on-surface-variant mb-8 relative z-10 leading-relaxed">Trips and services are confirmed only after the details are checked and both sides are clear on the arrangement.</p>
            <h4 className="text-sm font-bold text-white">Manual Confirmation</h4>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-surface-container-low rounded-xl p-12 md:p-20 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: "radial-gradient(circle at center, #2249DB 0%, transparent 70%)"}}></div>
        <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-6 relative z-10 tracking-tight">Need travel help?</h2>
        <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-12 relative z-10">Submit your requirement to get the best available quote. Final pricing and availability are shared after manual review.</p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
          <Link to="/book/cab" className="w-full md:w-auto bg-primary-container text-white px-10 py-5 font-label text-sm uppercase tracking-widest rounded-md hover:shadow-2xl hover:shadow-primary-container/30 transition-all flex items-center justify-center gap-3">
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>local_taxi</span>
            Submit Enquiry
          </Link>
          <div className="flex flex-col items-center md:items-start">
            <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Direct Assistance</span>
            <a className="text-2xl font-headline font-bold text-secondary hover:text-white transition-colors tracking-tight" href="tel:+917845039353">+91-7845039353</a>
          </div>
        </div>
      </section>
    </main>
  );
}
