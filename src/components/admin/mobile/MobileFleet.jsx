import React, { useMemo, useState } from 'react';
import MobileEmptyState from './MobileEmptyState';
import MobileFleetDetail from './MobileFleetDetail';
import MobileFleetRow from './MobileFleetRow';
import MobileSearchBar from './MobileSearchBar';

const filters = ['All', 'Available', 'Assigned', 'Maintenance', 'Expired Documents'];

function hasExpiredInsurance(expiry) {
  if (!expiry) return false;
  const date = new Date(expiry);
  if (Number.isNaN(date.getTime())) return false;
  return date < new Date();
}

export default function MobileFleet({ fleet, searchQuery, setSearchQuery, isLoading }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const visibleFleet = useMemo(() => {
    return fleet.filter((vehicle) => {
      if (activeFilter === 'Available' && vehicle.status !== 'Available') return false;
      if (activeFilter === 'Assigned' && !vehicle.assigned_driver && !vehicle.assigned_driver_name) return false;
      if (activeFilter === 'Maintenance' && vehicle.status !== 'Maintenance') return false;
      if (activeFilter === 'Expired Documents' && !hasExpiredInsurance(vehicle.insurance_expiry)) return false;
      return true;
    });
  }, [activeFilter, fleet]);

  return (
    <>
      <div className="space-y-4">
        <MobileSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search vehicle, plate, or status"
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-semibold ${
                activeFilter === filter
                  ? 'border-[#EFBF04] bg-[#EFBF04]/10 text-[#EFBF04]'
                  : 'border-white/10 bg-white/5 text-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-[20px] bg-white/10" />
            ))}
          </div>
        ) : visibleFleet.length > 0 ? (
          <div className="space-y-3">
            {visibleFleet.map((vehicle) => (
              <MobileFleetRow
                key={vehicle.id}
                vehicle={vehicle}
                onOpen={() => setSelectedVehicle(vehicle)}
              />
            ))}
          </div>
        ) : (
          <MobileEmptyState
            title="No vehicles found"
            description="Try another search or switch the current fleet filter."
          />
        )}
      </div>

      <MobileFleetDetail
        vehicle={selectedVehicle}
        isOpen={Boolean(selectedVehicle)}
        onClose={() => setSelectedVehicle(null)}
      />
    </>
  );
}
