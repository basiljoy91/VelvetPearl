import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { buildWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../../utils/whatsapp';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-[110] hidden w-[350px] overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] glass-panel animate-in slide-in-from-bottom-4 duration-500 md:block md:bottom-28 md:right-8 md:w-[380px]">
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
              href={buildWhatsAppLink({
                phone: DEFAULT_WHATSAPP_PHONE,
                message: 'Hi, I would like to know more about your travel services. Please help me plan my trip.',
              })}
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
              <a className="rounded-xl border border-white/10 px-4 py-3 text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5" href="tel:+919943139353">
                Call Now
              </a>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-on-surface-variant">
              Availability, pricing, and final confirmation are shared after manual review.
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-8 right-8 z-[100] hidden flex-col items-end gap-3 md:flex md:bottom-12 md:right-12">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-none ${isOpen ? 'bg-secondary' : 'bg-primary-container'}`}
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
