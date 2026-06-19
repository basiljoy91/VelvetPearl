import React from 'react';
import { BellDot, CarFront, ChevronRight, UserRound, X } from 'lucide-react';
import BottomSheet from '../../ui/BottomSheet';

const choices = [
  {
    key: 'bookings',
    label: 'Add Enquiry',
    description: 'Create a manual enquiry record received over phone, WhatsApp, or walk-in.',
    icon: <BellDot className="h-5 w-5" />,
  },
  {
    key: 'drivers',
    label: 'Add Driver',
    description: 'Add a driver profile with status, contact details, and assignment context.',
    icon: <UserRound className="h-5 w-5" />,
  },
  {
    key: 'fleet',
    label: 'Add Fleet Vehicle',
    description: 'Add a vehicle with type, status, insurance, and service details.',
    icon: <CarFront className="h-5 w-5" />,
  },
];

export default function MobileNewEntrySheet({ isOpen, onClose, onSelect }) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="New entry"
      subtitle="Choose what you want to add to the dashboard."
      footer={(
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white"
        >
          Cancel
        </button>
      )}
    >
      <div className="space-y-3">
        {choices.map((choice) => (
          <button
            key={choice.key}
            type="button"
            onClick={() => onSelect(choice.key)}
            className="flex w-full items-start gap-4 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:border-[#EFBF04]/40 hover:bg-[#EFBF04]/5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EFBF04]/10 text-[#EFBF04]">
              {choice.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-white">{choice.label}</p>
              <p className="mt-1 text-sm leading-6 text-gray-400">{choice.description}</p>
            </div>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-500" />
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
