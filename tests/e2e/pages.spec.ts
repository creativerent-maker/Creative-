import { describe, it, expect, afterAll } from 'vitest';
import { getBrowser, closeBrowser, PREVIEW } from './helpers';
import { localizedPath, locales, type PageKey } from '../../src/i18n/routes';
import fs from 'node:fs';

afterAll(closeBrowser);
const keys: PageKey[] = ['servicios', 'trabajos', 'crealuxe', 'contacto', 'calculadora', 'aviso-legal', 'privacidad', 'cookies', 'accesibilidad'];
const servicios = fs.readdirSync('src/content/servicios').map((f) => JSON.parse(fs.readFileSync(`src/content/servicios/${f}`, 'utf8')));
const urls: string[] = [];
for (const l of locales) {
  for (const k of keys) urls.push(localizedPath(k, l));
  for (const s of servicios) urls.push(localizedPath('servicios', l, s[l].slug));
  urls.push(localizedPath('trabajos', l, 'ejemplo-congreso-nacional'));
}

describe('inner pages', () => {
  it.each(urls)('%s -> 200, one h1, canonical', async (u) => {
    const page = await (await getBrowser()).newPage();
    const res = await page.goto(PREVIEW + u);
    expect(res?.status()).toBe(200);
    expect(await page.locator('h1').count()).toBe(1);
    expect(await page.locator('link[rel=canonical]').count()).toBe(1);
    await page.close();
  });

  it('unknown url -> 404 page with useful links', async () => {
    const page = await (await getBrowser()).newPage();
    const res = await page.goto(PREVIEW + '/no-existe/');
    expect(res?.status()).toBe(404);
    for (const href of ['/servicios/', '/trabajos/', '/contacto/']) expect(await page.locator(`main a[href="${href}"]`).count()).toBeGreaterThan(0);
    await page.close();
  });

  it('works filter: "Centros de congresos" leaves only congress cards', async () => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PREVIEW + '/trabajos/');
    await page.getByRole('button', { name: 'Centros de congresos' }).click();
    const visible = await page.locator('.work-card:visible').evaluateAll((els) => els.map((e) => e.getAttribute('data-tipo')));
    expect(visible.length).toBeGreaterThan(0);
    expect(new Set(visible)).toEqual(new Set(['congresos']));
    await page.close();
  });

  it('calculator: 300 cm wide at 1.5 -> 450 cm distance shown', async () => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PREVIEW + '/herramientas/calculadora-proyeccion/');
    await page.fill('#f-width', '300');
    await page.click('#calc');
    await expect(page.locator('#rtable').innerText()).resolves.toContain('450,0 cm');
    await page.close();
  });

  it('contact page has the quote form with privacy checkbox unchecked', async () => {
    const page = await (await getBrowser()).newPage();
    await page.goto(PREVIEW + '/contacto/');
    expect(await page.locator('form#presupuesto').count()).toBe(1);
    expect(await page.locator('input[name=privacidad]').isChecked()).toBe(false);
    await page.close();
  });
});
