/** Redirecciones 301 de la web antigua (WordPress) de creativerent.es — spec §9. */
const exact: [string, string][] = [
  ['/alquiler-de-material-audiovisual/', '/servicios/alquiler-material-audiovisual/'],
  ['/alquiler-de-infraestructura/', '/servicios/infraestructura/'],
  ['/produccion-completa/', '/servicios/produccion-completa/'],
  ['/mapping/', '/servicios/mapping/'],
  ['/post-produccion/', '/servicios/postproduccion/'],
  ['/personal-tecnico/', '/servicios/personal-tecnico/'],
  ['/trabajos-realizados/', '/trabajos/'],
  ['/cookie-policy/', '/cookies/'],
  ['/inicio/', '/'],
];
const splats: [string, string][] = [
  ['/project/*', '/trabajos/'],
  ['/project_category/*', '/trabajos/'],
  ['/comments/feed/*', '/'],
  ['/feed/*', '/'],
  ['/category/*', '/'],
  ['/author/*', '/'],
  ['/wp-content/*', '/'],
  ['/wp-admin/*', '/'],
  ['/wp-login.php', '/'],
];


export function robotsTxt(site: string): string {
  return `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${site.replace(/\/$/, '')}/sitemap-index.xml\n`;
}

/** .htaccess para el hosting de Webempresa (Apache/LiteSpeed): https, sin www, redirecciones antiguas, 404 y caché. */
export function htaccess(): string {
  const esc = (p: string) => p.replace(/^\//, '').replace(/[.]/g, '\\.');
  const lines = [
    '# Generado por astro.config.ts — no editar a mano',
    'Options -Indexes',
    'DirectoryIndex index.html',
    'ErrorDocument 404 /404.html',
    '',
    'RewriteEngine On',
    'RewriteCond %{HTTPS} off',
    'RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]',
    'RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]',
    'RewriteRule ^ https://%1%{REQUEST_URI} [R=301,L]',
    '',
    '# Web antigua (WordPress)',
  ];
  for (const [from, to] of exact) lines.push(`RewriteRule ^${esc(from.replace(/\/$/, ''))}/?$ ${to} [R=301,L]`);
  for (const [from, to] of splats) {
    lines.push(from.endsWith('/*') ? `RewriteRule ^${esc(from.slice(0, -1))} ${to} [R=301,L]` : `RewriteRule ^${esc(from)}$ ${to} [R=301,L]`);
  }
  lines.push(
    '',
    '<IfModule mod_headers.c>',
    '  <FilesMatch "\\.(avif|webp|jpg|jpeg|png|svg|woff2|css|js)$">',
    '    Header set Cache-Control "public, max-age=31536000, immutable"',
    '  </FilesMatch>',
    '  <FilesMatch "\\.html$">',
    '    Header set Cache-Control "public, max-age=300"',
    '  </FilesMatch>',
    '  Header always set X-Content-Type-Options "nosniff"',
    '  Header always set Referrer-Policy "strict-origin-when-cross-origin"',
    '</IfModule>',
    '<IfModule mod_deflate.c>',
    '  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript image/svg+xml application/xml',
    '</IfModule>',
    '',
  );
  return lines.join('\n');
}

export function robotsTxtFor(site: string, production: boolean): string {
  return production ? robotsTxt(site) : 'User-agent: *\nDisallow: /\n';
}
