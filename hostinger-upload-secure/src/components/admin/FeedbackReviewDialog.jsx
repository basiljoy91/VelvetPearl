import React from 'react';
import FeedbackStars from '../feedback/FeedbackStars';
import {
  FEEDBACK_SERVICE_OPTIONS,
  FEEDBACK_STATUS_OPTIONS,
  formatTripMonthLabel,
  getFeedbackStatusClasses,
} from '../../data/feedback';
import { LoadingButton } from '../ui/LoadingState';
import {
  feedbackInputClassName,
  feedbackLabelClassName,
  formatFeedbackDateTime,
} from './feedbackAdminUtils';

export default function FeedbackReviewDialog({
  feedback,
  draft,
  onDraftChange,
  onClose,
  onSave,
  activeAction,
}) {
  if (!feedback || !draft) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto p-3 md:items-center md:p-5">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0A] shadow-2xl md:max-h-[92vh]">
        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0A0A0A]/95 px-5 py-5 backdrop-blur md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#EFBF04]">Feedback Review</p>
              <h3 className="mt-1 text-2xl font-bold text-white">{feedback.reference_id}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <FeedbackStars rating={feedback.rating} />
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${getFeedbackStatusClasses(feedback.status)}`}>
                  {feedback.status}
                </span>
                {feedback.featured ? (
                  <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">
                    Featured on homepage
                  </span>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-gray-200"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid gap-6 overflow-y-auto px-5 py-5 md:px-6 md:py-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h4 className="text-lg font-semibold text-white">Original submission</h4>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className={feedbackLabelClassName}>Customer name</p>
                  <p className="mt-1 text-sm text-white">{feedback.customer_name}</p>
                </div>
                <div>
                  <p className={feedbackLabelClassName}>City</p>
                  <p className="mt-1 text-sm text-white">{feedback.city}</p>
                </div>
                <div>
                  <p className={feedbackLabelClassName}>Service used</p>
                  <p className="mt-1 text-sm text-white">{feedback.service_used}</p>
                </div>
                <div>
                  <p className={feedbackLabelClassName}>Trip month</p>
                  <p className="mt-1 text-sm text-white">{formatTripMonthLabel(feedback.trip_month)}</p>
                </div>
                <div>
                  <p className={feedbackLabelClassName}>Submitted</p>
                  <p className="mt-1 text-sm text-white">{formatFeedbackDateTime(feedback.created_at)}</p>
                </div>
                <div>
                  <p className={feedbackLabelClassName}>Last updated</p>
                  <p className="mt-1 text-sm text-white">{formatFeedbackDateTime(feedback.updated_at)}</p>
                </div>
                <div>
                  <p className={feedbackLabelClassName}>Private contact</p>
                  <p className="mt-1 text-sm text-white">{feedback.contact_number || 'Not shared'}</p>
                </div>
                <div>
                  <p className={feedbackLabelClassName}>Private email</p>
                  <p className="mt-1 text-sm text-white">{feedback.email || 'Not shared'}</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-black/20 p-4">
                <p className={feedbackLabelClassName}>Original message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white">{feedback.feedback_message}</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h4 className="text-lg font-semibold text-white">Public version</h4>
              <p className="mt-1 text-sm text-gray-400">
                These are the homepage-facing fields the admin can clean up before approval.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={feedbackLabelClassName}>Display name</label>
                  <input
                    type="text"
                    className={`${feedbackInputClassName} mt-2`}
                    value={draft.display_name}
                    onChange={(event) => onDraftChange('display_name', event.target.value)}
                  />
                </div>
                <div>
                  <label className={feedbackLabelClassName}>Display city</label>
                  <input
                    type="text"
                    className={`${feedbackInputClassName} mt-2`}
                    value={draft.display_city}
                    onChange={(event) => onDraftChange('display_city', event.target.value)}
                  />
                </div>
                <div>
                  <label className={feedbackLabelClassName}>Display service</label>
                  <select
                    className={`${feedbackInputClassName} mt-2`}
                    value={draft.display_service_used}
                    onChange={(event) => onDraftChange('display_service_used', event.target.value)}
                  >
                    {FEEDBACK_SERVICE_OPTIONS.map((option) => (
                      <option key={option} value={option} className="bg-[#0A0A0A]">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={feedbackLabelClassName}>Status</label>
                  <select
                    className={`${feedbackInputClassName} mt-2`}
                    value={draft.status}
                    onChange={(event) => onDraftChange('status', event.target.value)}
                  >
                    {FEEDBACK_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status} className="bg-[#0A0A0A]">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className={feedbackLabelClassName}>Display message</label>
                <textarea
                  rows="6"
                  className={`${feedbackInputClassName} mt-2`}
                  value={draft.display_message}
                  onChange={(event) => onDraftChange('display_message', event.target.value)}
                />
              </div>

              <div className="mt-4">
                <label className={`flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-on-surface-variant`}>
                  <input
                    checked={draft.featured}
                    type="checkbox"
                    onChange={(event) => onDraftChange('featured', event.target.checked)}
                  />
                  <span>Feature this feedback in the homepage lead card rotation.</span>
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h4 className="text-lg font-semibold text-white">Admin notes</h4>
              <textarea
                rows="5"
                className={`${feedbackInputClassName} mt-4`}
                value={draft.admin_notes}
                onChange={(event) => onDraftChange('admin_notes', event.target.value)}
                placeholder="Add internal notes about verification, cleanup, or publishing decisions."
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <LoadingButton
                  type="button"
                  isLoading={activeAction === 'save'}
                  onClick={() => onSave({ ...draft }, 'save')}
                  idleLabel="Save Changes"
                  loadingLabel="Saving Changes..."
                  className="bg-white/10 text-white hover:brightness-100"
                />
                <LoadingButton
                  type="button"
                  isLoading={activeAction === 'approve'}
                  onClick={() => onSave({ ...draft, status: 'Approved' }, 'approve')}
                  idleLabel="Approve"
                  loadingLabel="Approving..."
                  className="bg-emerald-500/20 text-emerald-200 hover:brightness-100"
                />
                <LoadingButton
                  type="button"
                  isLoading={activeAction === 'hide'}
                  onClick={() => onSave({ ...draft, status: 'Hidden' }, 'hide')}
                  idleLabel="Hide"
                  loadingLabel="Hiding..."
                  className="bg-white/10 text-gray-200 hover:brightness-100"
                />
                <LoadingButton
                  type="button"
                  isLoading={activeAction === 'decline'}
                  onClick={() => onSave({ ...draft, status: 'Declined' }, 'decline')}
                  idleLabel="Decline"
                  loadingLabel="Declining..."
                  className="bg-rose-500/20 text-rose-200 hover:brightness-100"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
