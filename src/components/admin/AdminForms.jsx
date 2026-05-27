import React, { useState } from 'react';
import { X } from 'lucide-react';

<<<<<<< HEAD
const inputClassName = 'w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40';
const labelClassName = 'text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold';

export default function AdminForms({ type, isOpen, onClose, onSubmit }) {
=======
export default function AdminForms({ type, isOpen, onClose, onSubmit, initialData }) {
>>>>>>> feature/Admin-pannel-Sachin-update-004
  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData({});
    onClose();
  };

  const handleChange = (e) => {
<<<<<<< HEAD
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
=======
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
>>>>>>> feature/Admin-pannel-Sachin-update-004
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
<<<<<<< HEAD
      defaultValues = {
        status: formData.status || 'Active',
        rating: formData.rating || '5.0',
        licence_status: formData.licence_status || 'Pending',
      };
    }

    onSubmit({ ...formData, ...defaultValues });
    handleClose();
=======
      defaultValues = { status: 'Active' };
    }

    onSubmit({ 
      ...formData, 
      ...defaultValues, 
      id: initialData?.id || `VP-${Math.floor(Math.random() * 9000) + 1000}` 
    });
    onClose();
>>>>>>> feature/Admin-pannel-Sachin-update-004
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
<<<<<<< HEAD
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />
      <div className="relative w-full max-w-3xl bg-[#0F0F0F] border border-[#EFBF04]/20 rounded-2xl shadow-2xl p-8 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-headline font-bold text-white capitalize">Add New {type}</h3>
          <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-full text-white transition-colors">
