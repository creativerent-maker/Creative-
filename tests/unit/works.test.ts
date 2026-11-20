import { describe, it, expect } from 'vitest';
import { visibleWorks, recentWorks, localizeWork, workAlternates, type WorkData } from '../../src/lib/works';

let n = 0;
function work(over: Partial<WorkData> = {}): WorkData {
  n++;
  return {
    slug: `trabajo-${n}`,
    fecha: new Date(2026, 0, n),
    lugar: 'Tarragona',
    tipoCliente: 'congresos',
    servicios: ['streaming'],
    destacado: false,
    publicado: true,
    es: { titulo: `Título ${n}`, texto: `Texto ${n}` },
    ...over,
  };
}

describe('visibleWorks', () => {
  it('hides example works in production but shows them in preview', () => {
    const all = [work(), work(), work({ ejemplo: true })];
    expect(visibleWorks(all, 'production')).toHaveLength(2);
    expect(visibleWorks(all, 'preview')).toHaveLength(3);
  });
  it('never shows unpublished works', () => {
    const all = [work({ publicado: false }), work()];
    expect(visibleWorks(all, 'preview')).toHaveLength(1);
  });
  it('sorts newest first', () => {
    const a = work({ fecha: new Date(2025, 1, 1) });
    const b = work({ fecha: new Date(2026, 5, 1) });
    expect(visibleWorks([a, b], 'preview')[0].slug).toBe(b.slug);
  });
});

describe('recentWorks', () => {
  it('returns nothing when fewer than 4 works are visible', () => {
    expect(recentWorks([work(), work(), work()])).toEqual([]);
  });
  it('returns 4 with featured first, then newest', () => {
    const old = work({ fecha: new Date(2020, 0, 1), destacado: true });
    const newer = [1, 2, 3, 4, 5].map((m) => work({ fecha: new Date(2026, m, 1) }));
    const visible = visibleWorks([old, ...newer], 'preview');
    const r = recentWorks(visible);
    expect(r).toHaveLength(4);
    expect(r[0].slug).toBe(old.slug);
    expect(r[1].slug).toBe(newer[4].slug);
  });
});

describe('localizeWork', () => {
  it('falls back to spanish and flags it untranslated', () => {
    const w = work();
    expect(localizeWork(w, 'ca')).toEqual({ titulo: w.es.titulo, texto: w.es.texto, translated: false });
  });
  it('uses the translation when present', () => {
    const w = work({ ca: { titulo: 'Títol', texto: 'Text' } });
    expect(localizeWork(w, 'ca')).toEqual({ titulo: 'Títol', texto: 'Text', translated: true });
  });
  it('a blank translated title counts as untranslated', () => {
    const w = work({ en: { titulo: '  ', texto: '' } });
    expect(localizeWork(w, 'en').translated).toBe(false);
  });
});

describe('workAlternates', () => {
  it('spanish-only work: hreflang es + x-default, canonical of ca points to es', () => {
    const w = work({ slug: 'congreso-x' });
    const alt = workAlternates(w);
    expect(alt.hreflang.map((h) => h.locale).sort()).toEqual(['es', 'x-default']);
    expect(alt.canonicalByLocale.ca).toBe('/trabajos/congreso-x/');
    expect(alt.canonicalByLocale.es).toBe('/trabajos/congreso-x/');
  });
  it('fully translated work: hreflang for all three and self canonicals', () => {
    const w = work({ slug: 'gala', ca: { titulo: 'Gala', texto: 't' }, en: { titulo: 'Gala', texto: 't' } });
    const alt = workAlternates(w);
    expect(alt.hreflang).toContainEqual({ locale: 'en', href: '/en/projects/gala/' });
    expect(alt.canonicalByLocale.ca).toBe('/ca/treballs/gala/');
  });
});
