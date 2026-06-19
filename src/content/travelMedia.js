const southIndiaHero = '/travel/south-india-hero.webp';
const waterfallDestination = '/travel/waterfall-destination.webp';
const familySightseeing = '/travel/family-sightseeing.webp';
const airportTransfer = '/travel/airport-transfer.webp';
const resortStay = '/travel/resort-stay.webp';
const groupTravel = '/travel/group-travel.webp';
const sedanCab = '/travel/sedan-cab.webp';
const suvCab = '/travel/suv-cab.webp';
const tempoTraveller = '/travel/tempo-traveller.webp';
const chennaiDestination = '/travel/destinations/chennai.webp';
const mahabalipuramDestination = '/travel/destinations/mahabalipuram.webp';
const puducherryDestination = '/travel/destinations/puducherry.webp';
const ootyDestination = '/travel/destinations/ooty.webp';
const kodaikanalDestination = '/travel/destinations/kodaikanal.webp';
const coimbatoreDestination = '/travel/destinations/coimbatore.webp';
const mysuruDestination = '/travel/destinations/mysuru.webp';
const maduraiDestination = '/travel/destinations/madurai.webp';

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

export const travelMedia = {
  hero: {
    src: southIndiaHero,
    alt: 'Scenic hill road through misty green South India hills after light rain',
  },
  waterfall: {
    src: waterfallDestination,
    alt: 'Lush waterfall surrounded by forest and rocks in a South India travel landscape',
  },
  family: {
    src: familySightseeing,
    alt: 'Family at a hill viewpoint beside a travel vehicle during a South India sightseeing stop',
  },
  airport: {
    src: airportTransfer,
    alt: 'Travellers loading luggage into a vehicle for an airport-style transfer in a green hill district',
  },
  stay: {
    src: resortStay,
    alt: 'Warm hotel room with a large window opening to a green hill view',
  },
  group: {
    src: groupTravel,
    alt: 'Small travel group at a scenic hill viewpoint near a vehicle during a day trip',
  },
};

export const destinationMedia = {
  chennai: {
    src: chennaiDestination,
    alt: 'Marina Beach promenade in Chennai during golden sunrise',
  },
  mahabalipuram: {
    src: mahabalipuramDestination,
    alt: 'Shore Temple style heritage monument facing the sea in Mahabalipuram',
  },
  puducherry: {
    src: puducherryDestination,
    alt: 'French quarter style seaside promenade in Puducherry',
  },
  ooty: {
    src: ootyDestination,
    alt: 'Tea gardens and misty hill roads in Ooty',
  },
  kodaikanal: {
    src: kodaikanalDestination,
    alt: 'Kodaikanal lake with boats and pine-covered hills',
  },
  coimbatore: {
    src: coimbatoreDestination,
    alt: 'Coimbatore highway with city skyline and Western Ghats backdrop',
  },
  mysuru: {
    src: mysuruDestination,
    alt: 'Mysuru palace style heritage building in warm evening light',
  },
  madurai: {
    src: maduraiDestination,
    alt: 'Madurai temple towers glowing at sunset above the city',
  },
};

export const vehicleMedia = {
  sedan: {
    src: sedanCab,
    alt: 'White sedan with luggage parked outside a city hotel for pickup or transfer travel',
  },
  suv: {
    src: suvCab,
    alt: 'Family beside a spacious SUV at a hill-view stop during a South India road trip',
  },
  tempoTraveller: {
    src: tempoTraveller,
    alt: 'Tempo traveller minibus parked for a group sightseeing stop with travel bags nearby',
  },
  airportTransfer: {
    src: airportTransfer,
    alt: 'Airport transfer vehicle being loaded with luggage before a pickup or drop run',
  },
};

export const slideshowArchiveMedia = [
  {
    src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    alt: 'Soft mountain valley landscape from the earlier destination cards',
  },
  {
    src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    alt: 'Layered hill view from the earlier destination cards',
  },
  {
    src: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80',
    alt: 'Forest overlook from the earlier destination cards',
  },
  {
    src: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
    alt: 'Cliff and pine valley image from the earlier destination cards',
  },
  {
    src: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
    alt: 'Open tree landscape from the earlier destination cards',
  },
  {
    src: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
    alt: 'Coastal water close-up from the earlier destination cards',
  },
  {
    src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Wide mountain valley scene from the earlier destination cards',
  },
  {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    alt: 'Sunlit scenic destination image from the earlier travel cards',
  },
].map((item) => ({
  ...item,
  src: optimizeUnsplashUrl(item.src),
}));
