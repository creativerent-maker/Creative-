import { describe, it, expect, afterAll } from 'vitest';
import { getBrowser, closeBrowser, PREVIEW, PROD } from './helpers';

afterAll(closeBrowser);

describe('home', () => {
  for (const p of ['/', '/ca/', '/en/']) {
    it(`${p} responds 200 with exactly one h1`, async () => {
      const page = await (await getBrowser()).newPage();
      const res = await page.goto(PREVIEW + p);
      expect(res?.status()).toBe(200);
      expect(await page.locator('h1').count()).toBe(1);
      await page.close();
    });
  }

  it('preview shows recent works with 4 cards', async () => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PREVIEW + '/');
    await expect(page.getByRole('heading', { name: 'Trabajos recientes' }).count()).resolves.toBe(1);
    expect(await page.locator('.work-card').count()).toBe(4);
    await page.close();
  });

  it('production build (no real works) hides recent works', async () => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PROD + '/');
    expect(await page.getByText('Trabajos recientes').count()).toBe(0);
    await page.close();
  });

  it('shows the 8 service cards and the "for" band', async () => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PREVIEW + '/');
    expect(await page.locator('.service-card').count()).toBe(8);
    expect(await page.getByText('Trabajamos para').count()).toBe(1);
    await page.close();
  });

  it('no horizontal scroll at 390px', async () => {
    const page = await (await getBrowser()).newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(PREVIEW + '/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.close();
  });

  it('client carousel stops with reduced motion', async () => {
    const page = await (await getBrowser()).newPage({ reducedMotion: 'reduce' });
    await page.goto(PREVIEW + '/');
    const name = await page.locator('.marquee-track').evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe('none');
    await page.close();
  });

  it('client carousel animates by default', async () => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PREVIEW + '/');
    const name = await page.locator('.marquee-track').evaluate((el) => getComputedStyle(el).animationName);
    expect(name).not.toBe('none');
    await page.close();
  });

  it('home weighs under 1 MB on first load (mobile)', async () => {
    const page = await (await getBrowser()).newPage({ viewport: { width: 390, height: 844 } });
    let bytes = 0;
    page.on('response', async (r) => { try { bytes += (await r.body()).length; } catch {} });
    await page.goto(PREVIEW + '/', { waitUntil: 'networkidle' });
    expect(bytes).toBeLessThan(1_000_000);
    await page.close();
  });
});
