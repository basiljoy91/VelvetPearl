import { Link } from 'react-router-dom';
import { buildWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../../utils/whatsapp';

export default function Footer() {
    return (
      <footer className="bg-[#0E0E0F] w-full px-6 py-12 pb-32 md:px-8 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="md:col-span-1">
            <div className="text-2xl font-headline font-black text-white mb-6">Velvet Pearl</div>
            <p className="text-sm font-body leading-relaxed text-gray-500 mb-6">
              Enquiry-first travel assistance for cabs, stays, tours, and custom trip planning. Business details are being updated gradually.
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
            <p className="text-sm text-gray-500 mb-4">Contact: +91-9943139353</p>
            <p className="text-xs text-gray-600 mb-4">Business address will be updated soon. GST or license details will be added if applicable.</p>
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
          <p className="text-xs text-gray-500">© 2024 Velvet Pearl Tours. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-[10px] font-label uppercase tracking-widest text-gray-600">Service areas will be updated soon</span>
          </div>
        </div>
      </footer>
    );
  }
