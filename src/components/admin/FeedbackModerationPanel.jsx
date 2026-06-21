import React, { useMemo, useState } from 'react';
import FeedbackReviewDialog from './FeedbackReviewDialog';
import FeedbackSummaryCard from './FeedbackSummaryCard';
import { FEEDBACK_STATUS_OPTIONS } from '../../data/feedback';
import { buildFeedbackDraft } from './feedbackAdminUtils';
import { SkeletonBlock } from '../ui/LoadingState';

function MetricCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function FeedbackCardSkeleton() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
      <SkeletonBlock className="h-3 w-28" />
      <SkeletonBlock className="mt-3 h-7 w-48" />
      <SkeletonBlock className="mt-2 h-4 w-28" />
      <SkeletonBlock className="mt-5 h-5 w-32" />
      <SkeletonBlock className="mt-4 h-24 w-full" />
      <SkeletonBlock className="mt-4 h-10 w-36 rounded-full" />
    </div>
  );
}

export default function FeedbackModerationPanel({
  feedbackEntries,
  filteredFeedback,
  feedbackFilters,
  setFeedbackFilters,
  isLoading,
  onSaveFeedback,
}) {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [draft, setDraft] = useState(null);
  const [activeAction, setActiveAction] = useState('');

  const feedbackCounts = useMemo(() => ({
    Pending: feedbackEntries.filter((item) => item.status === 'Pending').length,
    Approved: feedbackEntries.filter((item) => item.status === 'Approved').length,
    Hidden: feedbackEntries.filter((item) => item.status === 'Hidden').length,
    Declined: feedbackEntries.filter((item) => item.status === 'Declined').length,
    Featured: feedbackEntries.filter((item) => item.featured).length,
  }), [feedbackEntries]);

  const openReview = (feedback) => {
    setSelectedFeedback(feedback);
    setDraft(buildFeedbackDraft(feedback));
  };

  const closeReview = () => {
    setSelectedFeedback(null);
    setDraft(null);
    setActiveAction('');
  };

  const handleSave = async (payload, actionKey) => {
    if (!selectedFeedback) return;

    setActiveAction(actionKey);

    try {
      const updated = await onSaveFeedback(selectedFeedback.id, payload);
      setSelectedFeedback(updated);
      setDraft(buildFeedbackDraft(updated));
    } finally {
      setActiveAction('');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <section>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {Object.entries(feedbackCounts).map(([label, value]) => (
              <MetricCard key={label} label={label} value={value} />
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Feedback moderation</h2>
              <p className="mt-1 text-sm text-gray-400">
                Review public-facing wording, approve or decline submissions, and choose which notes get featured on the homepage.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackFilters({ status: 'all', featured: 'all', search: '' })}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-200"
            >
              Reset filters
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Status</label>
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#EFBF04]/50"
                value={feedbackFilters.status}
                onChange={(event) => setFeedbackFilters((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="all" className="bg-[#0A0A0A]">All statuses</option>
                {FEEDBACK_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status} className="bg-[#0A0A0A]">
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Featured</label>
              <select
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#EFBF04]/50"
                value={feedbackFilters.featured}
                onChange={(event) => setFeedbackFilters((current) => ({ ...current, featured: event.target.value }))}
              >
                <option value="all" className="bg-[#0A0A0A]">All feedback</option>
                <option value="featured" className="bg-[#0A0A0A]">Featured only</option>
                <option value="standard" className="bg-[#0A0A0A]">Not featured</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Search</label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#EFBF04]/50"
                value={feedbackFilters.search}
                onChange={(event) => setFeedbackFilters((current) => ({ ...current, search: event.target.value }))}
                placeholder="Search reference, name, city, or service"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => <FeedbackCardSkeleton key={index} />)
            : filteredFeedback.map((feedback) => (
              <FeedbackSummaryCard
                key={feedback.id}
                feedback={feedback}
                onOpen={() => openReview(feedback)}
              />
            ))}
          {!isLoading && filteredFeedback.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-10 text-sm text-gray-300 xl:col-span-2">
              No feedback matches the current filters yet.
            </div>
          ) : null}
        </section>
      </div>

      <FeedbackReviewDialog
        feedback={selectedFeedback}
        draft={draft}
        onDraftChange={(field, value) => setDraft((current) => ({ ...current, [field]: value }))}
        onClose={closeReview}
        onSave={handleSave}
        activeAction={activeAction}
      />
    </>
  );
}
