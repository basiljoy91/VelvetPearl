import { featuredPackages } from './travelCatalog.js';
import { travelMedia } from './travelMedia.js';

export const siteServiceAreas = [
  {
    name: 'Chennai',
    type: 'City',
    region: 'Tamil Nadu',
    country: 'IN',
  },
  {
    name: 'Tamil Nadu',
    type: 'State',
    country: 'IN',
  },
  {
    name: 'South India',
    type: 'Region',
    country: 'IN',
  },
];

export const coreSiteRoutes = [
  {
    path: '/',
    title: 'Home | Chennai and South India Travel Enquiries',
    description: 'Submit your travel enquiry for Chennai, Tamil Nadu, and nearby South India cab support, room assistance, tour packages, airport transfers, and custom trip planning. Manual confirmation after review.',
    image: travelMedia.hero.src,
    sourcePaths: ['src/pages/Home.jsx'],
    schemaType: 'WebPage',
    breadcrumbs: [{ name: 'Home', path: '/' }],
    llmsDescription: 'Homepage with travel services, destination ideas, customer feedback, and direct enquiry shortcuts.',
  },
  {
    path: '/about',
    title: 'About | Velvet Pearl Travel Service Information',
    description: 'Learn about the current enquiry-first travel workflow, service area notes, placeholder business verification details, and support direction for Velvet Pearl.',
    image: travelMedia.group.src,
    sourcePaths: ['src/pages/About.jsx'],
    schemaType: 'AboutPage',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
    ],
    llmsDescription: 'Business overview, service direction, and current travel support model for Velvet Pearl.',
  },
  {
    path: '/services',
    title: 'Services | Cab, Room, Tour and Custom Trip Enquiries',
    description: 'Explore enquiry-first travel support for cab services, room assistance, tour packages, custom trip planning, and WhatsApp follow-up.',
    image: travelMedia.family.src,
    sourcePaths: ['src/pages/Services.jsx'],
    schemaType: 'CollectionPage',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
    ],
    llmsDescription: 'Overview of cab, room, tour, and custom travel enquiry services.',
  },
  {
    path: '/routes',
    title: 'Routes | Popular Travel Route Enquiries and Planning',
    description: 'Browse editable route ideas, transfer directions, pricing notes, and travel planning support for cab and custom route enquiries.',
    image: travelMedia.airport.src,
    sourcePaths: ['src/pages/Routes.jsx'],
    schemaType: 'CollectionPage',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Routes', path: '/routes' },
    ],
    llmsDescription: 'Popular route examples for Chennai and South India travel planning.',
  },
  {
    path: '/contact',
    title: 'Contact | Travel Enquiry and WhatsApp Support',
    description: 'Contact Velvet Pearl for general travel enquiries, service clarification, WhatsApp support, and manual follow-up on cab, room, or tour requirements.',
    image: travelMedia.airport.src,
    sourcePaths: ['src/pages/Contact.jsx'],
    schemaType: 'ContactPage',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' },
    ],
    llmsDescription: 'Direct contact page for WhatsApp, phone, email, and manual travel follow-up.',
  },
  {
    path: '/feedback',
    title: 'Customer Feedback | Share Your Velvet Pearl Travel Experience',
    description: 'Share your Velvet Pearl travel experience with your full name and city.',
    image: travelMedia.family.src,
    sourcePaths: ['src/pages/Feedback.jsx'],
    schemaType: 'WebPage',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Feedback', path: '/feedback' },
    ],
    llmsDescription: 'Customer feedback submission form for sharing a travel experience with Velvet Pearl.',
  },
];

