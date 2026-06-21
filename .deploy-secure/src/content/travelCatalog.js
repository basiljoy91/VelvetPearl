import { destinationMedia, travelMedia } from './travelMedia.js';

const optimizeUnsplashUrl = (url, width = 1200) => {
  if (!url.includes('images.unsplash.com')) return url;

  const nextUrl = new URL(url);
  nextUrl.searchParams.set('auto', 'format');
  nextUrl.searchParams.set('fit', 'crop');
  nextUrl.searchParams.set('fm', 'webp');
  nextUrl.searchParams.set('q', '72');
  nextUrl.searchParams.set('w', String(width));
  return nextUrl.toString();
};

export const featuredDestinations = [
  {
    slug: 'chennai',
    name: 'Chennai',
    location: 'Tamil Nadu',
    shortDescription: 'A practical base for airport arrivals, city transfers, shoreline stops, and onward Tamil Nadu travel planning.',
    image: destinationMedia.chennai.src,
    tags: ['City', 'Transfers', 'Sightseeing'],
    ctaMessage: 'Hi, I want to plan a Chennai trip with local travel support.',
  },
  {
    slug: 'mahabalipuram',
    name: 'Mahabalipuram',
    location: 'Tamil Nadu',
    shortDescription: 'Useful for ECR day trips, temple heritage stops, coastal sightseeing, and short weekend travel from Chennai.',
    image: destinationMedia.mahabalipuram.src,
    tags: ['Heritage', 'Coastal', 'Day Trip'],
    ctaMessage: 'Hi, I want to plan a trip including Mahabalipuram.',
  },
  {
    slug: 'puducherry',
    name: 'Puducherry',
    location: 'South India',
    shortDescription: 'A good fit for weekend stays, couple trips, promenade time, and relaxed coastal planning from Chennai.',
    image: destinationMedia.puducherry.src,
    tags: ['Weekend', 'Coastal', 'Stay'],
    ctaMessage: 'Hi, I want to plan a trip including Puducherry.',
  },
  {
    slug: 'ooty',
    name: 'Ooty',
    location: 'Tamil Nadu',
    shortDescription: 'Popular for hill stays, family routes, cool-weather sightseeing, and multi-day Tamil Nadu plans.',
    image: destinationMedia.ooty.src,
    tags: ['Hills', 'Family', 'Sightseeing'],
    ctaMessage: 'Hi, I want to plan a trip including Ooty.',
  },
  {
    slug: 'kodaikanal',
    name: 'Kodaikanal',
    location: 'Tamil Nadu',
    shortDescription: 'Great for stay-based hill travel, couple or family trips, and slower-paced sightseeing plans.',
    image: destinationMedia.kodaikanal.src,
    tags: ['Hills', 'Stay', 'Couples'],
    ctaMessage: 'Hi, I want to plan a trip including Kodaikanal.',
  },
  {
    slug: 'coimbatore',
    name: 'Coimbatore',
    location: 'Tamil Nadu',
    shortDescription: 'A practical transfer point for airport pickups, business arrivals, and onward hill-station travel support.',
    image: destinationMedia.coimbatore.src,
    tags: ['Airport', 'Transfers', 'Onward Travel'],
    ctaMessage: 'Hi, I want to plan a trip through Coimbatore.',
  },
  {
    slug: 'madurai',
    name: 'Madurai',
    location: 'Tamil Nadu',
    shortDescription: 'Strong for temple routes, family travel, city stays, and multi-stop South India planning.',
    image: destinationMedia.madurai.src,
    tags: ['Temple Routes', 'Family', 'City Stay'],
    ctaMessage: 'Hi, I want to plan a trip including Madurai.',
  },
  {
    slug: 'mysuru',
    name: 'Mysuru',
    location: 'South India',
    shortDescription: 'Useful for heritage-focused routes, palace sightseeing, family stays, and custom South India circuits.',
    image: destinationMedia.mysuru.src,
    tags: ['Heritage', 'Family', 'Circuit'],
    ctaMessage: 'Hi, I want to plan a trip including Mysuru.',
  },
].map((destination) => ({
  ...destination,
  image: optimizeUnsplashUrl(destination.image, 900),
}));

