import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { redirectRules, robotsTxt } from './src/lib/redirects';

const SITE = 'https://creativerent.es';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  i18n: {
    locales: ['es', 'ca', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-ES', ca: 'ca-ES', en: 'en' } },
      filter: (page) => !/\/(aviso-legal|avis-legal|legal-notice|privacidad|privacitat|privacy|cookies|accesibilidad|accessibilitat|accessibility|404)\//.test(page),
    }),
    {
      name: 'creativerent-static-files',
      hooks: {
        'astro:build:done': ({ dir }) => {
          const out = fileURLToPath(dir);
          writeFileSync(`${out}/_redirects`, redirectRules().join('\n') + '\n');
          writeFileSync(`${out}/robots.txt`, robotsTxt(SITE));
        },
      },
    },
  ],
});
