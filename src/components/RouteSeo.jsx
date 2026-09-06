import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPackageBySlug } from '../content/travelCatalog';
import {
  buildAbsoluteUrl,
  createTravelAgencySchema,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_IMAGE_PATH,
  SITE_NAME,
} from '../utils/seo';

function ensureMetaAttribute(attribute, value) {
  let element = document.head.querySelector(`meta[${attribute}="${value}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }

  return element;
}

function setMetaName(name, content) {
  const element = ensureMetaAttribute('name', name);
  element.setAttribute('content', content);
}

function setMetaProperty(property, content) {
  const element = ensureMetaAttribute('property', property);
  element.setAttribute('content', content);
}

function setCanonicalLink(href) {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

function setStructuredData(schema) {
  const existing = document.getElementById('seo-structured-data');

  if (!schema) {
    if (existing) existing.remove();
    return;
  }

  const element = existing || document.createElement('script');
  element.id = 'seo-structured-data';
  element.type = 'application/ld+json';
  element.textContent = JSON.stringify(schema);

  if (!existing) {
    document.head.appendChild(element);
  }
}

function getSeoForPath(pathname) {
  const seoMap = {
    '/': {
      title: 'Home | Chennai and South India Travel Enquiries',
      description: 'Submit your travel enquiry for Chennai, Tamil Nadu, and nearby South India cab support, room assistance, tour packages, airport transfers, and custom trip planning. Manual confirmation after review.',
    },
    '/about': {
      title: `About | ${SITE_NAME} Travel Service Information`,
      description: 'Learn how Velvet Pearl supports cab, stay, tour, and custom trip enquiries with direct follow-up and manual confirmation before travel.',
    },
    '/services': {
      title: 'Services | Cab, Room, Tour and Custom Trip Enquiries',
      description: 'Explore Velvet Pearl travel support for cab services, room assistance, tour packages, custom trip planning, and WhatsApp follow-up.',
    },
    '/routes': {
      title: 'Routes | Popular Travel Route Enquiries and Planning',
      description: 'Browse frequently requested routes, estimate pickup and drop locations, and send cab or custom route enquiries for review.',
    },
    '/contact': {
      title: 'Contact | Travel Enquiry and WhatsApp Support',
      description: 'Contact Velvet Pearl for general travel enquiries, service clarification, WhatsApp support, and direct follow-up on cab, room, or tour requirements.',
    },
    '/book/cab': {
      title: 'Cab Enquiry | Airport Pickup, Local Sightseeing and Outstation Trips',
      description: 'Submit your cab enquiry for airport pickup, airport drop, local sightseeing, outstation routes, one-way transfers, and round trips. Manual confirmation after review.',
    },
    '/book/room': {
      title: 'Room Enquiry | Stay Assistance for Chennai and South India Trips',
      description: 'Share your stay dates, guests, room count, and budget to get room or stay assistance for Chennai stopovers, Tamil Nadu hill stations, and broader South India routes.',
    },
    '/book/tour': {
      title: 'Tour Packages | Chennai, Tamil Nadu and South India Travel Planning',
      description: 'Submit a tour package enquiry for Chennai, Tamil Nadu, and nearby South India travel planning, custom itineraries, group trips, sightseeing ideas, and manual quote review.',
    },
    '/book/event': {
      title: 'Custom Enquiry | Family, Group and Special Travel Plans',
      description: 'Send a custom trip enquiry for family travel, group trips, corporate travel, event travel, or mixed service planning with direct follow-up.',
    },
    '/admin': {
      title: `Admin Login | ${SITE_NAME}`,
      description: 'Secure admin access for enquiry management.',
      noindex: true,
      schema: null,
    },
    '/admin/dashboard': {
      title: `Admin Dashboard | ${SITE_NAME}`,
      description: 'Operational dashboard for manual enquiry fulfilment.',
      noindex: true,
      schema: null,
    },
  };

  if (pathname.startsWith('/packages/')) {
    const slug = pathname.split('/')[2];
    const pkg = getPackageBySlug(slug);

    if (pkg) {
      return {
        title: `${pkg.title} | South India Tour Package Details`,
        description: `${pkg.overview} View highlights, itinerary, inclusions, exclusions, and submit an enquiry for ${pkg.title}.`,
        image: pkg.image,
        type: 'article',
      };
    }
  }

  return seoMap[pathname] || {
    title: `${SITE_NAME} | Travel Enquiries`,
    description: DEFAULT_SEO_DESCRIPTION,
  };
}

export default function RouteSeo() {
  const location = useLocation();

  useEffect(() => {
    const seo = getSeoForPath(location.pathname);
    const title = seo.title;
    const description = seo.description || DEFAULT_SEO_DESCRIPTION;
    const canonicalUrl = buildAbsoluteUrl(location.pathname);
    const imageUrl = buildAbsoluteUrl(seo.image || DEFAULT_SEO_IMAGE_PATH);
    const ogType = seo.type || 'website';
    const robotsValue = seo.noindex ? 'noindex, nofollow' : 'index, follow';
    const schema = Object.prototype.hasOwnProperty.call(seo, 'schema') ? seo.schema : createTravelAgencySchema();

    document.title = title;
    setMetaName('description', description);
    setMetaName('robots', robotsValue);
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', imageUrl);
    setMetaProperty('og:title', title);
    setMetaProperty('og:description', description);
    setMetaProperty('og:image', imageUrl);
    setMetaProperty('og:url', canonicalUrl);
    setMetaProperty('og:type', ogType);
    setCanonicalLink(canonicalUrl);
    setStructuredData(schema);
  }, [location.pathname]);

  return null;
}
