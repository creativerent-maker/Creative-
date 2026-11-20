import { describe, it, expect } from 'vitest';
import { redirectRules } from '../../src/lib/redirects';

const rules = redirectRules();
describe('redirectRules (spec §9)', () => {
  it.each([
    '/alquiler-de-material-audiovisual/ /servicios/alquiler-material-audiovisual/ 301',
    '/alquiler-de-infraestructura/ /servicios/infraestructura/ 301',
    '/produccion-completa/ /servicios/produccion-completa/ 301',
    '/mapping/ /servicios/mapping/ 301',
    '/post-produccion/ /servicios/postproduccion/ 301',
    '/personal-tecnico/ /servicios/personal-tecnico/ 301',
    '/trabajos-realizados/ /trabajos/ 301',
    '/cookie-policy/ /cookies/ 301',
    '/project/* /trabajos/ 301',
    '/feed/* / 301',
    '/comments/feed/* / 301',
    '/category/* / 301',
    '/author/* / 301',
  ])('contains "%s"', (line) => expect(rules).toContain(line));

  it('also has the no-trailing-slash variant of exact rules', () => {
    expect(rules).toContain('/mapping /servicios/mapping/ 301');
    expect(rules).toContain('/cookie-policy /cookies/ 301');
  });
  it('never redirects a path to itself', () => {
    for (const r of rules) { const [from, to] = r.split(' '); expect(from).not.toBe(to); }
  });
});
