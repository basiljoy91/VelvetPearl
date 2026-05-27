import React from 'react';
import { X, Wrench, Fuel, CalendarClock, Activity } from 'lucide-react';

export default function VehicleConditionModal({ vehicle, isOpen, onClose }) {
  if (!isOpen || !vehicle) return null;

  // Determine overall health styling based on condition
  const getConditionStyles = (condition) => {
    switch (condition) {
      case 'Good':
        return { text: 'text-emerald-500', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]', label: 'Healthy' };
      case 'Moderate':
        return { text: 'text-amber-500', bg: 'bg-amber-500/20', border: 'border-amber-500/40', shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]', label: 'Attention Needed' };
      case 'Critical':
        return { text: 'text-rose-500', bg: 'bg-rose-500/20', border: 'border-rose-500/40', shadow: 'shadow-[0_0_20px_rgba(225,29,72,0.3)]', label: 'Critical / Poor' };
      default:
        return { text: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/40', shadow: '', label: 'Unknown' };
    }
  };

  const condStyles = getConditionStyles(vehicle.condition || 'Good');

  // Check if service is overdue
  const isServiceOverdue = () => {
    if (!vehicle.next_service) return false;
    const nextServiceDate = new Date(vehicle.next_service);
    const today = new Date();
    return nextServiceDate < today;
  };

  const overdue = isServiceOverdue();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Sliding Drawer */}
      <div className="relative h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        
        {/* Header Photo Area */}
        <div className="relative h-56 bg-gradient-to-b from-[#EFBF04]/20 to-[#0a0a0a] flex flex-col justify-end pb-6 px-8">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-end gap-6 relative">
            <div className={`w-28 h-28 rounded-xl border-4 ${condStyles.border} bg-[#0a0a0a] overflow-hidden shrink-0 ${condStyles.shadow} transition-all`}>
              {vehicle.photo ? (
                <img src={vehicle.photo} alt={vehicle.model} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <span className="material-symbols-outlined text-4xl text-gray-500">directions_car</span>
                </div>
              )}
            </div>
            <div className="pb-2">
              <h2 className="text-3xl font-headline font-bold text-white tracking-tight">{vehicle.model}</h2>
              <p className="text-[#EFBF04] font-mono text-sm uppercase tracking-widest mt-1">{vehicle.plate}</p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 pt-6 space-y-8">
          
          {/* Overall Health Card */}
          <div className={`p-6 rounded-2xl border ${condStyles.border} ${condStyles.bg} flex items-center gap-5`}>
            <div className={`p-3 rounded-full bg-black/40 ${condStyles.text}`}>
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-1">Overall Health</p>
              <h3 className={`text-xl font-bold ${condStyles.text}`}>{condStyles.label}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fuel Status */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-[#EFBF04]/20 rounded-lg text-[#EFBF04]">
                  <Fuel className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white">{vehicle.fuel_status || 0}%</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Fuel Level</p>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${parseInt(vehicle.fuel_status) < 20 ? 'bg-rose-500' : 'bg-[#EFBF04]'}`} 
                  style={{ width: `${vehicle.fuel_status || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Age */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </div>
                <span className="text-xl font-bold text-white">{vehicle.age || 0}</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Vehicle Age (Years)</p>
            </div>
          </div>

          {/* Service & Maintenance */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="text-sm uppercase tracking-widest text-gray-400 font-bold">Maintenance</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-sm text-gray-500">Last Service</span>
                <span className="text-sm font-bold text-white">{vehicle.lastService || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Next Service Due</span>
                {overdue ? (
                  <span className="text-sm font-bold text-rose-500 flex items-center gap-1 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
                    <CalendarClock className="w-4 h-4" /> Overdue
                  </span>
                ) : (
                  <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    <CalendarClock className="w-4 h-4" /> {vehicle.next_service || 'Scheduled'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Insurance Details */}
          <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
              </div>
              <h4 className="text-sm uppercase tracking-widest text-gray-400 font-bold">Insurance</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-sm text-gray-500">Provider</span>
                <span className="text-sm font-bold text-white">{vehicle.insurance_provider || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-sm text-gray-500">Policy No.</span>
                <span className="text-sm font-bold text-white uppercase">{vehicle.insurance_policy || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                {vehicle.insurance_status === 'Expired' ? (
                  <span className="text-sm font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
                    Expired
                  </span>
                ) : vehicle.insurance_status === 'Expiring Soon' ? (
                  <span className="text-sm font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                    Expiring Soon
                  </span>
                ) : vehicle.insurance_status === 'Valid' ? (
                  <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    Valid
                  </span>
                ) : (
                  <span className="text-sm font-bold text-gray-400">N/A</span>
                )}
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          {vehicle.notes && (
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold mb-2">Internal Notes</p>
              <p className="text-sm text-gray-300 leading-relaxed italic">{vehicle.notes}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
