import React from 'react';
import { useLocation } from 'react-router-dom';
import { buildWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../../utils/whatsapp';

export default function FloatingWhatsAppButton() {
  const { pathname } = useLocation();
  const hideOnMobile = pathname.startsWith('/book/') || pathname === '/contact' || pathname.startsWith('/admin');

  return (
    <a
      aria-label="Chat on WhatsApp"
      className={`group fixed bottom-24 right-4 z-[95] h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 sm:bottom-28 sm:right-6 sm:h-14 sm:w-14 md:bottom-32 md:right-12 ${
        hideOnMobile ? 'hidden md:flex' : 'flex'
      }`}
      href={buildWhatsAppLink({
        phone: DEFAULT_WHATSAPP_PHONE,
        message: 'Hi, I would like to know more about your travel services. Please help me plan my trip.',
      })}
      rel="noreferrer"
      target="_blank"
    >
      <span className="material-symbols-outlined text-2xl sm:text-3xl">forum</span>
      <span className="pointer-events-none absolute right-full mr-4 hidden whitespace-nowrap rounded bg-[#201f20] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#25D366] opacity-0 transition-opacity group-hover:opacity-100 md:block">
        WhatsApp
      </span>
    </a>
  );
}
