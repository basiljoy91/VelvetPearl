import React, { useState } from 'react';

export default function BookingActionCell({ booking, onUpdateStatus, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const isConfirmed = booking.status === 'Confirmed';
  const isCompleted = booking.status === 'Completed' || hasCompleted;

  const handleProcess = async () => {
    setIsLoading(true);
    try {
      await onUpdateStatus(booking.id, 'Confirmed');
    } catch (error) {
      console.error('Failed to update status', error);
      // Optional: Handle error UI here
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setHasCompleted(true); // Instantly lock the UI upon click
    try {
      await onUpdateStatus(booking.id, 'Completed');
    } catch (error) {
      setHasCompleted(false); // Unlock if the request fails
      console.error('Failed to complete booking', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setShowDeleteConfirm(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(booking.id);
    } catch (error) {
      console.error('Failed to delete booking', error);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex justify-end gap-2 relative">
      {isCompleted ? (
        // Locked / Processed state
        <button 
          disabled
          className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg cursor-not-allowed border border-emerald-500/30 flex items-center justify-center"
          title="Trip Completed"
        >
          <span className="material-symbols-outlined text-sm">check_circle</span>
        </button>
      ) : isConfirmed ? (
        // Confirmed state - Action Button to Complete
        <button 
          onClick={handleComplete} 
          disabled={isLoading}
          className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-black rounded-lg transition-colors border-none flex items-center justify-center"
          title="Mark as Completed"
        >
          {isLoading ? (
            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
          ) : (
            <span className="material-symbols-outlined text-sm">directions_car</span>
          )}
        </button>
      ) : (
        // Pending state - Action Button
        <>
          <button 
            onClick={() => { setShowConfirm(true); setShowDeleteConfirm(false); }} 
            disabled={isLoading || showConfirm}
            className={`p-2 rounded-lg transition-colors border-none flex items-center justify-center ${
              showConfirm || isLoading 
                ? 'bg-emerald-500/30 text-emerald-300' 
                : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black'
            }`}
          >
            {isLoading ? (
              <span className="material-symbols-outlined text-sm animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-sm">check</span>
            )}
          </button>

          {/* Confirmation Popover */}
          {showConfirm && (
            <div className="absolute top-10 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl p-3 shadow-2xl z-50 w-48 animate-in fade-in zoom-in duration-200">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3 font-bold text-center">Process this booking?</p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleProcess}
                  disabled={isLoading}
                  className="w-full bg-emerald-500 text-black py-2 rounded font-bold text-xs hover:bg-emerald-400 transition-colors border-none disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading && <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>}
                  Processed
                </button>
                <button 
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="w-full bg-white/5 text-gray-300 py-2 rounded font-bold text-xs hover:bg-white/10 transition-colors border border-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Button Area */}
      <div className="relative">
        <button 
          onClick={() => { setShowDeleteConfirm(true); setShowConfirm(false); }} 
          disabled={isLoading || showDeleteConfirm}
          className={`p-2 rounded-lg transition-colors border-none flex items-center justify-center ${
            showDeleteConfirm
              ? 'bg-rose-500/30 text-rose-300'
              : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-black'
          }`}
        >
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>

        {/* Delete Confirmation Popover */}
        {showDeleteConfirm && (
          <div className="absolute top-10 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl p-3 shadow-2xl z-50 w-48 animate-in fade-in zoom-in duration-200">
            <p className="text-[10px] uppercase tracking-widest text-rose-400 mb-3 font-bold text-center">Delete this booking?</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleDelete}
                disabled={isLoading}
                className="w-full bg-rose-500 text-black py-2 rounded font-bold text-xs hover:bg-rose-400 transition-colors border-none disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <span className="material-symbols-outlined text-[12px] animate-spin">sync</span>}
                Confirm Delete
              </button>
              <button 
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full bg-white/5 text-gray-300 py-2 rounded font-bold text-xs hover:bg-white/10 transition-colors border border-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
