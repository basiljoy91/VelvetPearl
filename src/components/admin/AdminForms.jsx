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
    
    let defaultValues = {};
    if (type === 'bookings') {
      defaultValues = { status: 'Pending', amount: 'TBD' };
    } else if (type === 'fleet') {
      defaultValues = { status: formData.status || 'Available', lastService: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) };
    } else if (type === 'drivers') {
      defaultValues = { status: 'Active', rating: '5.0' };
    }

    onSubmit({ ...formData, ...defaultValues, id: `VP-${Math.floor(Math.random() * 9000) + 1000}` });
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
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Phone Number</label>
                <input name="phone" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Service Type</label>
                <select name="service" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40 appearance-none">
                  <option value="" disabled selected className="bg-[#0F0F0F]">Select Service</option>
                  <option value="Cab" className="bg-[#0F0F0F]">Cab Booking</option>
                  <option value="Room" className="bg-[#0F0F0F]">Room Booking</option>
                  <option value="Tour" className="bg-[#0F0F0F]">Tour Booking</option>
                  <option value="Event" className="bg-[#0F0F0F]">Event Planning</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Details</label>
                <input name="details" onChange={handleChange} placeholder="e.g. VIP MPV, 4 Nights" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
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
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Vehicle Type</label>
                <select name="type" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40 appearance-none">
                  <option value="" disabled selected className="bg-[#0F0F0F]">Select Type</option>
                  <option value="VIP MPV" className="bg-[#0F0F0F]">VIP MPV</option>
                  <option value="Luxury Van" className="bg-[#0F0F0F]">Luxury Van</option>
                  <option value="Executive Sedan" className="bg-[#0F0F0F]">Executive Sedan</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Status</label>
                <select name="status" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40 appearance-none">
                  <option value="" disabled selected className="bg-[#0F0F0F]">Select Status</option>
                  <option value="Available" className="bg-[#0F0F0F]">Available</option>
                  <option value="On Trip" className="bg-[#0F0F0F]">On Trip</option>
                </select>
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
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Experience</label>
                <input name="experience" onChange={handleChange} placeholder="e.g. 5 Years" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
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
