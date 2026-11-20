/** Redirecciones 301 de la web antigua (WordPress) de creativerent.es — spec §9. Formato Cloudflare `_redirects`. */
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

export function redirectRules(): string[] {
  const out: string[] = [];
  for (const [from, to] of exact) {
    out.push(`${from} ${to} 301`);
    out.push(`${from.replace(/\/$/, '')} ${to} 301`);
  }
  for (const [from, to] of splats) out.push(`${from} ${to} 301`);
  return out;
}

export function robotsTxt(site: string): string {
  return `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${site.replace(/\/$/, '')}/sitemap-index.xml\n`;
}