=======
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0F0F0F] border border-[#EFBF04]/20 rounded-2xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-headline font-bold text-white capitalize">
            {initialData ? 'Edit' : 'Add New'} {type}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white transition-colors">
>>>>>>> feature/Admin-pannel-Sachin-update-004
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
<<<<<<< HEAD
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
=======
            <>
              {/* Photo Upload Area */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Vehicle Image (Optional)</label>
                <div className="flex items-center gap-4">
                  {formData.photo ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-[#EFBF04]">
                      <img src={formData.photo} alt="Preview" className="object-cover w-full h-full" />
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, photo: null })}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                      <span className="material-symbols-outlined">directions_car</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Image size must be less than 2MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({ ...prev, photo: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#EFBF04]/10 file:text-[#EFBF04] hover:file:bg-[#EFBF04]/20"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Vehicle Model</label>
                  <input name="model" value={formData.model || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Plate Number</label>
                  <input name="plate" value={formData.plate || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Vehicle Type</label>
                  <select name="type" value={formData.type || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40 appearance-none">
                    <option value="" disabled className="bg-[#0F0F0F]">Select Type</option>
                    <option value="VIP MPV" className="bg-[#0F0F0F]">VIP MPV</option>
                    <option value="Luxury Van" className="bg-[#0F0F0F]">Luxury Van</option>
                    <option value="Executive Sedan" className="bg-[#0F0F0F]">Executive Sedan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Status</label>
                  <select name="status" value={formData.status || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40 appearance-none">
                    <option value="" disabled className="bg-[#0F0F0F]">Select Status</option>
                    <option value="Available" className="bg-[#0F0F0F]">Available</option>
                    <option value="On Trip" className="bg-[#0F0F0F]">On Trip</option>
                    <option value="Maintenance" className="bg-[#0F0F0F]">Maintenance</option>
                  </select>
                </div>
>>>>>>> feature/Admin-pannel-Sachin-update-004
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Age (Years)</label>
                  <input name="age" value={formData.age !== undefined ? formData.age : ''} type="number" min="0" onChange={handleChange} placeholder="e.g. 2" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Fuel Status (%)</label>
                  <input name="fuel_status" value={formData.fuel_status !== undefined ? formData.fuel_status : ''} type="number" min="0" max="100" onChange={handleChange} placeholder="e.g. 100" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Next Service Date</label>
                  <input name="next_service" value={formData.next_service || ''} type="date" onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Condition</label>
                  <select name="condition" value={formData.condition || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40 appearance-none">
                    <option value="" disabled className="bg-[#0F0F0F]">Select Condition</option>
                    <option value="Good" className="bg-[#0F0F0F]">Good</option>
                    <option value="Moderate" className="bg-[#0F0F0F]">Moderate</option>
                    <option value="Critical" className="bg-[#0F0F0F]">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
<<<<<<< HEAD
                <label className={labelClassName}>Status</label>
                <select name="status" value={formData.status || ''} onChange={handleChange} className={inputClassName}>
                  <option value="" disabled className="bg-[#0F0F0F]">Select Status</option>
                  <option value="Available" className="bg-[#0F0F0F]">Available</option>
                  <option value="On Trip" className="bg-[#0F0F0F]">On Trip</option>
                  <option value="Maintenance" className="bg-[#0F0F0F]">Maintenance</option>
                </select>
=======
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Internal Notes</label>
                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows="2" placeholder="Any issues or logs..." className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40 resize-none"></textarea>
              </div>

              {/* Insurance Details Section */}
              <div className="border-t border-white/10 pt-6 mt-6">
                <h4 className="text-sm font-bold text-[#EFBF04] mb-4 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  Insurance Details
                </h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Insurance Provider</label>
                    <input name="insurance_provider" value={formData.insurance_provider || ''} onChange={handleChange} placeholder="e.g. State Farm" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Policy Number</label>
                    <input name="insurance_policy" value={formData.insurance_policy || ''} onChange={handleChange} placeholder="e.g. POL-12345" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Start Date</label>
                    <input name="insurance_start" type="date" value={formData.insurance_start || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Expiry Date</label>
                    <input name="insurance_expiry" type="date" value={formData.insurance_expiry || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Insurance Document (Optional)</label>
                  <div className="flex items-center gap-4">
                    {formData.insurance_doc ? (
                      <div className="relative h-16 w-16 bg-white/10 rounded-lg border border-emerald-500/30 flex items-center justify-center text-emerald-400 overflow-hidden group">
                        <span className="material-symbols-outlined group-hover:opacity-0 transition-opacity">description</span>
                        <button 
                          type="button"
                          onClick={() => setFormData({ ...formData, insurance_doc: null })}
                          className="absolute inset-0 bg-rose-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                          title="Remove Document"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <input 
                          type="file" 
                          accept="application/pdf,image/jpeg,image/png"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData(prev => ({ ...prev, insurance_doc: reader.result }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#EFBF04]/10 file:text-[#EFBF04] hover:file:bg-[#EFBF04]/20"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">PDF, PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
>>>>>>> feature/Admin-pannel-Sachin-update-004
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
<<<<<<< HEAD
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClassName}>Driver Name</label>
                <input name="name" onChange={handleChange} className={inputClassName} required />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Phone Number</label>
                <input name="phone" onChange={handleChange} className={inputClassName} required />
=======
            <>
              {/* Photo Upload Area */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Driver Photo (Optional)</label>
                <div className="flex items-center gap-4">
                  {formData.photo ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#EFBF04]">
                      <img src={formData.photo} alt="Preview" className="object-cover w-full h-full" />
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, photo: null })}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Image size must be less than 2MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({ ...prev, photo: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#EFBF04]/10 file:text-[#EFBF04] hover:file:bg-[#EFBF04]/20"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Driver Name</label>
                  <input name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Phone Number</label>
                  <input name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
                </div>
>>>>>>> feature/Admin-pannel-Sachin-update-004
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Experience</label>
                  <input name="experience" value={formData.experience || ''} onChange={handleChange} placeholder="e.g. 5 Years" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Licence Status</label>
                  <select name="licence_status" value={formData.licence_status || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40 appearance-none">
                    <option value="" disabled className="bg-[#0F0F0F]">Select Status</option>
                    <option value="Verified" className="bg-[#0F0F0F]">Verified</option>
                    <option value="Pending" className="bg-[#0F0F0F]">Pending</option>
                    <option value="Expired" className="bg-[#0F0F0F]">Expired</option>
                    <option value="Not Available" className="bg-[#0F0F0F]">Not Available</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
<<<<<<< HEAD
                <label className={labelClassName}>Experience</label>
                <input name="experience" onChange={handleChange} placeholder="e.g. 5 Years" className={inputClassName} required />
=======
                <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Address</label>
                <textarea name="address" value={formData.address || ''} onChange={handleChange} rows="2" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40 resize-none"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Assigned Vehicle (ID)</label>
                  <input name="assigned_vehicle" value={formData.assigned_vehicle || ''} onChange={handleChange} placeholder="e.g. FL-100 (Optional)" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold">Internal Notes</label>
                  <input name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Additional info" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#EFBF04]/40" />
                </div>
>>>>>>> feature/Admin-pannel-Sachin-update-004
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
