import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import TourPackageEnquiryForm from '../components/forms/TourPackageEnquiryForm';
import { buildWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../utils/whatsapp';
import { getPackageBySlug } from '../content/travelCatalog';

const sectionIntro = (eyebrow, title, description) => (
  <div className="mb-10 max-w-3xl space-y-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>
    <h2 className="font-headline text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h2>
    <p className="text-lg leading-relaxed text-on-surface-variant">{description}</p>
  </div>
);

export default function PackageDetail() {
  const { slug } = useParams();
  const pkg = getPackageBySlug(slug);

  if (!pkg) {
    return <Navigate replace to="/book/tour" />;
  }

  const packageWhatsApp = buildWhatsAppLink({
    phone: DEFAULT_WHATSAPP_PHONE,
    message: pkg.whatsappMessage,
  });

  return (
    <main className="overflow-hidden bg-background pt-20">
      <section className="relative min-h-[720px] px-6 py-16 md:px-8">
        <div className="absolute inset-0">
          <img alt={pkg.title} className="h-full w-full object-cover" decoding="async" fetchPriority="high" height="1600" src={pkg.image} width="2400" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,11,16,0.94)_0%,rgba(12,11,16,0.74)_45%,rgba(12,11,16,0.62)_100%)]"></div>
          <div className="absolute left-[-10%] top-16 h-96 w-96 rounded-full bg-primary-container/15 blur-[140px]"></div>
          <div className="absolute bottom-0 right-[-10%] h-80 w-80 rounded-full bg-secondary/15 blur-[140px]"></div>
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-secondary">Package Details</p>
              <h1 className="max-w-4xl font-headline text-5xl font-black leading-none tracking-tight text-white md:text-7xl">
                {pkg.title}
              </h1>
              <p className="max-w-3xl text-xl leading-relaxed text-on-surface-variant">
                {pkg.overview}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-secondary/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                {pkg.duration}
              </span>
              <span className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
                {pkg.priceNote}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {pkg.highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-on-surface-variant backdrop-blur-sm">
                  {item}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                className="rounded-xl bg-primary-container px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all hover:brightness-110"
                href="#package-enquiry"
              >
                Submit Enquiry
              </a>
              <a
                className="rounded-xl border border-secondary px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-secondary transition-all hover:bg-secondary/10"
                href={packageWhatsApp}
                rel="noreferrer"
                target="_blank"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="glass-panel rounded-[28px] border border-white/10 p-6 shadow-[0_24px_48px_rgba(0,0,0,0.45)] md:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">Overview</p>
            <h2 className="mt-4 font-headline text-3xl font-bold text-white">What This Package Covers</h2>
            <div className="mt-6 grid gap-4 text-sm text-on-surface-variant">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-bold text-white">Suitable For</p>
                <p className="mt-2">{pkg.suitableFor}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-bold text-white">Inclusions</p>
                <p className="mt-2">{pkg.inclusions.join(', ')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-bold text-white">Exclusions</p>
                <p className="mt-2">{pkg.exclusions.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {sectionIntro(
            'Gallery',
            'Images for This Package Style',
            'These images show the atmosphere of the route. Stop order and travel flow are confirmed after reviewing your dates, pickup point, and group needs.'
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {pkg.imageGallery.map((image, index) => (
              <article key={image} className="overflow-hidden rounded-[26px] border border-white/10 bg-black/20">
                <img alt={`${pkg.title} gallery ${index + 1}`} className="h-72 w-full object-cover" decoding="async" height="864" loading="lazy" src={image} width="1200" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {sectionIntro(
            'Itinerary',
            'How This Package Can Be Planned',
            'This flexible outline helps you understand the usual flow. Timing and stop order depend on your dates, pickup point, group size, and availability.'
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {pkg.itinerary.map((item, index) => (
              <article key={item.title} className="glass-card rounded-[24px] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">Step {index + 1}</p>
                <h3 className="mt-5 font-headline text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <article className="rounded-[28px] border border-white/10 bg-surface-container p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Inclusions</p>
            <h3 className="mt-4 font-headline text-3xl font-bold text-white">What We Can Review</h3>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-on-surface-variant">
              {pkg.inclusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-[28px] border border-white/10 bg-surface-container p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Exclusions</p>
            <h3 className="mt-4 font-headline text-3xl font-bold text-white">What Is Not Included Automatically</h3>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-on-surface-variant">
              {pkg.exclusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-background px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {sectionIntro(
            'Suitable For',
            'Who Usually Chooses This Kind of Plan',
            'This helps customers judge whether the package is close to what they need before sending a manual enquiry.'
          )}
          <div className="rounded-[28px] border border-white/10 bg-surface-container p-8">
            <p className="text-lg leading-relaxed text-on-surface-variant">{pkg.suitableFor}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {pkg.highlights.map((item) => (
                <span key={item} className="rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24 md:px-8" id="package-enquiry">
        <div className="mx-auto max-w-7xl">
          {sectionIntro(
            'Enquiry Form',
            'Request This Package',
            'Share your dates, group size, pickup point, and preferences. We will review the request manually and contact you with availability and pricing.'
          )}
          <div className="rounded-[32px] border border-white/10 bg-black/20 p-6 md:p-10">
            <TourPackageEnquiryForm packageData={pkg} />
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-24 md:px-8">
        <div className="mx-auto max-w-5xl">
          {sectionIntro(
            'FAQ',
            'Package Questions',
            'A few quick answers about package planning, pricing, and confirmation.'
          )}
          <div className="space-y-4">
            {pkg.faqs.map((faq) => (
              <details key={faq.question} className="group rounded-[22px] border border-white/10 bg-black/20 p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-headline text-2xl font-bold text-white">
                  <span>{faq.question}</span>
                  <span className="material-symbols-outlined text-secondary transition-transform group-open:rotate-45">add</span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 pb-24 pt-8 md:px-8">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,73,219,0.12),rgba(239,191,4,0.08))] p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Need a Different Route Mix?</p>
              <h2 className="mt-4 font-headline text-4xl font-bold text-white">Use WhatsApp or the full tour form for a custom version of this package.</h2>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
                If you want a different stay style, more days, another pickup point, or a custom mix of destinations, we can review that manually too.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Link
                className="rounded-xl bg-primary-container px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-white transition-all hover:brightness-110"
                to="/book/tour"
              >
                Open Full Tour Form
              </Link>
              <a
                className="rounded-xl border border-secondary px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-secondary transition-all hover:bg-secondary/10"
                href={packageWhatsApp}
                rel="noreferrer"
                target="_blank"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
