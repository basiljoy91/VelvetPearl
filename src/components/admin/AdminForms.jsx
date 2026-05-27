import React, { useState } from 'react';
import { X } from 'lucide-react';

const inputClassName = 'w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40';
const labelClassName = 'text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold';

export default function AdminForms({ type, isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({});

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData({});
    onClose();
  };

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let defaultValues = {};
    if (type === 'bookings') {
      defaultValues = { status: 'Pending', amount: 'TBD' };
    } else if (type === 'fleet') {
      defaultValues = {
        status: formData.status || 'Available',
        lastService: formData.lastService || new Date().toISOString().split('T')[0],
        fuel_status: formData.fuel_status || 100,
        condition: formData.condition || 'Good',
      };
    } else if (type === 'drivers') {
      defaultValues = {
        status: formData.status || 'Active',
        rating: formData.rating || '5.0',
        licence_status: formData.licence_status || 'Pending',
      };
    }

    onSubmit({ ...formData, ...defaultValues });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />
      <div className="relative w-full max-w-3xl bg-[#0F0F0F] border border-[#EFBF04]/20 rounded-2xl shadow-2xl p-8 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-headline font-bold text-white capitalize">Add New {type}</h3>
          <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-full text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {type === 'bookings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClassName}>Customer Name</label>
                <input name="customer" onChange={handleChange} className={inputClassName} required />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Phone Number</label>
                <input name="phone" onChange={handleChange} className={inputClassName} required />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Service Type</label>
                <select name="service" value={formData.service || ''} onChange={handleChange} className={inputClassName} required>
                  <option value="" disabled className="bg-[#0F0F0F]">Select Service</option>
                  <option value="Cab" className="bg-[#0F0F0F]">Cab Booking</option>
                  <option value="Room" className="bg-[#0F0F0F]">Room Booking</option>
                  <option value="Tour" className="bg-[#0F0F0F]">Tour Booking</option>
                  <option value="Event" className="bg-[#0F0F0F]">Event Planning</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Schedule Date</label>
                <input name="schedule" type="date" onChange={handleChange} className={inputClassName} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className={labelClassName}>Details</label>
                <input name="details" onChange={handleChange} placeholder="e.g. Airport pickup, VIP MPV, 4 Nights" className={inputClassName} required />
              </div>
            </div>
          )}

          {type === 'fleet' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClassName}>Vehicle Model</label>
                <input name="model" onChange={handleChange} className={inputClassName} required />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Plate Number</label>
                <input name="plate" onChange={handleChange} className={inputClassName} required />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Vehicle Type</label>
                <select name="type" value={formData.type || ''} onChange={handleChange} className={inputClassName}>
                  <option value="" disabled className="bg-[#0F0F0F]">Select Type</option>
                  <option value="VIP MPV" className="bg-[#0F0F0F]">VIP MPV</option>
                  <option value="Luxury Van" className="bg-[#0F0F0F]">Luxury Van</option>
                  <option value="Executive Sedan" className="bg-[#0F0F0F]">Executive Sedan</option>
                  <option value="Premium SUV" className="bg-[#0F0F0F]">Premium SUV</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Status</label>
                <select name="status" value={formData.status || ''} onChange={handleChange} className={inputClassName}>
                  <option value="" disabled className="bg-[#0F0F0F]">Select Status</option>
                  <option value="Available" className="bg-[#0F0F0F]">Available</option>
                  <option value="On Trip" className="bg-[#0F0F0F]">On Trip</option>
                  <option value="Maintenance" className="bg-[#0F0F0F]">Maintenance</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Age (Years)</label>
                <input name="age" type="number" min="0" onChange={handleChange} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Fuel Status (%)</label>
                <input name="fuel_status" type="number" min="0" max="100" onChange={handleChange} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Last Service</label>
                <input name="lastService" type="date" onChange={handleChange} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Next Service</label>
                <input name="next_service" type="date" onChange={handleChange} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Condition</label>
                <select name="condition" value={formData.condition || ''} onChange={handleChange} className={inputClassName}>
                  <option value="" disabled className="bg-[#0F0F0F]">Select Condition</option>
                  <option value="Excellent" className="bg-[#0F0F0F]">Excellent</option>
                  <option value="Good" className="bg-[#0F0F0F]">Good</option>
                  <option value="Needs Attention" className="bg-[#0F0F0F]">Needs Attention</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Insurance Provider</label>
                <input name="insurance_provider" onChange={handleChange} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Insurance Policy</label>
                <input name="insurance_policy" onChange={handleChange} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Insurance Start</label>
                <input name="insurance_start" type="date" onChange={handleChange} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Insurance Expiry</label>
                <input name="insurance_expiry" type="date" onChange={handleChange} className={inputClassName} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className={labelClassName}>Notes</label>
                <textarea name="notes" onChange={handleChange} rows="3" className={inputClassName} />
              </div>
            </div>
          )}

          {type === 'drivers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClassName}>Driver Name</label>
                <input name="name" onChange={handleChange} className={inputClassName} required />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Phone Number</label>
                <input name="phone" onChange={handleChange} className={inputClassName} required />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Experience</label>
                <input name="experience" onChange={handleChange} placeholder="e.g. 5 Years" className={inputClassName} required />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Rating</label>
                <input name="rating" type="number" min="0" max="5" step="0.1" onChange={handleChange} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Status</label>
                <select name="status" value={formData.status || ''} onChange={handleChange} className={inputClassName}>
                  <option value="" disabled className="bg-[#0F0F0F]">Select Status</option>
                  <option value="Active" className="bg-[#0F0F0F]">Active</option>
                  <option value="Unavailable" className="bg-[#0F0F0F]">Unavailable</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Licence Status</label>
                <select name="licence_status" value={formData.licence_status || ''} onChange={handleChange} className={inputClassName}>
                  <option value="" disabled className="bg-[#0F0F0F]">Select Licence Status</option>
                  <option value="Verified" className="bg-[#0F0F0F]">Verified</option>
                  <option value="Pending" className="bg-[#0F0F0F]">Pending</option>
                  <option value="Expired" className="bg-[#0F0F0F]">Expired</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Assigned Vehicle</label>
                <input name="assigned_vehicle" onChange={handleChange} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Total Rides</label>
                <input name="total_rides" type="number" min="0" onChange={handleChange} className={inputClassName} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className={labelClassName}>Address</label>
                <textarea name="address" onChange={handleChange} rows="2" className={inputClassName} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className={labelClassName}>Notes</label>
                <textarea name="notes" onChange={handleChange} rows="3" className={inputClassName} />
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-[#EFBF04] text-black py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:scale-[0.98] transition-all">
            Save Record
          </button>
        </form>
      </div>
    </div>
  );
}
