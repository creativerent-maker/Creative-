import { describe, it, expect, afterAll } from 'vitest';
import fs from 'node:fs';
import { getBrowser, closeBrowser, PREVIEW } from './helpers';
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

  it('client carousel has a pause button that stops the animation', async () => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PREVIEW + '/');
    const btn = page.locator('.marquee-toggle');
    expect(await btn.getAttribute('aria-pressed')).toBe('false');
    await btn.click();
    expect(await btn.getAttribute('aria-pressed')).toBe('true');
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
});
