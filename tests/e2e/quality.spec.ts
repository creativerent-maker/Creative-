import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { getBrowser, closeBrowser, PREVIEW } from './helpers';
import { localizedPath, locales } from '../../src/i18n/routes';

afterAll(closeBrowser);
let urls: string[] = [];
beforeAll(async () => {
  const xml = await (await fetch(PREVIEW + '/sitemap-0.xml')).text();
  urls = [...xml.matchAll(/<loc>https:\/\/creativerent\.es([^<]*)<\/loc>/g)].map((m) => m[1]);
  for (const l of locales) for (const k of ['aviso-legal', 'privacidad', 'cookies', 'accesibilidad'] as const) urls.push(localizedPath(k, l));
});

const FORBIDDEN = /\b(bodas?|casaments?|weddings?)\b/i;

describe('site-wide quality', () => {
  it('sitemap lists the whole site', () => expect(urls.length).toBeGreaterThan(40));

  it('every page: no forbidden words, zoom allowed, all images have alt, no horizontal scroll at 360px', async () => {
    const problems: string[] = [];
    const page = await (await getBrowser()).newPage({ viewport: { width: 360, height: 800 } });
    for (const u of urls) {
      await page.goto(PREVIEW + u, { waitUntil: 'load' });
      const r = await page.evaluate(() => ({
        text: document.body.innerText,
        viewport: document.querySelector('meta[name=viewport]')?.getAttribute('content') ?? '',
        noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).map((i) => i.src),
        wide: document.documentElement.scrollWidth > innerWidth,
      }));
      if (FORBIDDEN.test(r.text)) problems.push(`${u}: forbidden word`);
      if (/user-scalable\s*=\s*(0|no)|maximum-scale\s*=\s*1(\.0)?\b/.test(r.viewport)) problems.push(`${u}: zoom blocked`);
      if (r.noAlt.length) problems.push(`${u}: img without alt ${r.noAlt[0]}`);
      if (r.wide) problems.push(`${u}: horizontal scroll`);
    }
    await page.close();
    expect(problems).toEqual([]);
  }, 300000);

  it('no broken internal links', async () => {
    const page = await (await getBrowser()).newPage();
    const hrefs = new Set<string>();
    for (const u of urls) {
      await page.goto(PREVIEW + u, { waitUntil: 'domcontentloaded' });
      for (const h of await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')!))) hrefs.add(h.split('#')[0]);
    }
    await page.close();
    const broken: string[] = [];
    for (const h of hrefs) { const r = await fetch(PREVIEW + h); if (r.status !== 200) broken.push(`${h} -> ${r.status}`); }
    expect(broken).toEqual([]);
  }, 300000);
});
