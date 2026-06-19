import React from 'react';

export default function StickyActionBar({ children }) {
  return (
    <div className="sticky bottom-0 border-t border-white/10 bg-[#090909]/95 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
      <div className="flex gap-3">
        {children}
      </div>
    </div>
  );
}
