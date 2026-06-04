import React from 'react';
import { BellDot } from 'lucide-react';
import BrandMark from '../../branding/BrandMark';

export default function MobileAdminTopBar({ activeTab, title, subtitle, onGoHome }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#050505]/92 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <button type="button" onClick={onGoHome} className="text-left">
          <BrandMark
            className="gap-2"
            logoClassName="w-9"
            priority
            titleClassName="text-sm uppercase tracking-[0.28em] text-gray-500"
          />
          <h1 className="mt-2 text-3xl font-bold text-white">
            {title || (activeTab === 'dashboard' ? 'Overview' : activeTab)}
          </h1>
          {subtitle && <p className="mt-2 max-w-[18rem] text-sm text-gray-400">{subtitle}</p>}
        </button>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#EFBF04]">
          <BellDot className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}