export const featuredPackages = [
  {
    slug: 'chennai-1-day-city-shoreline-trip',
    title: 'Chennai 1-Day City & Shoreline Trip',
    duration: '1 Day',
    suitableFor: 'Families, business visitors, quick local trips',
    highlights: ['Marina stretch', 'City landmarks', 'Local transfers'],
    inclusions: ['Trip planning assistance', 'Cab arrangement on request', 'City route suggestion'],
    exclusions: ['Entry tickets', 'Food', 'Personal expenses'],
    priceNote: 'Price shared after enquiry',
    image: destinationMedia.chennai.src,
    whatsappMessage: 'Hi, I am interested in the Chennai 1-Day City & Shoreline Trip package.',
    overview: 'A practical single-day plan for travellers who want a few strong Chennai stops without turning the day into a rushed city circuit.',
    itinerary: [
      {
        title: 'Morning pickup and city start',
        description: 'Begin with pickup coordination, then shape the route around your arrival point, city landmarks, and preferred sightseeing pace.',
      },
      {
        title: 'Midday shoreline and local stops',
        description: 'Use the middle of the day for Marina-side movement, shopping areas, food breaks, or additional city stops based on timing.',
      },
      {
        title: 'Evening return or hotel drop',
        description: 'Close with hotel drop, airport transfer, or a final shoreline stop if time and traffic allow.',
      },
    ],
    imageGallery: [
      destinationMedia.chennai.src,
      travelMedia.family.src,
      travelMedia.hero.src,
    ],
    faqs: [
      {
        question: 'Can this be adjusted to my pickup point?',
        answer: 'Yes. Pickup point, route order, and stop count are reviewed manually after your enquiry.',
      },
      {
        question: 'Is cab included automatically?',
        answer: 'Cab support can be added on request, but vehicle assignment and pricing are shared only after review.',
      },
    ],
  },
  {
    slug: 'mahabalipuram-ecr-day-trip',
    title: 'Mahabalipuram & ECR Day Trip',
    duration: '1 Day',
    suitableFor: 'Families, couples, weekend travellers',
    highlights: ['Shore Temple area', 'ECR drive', 'Coastal sightseeing'],
    inclusions: ['Trip planning assistance', 'Cab arrangement on request', 'Flexible coastal stop review'],
    exclusions: ['Entry tickets', 'Food', 'Personal expenses'],
    priceNote: 'Price shared after enquiry',
    image: destinationMedia.mahabalipuram.src,
    whatsappMessage: 'Hi, I am interested in the Mahabalipuram & ECR Day Trip package.',
    overview: 'A relaxed Chennai-side route for travellers who want an ECR coastal drive, heritage stops, and a simple day-trip structure.',
    itinerary: [
      {
        title: 'Morning departure from Chennai',
        description: 'Start with pickup, then use the morning for the ECR drive and first heritage or shoreline stops.',
      },
      {
        title: 'Midday temple and coastal route',
        description: 'Continue with Mahabalipuram-side sightseeing, photo stops, and meal breaks based on the group pace.',
      },
      {
        title: 'Evening return or extension',
        description: 'Return to Chennai or review a Pondicherry extension if you want a longer coastal plan.',
      },
    ],
    imageGallery: [
      destinationMedia.mahabalipuram.src,
      destinationMedia.puducherry.src,
      travelMedia.family.src,
    ],
    faqs: [
      {
        question: 'Can this include pickup from my hotel or airport?',
        answer: 'Yes. Pickup point and timing can be reviewed along with the route.',
      },
      {
        question: 'Is this package fixed?',
        answer: 'No. It is a planning direction. Final route, timing, and pricing are shaped manually after review.',
      },
    ],
  },
  {
    slug: 'ooty-2-day-family-trip',
    title: 'Ooty 2-Day Family Trip',
    duration: '2 Days / 1 Night',
    suitableFor: 'Families, couples, small groups',
    highlights: ['Hill viewpoints', 'Garden stops', 'Cool-weather drives'],
    inclusions: ['Trip planning assistance', 'Cab arrangement on request', 'Stay preference review'],
    exclusions: ['Entry tickets', 'Food', 'Personal expenses'],
    priceNote: 'Price shared after enquiry',
    image: destinationMedia.ooty.src,
    whatsappMessage: 'Hi, I am interested in the Ooty 2-Day Family Trip package.',
    overview: 'A balanced hill-station plan designed for travellers who want time for viewpoints, soft sightseeing, and one overnight stay without overpacking the route.',
    itinerary: [
      {
        title: 'Day 1: Arrival, hill drive, and stay check-in',
        description: 'Begin with arrival or pickup support, then cover a few flexible Ooty-side stops before settling into the stay area for the evening.',
      },
      {
        title: 'Day 2: Family-friendly sightseeing loop',
        description: 'Use the second day for botanical gardens, viewpoints, and a return plan shaped around the group pace and children if any.',
      },
      {
        title: 'Optional add-ons',
        description: 'Coimbatore transfers, extra stay night, or route extensions can be reviewed as part of the same enquiry.',
      },
    ],
    imageGallery: [
      destinationMedia.ooty.src,
      travelMedia.family.src,
      travelMedia.waterfall.src,
    ],
    faqs: [
      {
        question: 'Can this include room support too?',
        answer: 'Yes. Room or resort options can be reviewed along with cab and sightseeing requirements.',
      },
      {
        question: 'Is this package fixed?',
        answer: 'No. It is a planning direction. Final route, timing, and pricing are shaped manually after review.',
      },
    ],
  },
  {
    slug: 'kodaikanal-stay-sightseeing-plan',
    title: 'Kodaikanal Stay + Sightseeing Plan',
    duration: '2 to 3 Days',
    suitableFor: 'Couples, families, relaxed hill travellers',
    highlights: ['Lake area stay', 'Scenic drives', 'Relaxed local sightseeing'],
    inclusions: ['Stay preference review', 'Private trip planning support'],
    exclusions: ['Decor, meals, and room add-ons unless discussed'],
    priceNote: 'Price shared after enquiry',
    image: destinationMedia.kodaikanal.src,
    whatsappMessage: 'Hi, I am interested in the Kodaikanal Stay + Sightseeing Plan package.',
    overview: 'A slower-paced option for travellers who want a blend of stay time, scenic movement, and a lighter Kodaikanal sightseeing schedule.',
    itinerary: [
      {
        title: 'Arrival and check-in support',
        description: 'The first half focuses on arrival, room preference coordination, and a comfortable transition into the stay.',
      },
      {
        title: 'Leisure sightseeing and scenic route time',
        description: 'The next day can include soft sightseeing, lake or hill-area stops, and a relaxed travel pace.',
      },
      {
        title: 'Departure planning',
        description: 'Check-out timing, return route, and transfer support are shaped around your preferred departure plan.',
      },
    ],
    imageGallery: [
      destinationMedia.kodaikanal.src,
      travelMedia.stay.src,
      travelMedia.hero.src,
    ],
    faqs: [
      {
        question: 'Can I ask for stay-only suggestions first?',
        answer: 'Yes. You can use the same enquiry to ask only for stay options before adding sightseeing support.',
      },
      {
        question: 'Do you show final package prices online?',
        answer: 'No. Final pricing is shared after dates, stay preference, and travel support needs are reviewed.',
      },
    ],
  },
  {
    slug: 'chennai-airport-pickup-tamil-nadu-tour',
    title: 'Chennai Airport Pickup + Tamil Nadu Tour',
    duration: 'Flexible',
    suitableFor: 'Airport arrival travellers, families, first-time visitors',
    highlights: ['Arrival support', 'Transfer planning', 'Stay-based sightseeing'],
    inclusions: ['Pickup planning', 'Cab discussion', 'Travel timing coordination'],
    exclusions: ['Flight changes, tickets, meals, personal expenses'],
    priceNote: 'Price shared after enquiry',
    image: travelMedia.airport.src,
    whatsappMessage: 'Hi, I am interested in the Chennai Airport Pickup + Tamil Nadu Tour package.',
    overview: 'A useful option for customers arriving by air who want Chennai pickup support plus an onward Tamil Nadu sightseeing or stay plan in one enquiry.',
    itinerary: [
      {
        title: 'Arrival tracking and pickup coordination',
        description: 'Pickup support is reviewed around airport, arrival time, luggage, and onward route preference.',
      },
      {
        title: 'Transfer into stay area',
        description: 'After the transfer, the route can include light stops or go directly to the stay depending on energy and arrival time.',
      },
      {
        title: 'Sightseeing based on available days',
        description: 'The local plan is adjusted around the remaining travel window and preferred pace.',
      },
    ],
    imageGallery: [
      travelMedia.airport.src,
      destinationMedia.chennai.src,
      destinationMedia.coimbatore.src,
    ],
    faqs: [
      {
        question: 'Can I request a specific vehicle type?',
        answer: 'Yes. Vehicle preference can be added, but final assignment depends on date, route, and availability.',
      },
      {
        question: 'Can this include return airport drop too?',
        answer: 'Yes. Mention both arrival and return needs in the enquiry so they can be reviewed together.',
      },
    ],
  },
  {
    slug: 'custom-group-trip',
    title: 'Custom South India Group Trip',
    duration: 'Flexible',
    suitableFor: 'Friends, office groups, large family plans',
    highlights: ['Multi-service planning', 'Tempo traveller support', 'Flexible itinerary discussion'],
    inclusions: ['Cab, stay, and route review based on your requirement'],
    exclusions: ['Entry tickets', 'Food', 'Paid activities', 'Personal expenses'],
    priceNote: 'Price shared after enquiry',
    image: travelMedia.group.src,
    whatsappMessage: 'Hi, I am interested in the Custom South India Group Trip package.',
    overview: 'A broad planning path for groups that need mixed services such as transport, room support, and custom South India route decisions in one place.',
    itinerary: [
      {
        title: 'Requirement collection first',
        description: 'The first step is understanding headcount, date window, room mix, vehicle size, and destination priorities.',
      },
      {
        title: 'Route and resource matching',
        description: 'The plan is then shaped around vehicle type, timing, luggage, and stay preference rather than a fixed public package.',
      },
      {
        title: 'Manual quote and confirmation flow',
        description: 'Quote, assignment, and final confirmation happen only after back-and-forth review with the team.',
      },
    ],
    imageGallery: [
      travelMedia.group.src,
      travelMedia.family.src,
      destinationMedia.mysuru.src,
    ],
    faqs: [
      {
        question: 'Can group stay and transport be handled together?',
        answer: 'Yes. This package direction is specifically for mixed requirements that need manual coordination.',
      },
      {
        question: 'Do I need exact headcount before enquiring?',
        answer: 'No. Estimated group size is enough to start; final details can be refined during follow-up.',
      },
    ],
  },
].map((pkg) => ({
  ...pkg,
  image: optimizeUnsplashUrl(pkg.image, 1200),
  imageGallery: pkg.imageGallery.map((image) => optimizeUnsplashUrl(image, 1200)),
}));

export function buildDestinationEnquiryState(destination) {
  return {
    destination: destination.name,
    mustVisitPlaces: destination.name,
  };
}

export function buildPackageEnquiryState(pkg) {
  return {
    packageName: pkg.title,
    packageDuration: pkg.duration,
    destination: pkg.title,
    mustVisitPlaces: pkg.highlights.join(', '),
  };
}

export function getPackageBySlug(slug) {
  return featuredPackages.find((pkg) => pkg.slug === slug);
}
