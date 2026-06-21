import React from 'react';
import FeedbackStars from '../feedback/FeedbackStars';
import { getFeedbackStatusClasses } from '../../data/feedback';
import { formatFeedbackDateTime, getFeedbackSnippet } from './feedbackAdminUtils';

export default function FeedbackSummaryCard({ feedback, onOpen }) {
  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_80px_rgba(0,0,0,0.24)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-xs text-[#EFBF04]">{feedback.reference_id}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {feedback.customer_name}
              <span className="ml-2 text-sm font-normal text-gray-400">• {feedback.city}</span>
            </h3>
            <p className="mt-1 text-sm text-gray-400">{feedback.service_used}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {feedback.featured && (
              <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">
                Featured
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${getFeedbackStatusClasses(feedback.status)}`}>
              {feedback.status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <FeedbackStars rating={feedback.rating} />
          <p className="text-xs text-gray-500">Submitted {formatFeedbackDateTime(feedback.created_at)}</p>
        </div>

        <div className="rounded-2xl bg-black/20 p-4">
          <p className="text-sm leading-relaxed text-white">{getFeedbackSnippet(feedback.display_message || feedback.feedback_message)}</p>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white"
        >
          Review Feedback
        </button>
      </div>
    </article>
  );
}
