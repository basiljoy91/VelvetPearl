import { Link } from 'react-router-dom';
import { buildWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../../utils/whatsapp';
import footerBanner from '../../assets/branding/velvet-pearl/velvet-pearl-banner-dark.png';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
      <footer className="bg-[#0E0E0F] w-full px-6 py-12 pb-32 md:px-8 md:pb-12">
        <div className="grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4 xl:gap-10 mx-auto">
          <div className="xl:col-span-2">
            <Link
              className="group block overflow-hidden rounded-[28px] border border-white/8 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.28)] transition-transform duration-300 hover:-translate-y-1"
              to="/"
            >
              <img
                alt="Velvet Pearl banner with The Art of Travel tagline"
                className="w-full h-auto rounded-[22px] border border-white/6 bg-[#05070d] object-contain"
                height="793"
                loading="lazy"
                src={footerBanner}
                width="1983"
              />
            </Link>
            <p className="mt-5 text-sm font-label uppercase tracking-[0.22em] text-[#EFBF04]">
              The Art of Travel
            </p>
            <p className="mt-3 max-w-2xl text-sm font-body leading-relaxed text-gray-500">
              Enquiry-first travel assistance for cabs, stays, tours, and custom trip planning across Chennai and South India.
            </p>
          </div>
          <div>
            <h4 className="font-label text-[10px] uppercase tracking-widest text-[#EFBF04] mb-6 font-bold">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link className="text-sm text-gray-500 hover:text-[#2249DB] transition-all" to="/about">About Us</Link></li>
              <li><Link className="text-sm text-gray-500 hover:text-[#2249DB] transition-all" to="/services">Our Services</Link></li>
              <li><Link className="text-sm text-gray-500 hover:text-[#2249DB] transition-all" to="/routes">Popular Routes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label text-[10px] uppercase tracking-widest text-[#EFBF04] mb-6 font-bold">Support</h4>
            <ul className="space-y-3">
              <li><a className="text-sm text-gray-500 hover:text-[#2249DB] transition-all" href={buildWhatsAppLink({ phone: DEFAULT_WHATSAPP_PHONE, message: 'Hi, I would like to know more about your travel services.' })} rel="noreferrer" target="_blank">WhatsApp Support</a></li>
              <li><Link className="text-sm text-gray-500 hover:text-[#2249DB] transition-all" to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label text-[10px] uppercase tracking-widest text-[#EFBF04] mb-6">Connect</h4>
            <p className="text-sm text-gray-500 mb-4">Contact: +91-7845039353</p>
            <p className="text-xs text-gray-600 mb-4">Call or message Velvet Pearl directly for travel support, booking questions, and service verification.</p>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-primary-container transition-all group cursor-pointer" href={buildWhatsAppLink({ phone: DEFAULT_WHATSAPP_PHONE, message: 'Hi, I would like to know more about your travel services.' })} rel="noreferrer" target="_blank">
                <span className="material-symbols-outlined text-sm text-gray-400 group-hover:text-white">forum</span>
              </a>
              <Link className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-primary-container transition-all group cursor-pointer" to="/contact">
                <span className="material-symbols-outlined text-sm text-gray-400 group-hover:text-white">call</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">© {currentYear} Velvet Pearl Tours and Travels. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-[10px] font-label uppercase tracking-widest text-gray-600">Chennai and South India travel support</span>
          </div>
        </div>
      </footer>
    );
  }
