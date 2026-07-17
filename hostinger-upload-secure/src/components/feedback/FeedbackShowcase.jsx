import React from 'react';
import { Link } from 'react-router-dom';
import FeedbackStars from './FeedbackStars';

function FeedbackCard({ item, featured = false, railMode = 'desktop' }) {
  const railWidth = railMode === 'mobile' ? 'min(310px, calc(100vw - 5rem))' : '310px';

  return (
    <article
      style={featured ? undefined : { width: railWidth }}
      className={`relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] ${
        featured ? 'w-full p-7 md:p-9' : 'shrink-0 p-5'
      }`}
    >
      <div className="absolute right-5 top-5 text-[80px] font-black leading-none text-white/[0.05]">"</div>
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <FeedbackStars rating={item.rating} />
          <span className="rounded-full border border-[#EFBF04]/20 bg-[#EFBF04]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#EFBF04]">
            {item.service_used}
          </span>
        </div>
        <p className={`${featured ? 'text-xl leading-relaxed md:text-2xl' : 'text-sm leading-relaxed'} text-white`}>
          {item.feedback_message}
        </p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-white">{item.customer_name}</p>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">{item.city}</p>
          </div>
          {item.featured && (
            <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-300">
              Featured
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function LoadingCard({ featured = false }) {
  return (
    <div className={`animate-pulse rounded-[30px] border border-white/10 bg-white/5 ${featured ? 'h-[320px]' : 'h-[240px] min-w-[310px] max-w-[310px]'}`} />
  );
}

export default function FeedbackShowcase({ feedbackEntries = [], isLoading = false }) {
  if (isLoading) {
    return (
      <section className="relative bg-surface-container-lowest px-6 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl space-y-4">
            <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="h-12 w-3/4 animate-pulse rounded-full bg-white/10" />
            <div className="h-5 w-full animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <LoadingCard featured />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 3 }).map((_, index) => <LoadingCard key={index} />)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!feedbackEntries.length) {
    return (
      <section className="relative overflow-hidden bg-surface-container-lowest px-6 py-20 md:px-8">
        <div className="absolute left-[-6%] top-0 h-72 w-72 rounded-full bg-primary-container/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-4%] h-72 w-72 rounded-full bg-[#EFBF04]/10 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,73,219,0.12),rgba(239,191,4,0.08))] p-8 md:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#EFBF04]">Guest Notes</p>
          <h2 className="mt-4 max-w-3xl font-headline text-4xl font-bold text-white md:text-5xl">
            Customer stories will appear here soon.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            Once guests start sharing their experiences, this space will highlight real travel feedback for future visitors.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex rounded-xl bg-primary-container px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all hover:brightness-110"
              to="/feedback"
            >
              Share Feedback
            </Link>
            <Link
              className="inline-flex rounded-xl border border-[#EFBF04] px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#EFBF04] transition-all hover:bg-[#EFBF04]/10"
              to="/contact"
            >
              Contact Team
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const featuredEntry = feedbackEntries.find((entry) => entry.featured) || feedbackEntries[0];
  const railEntries = feedbackEntries.filter((entry) => entry.id !== featuredEntry.id);
  const marqueeEntries = railEntries.length > 1 ? [...railEntries, ...railEntries] : railEntries;
  const mobileEntries = feedbackEntries;

  return (
    <section
      id="public-reviews"
      className="relative scroll-mt-24 overflow-hidden bg-surface-container-lowest px-6 py-20 md:scroll-mt-28 md:px-8"
    >
      <div className="absolute left-[-6%] top-0 h-72 w-72 rounded-full bg-primary-container/15 blur-[120px]" />
      <div className="absolute top-1/3 right-[-4%] h-72 w-72 rounded-full bg-[#EFBF04]/10 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#EFBF04]">Guest Notes</p>
            <h2 className="font-headline text-4xl font-bold text-white md:text-5xl">
              Real feedback from recent customer journeys.
            </h2>
            <p className="text-lg leading-relaxed text-on-surface-variant">
              A quick feel for the service before sending an enquiry.
            </p>
          </div>
          <Link
            className="inline-flex w-fit rounded-xl border border-[#EFBF04] px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#EFBF04] transition-all hover:bg-[#EFBF04]/10"
            to="/feedback"
          >
            Share Your Experience
          </Link>
        </div>

        <div className="md:hidden">
          <div className="overflow-x-auto pb-3">
            <div className="flex w-max snap-x snap-mandatory gap-4 pr-6">
              {mobileEntries.map((item) => (
                <div key={`mobile-${item.id}`} className="snap-start">
                  <FeedbackCard item={item} railMode="mobile" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden gap-6 md:grid xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
          <div className="min-w-0">
            <FeedbackCard item={featuredEntry} featured />
          </div>

          <div className="min-w-0 space-y-4">
            {marqueeEntries.length > 0 ? (
              <div className="feedback-rail w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <div className="feedback-rail-track flex w-max gap-4 py-1">
                  {marqueeEntries.map((item, index) => (
                    <FeedbackCard key={`${item.id}-${index}`} item={item} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-on-surface-variant">
                More customer reviews will appear here automatically as new feedback comes in.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
