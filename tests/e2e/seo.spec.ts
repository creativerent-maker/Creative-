import { describe, it, expect, afterAll } from 'vitest';
import { getBrowser, closeBrowser, PREVIEW, PROD } from './helpers';
afterAll(closeBrowser);

async function head(url: string) {
  const page = await (await getBrowser()).newPage();
  await page.goto(url);
  const data = await page.evaluate(() => ({
    canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href'),
    hreflang: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => l.getAttribute('hreflang')),
    jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent!)),
  }));
  await page.close();
  return data;
}

describe('seo', () => {
  it('home has hreflang es/ca/en/x-default and LocalBusiness JSON-LD', async () => {
    const h = await head(PREVIEW + '/');
    expect(h.hreflang.sort()).toEqual(['ca', 'en', 'es', 'x-default']);
    const lb = h.jsonld.flatMap((j) => j['@graph'] ?? [j]).find((j) => j['@type'] === 'LocalBusiness');
    expect(lb.telephone).toBe('+34977199720');
    expect(lb.address.streetAddress).toBe('C/ Campsrodons, nave 14');
    expect(lb.address.postalCode).toBe('43110');
  });

  it('spanish-only work seen in /ca/: no ca hreflang, canonical points to es', async () => {
    const h = await head(PREVIEW + '/ca/treballs/ejemplo-presentacion-nuevo-modelo/');
    expect(h.hreflang).not.toContain('ca');
    expect(h.canonical).toBe('https://creativerent.es/trabajos/ejemplo-presentacion-nuevo-modelo/');
  });

  it('service page has Service JSON-LD and breadcrumbs', async () => {
    const h = await head(PREVIEW + '/servicios/mapping/');
    const types = h.jsonld.flatMap((j) => j['@graph'] ?? [j]).map((j) => j['@type']);
    expect(types).toContain('Service');
    expect(types).toContain('BreadcrumbList');
  });

  it('production sitemap exists and lists no example pages', async () => {
    const idx = await fetch(PROD + '/sitemap-index.xml');
    expect(idx.status).toBe(200);
    const xml = await (await fetch(PROD + '/sitemap-0.xml')).text();
    expect(xml).toContain('https://creativerent.es/servicios/');
    expect(xml).not.toContain('ejemplo');
  });

  it('robots.txt points to the sitemap', async () => {
    const txt = await (await fetch(PROD + '/robots.txt')).text();
    expect(txt).toContain('Sitemap: https://creativerent.es/sitemap-index.xml');
  });

  it('_redirects is published', async () => {
    const r = await fetch(PROD + '/_redirects');
    expect(await r.text()).toContain('/project/* /trabajos/ 301');
  });
});
