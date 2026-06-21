import React from 'react';

export default function FeedbackStars({
  rating = 0,
  className = '',
  activeClassName = 'text-[#EFBF04]',
  inactiveClassName = 'text-white/15',
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`${rating} out of 5 stars`} role="img">
      {Array.from({ length: 5 }).map((_, index) => {
        const isActive = index < Number(rating || 0);
        return (
          <span
            key={index}
            className={`material-symbols-outlined text-[18px] ${isActive ? activeClassName : inactiveClassName}`}
          >
            star
          </span>
        );
      })}
    </div>
  );
}
