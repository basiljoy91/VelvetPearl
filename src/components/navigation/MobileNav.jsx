import { Link } from 'react-router-dom';

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-4 pt-3 bg-black/85 backdrop-blur-lg border-t border-[#EFBF04]/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:hidden">
      <Link to="/" className="flex flex-col items-center justify-center text-gray-500 p-2 active:scale-90 transition-transform">
        <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 0"}}>home</span>
        <span className="text-[10px] font-label mt-1">Home</span>
      </Link>
      <Link to="/about" className="flex flex-col items-center justify-center text-gray-500 p-2 active:scale-90 transition-transform font-body">
        <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 0"}}>info</span>
        <span className="text-[10px] font-label mt-1">About</span>
      </Link>
      <Link to="/services" className="flex flex-col items-center justify-center text-gray-500 p-2 active:scale-90 transition-transform">
        <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 0"}}>handyman</span>
        <span className="text-[10px] font-label mt-1">Services</span>
      </Link>
      <Link to="/routes" className="flex flex-col items-center justify-center text-gray-500 p-2 active:scale-90 transition-transform">
        <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 0"}}>map</span>
        <span className="text-[10px] font-label mt-1">Routes</span>
      </Link>
      <Link to="/contact" className="flex flex-col items-center justify-center text-gray-500 p-2 active:scale-90 transition-transform font-body">
        <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 0"}}>chat</span>
        <span className="text-[10px] font-label mt-1">Contact</span>
      </Link>
    </nav>
  );
}
