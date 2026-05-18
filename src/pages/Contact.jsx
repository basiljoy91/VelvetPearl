import React from 'react';

export default function Contact() {
  const faqs = [
    {
      icon: 'payments',
      title: 'Payment Methods',
      text: 'We accept digital payments via PhonePe and Google Pay for immediate booking confirmation. Cash payments are also accepted upon trip commencement for your convenience.'
    },
    {
      icon: 'event_busy',
      title: 'Cancellation Policy',
      text: 'Cancellations made 24 hours prior to departure are eligible for a full refund. Same-day cancellations may incur a nominal processing fee depending on the service tier.'
    },
    {
      icon: 'schedule',
      title: 'Support Hours',
      text: 'Our digital support is active 24/7. Physical concierge desk operates from 08:00 AM to 10:00 PM IST daily for personalized route planning and vehicle inspections.'
    }
  ];

  return (
    <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <header className="relative mb-24">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-container/10 rounded-full blur-[100px] pointer-events-none"></div>
        <h1 className="font-headline font-light text-6xl md:text-8xl tracking-tighter mb-6 relative text-white">
          Contact & <br/>
          <span className="font-bold text-secondary">Support</span>
        </h1>
        <p className="font-body text-on-surface-variant max-w-xl text-lg leading-relaxed mb-12">
          Our premium concierge service is available around the clock to ensure your journey through Tamil Nadu is as seamless as the velvet finish of our fleet.
        </p>
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="flex items-center gap-6 group">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-secondary border border-secondary/10 group-hover:bg-secondary group-hover:text-on-secondary transition-all duration-500">
              <span className="material-symbols-outlined text-3xl">call</span>
            </div>
            <div>
              <span className="font-label text-xs uppercase tracking-widest text-[#8e90a1] block mb-1 font-bold">Direct Line & WhatsApp</span>
              <a className="font-headline font-bold text-2xl tracking-tight text-on-surface hover:text-secondary transition-colors" href="tel:+919943139353">+91-9943139353</a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32">
        {/* Contact Form Section */}
        <div className="lg:col-span-7 bg-surface-container-low p-10 rounded-xl relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-[80px]"></div>
          <h2 className="font-headline font-bold text-3xl mb-8 relative text-white tracking-tight">Send a Message</h2>
          <form className="space-y-6 relative" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-[#8e90a1] ml-1 font-bold">Full Name</label>
                <input className="w-full bg-surface-container-highest border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-4 text-on-surface focus:ring-0 outline-none rounded-sm" placeholder="John Doe" type="text"/>
              </div>
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-[#8e90a1] ml-1 font-bold">Email Address</label>
                <input className="w-full bg-surface-container-highest border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-4 text-on-surface focus:ring-0 outline-none rounded-sm" placeholder="john@premium.com" type="email"/>
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-widest text-[#8e90a1] ml-1 font-bold">Phone Number</label>
              <input className="w-full bg-surface-container-highest border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-4 text-on-surface focus:ring-0 outline-none rounded-sm" placeholder="+91 00000 00000" type="tel"/>
            </div>
            <div className="space-y-2">
              <label className="font-label text-xs uppercase tracking-widest text-[#8e90a1] ml-1 font-bold">Message</label>
              <textarea className="w-full bg-surface-container-highest border-0 border-l-2 border-transparent focus:border-secondary transition-all px-4 py-4 text-on-surface focus:ring-0 outline-none rounded-sm" placeholder="How can we curate your journey?" rows="4"></textarea>
            </div>
            <button className="w-full py-5 bg-primary-container text-white font-headline font-bold text-lg tracking-tight hover:brightness-110 transition-all flex items-center justify-center gap-3 rounded-md shadow-xl shadow-blue-900/20">
              Send Message
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="font-headline font-bold text-3xl mb-8 text-white tracking-tight">Frequently Asked <span className="text-secondary italic">Questions</span></h2>
          {faqs.map((faq, index) => (
            <div key={index} className="glass-panel p-8 rounded-xl border-t border-secondary/10 hover:border-secondary/30 transition-all duration-300">
              <div className="flex items-start gap-4 mb-4">
                <span className="material-symbols-outlined text-secondary">{faq.icon}</span>
                <h3 className="font-headline font-bold text-xl tracking-tight text-white">{faq.title}</h3>
              </div>
              <p className="font-body text-on-surface-variant leading-relaxed text-sm">
                {faq.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Visual Anchor */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-high h-48 rounded-xl overflow-hidden relative group border border-white/5">
          <img className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" alt="Luxury Hospitality" src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent p-6 flex flex-col justify-end">
            <span className="font-label text-[10px] tracking-[0.2em] text-secondary uppercase font-bold">Luxury Partners</span>
            <span className="font-headline font-bold text-lg text-white">Hospitality Network</span>
          </div>
        </div>
        <div className="bg-surface-container-high h-48 rounded-xl overflow-hidden relative group border border-white/5">
          <img className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" alt="Executive Fleet" src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent p-6 flex flex-col justify-end">
            <span className="font-label text-[10px] tracking-[0.2em] text-secondary uppercase font-bold">Premium Fleet</span>
            <span className="font-headline font-bold text-lg text-white">Executive Logistics</span>
          </div>
        </div>
        <div className="bg-surface-container-high h-48 rounded-xl overflow-hidden relative group border border-white/5">
          <img className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" alt="Cultural Routes" src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent p-6 flex flex-col justify-end">
            <span className="font-label text-[10px] tracking-[0.2em] text-secondary uppercase font-bold">Cultural Routes</span>
            <span className="font-headline font-bold text-lg text-white">Curated Experiences</span>
          </div>
        </div>
      </section>
    </main>
  );
}
