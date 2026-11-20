import { locales, localizedPath, type Locale } from '../i18n/routes';

export const tiposCliente = ['ayuntamientos', 'instituciones', 'empresas', 'congresos'] as const;
export type TipoCliente = (typeof tiposCliente)[number];

export const servicioIds = [
  'alquiler-material-audiovisual', 'pantallas-led', 'streaming', 'infraestructura',
  'produccion-completa', 'mapping', 'postproduccion', 'personal-tecnico',
] as const;
export type ServicioId = (typeof servicioIds)[number];

export interface WorkText { titulo?: string; texto?: string }
export interface WorkData {
  slug: string;
  fecha: Date;
  lugar: string;
  tipoCliente: TipoCliente;
  servicios: ServicioId[];
  destacado: boolean;
  publicado: boolean;
  ejemplo?: boolean;
  es: { titulo: string; texto: string };
  ca?: WorkText;
  en?: WorkText;
}

export type SiteEnv = 'production' | 'preview';
export function siteEnv(): SiteEnv {
  const v = (import.meta as { env?: Record<string, string | undefined> }).env?.SITE_ENV ?? process.env.SITE_ENV;
  return v === 'production' ? 'production' : 'preview';
}

export function visibleWorks<T extends WorkData>(all: T[], env: SiteEnv): T[] {
  return all
    .filter((w) => w.publicado && !(env === 'production' && w.ejemplo))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

export const RECENT_COUNT = 4;

/** Destacados primero (más recientes antes) y se completa con los más recientes; vacío si hay menos de 4. */
export function recentWorks<T extends WorkData>(visible: T[]): T[] {
  if (visible.length < RECENT_COUNT) return [];
  const featured = visible.filter((w) => w.destacado);
  const rest = visible.filter((w) => !w.destacado);
  return [...featured, ...rest].slice(0, RECENT_COUNT);
}

function isTranslated(w: WorkData, locale: Locale): boolean {
  if (locale === 'es') return true;
  return Boolean(w[locale]?.titulo?.trim());
}

export function localizeWork(w: WorkData, locale: Locale): { titulo: string; texto: string; translated: boolean } {
  if (!isTranslated(w, locale)) return { titulo: w.es.titulo, texto: w.es.texto, translated: false };
  const tr = locale === 'es' ? w.es : w[locale]!;
  return { titulo: tr.titulo!, texto: tr.texto?.trim() ? tr.texto : w.es.texto, translated: true };
}

/** Rutas relativas; el layout las convierte en absolutas. */
export function workAlternates(w: WorkData): {
  canonicalByLocale: Record<Locale, string>;
  hreflang: { locale: Locale | 'x-default'; href: string }[];
} {
  const esHref = localizedPath('trabajos', 'es', w.slug);
  const canonicalByLocale = Object.fromEntries(
    locales.map((l) => [l, isTranslated(w, l) ? localizedPath('trabajos', l, w.slug) : esHref]),
  ) as Record<Locale, string>;
  const hreflang: { locale: Locale | 'x-default'; href: string }[] = locales
    .filter((l) => isTranslated(w, l))
    .map((l) => ({ locale: l, href: localizedPath('trabajos', l, w.slug) }));
  hreflang.push({ locale: 'x-default', href: esHref });
  return { canonicalByLocale, hreflang };
}
