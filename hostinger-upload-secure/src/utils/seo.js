import { SUPPORT_EMAIL } from './contact';
import { siteServiceAreas } from '../content/siteMetadata.js';

export const SITE_NAME = 'Velvet Pearl';
export const SITE_LANGUAGE = 'en-IN';
export const SITE_LOCALE = 'en_IN';
export const SUPPORT_PHONE = '+91 78450 39353';
export const DEFAULT_SEO_IMAGE_PATH = '/og-cover.png';
export const DEFAULT_SEO_DESCRIPTION = 'Travel enquiry support for Chennai, Tamil Nadu, and South India cab bookings, airport transfers, room assistance, tour planning, custom trips, and approved customer feedback.';
export const DEFAULT_SITE_URL = 'https://velvetpearl.in';

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ''));
}

function buildAreaServedEntity(area) {
  if (area.type === 'City') {
    return compactObject({
      '@type': 'City',
      name: area.name,
      containedInPlace: area.region
        ? {
            '@type': 'State',
            name: area.region,
            addressCountry: area.country,
          }
        : undefined,
      addressCountry: area.country,
    });
  }

  if (area.type === 'State') {
    return compactObject({
      '@type': 'State',
      name: area.name,
      addressCountry: area.country,
    });
  }

  return compactObject({
    '@type': 'Place',
    name: area.name,
    addressCountry: area.country,
  });
}

function buildImageObject(imagePath, caption) {
  return compactObject({
    '@type': 'ImageObject',
    url: buildAbsoluteUrl(imagePath),
    caption,
  });
}

function buildBusinessId() {
  return `${buildAbsoluteUrl('/')}#travel-agency`;
}

function buildWebsiteId() {
  return `${buildAbsoluteUrl('/')}#website`;
}

export function getSiteOrigin() {
  const configuredSiteUrl = (import.meta.env.VITE_SITE_URL || '').trim().replace(/\/$/, '');

  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return DEFAULT_SITE_URL;
}

export function buildAbsoluteUrl(path = '/') {
  const siteOrigin = getSiteOrigin();
  return new URL(path, siteOrigin).toString();
}

export function createCoreSchemaGraph() {
  const areaServed = siteServiceAreas.map(buildAreaServedEntity);

  return [
    {
      '@type': 'WebSite',
      '@id': buildWebsiteId(),
      url: buildAbsoluteUrl('/'),
      name: SITE_NAME,
      description: DEFAULT_SEO_DESCRIPTION,
      inLanguage: SITE_LANGUAGE,
      publisher: {
        '@id': buildBusinessId(),
      },
    },
    {
      '@type': 'TravelAgency',
      '@id': buildBusinessId(),
      name: SITE_NAME,
      url: buildAbsoluteUrl('/'),
      telephone: SUPPORT_PHONE,
      email: SUPPORT_EMAIL,
      image: buildAbsoluteUrl(DEFAULT_SEO_IMAGE_PATH),
      logo: buildAbsoluteUrl('/apple-touch-icon.png'),
      description: DEFAULT_SEO_DESCRIPTION,
      areaServed,
      serviceArea: areaServed,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone: SUPPORT_PHONE,
          email: SUPPORT_EMAIL,
          url: buildAbsoluteUrl('/contact'),
          availableLanguage: 'English',
          areaServed: 'IN',
        },
      ],
      makesOffer: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Cab booking enquiry',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Room and stay enquiry',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Tour package enquiry',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Custom travel enquiry',
          },
        },
      ],
    },
  ];
}

export function createBreadcrumbSchema(pathname, items = []) {
  if (!items.length) return null;

  return {
    '@type': 'BreadcrumbList',
    '@id': `${buildAbsoluteUrl(pathname)}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.path),
    })),
  };
}

export function createServiceSchema({
  pathname,
  name,
  description,
  serviceType,
  imagePath,
}) {
  return compactObject({
    '@type': 'Service',
    '@id': `${buildAbsoluteUrl(pathname)}#service`,
    name,
    description,
    serviceType,
    provider: {
      '@id': buildBusinessId(),
    },
    areaServed: siteServiceAreas.map(buildAreaServedEntity),
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: buildAbsoluteUrl(pathname),
    },
    image: imagePath ? [buildAbsoluteUrl(imagePath)] : undefined,
  });
}

export function createItinerarySchema(pathname, title, itinerary = []) {
  if (!itinerary.length) return null;

  return {
    '@type': 'ItemList',
    '@id': `${buildAbsoluteUrl(pathname)}#itinerary`,
    name: `${title} itinerary`,
    itemListElement: itinerary.map((item, index) => compactObject({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title,
      description: item.description,
    })),
  };
}

export function createFaqSchema(pathname, faqs = []) {
  if (!faqs.length) return null;

  return {
    '@type': 'FAQPage',
    '@id': `${buildAbsoluteUrl(pathname)}#faq`,
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function createPageSchema({
  pathname,
  title,
  description,
  imagePath = DEFAULT_SEO_IMAGE_PATH,
  pageType = 'WebPage',
  breadcrumbs = [],
  extraEntities = [],
}) {
  const pageUrl = buildAbsoluteUrl(pathname);
  const graph = [
    ...createCoreSchemaGraph(),
    compactObject({
      '@type': pageType,
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      inLanguage: SITE_LANGUAGE,
      isPartOf: {
        '@id': buildWebsiteId(),
      },
      about: {
        '@id': buildBusinessId(),
      },
      primaryImageOfPage: imagePath ? buildImageObject(imagePath, title) : undefined,
      breadcrumb: breadcrumbs.length
        ? {
            '@id': `${pageUrl}#breadcrumb`,
          }
        : undefined,
    }),
  ];

  const breadcrumbSchema = createBreadcrumbSchema(pathname, breadcrumbs);

  if (breadcrumbSchema) {
    graph.push(breadcrumbSchema);
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [...graph, ...extraEntities.filter(Boolean)],
  };
}
