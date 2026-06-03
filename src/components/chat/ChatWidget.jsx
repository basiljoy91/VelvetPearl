import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { buildWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../../utils/whatsapp';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const showMobileContactDock = !pathname.startsWith('/admin') && !pathname.startsWith('/book/') && !pathname.startsWith('/packages/') && pathname !== '/contact';
  const whatsappHref = buildWhatsAppLink({
    phone: DEFAULT_WHATSAPP_PHONE,
    message: 'Hi, I would like to know more about your travel services. Please help me plan my trip.',
  });

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-[110] hidden w-[350px] translate-y-0 scale-100 overflow-hidden rounded-2xl border border-white/10 opacity-100 shadow-[0_20px_60px_rgba(0,0,0,0.6)] glass-panel transition-all duration-300 ease-out md:bottom-28 md:right-8 md:block md:w-[380px]">
          <div className="bg-primary-container px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
              </div>
              <div>
                <h4 className="text-white font-headline font-bold text-sm">Velvet Pearl Support</h4>
                <p className="text-white/70 text-[10px] uppercase tracking-widest">Real contact options</p>
              </div>
            </div>
            <button className="text-white/70 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 space-y-5 bg-surface-container-lowest">
            <div className="rounded-2xl bg-surface-container-high p-4">
              <p className="text-on-surface text-sm leading-relaxed">
                Need help with a cab, room, or tour request? Use WhatsApp for quick follow-up or submit a full enquiry form.
              </p>
            </div>

            <a
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#25D366] px-4 py-4 text-sm font-bold text-white transition-all hover:brightness-110"
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined text-base">forum</span>
              Chat on WhatsApp
            </a>

            <div className="grid grid-cols-2 gap-3">
              <Link className="rounded-xl border border-secondary/30 px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-secondary hover:bg-secondary/5" to="/contact">
                Contact Form
              </Link>
              <Link className="rounded-xl border border-white/10 px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5" to="/contact">
                Contact Page
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-on-surface-variant">
              Availability, pricing, and final confirmation are shared after manual review.
            </div>
          </div>
        </div>
      )}

      {showMobileContactDock && (
        <div className="fixed bottom-24 left-4 z-[96] flex translate-y-0 gap-2 opacity-100 transition-all duration-300 ease-out md:hidden">
          <a
            className="rounded-full border border-[#25D366]/40 bg-[#25D366]/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#7df0a6] backdrop-blur transition-all hover:border-[#25D366]/60 hover:bg-[#25D366]/20"
            href={whatsappHref}
            rel="noreferrer"
            target="_blank"
          >
            WhatsApp
          </a>
          <Link
            className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur transition-all hover:bg-black/75"
            to="/contact"
          >
            Contact
          </Link>
        </div>
      )}

      <div className="fixed bottom-8 right-8 z-[100] hidden flex-col items-end gap-3 md:flex md:bottom-12 md:right-12">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close contact options' : 'Open contact options'}
          className={`group relative flex h-16 w-16 items-center justify-center rounded-full border-none text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-secondary rotate-90' : 'bg-primary-container'}`}
        >
          <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isOpen ? 'close' : 'chat'}
          </span>
          {!isOpen && (
            <div className="absolute right-full mr-4 whitespace-nowrap rounded bg-[#201f20] px-3 py-1.5 text-xs font-label uppercase tracking-widest text-[#EFBF04] opacity-0 transition-opacity group-hover:opacity-100 border border-white/10 pointer-events-none">
              Contact Options
            </div>
          )}
        </button>
      </div>
    </>
  );
}
