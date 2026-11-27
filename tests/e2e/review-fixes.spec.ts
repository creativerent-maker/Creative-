import { describe, it, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import { getBrowser, closeBrowser, PREVIEW, PROD } from './helpers';
afterAll(closeBrowser);

describe('review fixes', () => {
  it('production output ships no example assets', () => {
    const files = fs.readdirSync('dist-prod/_astro');
    const bad = files.filter((f) => /^(portada|fiesta-mayor|jornada|convencion|congreso|concierto|microfono|presentacion|ejemplo-)/.test(f));
    expect(bad).toEqual([]);
  });

  it('photos are served with AVIF and WebP sources', async () => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PREVIEW + '/');
    expect(await page.locator('.hero source[type="image/avif"]').count()).toBe(1);
    expect(await page.locator('.work-card source[type="image/avif"]').count()).toBe(4);
    await page.close();
  });

  it('client carousel has no pause button and still pauses on hover', async () => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PREVIEW + '/');
    expect(await page.locator('.marquee-toggle').count()).toBe(0);
    await page.locator('.marquee').hover();
    const state = await page.locator('.marquee-track').evaluate((el) => getComputedStyle(el).animationPlayState);
    expect(state).toBe('paused');
    await page.close();
  });

  it('sitemap omits untranslated work URLs in ca/en but keeps the es one', async () => {
    const xml = await (await fetch(PREVIEW + '/sitemap-0.xml')).text();
    expect(xml).toContain('https://creativerent.es/trabajos/ejemplo-presentacion-nuevo-modelo/');
    expect(xml).not.toContain('/ca/treballs/ejemplo-presentacion-nuevo-modelo/');
    expect(xml).not.toContain('/en/projects/ejemplo-presentacion-nuevo-modelo/');
    expect(xml).toContain('/ca/treballs/ejemplo-congreso-nacional/');
  });

  it.each(['/aviso-legal/', '/ca/avis-legal/', '/en/legal-notice/', '/privacidad/'])('%s shows the real company data and is indexable in production', async (u) => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PROD + u);
    const text = await page.locator('main').innerText();
    expect(text).toContain('Creative Rent, S.L.U.');
    expect(text).toContain('B55562714');
    expect(text).toContain('C/ Campsrodons, nave 14, 43110 La Canonja (Tarragona)');
    expect(text).not.toMatch(/\[(RAZÓN SOCIAL|CIF|DOMICILIO SOCIAL)\]/);
    expect(await page.locator('meta[name=robots][content=noindex]').count()).toBe(0);
    await page.close();
  });
});

describe('webempresa hosting', () => {
  it('contact form posts to the PHP endpoint with a hidden honeypot and no Cloudflare scripts', async () => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PREVIEW + '/contacto/');
    expect(await page.locator('form#presupuesto').getAttribute('data-endpoint')).toBe('/api/presupuesto.php');
    const hp = page.locator('form#presupuesto input[name=web]');
    expect(await hp.count()).toBe(1);
    expect(await hp.isVisible()).toBe(false);
    expect(await hp.getAttribute('tabindex')).toBe('-1');
    expect(await page.locator('script[src*="challenges.cloudflare.com"]').count()).toBe(0);
    await page.close();
  });

  it('test (preview) builds are hidden from search engines', async () => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PREVIEW + '/');
    expect(await page.locator('meta[name=robots][content=noindex]').count()).toBe(1);
    await page.close();
    expect(await (await fetch(PREVIEW + '/robots.txt')).text()).toContain('Disallow: /');
  });

  it('production build is indexable and ships .htaccess with the legacy redirects', async () => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PROD + '/');
    expect(await page.locator('meta[name=robots][content=noindex]').count()).toBe(0);
    await page.close();
    const ht = fs.readFileSync('dist-prod/.htaccess', 'utf8');
    expect(ht).toContain('ErrorDocument 404 /404.html');
    expect(ht).toContain('RewriteRule ^project/ /trabajos/ [R=301,L]');
    expect(ht).toContain('RewriteRule ^mapping/?$ /servicios/mapping/ [R=301,L]');
  });
});
