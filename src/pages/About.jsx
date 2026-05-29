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
              This page will be updated with verified business details, service scope, and operating information as they are finalized.
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
                <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>edit_note</span>
                <span className="font-label text-[10px] uppercase tracking-widest text-secondary">Editable Service Summary</span>
              </div>
              <h2 className="font-headline text-3xl font-bold mb-6 text-white tracking-tight">Current Service Scope</h2>
              <div className="space-y-6 text-on-surface-variant max-w-xl">
                <p>Velvet Pearl currently presents an enquiry-first workflow for <strong>cab booking enquiry, room or stay enquiry, tour package enquiry, custom trip enquiry, and general travel enquiry.</strong></p>
                <p>This content is intentionally conservative until real fleet details, partner stays, verified reviews, and formal business proof are ready to publish.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-high rounded-xl p-8 border-t border-white/5 flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined text-primary mb-4" style={{fontVariationSettings: "'FILL' 0"}}>place</span>
            <h3 className="font-headline text-xl font-bold text-white mb-4">Service Area Notes</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Editable placeholders for current service area: Chennai travel support, airport pickup or drop assistance, local sightseeing support, South India outstation trip support, and family or group travel support.</p>
          </div>
          <div className="mt-8 pt-8 border-t border-outline-variant/20">
            <p className="text-xs font-label uppercase tracking-widest text-secondary mb-2">Business Verification</p>
            <p className="text-sm text-on-surface-variant">Business address will be updated soon. GST or license details will be added if applicable. For verification, contact us directly on WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* Placeholder Facts */}
      <section className="mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant/20 rounded-xl overflow-hidden border border-outline-variant/20">
          <div className="bg-surface p-10 flex flex-col items-center text-center">
            <span className="text-2xl font-headline font-black text-white mb-2">Vehicles</span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Vehicle details will be updated soon</span>
          </div>
          <div className="bg-surface p-10 flex flex-col items-center text-center">
            <span className="text-2xl font-headline font-black text-secondary mb-2">Hotels</span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Hotel partner details will be added soon</span>
          </div>
          <div className="bg-surface p-10 flex flex-col items-center text-center">
            <span className="text-2xl font-headline font-black text-white mb-2">Reviews</span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Customer reviews coming soon</span>
          </div>
          <div className="bg-surface p-10 flex flex-col items-center text-center">
            <span className="text-2xl font-headline font-black text-primary mb-2">Proof</span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Business details will be updated soon</span>
          </div>
        </div>
      </section>
      
      {/* Reviews Placeholder */}
      <section className="mb-32">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">Customer Feedback</h2>
          <div className="h-px flex-grow mx-8 bg-gradient-to-r from-secondary/50 to-transparent hidden md:block"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-xl relative">
            <span className="material-symbols-outlined absolute top-6 right-8 text-secondary/20 scale-150" style={{fontVariationSettings: "'FILL' 0"}}>reviews</span>
            <p className="text-on-surface-variant mb-8 relative z-10 leading-relaxed">Customer reviews coming soon.</p>
            <h4 className="text-sm font-bold text-white">Verified review placeholder</h4>
          </div>
          <div className="glass-card p-8 rounded-xl relative">
            <span className="material-symbols-outlined absolute top-6 right-8 text-secondary/20 scale-150" style={{fontVariationSettings: "'FILL' 0"}}>comment_bank</span>
            <p className="text-on-surface-variant mb-8 relative z-10 leading-relaxed">We are collecting verified customer feedback.</p>
            <h4 className="text-sm font-bold text-white">Feedback collection in progress</h4>
          </div>
          <div className="glass-card p-8 rounded-xl relative">
            <span className="material-symbols-outlined absolute top-6 right-8 text-secondary/20 scale-150" style={{fontVariationSettings: "'FILL' 0"}}>history_edu</span>
            <p className="text-on-surface-variant mb-8 relative z-10 leading-relaxed">Real customer stories will be added here soon.</p>
            <h4 className="text-sm font-bold text-white">Story section placeholder</h4>
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
            <a className="text-2xl font-headline font-bold text-secondary hover:text-white transition-colors tracking-tight" href="tel:+919943139353">+91-9943139353</a>
          </div>
        </div>
      </section>
    </main>
  );
}
