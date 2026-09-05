import React from 'react';

export default function MobileAdminBottomNav({ items, activeTab, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-[#080808]/96 px-2 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none]">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex min-w-[5.5rem] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] transition ${isActive ? 'bg-[#EFBF04]/12 text-[#EFBF04]' : 'text-gray-400'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
