import { describe, it, expect } from 'vitest';
import { pageAlternates } from '../../src/lib/seo';

describe('pageAlternates', () => {
  it('static page: three locales plus x-default pointing at spanish', () => {
    const a = pageAlternates('contacto');
    expect(a).toEqual([
      { locale: 'es', href: '/contacto/' },
      { locale: 'ca', href: '/ca/contacte/' },
      { locale: 'en', href: '/en/contact/' },
      { locale: 'x-default', href: '/contacto/' },
    ]);
  });
  it('item page uses the per-locale item slug', () => {
    const a = pageAlternates('servicios', { es: 'pantallas-led', ca: 'pantalles-led', en: 'led-screens' });
    expect(a[1]).toEqual({ locale: 'ca', href: '/ca/serveis/pantalles-led/' });
  });
});
