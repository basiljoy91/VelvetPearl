import React, { useCallback, useEffect, useState } from 'react';
import { X, Car, Home, Map, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InlineSpinner } from '../ui/LoadingState';

export default function BookingModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [pendingServiceId, setPendingServiceId] = useState('');

  const handleClose = useCallback(() => {
    setPendingServiceId('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !pendingServiceId) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, isOpen, pendingServiceId]);

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

  const handleSelect = (service) => {
    if (pendingServiceId) return;

    setPendingServiceId(service.id);

    window.setTimeout(() => {
      handleClose();
      navigate(service.path);
    }, 130);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:items-center md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-2xl transition-opacity duration-300 opacity-100"
        onClick={() => {
          if (!pendingServiceId) handleClose();
        }}
      />

      {/* Modal Content */}
      <div className="relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#EFBF04]/20 bg-[#0F0F0F] shadow-2xl transition-all duration-300 ease-out md:max-h-[90vh] translate-y-0 scale-100 opacity-100">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#EFBF04]/10 bg-gradient-to-r from-black via-[#0F0F0F] to-[#0F0F0F]/95 px-5 py-5 backdrop-blur md:px-10 md:py-8">
          <div className="min-w-0">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-white mb-2">Select Service</h2>
            <p className="text-gray-400 font-body text-sm md:text-base">Choose the enquiry form that matches your requirement.</p>
          </div>
          <button 
            onClick={handleClose}
            disabled={Boolean(pendingServiceId)}
            aria-label="Close enquiry service selector"
            className="shrink-0 rounded-full bg-white/5 p-3 text-white transition-all duration-300 hover:bg-white/10 hover:rotate-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 md:grid-cols-2 md:p-10">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => handleSelect(service)}
              disabled={Boolean(pendingServiceId)}
              className={`group relative flex items-start gap-6 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br p-6 text-left transition-all duration-500 ${service.color} ${pendingServiceId === service.id ? 'border-[#EFBF04]/50 bg-[#EFBF04]/10 scale-[0.99]' : 'hover:border-[#EFBF04]/40 hover:translate-y-[-4px]'} disabled:cursor-not-allowed disabled:opacity-80`}
            >
              <div className={`absolute right-0 top-0 p-4 transition-opacity duration-300 ${pendingServiceId === service.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {pendingServiceId === service.id ? (
                  <InlineSpinner className="text-[#EFBF04]" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-[#EFBF04]" />
                )}
              </div>
              
              <div className={`flex-shrink-0 rounded-xl border border-[#EFBF04]/20 bg-black/40 p-4 transition-transform duration-500 ${pendingServiceId === service.id ? 'scale-105' : 'group-hover:scale-110'}`}>
                {service.icon}
              </div>
              
              <div className="text-left">
                <h3 className="mb-2 text-xl font-bold text-white transition-colors duration-300 group-hover:text-[#EFBF04]">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-body">
                  {pendingServiceId === service.id ? 'Opening enquiry form...' : service.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="sticky bottom-0 border-t border-[#EFBF04]/10 bg-black/85 px-5 py-4 text-center backdrop-blur md:px-10 md:py-6">
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-label">
            Manual Review Before Final Confirmation • Velvet Pearl
          </p>
        </div>
      </div>
    </div>
  );
}
