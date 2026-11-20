export const locales = ['es', 'ca', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export type PageKey =
  | 'home' | 'servicios' | 'trabajos' | 'crealuxe' | 'contacto' | 'calculadora'
  | 'aviso-legal' | 'privacidad' | 'cookies' | 'accesibilidad';

export const slugs: Record<Exclude<PageKey, 'home'>, Record<Locale, string>> = {
  servicios: { es: 'servicios', ca: 'serveis', en: 'services' },
  trabajos: { es: 'trabajos', ca: 'treballs', en: 'projects' },
  crealuxe: { es: 'crealuxe-fx', ca: 'crealuxe-fx', en: 'crealuxe-fx' },
  contacto: { es: 'contacto', ca: 'contacte', en: 'contact' },
  calculadora: {
    es: 'herramientas/calculadora-proyeccion',
    ca: 'eines/calculadora-projeccio',
    en: 'tools/projection-calculator',
  },
  'aviso-legal': { es: 'aviso-legal', ca: 'avis-legal', en: 'legal-notice' },
  privacidad: { es: 'privacidad', ca: 'privacitat', en: 'privacy' },
  cookies: { es: 'cookies', ca: 'cookies', en: 'cookies' },
  accesibilidad: { es: 'accesibilidad', ca: 'accessibilitat', en: 'accessibility' },
};

export function localeRoot(locale: Locale): string {
  return locale === defaultLocale ? '/' : `/${locale}/`;
}

export function localizedPath(key: PageKey, locale: Locale, slug?: string): string {
  const root = localeRoot(locale);
  if (key === 'home') return root;
  const parts = [slugs[key][locale], slug].filter(Boolean).join('/');
  return `${root}${parts}/`;
}

/** Locale from a URL pathname ('/ca/serveis/' -> 'ca'). */
export function localeFromPath(pathname: string): Locale {
  const seg = pathname.split('/')[1];
  return (locales as readonly string[]).includes(seg) && seg !== defaultLocale ? (seg as Locale) : defaultLocale;
}
