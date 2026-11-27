import { describe, it, expect } from 'vitest';
import { htaccess } from '../../src/lib/redirects';

const h = htaccess();
describe('legacy redirects in .htaccess (spec §9)', () => {
  it.each([
    'RewriteRule ^alquiler-de-material-audiovisual/?$ /servicios/alquiler-material-audiovisual/ [R=301,L]',
    'RewriteRule ^alquiler-de-infraestructura/?$ /servicios/infraestructura/ [R=301,L]',
    'RewriteRule ^produccion-completa/?$ /servicios/produccion-completa/ [R=301,L]',
    'RewriteRule ^mapping/?$ /servicios/mapping/ [R=301,L]',
    'RewriteRule ^post-produccion/?$ /servicios/postproduccion/ [R=301,L]',
    'RewriteRule ^personal-tecnico/?$ /servicios/personal-tecnico/ [R=301,L]',
    'RewriteRule ^trabajos-realizados/?$ /trabajos/ [R=301,L]',
    'RewriteRule ^cookie-policy/?$ /cookies/ [R=301,L]',
    'RewriteRule ^project/ /trabajos/ [R=301,L]',
    'RewriteRule ^feed/ / [R=301,L]',
    'RewriteRule ^comments/feed/ / [R=301,L]',
    'RewriteRule ^category/ / [R=301,L]',
    'RewriteRule ^author/ / [R=301,L]',
    'RewriteRule ^wp-login\\.php$ / [R=301,L]',
  ])('contains "%s"', (line) => expect(h.split('\n')).toContain(line));

  it('www is redirected to the bare domain', () => {
    expect(h).toContain('RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]');
  });
});
