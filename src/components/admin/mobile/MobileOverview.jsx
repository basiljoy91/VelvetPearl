import React, { useMemo } from 'react';
import { ArrowRight, BellDot, CalendarClock, CarFront, ClipboardList, UserRound } from 'lucide-react';
import { SkeletonBlock } from '../../ui/LoadingState';
import MobileAdminSectionHeader from './MobileAdminSectionHeader';
import MobileEmptyState from './MobileEmptyState';
import MobileMetricCard from './MobileMetricCard';
import MobileRecentActivityList from './MobileRecentActivityList';

function isSameDay(value, targetDate = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return date.getFullYear() === targetDate.getFullYear()
    && date.getMonth() === targetDate.getMonth()
    && date.getDate() === targetDate.getDate();
}

function MobileSectionSkeleton({ lines = 4 }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_80px_rgba(0,0,0,0.24)]">
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

function QuickActionButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:border-[#EFBF04]/30 hover:bg-[#EFBF04]/5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFBF04]/10 text-[#EFBF04]">
          {icon}
        </div>
        <span className="text-sm font-semibold text-white">{label}</span>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-500" />
    </button>
  );
}

export default function MobileOverview({
  enquiries,
  overviewCounts,
  categoryCounts,
  recentEnquiries,
  isLoading,
  onOpenEnquiry,
  onOpenBookings,
  onOpenStatus,
  onOpenDrivers,
  onOpenNewEntry,
  getStatusClasses,
  getCustomerName,
  getServiceLabel,
}) {
  const todayMetrics = useMemo(() => {
    const now = new Date();
    const activeStatuses = new Set(['New', 'Contacted', 'Quoted', 'Awaiting Customer', 'Assigned', 'Confirmed']);

    return {
      contactedToday: enquiries.filter((item) => isSameDay(item.last_contacted_at, now)).length,
      quotedToday: enquiries.filter((item) => item.status === 'Quoted' && isSameDay(item.updated_at, now)).length,
      completedToday: enquiries.filter((item) => item.status === 'Completed' && isSameDay(item.updated_at, now)).length,
      followUpsDue: enquiries.filter((item) => item.follow_up_at && new Date(item.follow_up_at) <= now && activeStatuses.has(item.status)).length,
      pendingAssignment: enquiries.filter((item) => {
        if (!activeStatuses.has(item.status)) return false;
        return !item.assigned_driver_id && !item.assigned_vehicle_id && !item.assigned_room_id && !item.assigned_package_id;
      }).length,
    };
  }, [enquiries]);

  const attentionCards = [
    { label: 'New Enquiries', value: overviewCounts.New, onClick: () => onOpenStatus('New'), highlight: true },
    { label: 'Awaiting Customer', value: overviewCounts['Awaiting Customer'], onClick: () => onOpenStatus('Awaiting Customer') },
    { label: 'Pending Assignment', value: todayMetrics.pendingAssignment, onClick: () => onOpenStatus('Assigned') },
    { label: 'Follow-ups Due', value: todayMetrics.followUpsDue, onClick: () => onOpenBookings() },
  ];

  const todayCards = [
    { label: 'Contacted Today', value: todayMetrics.contactedToday, onClick: () => onOpenStatus('Contacted') },
    { label: 'Quoted Today', value: todayMetrics.quotedToday, onClick: () => onOpenStatus('Quoted') },
    { label: 'Completed Today', value: todayMetrics.completedToday, onClick: () => onOpenStatus('Completed') },
    { label: 'Tour Enquiries', value: categoryCounts.tour, onClick: () => onOpenBookings('tour') },
  ];

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-28 rounded-[28px]" />
          ))}
        </div>
        <MobileSectionSkeleton lines={3} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <MobileAdminSectionHeader
          title="Attention now"
          description="The fastest way to see what needs manual action first."
        />
        <div className="grid grid-cols-2 gap-3">
          {attentionCards.map((item) => (
            <MobileMetricCard
              key={item.label}
              label={item.label}
              value={item.value}
              highlight={item.highlight}
              onClick={item.onClick}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_80px_rgba(0,0,0,0.24)]">
        <MobileAdminSectionHeader
          title="Today"
          description="Recent activity and priority counts you can act on immediately."
        />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {todayCards.map((item) => (
            <MobileMetricCard
              key={item.label}
              label={item.label}
              value={item.value}
              onClick={item.onClick}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_80px_rgba(0,0,0,0.24)]">
        <MobileAdminSectionHeader
          title="Quick actions"
          description="Shortcuts for the things admins do most often on phone."
        />
        <div className="mt-4 grid gap-3">
          <QuickActionButton icon={<BellDot className="h-5 w-5" />} label="New Enquiry" onClick={onOpenNewEntry} />
          <QuickActionButton icon={<ClipboardList className="h-5 w-5" />} label="View New Enquiries" onClick={() => onOpenStatus('New')} />
          <QuickActionButton icon={<CalendarClock className="h-5 w-5" />} label="View Pending Assignment" onClick={() => onOpenBookings()} />
          <QuickActionButton icon={<UserRound className="h-5 w-5" />} label="Open Drivers" onClick={onOpenDrivers} />
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_80px_rgba(0,0,0,0.24)]">
        <MobileAdminSectionHeader
          title="Recent activity"
          description="Latest customer submissions that may need manual review."
        />
        {recentEnquiries.length > 0 ? (
          <div className="mt-4">
            <MobileRecentActivityList
              enquiries={recentEnquiries.slice(0, 5)}
              getStatusClasses={getStatusClasses}
              getCustomerName={getCustomerName}
              getServiceLabel={getServiceLabel}
              onOpenEnquiry={onOpenEnquiry}
            />
          </div>
        ) : (
          <div className="mt-4">
            <MobileEmptyState
              title="No enquiries yet"
              description="New customer enquiries will start appearing here after the first form submission."
            />
          </div>
        )}
      </section>
    </div>
  );
}
