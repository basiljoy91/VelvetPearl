import React, { useState } from 'react';
import FeedbackReviewDialog from '../FeedbackReviewDialog';
import FeedbackSummaryCard from '../FeedbackSummaryCard';
import { FEEDBACK_STATUS_OPTIONS } from '../../../data/feedback';
import { buildFeedbackDraft } from '../feedbackAdminUtils';
import MobileActiveFilterChips from './MobileActiveFilterChips';
import MobileEmptyState from './MobileEmptyState';
import MobileSearchBar from './MobileSearchBar';

export default function MobileFeedback({
  filteredFeedback,
  feedbackFilters,
  setFeedbackFilters,
  isLoading,
  onSaveFeedback,
}) {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [draft, setDraft] = useState(null);
  const [activeAction, setActiveAction] = useState('');

  const chips = [
    feedbackFilters.status !== 'all' ? {
      key: 'status',
      label: feedbackFilters.status,
      onRemove: () => setFeedbackFilters((current) => ({ ...current, status: 'all' })),
    } : null,
    feedbackFilters.featured !== 'all' ? {
      key: 'featured',
      label: feedbackFilters.featured === 'featured' ? 'Featured only' : 'Not featured',
      onRemove: () => setFeedbackFilters((current) => ({ ...current, featured: 'all' })),
    } : null,
    feedbackFilters.search.trim() ? {
      key: 'search',
      label: `Search: ${feedbackFilters.search.trim()}`,
      onRemove: () => setFeedbackFilters((current) => ({ ...current, search: '' })),
    } : null,
  ].filter(Boolean);

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
      <div className="space-y-4">
        <MobileSearchBar
          value={feedbackFilters.search}
          onChange={(value) => setFeedbackFilters((current) => ({ ...current, search: value }))}
          placeholder="Search feedback"
          onOpenFilters={() => {}}
          filterCount={chips.length}
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFeedbackFilters((current) => ({ ...current, status: 'all' }))}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-semibold ${
              feedbackFilters.status === 'all'
                ? 'border-[#EFBF04] bg-[#EFBF04]/10 text-[#EFBF04]'
                : 'border-white/10 bg-white/5 text-gray-200'
            }`}
          >
            All
          </button>
          {FEEDBACK_STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFeedbackFilters((current) => ({ ...current, status }))}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-semibold ${
                feedbackFilters.status === status
                  ? 'border-[#EFBF04] bg-[#EFBF04]/10 text-[#EFBF04]'
                  : 'border-white/10 bg-white/5 text-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            ['all', 'All types'],
            ['featured', 'Featured only'],
            ['standard', 'Not featured'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFeedbackFilters((current) => ({ ...current, featured: key }))}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-semibold ${
                feedbackFilters.featured === key
                  ? 'border-sky-400 bg-sky-500/10 text-sky-300'
                  : 'border-white/10 bg-white/5 text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <MobileActiveFilterChips chips={chips} />

        {filteredFeedback.length > 0 ? (
          <div className="space-y-3">
            {filteredFeedback.map((feedback) => (
              <FeedbackSummaryCard
                key={feedback.id}
                feedback={feedback}
                onOpen={() => openReview(feedback)}
              />
            ))}
          </div>
        ) : (
          <MobileEmptyState
            title={isLoading ? 'Loading feedback...' : 'No feedback matches these filters'}
            description={isLoading
              ? 'Approved, pending, and declined feedback submissions will appear here.'
              : 'Try switching status filters or searching with a different name, city, or service label.'}
            action={!isLoading && chips.length > 0 ? (
              <button
                type="button"
                onClick={() => setFeedbackFilters({ status: 'all', featured: 'all', search: '' })}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-200"
              >
                Reset filters
              </button>
            ) : null}
          />
        )}
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
