import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/routes';
import { localizedPath } from '../i18n/routes';
import { siteEnv, visibleWorks, type ServicioId, type WorkData } from './works';

export type Work = WorkData & { portada: CollectionEntry<'trabajos'>['data']['portada']; portadaAlt: string; galeria: CollectionEntry<'trabajos'>['data']['galeria'] };

export async function getWorks(): Promise<Work[]> {
  const entries = await getCollection('trabajos');
  const all = entries.map((e) => ({ slug: e.id, ...e.data }) as Work);
  return visibleWorks(all, siteEnv());
}

export type Servicio = { id: ServicioId; orden: number; foto?: CollectionEntry<'servicios'>['data']['foto']; t: CollectionEntry<'servicios'>['data']['es']; slugs: Record<Locale, string>; href: string };

export async function getServicios(locale: Locale): Promise<Servicio[]> {
  const entries = await getCollection('servicios');
  return entries
    .map((e) => ({
      id: e.id as ServicioId,
      orden: e.data.orden,
      foto: e.data.foto,
      t: e.data[locale],
      slugs: { es: e.data.es.slug, ca: e.data.ca.slug, en: e.data.en.slug },
      href: localizedPath('servicios', locale, e.data[locale].slug),
    }))
    .sort((a, b) => a.orden - b.orden);
}

export async function getClientes() {
  const env = siteEnv();
  const entries = await getCollection('clientes');
  return entries
    .map((e) => e.data)
    .filter((c) => !(env === 'production' && c.ejemplo))
    .sort((a, b) => a.orden - b.orden);
}
