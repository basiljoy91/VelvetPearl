import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ onBookClick }) {
  const location = useLocation();

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navLinkClass = (path) =>
    `font-label text-sm uppercase tracking-widest transition-all duration-300 ${location.pathname === path
      ? 'text-[#EFBF04]'
      : 'text-gray-300 hover:text-[#EFBF04]'
    }`;

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-[#EFBF04]/20 shadow-lg">
      <div className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-7xl mx-auto">

        {/* Logo */}
        <Link to="/" onClick={handleScrollTop}>
          <div className="text-lg md:text-2xl font-headline font-bold text-white tracking-wide cursor-pointer hover:text-[#EFBF04] transition-colors duration-300">
            Velvet Pearl
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" onClick={handleScrollTop} className={navLinkClass('/')}>
            Home
          </Link>

          <Link to="/about" onClick={handleScrollTop} className={navLinkClass('/about')}>
            About
          </Link>

          <Link to="/services" onClick={handleScrollTop} className={navLinkClass('/services')}>
            Services
          </Link>

          <Link to="/routes" onClick={handleScrollTop} className={navLinkClass('/routes')}>
            Routes
          </Link>

          <Link to="/contact" onClick={handleScrollTop} className={navLinkClass('/contact')}>
            Contact
          </Link>
        </div>

        {/* CTA Button */}
        <button
          onClick={onBookClick}
          className="bg-[#EFBF04] text-black font-label text-xs uppercase tracking-widest px-6 py-2.5 rounded-md font-bold hover:bg-yellow-400 hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
        >
          Submit Enquiry
        </button>
      </div>
    </nav>
  );
}
