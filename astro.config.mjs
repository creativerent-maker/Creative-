// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://creativerent.es',
  trailingSlash: 'always',
  i18n: {
    locales: ['es', 'ca', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-ES', ca: 'ca-ES', en: 'en' } },
      filter: (page) => !/\/(aviso-legal|avis-legal|legal-notice|privacidad|privacitat|privacy|cookies|accesibilidad|accessibilitat|accessibility)\//.test(page),
    }),
  ],
});
