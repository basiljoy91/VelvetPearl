import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPublicRouteSeo } from '../content/siteMetadata.js';
import {
  buildAbsoluteUrl,
  createFaqSchema,
  createItinerarySchema,
  createPageSchema,
  createServiceSchema,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_IMAGE_PATH,
  SITE_LOCALE,
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
  const privateSeoMap = {
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

  if (Object.prototype.hasOwnProperty.call(privateSeoMap, pathname)) {
    return privateSeoMap[pathname];
  }

  const publicSeo = getPublicRouteSeo(pathname);

  if (publicSeo) {
    return publicSeo;
  }

  return {
    title: `${SITE_NAME} | Travel Enquiries`,
    description: DEFAULT_SEO_DESCRIPTION,
  };
}

function buildSchemaForRoute(pathname, seo) {
  if (Object.prototype.hasOwnProperty.call(seo, 'schema')) {
    return seo.schema;
  }

  const imagePath = seo.image || DEFAULT_SEO_IMAGE_PATH;
  const extraEntities = [];

  if (seo.serviceType) {
    extraEntities.push(createServiceSchema({
      pathname,
      name: seo.title,
      description: seo.description,
      serviceType: seo.serviceType,
      imagePath,
    }));
  }

  if (seo.packageData) {
    extraEntities.push(createItinerarySchema(pathname, seo.packageData.title, seo.packageData.itinerary));
    extraEntities.push(createFaqSchema(pathname, seo.packageData.faqs));
  }

  return createPageSchema({
    pathname,
    title: seo.title,
    description: seo.description || DEFAULT_SEO_DESCRIPTION,
    imagePath,
    pageType: seo.schemaType,
    breadcrumbs: seo.breadcrumbs,
    extraEntities,
  });
}

export default function RouteSeo() {
  const location = useLocation();

  useEffect(() => {
    const seo = getSeoForPath(location.pathname);
    const title = seo.title;
    const description = seo.description || DEFAULT_SEO_DESCRIPTION;
    const canonicalUrl = buildAbsoluteUrl(location.pathname);
    const imageUrl = buildAbsoluteUrl(seo.image || DEFAULT_SEO_IMAGE_PATH);
    const ogType = seo.ogType || seo.type || 'website';
    const robotsValue = seo.noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    const schema = buildSchemaForRoute(location.pathname, seo);

    document.title = title;
    setMetaName('author', SITE_NAME);
    setMetaName('description', description);
    setMetaName('robots', robotsValue);
    setMetaName('googlebot', robotsValue);
    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);
    setMetaName('twitter:image', imageUrl);
    setMetaProperty('og:title', title);
    setMetaProperty('og:description', description);
    setMetaProperty('og:image', imageUrl);
    setMetaProperty('og:image:alt', title);
    setMetaProperty('og:locale', SITE_LOCALE);
    setMetaProperty('og:site_name', SITE_NAME);
    setMetaProperty('og:url', canonicalUrl);
    setMetaProperty('og:type', ogType);
    setCanonicalLink(canonicalUrl);
    setStructuredData(schema);
  }, [location.pathname]);

  return null;
}
