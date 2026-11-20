import { locales, localizedPath, type Locale, type PageKey } from '../i18n/routes';

export type Alternate = { locale: Locale | 'x-default'; href: string };

/** hreflang de una página que existe en los tres idiomas. */
export function pageAlternates(key: PageKey, itemSlug?: Record<Locale, string>): Alternate[] {
  const list: Alternate[] = locales.map((l) => ({ locale: l, href: localizedPath(key, l, itemSlug?.[l]) }));
  list.push({ locale: 'x-default', href: list[0].href });
  return list;
}

export function hrefFor(alts: Alternate[], locale: Locale): string {
  return alts.find((a) => a.locale === locale)!.href;
}
