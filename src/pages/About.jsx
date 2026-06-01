import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  const handleBookCab = () => {
    navigate("/book/cab");
  };

  return (
    <main className="pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="mb-24 relative overflow-hidden rounded-3xl">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')",
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/75"></div>

        {/* Existing Blur Effect */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Existing Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end p-8 md:p-12">
          <div className="lg:col-span-8">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-secondary mb-4 block">
              The Heritage of Service
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-light tracking-tighter leading-tight text-white mb-8">
              About <span className="font-bold text-white">Velvet Pearl</span>
              <br />
              Tours and Travels
            </h1>
          </div>

          <div className="lg:col-span-4 pb-4">
            <p className="text-white/90 text-lg leading-relaxed border-l border-secondary/30 pl-6">
              Crafting seamless transitions between destinations since our
              inception. We don't just provide travel; we curate experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Core Solutions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
        <div className="md:col-span-2 glass-card rounded-xl p-10 border-t border-white/5 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="material-symbols-outlined text-secondary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  stars
                </span>
                <span className="font-label text-[10px] uppercase tracking-widest text-secondary">
                  Premium Standard
                </span>
              </div>
              <h2 className="font-headline text-3xl font-bold mb-6 text-white tracking-tight">
                One-Stop Travel Solutions
              </h2>
              <div className="space-y-6 text-on-surface-variant max-w-xl">
                <p>
                  Velvet Pearl is more than a transport company. We provide a
                  holistic ecosystem for the modern traveler, integrating{" "}
                  <strong>
                    Tours, Luxury Rooms, Professional Cabs, and Corporate
                    Events.
                  </strong>
                </p>
                <p>
                  Our commitment to excellence ensures that every touchpoint of
                  your journey—from the moment you land to your final
                  departure—is managed with surgical precision and the warmth of
                  South Indian hospitality.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-high rounded-xl p-8 border-t border-white/5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div>
            <span
              className="material-symbols-outlined text-primary mb-4"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              verified_user
            </span>
            <h3 className="font-headline text-xl font-bold text-white mb-4">
              Regional Expertise
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Deep-rooted knowledge of Tamil Nadu’s landscapes, from the busy
              streets of Chennai to the serene temples of Madurai. Our drivers
              are local curators.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-outline-variant/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-label uppercase tracking-widest text-secondary">
                Safety Rating
              </span>
              <span className="text-white font-bold">99.8%</span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full w-[99%]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="mb-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant/20 rounded-xl overflow-hidden border border-outline-variant/20">
          <div className="bg-surface p-10 flex flex-col items-center text-center transition-all duration-300 md:hover:scale-105 md:hover:bg-surface-container-high">
            <span className="text-4xl font-headline font-black text-white mb-2">
              150+
            </span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              Premium Fleet
            </span>
          </div>
          <div className="bg-surface p-10 flex flex-col items-center text-center transition-all duration-300 md:hover:scale-105 md:hover:bg-surface-container-high">
            <span className="text-4xl font-headline font-black text-secondary mb-2">
              L-882
            </span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              Licensed & Certified
            </span>
          </div>
          <div className="bg-surface p-10 flex flex-col items-center text-center transition-all duration-300 md:hover:scale-105 md:hover:bg-surface-container-high">
            <span className="text-4xl font-headline font-black text-white mb-2">
              12k+
            </span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              Happy Clients
            </span>
          </div>
          <div className="bg-surface p-10 flex flex-col items-center text-center transition-all duration-300 md:hover:scale-105 md:hover:bg-surface-container-high">
            <span className="text-4xl font-headline font-black text-primary mb-2">
              24/7
            </span>
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              Global Support
            </span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mb-32">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-12">
          <h2 className="font-headline text-4xl font-bold text-white tracking-tight">
            Client Perspectives
          </h2>
          <div className="h-px flex-grow mx-8 bg-gradient-to-r from-secondary/50 to-transparent hidden md:block"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="glass-card p-8 rounded-xl relative transition-all duration-300 md:hover:-translate-y-2 md:hover:shadow-xl">
            <span
              className="material-symbols-outlined absolute top-6 right-8 text-secondary/20 scale-150"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              format_quote
            </span>
            <p className="text-on-surface-variant italic mb-8 relative z-10 leading-relaxed">
              "The level of professionalism in their cab service is unmatched in
              the region. Impeccable timing and luxury vehicles."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">
                  person
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Rajesh Kumar</h4>
                <p className="text-[10px] font-label uppercase text-secondary">
                  Corporate Traveler
                </p>
              </div>
            </div>
          </div>
          {/* Testimonial 2 */}
          <div className="glass-card p-8 rounded-xl relative transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
            <span
              className="material-symbols-outlined absolute top-6 right-8 text-secondary/20 scale-150"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              format_quote
            </span>
            <p className="text-on-surface-variant italic mb-8 relative z-10 leading-relaxed">
              "Their regional expertise made our family temple tour effortless.
              They know the hidden gems of Tamil Nadu."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">
                  person
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Ananya Iyer</h4>
                <p className="text-[10px] font-label uppercase text-secondary">
                  Family Vacation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-surface-container-low rounded-xl p-12 md:p-20 relative overflow-hidden text-center">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #2249DB 0%, transparent 70%)",
          }}
        ></div>
        <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-6 relative z-10 tracking-tight">
          Ready for your premium journey?
        </h2>
        <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-12 relative z-10">
          Connect with our luxury concierge and book your experience today. We
          handle the details, you enjoy the destination.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
          <button
            className="w-full md:w-auto bg-primary-container text-white px-10 py-5 font-label text-sm uppercase tracking-widest rounded-md hover:shadow-2xl hover:shadow-primary-container/30 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
            onClick={handleBookCab}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              local_taxi
            </span>
            Book a Cab
          </button>
          <div className="flex flex-col items-center md:items-start">
            <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">
              Direct Assistance
            </span>

            <a
              href="tel:+919943139353"
              className="flex items-center gap-2 text-2xl font-headline font-bold text-secondary hover:text-white transition-colors tracking-tight"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                call
              </span>
              +91 99431 39353
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
