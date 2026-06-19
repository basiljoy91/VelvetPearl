import React from 'react';
import { SkeletonBlock } from '../../ui/LoadingState';
import MobileActiveFilterChips from './MobileActiveFilterChips';
import MobileEmptyState from './MobileEmptyState';
import MobileEnquiryCard from './MobileEnquiryCard';
import MobileFilterSheet from './MobileFilterSheet';
import MobileSearchBar from './MobileSearchBar';

function MobileSectionSkeleton({ lines = 4 }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_18px_80px_rgba(0,0,0,0.24)]">
      <SkeletonBlock className="h-8 w-40" />
      <SkeletonBlock className="mt-2 h-4 w-52" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonBlock key={index} className="h-20 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

function getFilterChipLabel(filters, typeLabels) {
  const chips = [];

  if (filters.type && filters.type !== 'all') {
    chips.push({ key: 'type', label: typeLabels[filters.type] || filters.type });
  }
  if (filters.status && filters.status !== 'all') {
    chips.push({ key: 'status', label: filters.status });
  }
  if (filters.travelDate) {
    chips.push({ key: 'travelDate', label: `Travel ${filters.travelDate}` });
  }
  if (filters.submittedFrom) {
    chips.push({ key: 'submittedFrom', label: `From ${filters.submittedFrom}` });
  }
  if (filters.submittedTo) {
    chips.push({ key: 'submittedTo', label: `To ${filters.submittedTo}` });
  }
  if (filters.search?.trim()) {
    chips.push({ key: 'search', label: `Search: ${filters.search.trim()}` });
  }

  return chips;
}

const resetFilters = {
  type: 'all',
  status: 'all',
  submittedFrom: '',
  submittedTo: '',
  travelDate: '',
  search: '',
};

export default function MobileEnquiries({
  enquiries,
  filteredEnquiries,
  enquiryFilters,
  setEnquiryFilters,
  isLoading,
  isFilterOpen,
  setIsFilterOpen,
  typeOptions,
  typeLabels,
  statusOptions,
  getStatusClasses,
  getCustomerName,
  getServiceLabel,
  getTravelDateLabel,
  formatDate,
  formatDateTime,
  buildCustomerReplyHref,
  openEnquiryDetail,
  markEnquiryContacted,
}) {
  const activeFilterChips = getFilterChipLabel(enquiryFilters, typeLabels);
  const filterCount = activeFilterChips.length;

  return (
    <>
      <div className="space-y-4">
        <MobileSearchBar
          value={enquiryFilters.search}
          onChange={(value) => setEnquiryFilters((current) => ({ ...current, search: value }))}
          placeholder="Search name, phone, or reference ID"
          onOpenFilters={() => setIsFilterOpen(true)}
          filterCount={filterCount}
        />

        <MobileActiveFilterChips
          chips={activeFilterChips.map((chip) => ({
            ...chip,
            onRemove: () => setEnquiryFilters((current) => ({
              ...current,
              [chip.key]: chip.key === 'type' || chip.key === 'status' ? 'all' : '',
            })),
          }))}
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'New', label: 'New' },
            { key: 'Awaiting Customer', label: 'Awaiting' },
            { key: 'Assigned', label: 'Assigned' },
            { key: 'Completed', label: 'Completed' },
          ].map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setEnquiryFilters((current) => ({ ...current, status: chip.key === 'all' ? 'all' : chip.key }))}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-semibold ${
                (chip.key === 'all' ? enquiryFilters.status === 'all' : enquiryFilters.status === chip.key)
                  ? 'border-[#EFBF04] bg-[#EFBF04]/10 text-[#EFBF04]'
                  : 'border-white/10 bg-white/5 text-gray-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <MobileSectionSkeleton lines={4} />
        ) : filteredEnquiries.length > 0 ? (
          <div className="space-y-3">
            {filteredEnquiries.map((enquiry) => (
              <MobileEnquiryCard
                key={enquiry.id}
                enquiry={enquiry}
                getStatusClasses={getStatusClasses}
                getCustomerName={getCustomerName}
                getServiceLabel={getServiceLabel}
                getTravelDateLabel={getTravelDateLabel}
                formatDate={formatDate}
                formatDateTime={formatDateTime}
                whatsappHref={buildCustomerReplyHref(enquiry)}
                onView={() => openEnquiryDetail(enquiry.id)}
                onMarkContacted={() => markEnquiryContacted(enquiry.id)}
              />
            ))}
          </div>
        ) : (
          <MobileEmptyState
            title={enquiries.length === 0 ? 'No enquiries yet' : 'No results found'}
            description={enquiries.length === 0
              ? 'New customer enquiries will appear here after form submissions start coming in.'
              : 'Try removing some filters or searching with a different reference, name, or phone number.'}
            action={filterCount > 0 ? (
              <button
                type="button"
                onClick={() => setEnquiryFilters(resetFilters)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-200"
              >
                Reset filters
              </button>
            ) : null}
          />
        )}
      </div>

      <MobileFilterSheet
        key={`mobile-filter-${isFilterOpen ? 'open' : 'closed'}-${JSON.stringify(enquiryFilters)}`}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={enquiryFilters}
        onApply={(nextFilters) => setEnquiryFilters(nextFilters)}
        onReset={() => setEnquiryFilters(resetFilters)}
        typeOptions={typeOptions}
        typeLabels={typeLabels}
        statusOptions={statusOptions}
      />
    </>
  );
}
