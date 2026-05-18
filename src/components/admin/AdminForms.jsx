import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AdminForms({ type, isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, id: `VP-${Math.floor(Math.random() * 9000) + 1000}` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0F0F0F] border border-[#EFBF04]/20 rounded-2xl shadow-2xl p-8 overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-headline font-bold text-white capitalize">Add New {type}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'bookings' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Customer Name</label>
                <input name="customer" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Service Type</label>
                <select name="service" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40 appearance-none">
                  <option value="Cab">Cab Booking</option>
                  <option value="Room">Room Booking</option>
                  <option value="Tour">Tour Booking</option>
                  <option value="Event">Event Planning</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Schedule Date</label>
                <input name="schedule" type="date" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
              </div>
            </>
          )}

          {type === 'fleet' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Vehicle Model</label>
                <input name="model" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Plate Number</label>
                <input name="plate" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
              </div>
            </>
          )}

          {type === 'drivers' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Driver Name</label>
                <input name="name" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Phone Number</label>
                <input name="phone" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-[#EFBF04] text-black py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:scale-[0.98] transition-all">
            Save Record
          </button>
        </form>
      </div>
    </div>
  );
}
