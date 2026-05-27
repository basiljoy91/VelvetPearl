import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Calendar, IndianRupee, Sparkles, Navigation } from 'lucide-react';

const INTERESTS = [
  'Snowfall places',
  'Hill stations',
  'Trekking',
  'Nature',
  'Adventure',
  'Family trips',
  'Peaceful destinations'
];

const BUDGETS = ['Low', 'Medium', 'Luxury'];

export default function SmartTripPlanner({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [budget, setBudget] = useState('Medium');
  const [days, setDays] = useState(3);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await fetch('http://localhost:5009/api/trips/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          days,
          interests: selectedInterests
        })
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-[#0F0F0F] border border-[#EFBF04]/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Panel: Inputs */}
        <div className="w-full md:w-2/5 bg-white/5 p-8 overflow-y-auto custom-scrollbar border-r border-white/10 shrink-0">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-headline font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#EFBF04]" />
              Smart Planner
            </h2>
            <button onClick={onClose} className="md:hidden p-2 bg-white/5 hover:bg-white/10 rounded-full text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Days */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold block">
                Duration (Days)
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" 
                  max="14" 
                  value={days} 
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full accent-[#EFBF04]"
                />
                <span className="text-xl font-bold text-white w-12 text-center bg-white/5 py-2 rounded-lg border border-white/10">
                  {days}
                </span>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold block">
                Estimated Budget Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BUDGETS.map(b => (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                      budget === b 
                        ? 'bg-[#EFBF04] border-[#EFBF04] text-black shadow-[0_0_15px_rgba(239,191,4,0.3)]' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-[#EFBF04] font-bold block">
                Travel Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                        isSelected 
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching || selectedInterests.length === 0}
              className="w-full bg-[#EFBF04] hover:bg-[#d6aa03] text-black font-bold py-4 rounded-xl uppercase tracking-widest text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <span className="material-symbols-outlined animate-spin text-lg">sync</span>
              ) : (
                <Navigation className="w-5 h-5" />
              )}
              Find My Trip
            </button>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="w-full md:w-3/5 p-8 overflow-y-auto custom-scrollbar relative">
          <button onClick={onClose} className="hidden md:flex absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors z-10">
            <X className="w-5 h-5" />
          </button>

          {!hasSearched ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <span className="material-symbols-outlined text-8xl mb-4 text-[#EFBF04]/30" style={{ fontVariationSettings: "'FILL' 0" }}>travel_explore</span>
              <h3 className="text-2xl font-headline font-bold text-white mb-2">Ready to explore?</h3>
              <p className="text-sm text-gray-400 max-w-xs">Select your preferences on the left and let our Smart Planner design your perfect getaway.</p>
            </div>
          ) : isSearching ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-6xl mb-4 text-[#EFBF04] animate-bounce">flight_takeoff</span>
              <h3 className="text-xl font-bold text-white">Curating your perfect trips...</h3>
            </div>
          ) : results.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
              <span className="material-symbols-outlined text-6xl mb-4 text-rose-400">sentiment_dissatisfied</span>
              <h3 className="text-xl font-bold text-white mb-2">No perfect matches found</h3>
              <p className="text-sm text-gray-400 max-w-xs">Try adjusting your budget, days, or interests to see more options.</p>
            </div>
          ) : (
            <div className="space-y-6 pb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#EFBF04]">recommend</span>
                Top Recommended Trips
              </h3>

              {results.map((trip, idx) => (
                <div key={trip.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-[#EFBF04]/30 transition-all flex flex-col sm:flex-row">
                  <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden shrink-0">
                    <img src={trip.image} alt={trip.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-[#EFBF04]">star</span>
                      Match {idx + 1}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-xl font-bold text-white flex items-center gap-1">
                          {trip.name}
                        </h4>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-[#EFBF04]" /> {trip.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-bold text-emerald-400">{trip.estimated_budget}</span>
                        <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">{trip.budget_tier}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">{trip.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {trip.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] uppercase tracking-widest px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-[#EFBF04] font-bold">
                        <Calendar className="w-4 h-4" />
                        {trip.min_days}-{trip.max_days} Days
                      </div>
                      <button 
                        onClick={() => {
                          onClose();
                          navigate('/book/cab', { state: { destination: trip.name } });
                        }}
                        className="text-xs font-bold uppercase tracking-widest text-white hover:text-[#EFBF04] flex items-center gap-1 transition-colors"
                      >
                        View Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
