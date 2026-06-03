import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { featuredPackages } from '../src/content/travelCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const siteUrl = (process.env.VITE_SITE_URL || 'http://localhost:4173').replace(/\/$/, '');
const isDefaultLocalSiteUrl = siteUrl === 'http://localhost:4173';
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

if (isDefaultLocalSiteUrl) {
  console.warn('[seo] VITE_SITE_URL is not set. sitemap.xml and robots.txt will use http://localhost:4173.');
}

const publicRoutes = [
  '/',
  '/about',
  '/services',
  '/routes',
  '/contact',
  '/book/cab',
  '/book/room',
  '/book/tour',
  '/book/event',
  ...featuredPackages.map((pkg) => `/packages/${pkg.slug}`),
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes.map((route) => `  <url>
    <loc>${siteUrl}${route}</loc>
    <lastmod>${today}</lastmod>
  </url>`).join('\n')}
</urlset>
`;

const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/dashboard

Sitemap: ${siteUrl}/sitemap.xml
`;

await fs.mkdir(publicDir, { recursive: true });
await fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
await fs.writeFile(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');
