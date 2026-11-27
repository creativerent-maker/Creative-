import { describe, it, expect } from 'vitest';
import { htaccess } from '../../src/lib/redirects';

const h = htaccess();
describe('htaccess (Webempresa / Apache)', () => {
  it('exact legacy pages redirect with and without trailing slash', () => {
    expect(h).toContain('RewriteRule ^alquiler-de-material-audiovisual/?$ /servicios/alquiler-material-audiovisual/ [R=301,L]');
    expect(h).toContain('RewriteRule ^cookie-policy/?$ /cookies/ [R=301,L]');
  });
  it('legacy sections redirect by prefix', () => {
    expect(h).toContain('RewriteRule ^project/ /trabajos/ [R=301,L]');
    expect(h).toContain('RewriteRule ^feed/ / [R=301,L]');
  });
  it('uses the custom 404 and forces https', () => {
    expect(h).toContain('ErrorDocument 404 /404.html');
    expect(h).toMatch(/RewriteCond %\{HTTPS\} off/);
  });
});