export const enquirySiteRoutes = [
  {
    path: '/book/cab',
    title: 'Cab Enquiry | Airport Pickup, Local Sightseeing and Outstation Trips',
    description: 'Submit your cab enquiry for airport pickup, airport drop, local sightseeing, outstation routes, one-way transfers, and round trips. Manual confirmation after review.',
    image: travelMedia.airport.src,
    sourcePaths: ['src/pages/CabBooking.jsx'],
    schemaType: 'WebPage',
    serviceType: 'Cab booking enquiry',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Cab Enquiry', path: '/book/cab' },
    ],
    llmsDescription: 'Cab enquiry form for airport transfers, local rides, sightseeing, and outstation travel.',
  },
  {
    path: '/book/room',
    title: 'Room Enquiry | Stay Assistance for Chennai and South India Trips',
    description: 'Share your stay dates, guests, room count, and budget to get room or stay assistance for Chennai stopovers, Tamil Nadu hill stations, and broader South India routes.',
    image: travelMedia.stay.src,
    sourcePaths: ['src/pages/RoomBooking.jsx'],
    schemaType: 'WebPage',
    serviceType: 'Room and stay enquiry',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Room Enquiry', path: '/book/room' },
    ],
    llmsDescription: 'Room and stay enquiry form for stopovers, hotels, resorts, and family stays.',
  },
  {
    path: '/book/tour',
    title: 'Tour Packages | Chennai, Tamil Nadu and South India Travel Planning',
    description: 'Submit a tour package enquiry for Chennai, Tamil Nadu, and nearby South India travel planning, custom itineraries, group trips, sightseeing ideas, and manual quote review.',
    image: travelMedia.hero.src,
    sourcePaths: ['src/pages/TourBooking.jsx'],
    schemaType: 'WebPage',
    serviceType: 'Tour package enquiry',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Tour Enquiry', path: '/book/tour' },
    ],
    llmsDescription: 'Tour enquiry form for destination ideas, itineraries, groups, and custom South India travel plans.',
  },
  {
    path: '/book/event',
    title: 'Custom Enquiry | Family, Group and Special Travel Plans',
    description: 'Send a custom trip enquiry for family travel, group trips, corporate travel, event travel, or mixed service planning with manual follow-up.',
    image: travelMedia.group.src,
    sourcePaths: ['src/pages/EventBooking.jsx'],
    schemaType: 'WebPage',
    serviceType: 'Custom travel enquiry',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Custom Enquiry', path: '/book/event' },
    ],
    llmsDescription: 'Flexible enquiry form for mixed travel needs, group trips, special requests, and custom planning.',
  },
];

const packageSourcePaths = ['src/pages/PackageDetail.jsx', 'src/content/travelCatalog.js'];

export const packageSiteRoutes = featuredPackages.map((pkg) => ({
  path: `/packages/${pkg.slug}`,
  title: `${pkg.title} | South India Tour Package Details`,
  description: `${pkg.overview} View highlights, itinerary, inclusions, exclusions, and submit an enquiry for ${pkg.title}.`,
  image: pkg.image,
  images: Array.from(new Set([pkg.image, ...(pkg.imageGallery || [])])),
  sourcePaths: packageSourcePaths,
  schemaType: 'WebPage',
  ogType: 'article',
  serviceType: 'Tour package enquiry',
  packageData: pkg,
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Tour Enquiry', path: '/book/tour' },
    { name: pkg.title, path: `/packages/${pkg.slug}` },
  ],
  llmsDescription: `${pkg.duration} travel package page for ${pkg.title}. Includes highlights, itinerary direction, FAQs, and an enquiry form.`,
}));

export const publicSiteRoutes = [
  ...coreSiteRoutes,
  ...enquirySiteRoutes,
  ...packageSiteRoutes,
];

export function getPublicRouteSeo(pathname) {
  return publicSiteRoutes.find((route) => route.path === pathname) || null;
}

export const llmsRouteGroups = [
  {
    title: 'Core pages',
    routes: coreSiteRoutes,
  },
  {
    title: 'Enquiry forms',
    routes: enquirySiteRoutes,
  },
  {
    title: 'Tour packages',
    routes: packageSiteRoutes,
  },
];
