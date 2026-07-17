import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { buildWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../utils/whatsapp';
import { slideshowArchiveMedia, travelMedia, vehicleMedia } from '../content/travelMedia';
import { buildDestinationEnquiryState, buildPackageEnquiryState, featuredDestinations, featuredPackages } from '../content/travelCatalog';
import FeedbackShowcase from '../components/feedback/FeedbackShowcase';
import { getPublicFeedback } from '../services/dataService';

const optimizeRemoteImage = (url, width = 1200) => {
  if (!url.includes('images.unsplash.com')) return url;

  const nextUrl = new URL(url);
  nextUrl.searchParams.set('auto', 'format');
  nextUrl.searchParams.set('fit', 'crop');
  nextUrl.searchParams.set('fm', 'webp');
  nextUrl.searchParams.set('q', '72');
  nextUrl.searchParams.set('w', String(width));
  return nextUrl.toString();
};

const serviceCards = [
  {
    title: 'Cab Booking Enquiry',
    description: 'Chennai airport pickup, city transfers, outstation trips, and family travel support.',
    icon: 'local_taxi',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    path: '/book/cab',
    whatsappText: 'Hi, I want to submit a cab enquiry for my Chennai or South India trip. Please guide me.',
  },
  {
    title: 'Tour Packages',
    description: 'Share your travel window, group size, interests, and South India destination preferences.',
    icon: 'travel_explore',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    path: '/book/tour',
    whatsappText: 'Hi, I want help with a South India tour package enquiry. Please guide me.',
  },
  {
    title: 'Room / Stay Assistance',
    description: 'Send your dates, room count, guest details, and budget for Chennai stopovers or South India stay suggestions.',
    icon: 'bed',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    path: '/book/room',
    whatsappText: 'Hi, I want to submit a room or stay enquiry for Chennai or South India. Please guide me.',
  },
  {
    title: 'Custom Trip Planning',
    description: 'For mixed requirements like cab, stay, sightseeing, and custom planning across Chennai and South India.',
    icon: 'map',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    path: '/book/event',
    whatsappText: 'Hi, I want help planning a custom trip. Please guide me with options and pricing.',
  },
];

const destinations = featuredDestinations;

const packageCards = featuredPackages;

const cabHighlights = [
  {
    title: 'Sedan',
    seats: 'Up to 4 seats',
    suitableFor: 'Couples, small families, airport transfers',
    luggage: 'Light to medium luggage',
    image: vehicleMedia.sedan.src,
    alt: vehicleMedia.sedan.alt,
  },
  {
    title: 'SUV',
    seats: 'Up to 6 or 7 seats',
    suitableFor: 'Families and hill travel routes',
    luggage: 'Better for mixed luggage needs',
    image: vehicleMedia.suv.src,
    alt: vehicleMedia.suv.alt,
  },
  {
    title: 'Tempo Traveller',
    seats: 'Group seating',
    suitableFor: 'Large families and group trips',
    luggage: 'Discuss luggage requirement in enquiry',
    image: vehicleMedia.tempoTraveller.src,
    alt: vehicleMedia.tempoTraveller.alt,
  },
  {
    title: 'Airport Transfer',
    seats: 'Based on trip size',
    suitableFor: 'Pickup and drop assistance',
    luggage: 'Final option depends on route and bags',
    image: vehicleMedia.airportTransfer.src,
    alt: vehicleMedia.airportTransfer.alt,
  },
];

const stayOptions = [
  {
    title: 'Budget Stays',
    description: 'For practical room requirements with budget awareness and basic comfort needs.',
  },
  {
    title: 'Family Rooms',
    description: 'Useful when you need room count, guest mix, and meal preference support.',
  },
  {
    title: 'Resorts',
    description: 'Share your location and stay preference so suitable options can be checked manually.',
  },
  {
    title: 'Group Stays',
    description: 'For larger trips that need room planning, pickup support, and coordination.',
  },
];

const howItWorks = [
  'Submit your requirement',
  'We review availability and options',
  'We contact you on WhatsApp or phone',
  'You confirm after price discussion',
  'We assign driver, vehicle, room, or package manually',
];

const whyChooseUs = [
  'Local travel support',
  'Easy WhatsApp communication',
  'Custom trip planning',
  'Manual review before confirmation',
  'Cab, room, and package assistance in one place',
  'Flexible plans based on customer requirement',
];

const faqs = [
  {
    question: 'Is my enquiry a confirmed booking?',
    answer: 'No. Your enquiry is reviewed manually. Final confirmation happens after availability and pricing are discussed.',
  },
  {
    question: 'Can I contact directly on WhatsApp?',
    answer: 'Yes. You can use the WhatsApp buttons on the website to start the conversation directly.',
  },
  {
    question: 'Do you provide cab booking?',
    answer: 'Yes. You can submit a cab enquiry for airport transfers, local sightseeing, and outstation trips.',
  },
  {
    question: 'Can I request rooms?',
    answer: 'Yes. Share your check-in, check-out, guest count, room type, and budget through the room enquiry form.',
  },
  {
    question: 'Do you provide custom tour packages?',
    answer: 'Yes. Custom trip requirements can be submitted through the custom enquiry form.',
  },
  {
    question: 'Do I need to pay online?',
    answer: 'No online payment is required in this phase. Payment is handled manually after discussion.',
  },
];

const heroSlides = [
  travelMedia.hero,
  travelMedia.airport,
  travelMedia.family,
  travelMedia.stay,
  travelMedia.group,
  travelMedia.waterfall,
  ...slideshowArchiveMedia,
];

const sectionIntro = (eyebrow, title, description) => (
  <div className="mb-12 max-w-3xl space-y-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>
    <h2 className="font-headline text-4xl font-bold tracking-tight text-white md:text-5xl">{title}</h2>
    <p className="text-lg leading-relaxed text-on-surface-variant">{description}</p>
  </div>
);

export default function Home() {
  const navigate = useNavigate();
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [quickEnquiry, setQuickEnquiry] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'cab',
  });
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(true);

  const quickServiceCopy = useMemo(() => ({
    cab: {
      label: 'Cab Booking Enquiry',
      note: 'We will ask for trip details like pickup, drop, date, and passenger count on the next screen.',
    },
    tour: {
      label: 'Tour Package Enquiry',
      note: 'We will ask for destination, dates, group size, and interests on the next screen.',
    },
    room: {
      label: 'Room / Stay Enquiry',
      note: 'We will ask for stay dates, guest count, room type, and budget on the next screen.',
    },
    event: {
      label: 'Custom Trip Enquiry',
      note: 'We will ask for your travel area, service mix, and full requirement details on the next screen.',
    },
  }), []);

  const handleQuickEnquiry = (e) => {
    e.preventDefault();
    navigate(`/book/${quickEnquiry.service}`, {
      state: {
        name: quickEnquiry.name,
        phone: quickEnquiry.phone,
        email: quickEnquiry.email,
      },
    });
  };

  const goToService = (path, state) => navigate(path, state ? { state } : undefined);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadFeedback = async () => {
      try {
        const nextFeedback = await getPublicFeedback(12);
        if (!ignore) {
          setFeedbackEntries(nextFeedback);
        }
      } catch (error) {
        console.error('Home feedback load error:', error);
      } finally {
        if (!ignore) {
          setIsFeedbackLoading(false);
        }
      }
    };

    loadFeedback();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="overflow-hidden pb-28 pt-20 md:pb-0">
      <section className="relative px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-16 lg:min-h-[920px]">
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <img
              key={slide.src}
              alt={slide.alt}
              aria-hidden={index !== heroSlideIndex}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[2200ms] ease-in-out ${
                index === heroSlideIndex ? 'opacity-100' : 'opacity-0'
              }`}
              decoding="async"
              fetchPriority={index === 0 ? 'high' : 'auto'}
              height="1600"
              loading={index === 0 ? 'eager' : 'lazy'}
              src={slide.src}
              width="2400"
            />
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,11,16,0.95)_0%,rgba(12,11,16,0.75)_45%,rgba(12,11,16,0.55)_100%)]"></div>
          <div className="absolute left-[-10%] top-12 h-96 w-96 rounded-full bg-primary-container/15 blur-[140px]"></div>
          <div className="absolute bottom-0 right-[-10%] h-80 w-80 rounded-full bg-secondary/15 blur-[140px]"></div>
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-secondary">Chennai and South India Travel Support</p>
              <h1 className="max-w-3xl font-headline text-4xl font-black leading-none tracking-tight text-white sm:text-5xl md:text-7xl">
                Plan Your Chennai and South India Trip with Local Travel Support
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
                Send your cab, room, or tour requirement for Chennai, nearby getaways, and South India travel. We&apos;ll review it manually and contact you with availability and pricing.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <a
                className="rounded-xl bg-primary-container px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-white transition-all hover:brightness-110"
                href="#service-snapshot"
              >
                Submit Enquiry
              </a>
              <a
                className="rounded-xl border border-secondary px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-secondary transition-all hover:bg-secondary/10"
                href={buildWhatsAppLink({
                  phone: DEFAULT_WHATSAPP_PHONE,
                  message: 'Hi, I would like to know more about your travel services. Please help me plan my trip.',
                })}
                rel="noreferrer"
                target="_blank"
              >
                Chat on WhatsApp
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                'Cab booking enquiry',
                'Room / stay enquiry',
                'Tour package enquiry',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-on-surface-variant backdrop-blur-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[28px] border border-white/10 p-5 shadow-[0_24px_48px_rgba(0,0,0,0.45)] sm:p-6 md:p-8">
            <div className="mb-6 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">Quick Start</p>
              <h2 className="font-headline text-2xl font-bold text-white sm:text-3xl">Choose Your Enquiry Type</h2>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                Start here and continue to the full service-specific form. Final confirmation happens only after manual review.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleQuickEnquiry}>
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Full Name</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-all focus:border-secondary"
                  onChange={(e) => setQuickEnquiry((current) => ({ ...current, name: e.target.value }))}
                  required
                  type="text"
                  value={quickEnquiry.name}
                />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Phone Number</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-all focus:border-secondary"
                    onChange={(e) => setQuickEnquiry((current) => ({ ...current, phone: e.target.value }))}
                    required
                    type="tel"
                    value={quickEnquiry.phone}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Email</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-all focus:border-secondary"
                    onChange={(e) => setQuickEnquiry((current) => ({ ...current, email: e.target.value }))}
                    type="email"
                    value={quickEnquiry.email}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Service Needed</label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-all focus:border-secondary"
                  onChange={(e) => setQuickEnquiry((current) => ({ ...current, service: e.target.value }))}
                  value={quickEnquiry.service}
                >
                  <option value="cab">Cab booking enquiry</option>
                  <option value="tour">Tour package enquiry</option>
                  <option value="room">Room / stay enquiry</option>
                  <option value="event">Custom trip enquiry</option>
                </select>
              </div>
              <div className="rounded-2xl border border-secondary/20 bg-secondary/10 px-4 py-4 text-sm text-on-surface-variant">
                <p className="font-bold text-white">{quickServiceCopy[quickEnquiry.service].label}</p>
                <p className="mt-2">{quickServiceCopy[quickEnquiry.service].note}</p>
              </div>
              <button
                className="w-full rounded-xl bg-primary-container px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition-all hover:brightness-110"
                type="submit"
              >
                Continue to Enquiry Form
              </button>
            </form>
          </div>
        </div>
      </section>

      <FeedbackShowcase feedbackEntries={feedbackEntries} isLoading={isFeedbackLoading} />

      <section className="bg-surface-container-low px-6 py-24 md:px-8" id="service-snapshot">
        <div className="mx-auto max-w-7xl">
          {sectionIntro(
            'Services',
            'Choose the Right Enquiry Path',
            'Each service below leads to a form built for operational details, so your request can be reviewed properly before pricing and confirmation are shared.'
          )}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {serviceCards.map((card) => (
              <article key={card.title} className="overflow-hidden rounded-[26px] border border-white/10 bg-black/20">
                <div className="relative h-56 overflow-hidden">
                  <img alt={card.title} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" decoding="async" height="896" loading="lazy" src={optimizeRemoteImage(card.image, 900)} width="1200" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
                    <span className="material-symbols-outlined">{card.icon}</span>
                  </div>
                </div>
                <div className="space-y-5 p-6">
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{card.description}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      className="w-full rounded-xl bg-primary-container px-5 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
                      onClick={() => goToService(card.path)}
                      type="button"
                    >
                      {card.title === 'Cab Booking Enquiry' && 'Submit Cab Enquiry'}
                      {card.title === 'Tour Packages' && 'Submit Tour Enquiry'}
                      {card.title === 'Room / Stay Assistance' && 'Submit Room Enquiry'}
                      {card.title === 'Custom Trip Planning' && 'Submit Custom Enquiry'}
                    </button>
                    <a
                      className="w-full rounded-xl border border-secondary px-5 py-3 text-center text-sm font-bold text-secondary transition-all hover:bg-secondary/10"
                      href={buildWhatsAppLink({ phone: DEFAULT_WHATSAPP_PHONE, message: card.whatsappText })}
                      rel="noreferrer"
                      target="_blank"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {sectionIntro(
            'Destinations',
            'Featured Chennai and South India Destination Ideas',
            'Use these destination ideas as a starting point for your tour or custom trip enquiry. Final plans are shaped manually around your dates, route, and preferences.'
          )}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {destinations.map((destination) => (
              <article key={destination.name} className="overflow-hidden rounded-[24px] border border-white/10 bg-surface-container">
                <img alt={destination.name} className="h-56 w-full object-cover" decoding="async" height="560" loading="lazy" src={destination.image} width="900" />
                <div className="space-y-4 p-6">
                  <h3 className="font-headline text-2xl font-bold text-white">{destination.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{destination.location}</p>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{destination.shortDescription}</p>
                  <div className="flex flex-wrap gap-2">
                    {destination.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-[11px] font-bold text-secondary">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white transition-all hover:border-secondary hover:bg-white/5"
                      onClick={() => goToService('/book/tour', buildDestinationEnquiryState(destination))}
                      type="button"
                    >
                      Plan a Trip
                    </button>
                    <a
                      className="rounded-xl border border-secondary px-4 py-3 text-center text-sm font-bold text-secondary transition-all hover:bg-secondary/10"
                      href={buildWhatsAppLink({ phone: DEFAULT_WHATSAPP_PHONE, message: destination.ctaMessage })}
                      rel="noreferrer"
                      target="_blank"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {sectionIntro(
            'Packages',
            'Featured Tour Package Ideas',
            'These are sample planning directions to help customers describe what they want. Final pricing and availability are shared only after enquiry review.'
          )}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {packageCards.map((pkg) => (
              <article key={pkg.title} className="overflow-hidden rounded-[28px] border border-white/10 bg-black/20">
                <img alt={pkg.title} className="h-60 w-full object-cover" decoding="async" height="720" loading="lazy" src={pkg.image} width="1200" />
                <div className="space-y-5 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-headline text-2xl font-bold text-white">{pkg.title}</h3>
                    <span className="rounded-full border border-secondary/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                      {pkg.duration}
                    </span>
                  </div>
                  <div className="grid gap-3 rounded-2xl bg-white/5 p-4 text-sm text-on-surface-variant">
                    <p><span className="font-bold text-white">Suitable for:</span> {pkg.suitableFor}</p>
                    <p><span className="font-bold text-white">Highlights:</span> {pkg.highlights.join(', ')}</p>
                    <p><span className="font-bold text-white">Includes:</span> {pkg.inclusions.join(', ')}</p>
                    <p><span className="font-bold text-white">Pricing:</span> {pkg.priceNote}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      className="w-full rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-white transition-all hover:border-secondary hover:bg-white/5"
                      onClick={() => goToService(`/packages/${pkg.slug}`)}
                      type="button"
                    >
                      View Details
                    </button>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        className="flex-1 rounded-xl bg-primary-container px-5 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
                        onClick={() => goToService('/book/tour', buildPackageEnquiryState(pkg))}
                        type="button"
                      >
                        Submit Enquiry
                      </button>
                      <a
                        className="flex-1 rounded-xl border border-secondary px-5 py-3 text-center text-sm font-bold text-secondary transition-all hover:bg-secondary/10"
                        href={buildWhatsAppLink({ phone: DEFAULT_WHATSAPP_PHONE, message: pkg.whatsappMessage })}
                        rel="noreferrer"
                        target="_blank"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {sectionIntro(
            'Cab Support',
            'Vehicle Options Based on Availability',
            'Cab types are matched after reviewing the date, route, passenger count, and luggage details from your enquiry.'
          )}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {cabHighlights.map((item) => (
              <article key={item.title} className="overflow-hidden rounded-[24px] border border-white/10 bg-surface-container">
                <img alt={item.alt} className="h-52 w-full object-cover" decoding="async" height="624" loading="lazy" src={item.image} width="1200" />
                <div className="space-y-4 p-6">
                  <h3 className="font-headline text-2xl font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant">{item.seats}</p>
                  <p className="text-sm text-on-surface-variant">{item.suitableFor}</p>
                  <p className="text-sm text-on-surface-variant">{item.luggage}</p>
                  <p className="rounded-xl bg-secondary/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                    Availability confirmed after enquiry
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            {sectionIntro(
              'Stay Support',
              'Room and Stay Assistance',
              'Looking for rooms or stays in Chennai, hill stations, or broader South India routes? Share your dates, group size, room preference, and budget. We&apos;ll check available options and contact you with suitable suggestions.'
            )}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {stayOptions.map((item) => (
              <article key={item.title} className="rounded-[22px] border border-white/10 bg-black/20 p-6">
                <h3 className="font-headline text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{item.description}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                  Room availability is confirmed after enquiry review
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {sectionIntro(
            'How It Works',
            'This Is a Manual Travel Service',
            'These steps help set the right expectation: the website collects requirements first, then the team reviews and follows up manually.'
          )}
          <div className="grid gap-6 md:grid-cols-5">
            {howItWorks.map((step, index) => (
              <article key={step} className="glass-card rounded-[24px] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-secondary">Step {index + 1}</p>
                <h3 className="mt-5 font-headline text-2xl font-bold text-white">{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          {sectionIntro(
            'Why Choose Us',
            'Support That Matches Real Travel Planning',
            'The focus here is on responsive communication and manual coordination, not auto-confirmed booking promises.'
          )}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {whyChooseUs.map((item) => (
              <div key={item} className="rounded-[22px] border border-white/10 bg-black/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                    <span className="material-symbols-outlined text-lg">check</span>
                  </div>
                  <p className="text-base font-semibold text-white">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-24 md:px-8">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(34,73,219,0.12),rgba(239,191,4,0.08))] p-8 md:p-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Share Feedback</p>
          <h2 className="mt-4 font-headline text-4xl font-bold text-white md:text-5xl">Travelled with us? Add your note here.</h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
            This public form is separate from the enquiry flow. Customers can submit feedback directly, and approved notes may appear on the homepage after admin review.
          </p>
          <Link
            className="mt-8 inline-flex rounded-xl border border-secondary px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-secondary transition-all hover:bg-secondary/10"
            to="/feedback"
          >
            Open Feedback Form
          </Link>
        </div>
      </section>

      <section className="bg-surface-container-low px-6 py-24 md:px-8">
        <div className="mx-auto max-w-5xl">
          {sectionIntro(
            'FAQ',
            'Common Questions',
            'A few quick answers to help customers understand how enquiry, pricing, and confirmation work on this website.'
          )}
          <div className="space-y-4">
            {faqs.map((faq) => (
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

      <section className="bg-background px-6 pb-24 pt-10 md:px-8">
        <div className="mx-auto max-w-7xl rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(34,73,219,0.12))] p-8 md:p-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary">Ready to Plan Your Trip?</p>
              <h2 className="mt-4 font-headline text-4xl font-bold text-white md:text-5xl">Send your travel requirement and we&apos;ll help you with the next steps.</h2>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
                Availability, pricing, and confirmation are shared after our team reviews your enquiry manually.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
              <a
                className="rounded-xl bg-primary-container px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-white transition-all hover:brightness-110"
                href="#service-snapshot"
              >
                Submit Enquiry
              </a>
              <a
                className="rounded-xl border border-secondary px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.18em] text-secondary transition-all hover:bg-secondary/10"
                href={buildWhatsAppLink({
                  phone: DEFAULT_WHATSAPP_PHONE,
                  message: 'Hi, I would like to know more about your travel services. Please help me plan my trip.',
                })}
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
