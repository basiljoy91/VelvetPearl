import React from 'react';

export default function StatCard({ label, value, icon, colorClass, bgClass, trend, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl h-[150px] animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-lg bg-white/10" />
          {/* Optional Trend Skeleton */}
          {trend !== undefined && <div className="w-12 h-4 rounded bg-white/10" />}
        </div>
        <div className="w-24 h-3 bg-white/10 rounded mb-2" />
        <div className="w-16 h-8 bg-white/10 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl group hover:border-[#EFBF04]/30 transition-all">
      <div className="flex justify-between items-start mb-4">
        <span className={`material-symbols-outlined p-2 ${bgClass} ${colorClass} rounded-lg`}>
          {icon}
        </span>
        {trend && (
          <span className={`text-[10px] font-label font-bold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-gray-500 text-xs uppercase tracking-widest font-label">
        {label}
      </p>
      <h3 className="text-4xl font-headline font-bold text-white mt-1 group-hover:text-[#EFBF04] transition-colors">
        {value}
      </h3>
    </div>
  );
}
