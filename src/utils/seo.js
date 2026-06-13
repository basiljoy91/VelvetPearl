export const SITE_NAME = 'Velvet Pearl';
export const DEFAULT_SEO_IMAGE_PATH = '/og-cover.png';
export const DEFAULT_SEO_DESCRIPTION = 'Submit your travel enquiry for cab booking, room assistance, tour packages, airport transfers, and custom trip planning. Manual confirmation after review.';
export const DEFAULT_SITE_URL = 'http://localhost:4173';

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

export function createTravelAgencySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: SITE_NAME,
    url: buildAbsoluteUrl('/'),
    telephone: '+91 78450 39353',
    image: buildAbsoluteUrl(DEFAULT_SEO_IMAGE_PATH),
    description: DEFAULT_SEO_DESCRIPTION,
  };
}
