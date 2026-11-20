import { describe, it, expect } from 'vitest';
import { localizedPath } from '../../src/i18n/routes';
import { ui } from '../../src/i18n/ui';

describe('localizedPath', () => {
  it('home per locale', () => {
    expect(localizedPath('home', 'es')).toBe('/');
    expect(localizedPath('home', 'ca')).toBe('/ca/');
    expect(localizedPath('home', 'en')).toBe('/en/');
  });
  it('translated section slugs with item slug', () => {
    expect(localizedPath('servicios', 'en', 'mapping')).toBe('/en/services/mapping/');
    expect(localizedPath('trabajos', 'ca')).toBe('/ca/treballs/');
  });
  it('nested calculator path in spanish has no prefix', () => {
    expect(localizedPath('calculadora', 'es')).toBe('/herramientas/calculadora-proyeccion/');
  });
});

describe('ui strings', () => {
  it('every spanish key exists in ca and en', () => {
    for (const k of Object.keys(ui.es)) {
      expect(ui.ca, `ca missing ${k}`).toHaveProperty(k);
      expect(ui.en, `en missing ${k}`).toHaveProperty(k);
    }
  });
});
