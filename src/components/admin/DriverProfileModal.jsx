import React from 'react';
import { X, Award } from 'lucide-react';

export default function DriverProfileModal({ driver, isOpen, onClose, bookings = [] }) {
  if (!isOpen || !driver) return null;

  // Filter bookings assigned to this driver
  const driverHistory = bookings.filter(b => b.driver_id === driver.id);

  const getLicenceColor = (status) => {
    switch (status) {
      case 'Verified': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Expired': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/20 text-emerald-400';
      case 'Confirmed': return 'bg-blue-500/20 text-blue-400';
      case 'Cancelled': return 'bg-rose-500/20 text-rose-400';
      default: return 'bg-amber-500/20 text-amber-400';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Sliding Drawer */}
      <div className="relative h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        
        {/* Header Photo Area */}
        <div className="relative h-48 bg-gradient-to-b from-[#EFBF04]/20 to-[#0a0a0a] flex items-end justify-center pb-6">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative">
            {driver.photo ? (
              <img src={driver.photo} alt={driver.name} className="w-32 h-32 rounded-full object-cover border-4 border-[#0a0a0a] shadow-xl bg-[#0a0a0a]" />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-[#0a0a0a] shadow-xl bg-white/10 flex items-center justify-center text-gray-400">
                <span className="material-symbols-outlined text-5xl">person</span>
              </div>
            )}
            
            {/* Status Badge */}
            <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-[#0a0a0a] ${driver.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} title={`Driver Status: ${driver.status}`}></div>
          </div>
        </div>

        <div className="px-8 pb-8 pt-2">
          <div className="text-center mb-8 relative">
            <h2 className="text-3xl font-headline font-bold text-white tracking-tight">{driver.name}</h2>
            <div className="flex items-center justify-center gap-3 mt-1">
              <p className="text-[#EFBF04] font-mono text-sm uppercase tracking-widest">{driver.id}</p>
              {driver.availability_status === 'Unavailable' && (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  On Trip
                </span>
              )}
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Verification Status */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Licence Verification</span>
                <span className="material-symbols-outlined text-sm text-gray-500">verified_user</span>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-bold ${getLicenceColor(driver.licence_status || 'Not Available')}`}>
                {driver.licence_status || 'Not Available'}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-green-400 text-xl mb-1">directions_car</span>
                <span className="text-lg font-bold text-white">{driver.completed_trips || 0}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Completed Trips</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-blue-400 text-xl mb-1">work_history</span>
                <span className="text-lg font-bold text-white">{driver.experience || 'New'}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Experience</span>
              </div>
            </div>

            {/* Detailed Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400 mt-1">
                  <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">Phone Number</p>
                  <p className="text-white text-sm">{driver.phone || 'Not Provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400 mt-1">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">Address</p>
                  <p className="text-white text-sm leading-relaxed">{driver.address || 'No address provided on file.'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400 mt-1">
                  <span className="material-symbols-outlined text-[20px]">directions_car</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">Assigned Vehicle</p>
                  <p className="text-white text-sm">{driver.assigned_vehicle || 'None assigned yet'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400 mt-1">
                  <span className="material-symbols-outlined text-[20px]">notes</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">Internal Notes</p>
                  <p className="text-white text-sm leading-relaxed text-gray-300 italic">{driver.notes || 'No notes.'}</p>
                </div>
              </div>
            </div>

            {/* ── Trip Assignment History ── */}
            <div className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#EFBF04] text-lg">history</span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Booking History</span>
                </div>
                <span className="bg-[#EFBF04]/10 text-[#EFBF04] text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {driverHistory.length} Trip{driverHistory.length !== 1 ? 's' : ''}
                </span>
              </div>

              {driverHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-600">
                  <span className="material-symbols-outlined text-3xl">directions_car</span>
                  <p className="text-xs uppercase tracking-widest">No trips assigned yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {driverHistory.map((b) => (
                    <div key={b.id} className="px-5 py-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#EFBF04] font-mono text-[10px] font-bold">{b.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusColor(b.status)}`}>
                              {b.status}
                            </span>
                          </div>
                          <p className="text-white text-sm font-semibold truncate">{b.customer}</p>
                          <p className="text-gray-500 text-[11px] mt-0.5">{b.service}</p>
                          {b.schedule && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <span className="material-symbols-outlined text-gray-600 text-[13px]">calendar_month</span>
                              <span className="text-gray-500 text-[11px]">{b.schedule}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-gray-600 text-[10px]">{b.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
