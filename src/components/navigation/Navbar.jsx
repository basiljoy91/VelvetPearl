import { Link } from 'react-router-dom';

export default function Navbar({ onBookClick }) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-[#EFBF04]/20 shadow-2xl shadow-blue-900/10">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
        <div className="text-xl font-headline font-bold text-white tracking-tight">Velvet Pearl</div>
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="font-label text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors duration-300">Home</Link>
          <Link to="/about" className="font-label text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors duration-300">About</Link>
          <Link to="/services" className="font-label text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors duration-300">Services</Link>
          <Link to="/routes" className="font-label text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors duration-300">Routes</Link>
          <Link to="/contact" className="font-label text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors duration-300">Contact</Link>
        </div>
        <button 
          onClick={onBookClick}
          className="bg-[#EFBF04] text-black font-label text-xs uppercase tracking-widest px-6 py-2.5 rounded-md hover:scale-95 transition-all duration-200 ease-in-out font-bold"
        >
          Book Now
        </button>
      </div>
    </nav>
  );
}
