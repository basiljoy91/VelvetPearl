import React, { useMemo, useState } from 'react';
import MobileEmptyState from './MobileEmptyState';
import MobileDriverDetail from './MobileDriverDetail';
import MobileDriverRow from './MobileDriverRow';
import MobileSearchBar from './MobileSearchBar';

const filters = ['All', 'Active', 'Unavailable', 'Assigned'];

export default function MobileDrivers({ drivers, searchQuery, setSearchQuery, isLoading }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedDriver, setSelectedDriver] = useState(null);

  const visibleDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      if (activeFilter === 'Active' && driver.status !== 'Active') return false;
      if (activeFilter === 'Unavailable' && driver.status !== 'Unavailable') return false;
      if (activeFilter === 'Assigned' && !driver.assigned_vehicle) return false;
      return true;
    });
  }, [activeFilter, drivers]);

  return (
    <>
      <div className="space-y-4">
        <MobileSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search driver, phone, or vehicle"
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
        ) : visibleDrivers.length > 0 ? (
          <div className="space-y-3">
            {visibleDrivers.map((driver) => (
              <MobileDriverRow
                key={driver.id}
                driver={driver}
                onOpen={() => setSelectedDriver(driver)}
              />
            ))}
          </div>
        ) : (
          <MobileEmptyState
            title="No drivers found"
            description="Try a different search or switch the current driver filter."
          />
        )}
      </div>

      <MobileDriverDetail
        driver={selectedDriver}
        isOpen={Boolean(selectedDriver)}
        onClose={() => setSelectedDriver(null)}
      />
    </>
  );
}
