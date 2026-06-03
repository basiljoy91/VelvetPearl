import React from 'react';
import { useLocation } from 'react-router-dom';
import { buildWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../../utils/whatsapp';

export default function FloatingWhatsAppButton() {
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith('/admin');
  const needsFormSafePlacement = pathname.startsWith('/book/') || pathname === '/contact' || pathname.startsWith('/packages/');

  return (
    <a
      aria-label="Chat on WhatsApp"
      className={`group fixed z-[95] flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all duration-300 ease-out hover:scale-110 hover:brightness-110 active:scale-95 md:bottom-32 md:right-12 md:h-14 md:w-14 ${
        isAdminPage
          ? 'hidden'
          : needsFormSafePlacement
            ? 'bottom-28 left-4 h-11 w-11 translate-y-0 opacity-100 md:left-auto md:right-12 md:h-14 md:w-14'
            : 'bottom-24 right-4 h-12 w-12 translate-y-0 opacity-100 sm:bottom-28 sm:right-6 sm:h-14 sm:w-14'
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
