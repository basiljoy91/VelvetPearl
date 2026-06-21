import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  coreSiteRoutes,
  enquirySiteRoutes,
  llmsRouteGroups,
  packageSiteRoutes,
} from '../src/content/siteMetadata.js';
import { SUPPORT_EMAIL } from '../src/utils/contact.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const defaultSiteUrl = 'https://velvetpearl.in';
const siteUrl = (process.env.VITE_SITE_URL || defaultSiteUrl).trim().replace(/\/$/, '') || defaultSiteUrl;

const sitemapDefinitions = [
  {
    filename: 'sitemap-pages.xml',
    routes: coreSiteRoutes,
  },
  {
    filename: 'sitemap-enquiries.xml',
    routes: enquirySiteRoutes,
  },
  {
    filename: 'sitemap-packages.xml',
    routes: packageSiteRoutes,
  },
];

function escapeXml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function buildAbsoluteUrl(urlOrPath) {
  return new URL(urlOrPath, `${siteUrl}/`).toString();
}

function getRouteImages(route) {
  return Array.from(new Set([...(route.images || []), route.image].filter(Boolean)));
}

async function resolveRouteLastmod(route) {
  const sourcePaths = route.sourcePaths || [];

  if (!sourcePaths.length) {
    return formatDate(Date.now());
  }

  const dates = await Promise.all(sourcePaths.map(async (relativePath) => {
    try {
      const stats = await fs.stat(path.join(projectRoot, relativePath));
      return formatDate(stats.mtime);
    } catch {
      return null;
    }
  }));

  return dates.filter(Boolean).sort().at(-1) || formatDate(Date.now());
}

function buildImageXml(route) {
  const images = getRouteImages(route);

  if (!images.length) {
    return '';
  }

  return `\n${images.map((image) => `    <image:image>
      <image:loc>${escapeXml(buildAbsoluteUrl(image))}</image:loc>
      <image:title>${escapeXml(route.title)}</image:title>
    </image:image>`).join('\n')}`;
}

function buildUrlEntry(route, lastmod) {
  return `  <url>
    <loc>${escapeXml(buildAbsoluteUrl(route.path))}</loc>
    <lastmod>${lastmod}</lastmod>${buildImageXml(route)}
  </url>`;
}

function buildSitemapXml(routeEntries) {
  const usesImages = routeEntries.some(({ route }) => getRouteImages(route).length > 0);
  const imageNamespace = usesImages ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNamespace}>
${routeEntries.map(({ route, lastmod }) => buildUrlEntry(route, lastmod)).join('\n')}
</urlset>
`;
}

function buildSitemapIndexXml(sitemapEntries) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map((entry) => `  <sitemap>
    <loc>${escapeXml(buildAbsoluteUrl(entry.filename))}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>
`;
}

function buildLlmsTxt() {
  const sections = llmsRouteGroups.flatMap((group) => [
    `## ${group.title}`,
    ...group.routes.map((route) => `- [${route.title}](${buildAbsoluteUrl(route.path)}): ${route.llmsDescription}`),
    '',
  ]);

  return [
    '# Velvet Pearl',
    '',
    '> Travel enquiry-first support for Chennai, Tamil Nadu, and South India cab trips, room stays, tour planning, custom travel, and approved customer feedback.',
    '',
    `Website: ${buildAbsoluteUrl('/')}`,
    `Support email: ${SUPPORT_EMAIL}`,
    'Support phone: +91 78450 39353',
    'Primary service area: Chennai, Tamil Nadu, South India',
    '',
    ...sections,
  ].join('\n').trimEnd() + '\n';
}

const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/

Sitemap: ${buildAbsoluteUrl('/sitemap.xml')}
`;

await fs.mkdir(publicDir, { recursive: true });

const sitemapEntries = [];

for (const definition of sitemapDefinitions) {
  const routeEntries = await Promise.all(definition.routes.map(async (route) => ({
    route,
    lastmod: await resolveRouteLastmod(route),
  })));
  const lastmod = routeEntries.map((entry) => entry.lastmod).sort().at(-1) || formatDate(Date.now());
  const sitemapXml = buildSitemapXml(routeEntries);

  await fs.writeFile(path.join(publicDir, definition.filename), sitemapXml, 'utf8');
  sitemapEntries.push({
    filename: definition.filename,
    lastmod,
  });
}

await fs.writeFile(path.join(publicDir, 'sitemap.xml'), buildSitemapIndexXml(sitemapEntries), 'utf8');
await fs.writeFile(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');
await fs.writeFile(path.join(publicDir, 'llms.txt'), buildLlmsTxt(), 'utf8');
