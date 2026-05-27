import { Link } from 'react-router-dom';

export default function Footer() {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Velvet Pearl Tours',
          text: 'Redefining luxury travel and concierge services across South India.',
          url: window.location.origin
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Website link copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

    return (
      <footer className="bg-[#0E0E0F] w-full py-12 px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="md:col-span-1">
            <div className="text-2xl font-headline font-black text-white mb-6">Velvet Pearl</div>
            <p className="text-sm font-body leading-relaxed text-gray-500 mb-6">
              Redefining luxury travel and concierge services across South India with a commitment to safety and precision.
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
              <li><a className="text-sm text-gray-500 hover:text-[#2249DB] transition-all" href="https://wa.me/919943139353">WhatsApp Support</a></li>
              <li><Link className="text-sm text-gray-500 hover:text-[#2249DB] transition-all" to="/contact">Contact Us</Link></li>
              <li><Link className="text-sm text-gray-500 hover:text-[#2249DB] transition-all" to="/admin">Admin Access</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label text-[10px] uppercase tracking-widest text-[#EFBF04] mb-6">Connect</h4>
            <p className="text-sm text-gray-500 mb-4">Contact: +91-9943139353</p>
            <div className="flex gap-4">
              <button 
                onClick={handleShare}
                className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-primary-container transition-all group cursor-pointer"
                title="Share Website"
              >
                <span className="material-symbols-outlined text-sm text-gray-400 group-hover:text-white">share</span>
              </button>
              <a 
                href="mailto:sample@gmail.com?subject=Inquiry for Velvet Pearl Tours"
                className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-primary-container transition-all group cursor-pointer"
                title="Email Us"
              >
                <span className="material-symbols-outlined text-sm text-gray-400 group-hover:text-white">mail</span>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">© 2024 Velvet Pearl Tours. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-[10px] font-label uppercase tracking-widest text-gray-600">Chennai</span>
            <span className="text-[10px] font-label uppercase tracking-widest text-gray-600">Madurai</span>
            <span className="text-[10px] font-label uppercase tracking-widest text-gray-600">Trichy</span>
          </div>
        </div>
      </footer>
    );
  }
