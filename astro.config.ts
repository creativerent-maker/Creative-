import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { htaccess, robotsTxtFor } from './src/lib/redirects';

const SITE = 'https://creativerent.es';

// Trabajos sin traducción: su versión ca/en canonicaliza a la española, así que no van al sitemap.
const untranslatedWorkPaths = new Set<string>();
for (const f of readdirSync('src/content/trabajos').filter((f) => f.endsWith('.json'))) {
  const slug = f.replace(/\.json$/, '');
  const d = JSON.parse(readFileSync(`src/content/trabajos/${f}`, 'utf8'));
  if (!d.ca?.titulo?.trim()) untranslatedWorkPaths.add(`/ca/treballs/${slug}/`);
  if (!d.en?.titulo?.trim()) untranslatedWorkPaths.add(`/en/projects/${slug}/`);
}

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  vite: {
    // En producción el empaquetador elimina por completo las fotos de ejemplo.
    define: { __ALLOW_EXAMPLES__: JSON.stringify(process.env.SITE_ENV !== 'production') },
  },
  i18n: {
    locales: ['es', 'ca', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-ES', ca: 'ca-ES', en: 'en' } },
      filter: (page) => !untranslatedWorkPaths.has(new URL(page).pathname) && !/\/(aviso-legal|avis-legal|legal-notice|privacidad|privacitat|privacy|cookies|accesibilidad|accessibilitat|accessibility|404)\//.test(page),
    }),
    {
      name: 'creativerent-static-files',
      hooks: {
        'astro:build:done': ({ dir }) => {
          const out = fileURLToPath(dir);
          const production = process.env.SITE_ENV === 'production';
          writeFileSync(`${out}/.htaccess`, htaccess());
          writeFileSync(`${out}/robots.txt`, robotsTxtFor(SITE, production));
        },
      },
    },
  ],
});
