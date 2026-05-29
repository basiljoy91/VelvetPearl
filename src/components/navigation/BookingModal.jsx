import React from 'react';
import { X, Car, Home, Map, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BookingModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const services = [
    {
      id: 'cab',
      title: 'Cab Booking Enquiry',
      description: 'Share your route, date, passenger count, and vehicle preference',
      icon: <Car className="w-8 h-8 text-[#EFBF04]" />,
      path: '/book/cab',
      color: 'from-blue-500/20 to-blue-600/20'
    },
    {
      id: 'room',
      title: 'Room or Stay Enquiry',
      description: 'Send check-in, check-out, guests, room count, and stay preference',
      icon: <Home className="w-8 h-8 text-[#EFBF04]" />,
      path: '/book/room',
      color: 'from-purple-500/20 to-purple-600/20'
    },
    {
      id: 'tour',
      title: 'Tour Package Enquiry',
      description: 'Tell us your destination, travel window, group size, and budget',
      icon: <Map className="w-8 h-8 text-[#EFBF04]" />,
      path: '/book/tour',
      color: 'from-emerald-500/20 to-emerald-600/20'
    },
    {
      id: 'event',
      title: 'Custom Trip Enquiry',
      description: 'Use this for event-linked travel or special trip planning needs',
      icon: <Calendar className="w-8 h-8 text-[#EFBF04]" />,
      path: '/book/event',
      color: 'from-rose-500/20 to-rose-600/20'
    }
  ];

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-2xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl bg-[#0F0F0F] border border-[#EFBF04]/20 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 md:p-10 border-b border-[#EFBF04]/10 flex justify-between items-center bg-gradient-to-r from-black to-[#0F0F0F]">
          <div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-white mb-2">Select Service</h2>
            <p className="text-gray-400 font-body text-sm md:text-base">Choose the enquiry form that matches your requirement.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all duration-300 hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Services Grid */}
        <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => handleSelect(service.path)}
              className={`group relative flex items-start gap-6 p-6 rounded-2xl border border-white/5 bg-gradient-to-br ${service.color} hover:border-[#EFBF04]/40 transition-all duration-500 hover:translate-y-[-4px] overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="w-5 h-5 text-[#EFBF04]" />
              </div>
              
              <div className="flex-shrink-0 p-4 rounded-xl bg-black/40 border border-[#EFBF04]/20 group-hover:scale-110 transition-transform duration-500">
                {service.icon}
              </div>
              
              <div className="text-left">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#EFBF04] transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-body">
                  {service.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="px-10 py-6 bg-black/40 text-center border-t border-[#EFBF04]/10">
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-label">
            Manual Review Before Final Confirmation • Velvet Pearl
          </p>
        </div>
      </div>
    </div>
  );
}
