import type { ImageMetadata } from 'astro';
const portadas = import.meta.glob<{ default: ImageMetadata }>('../assets/portada/*.{jpg,jpeg,png,webp,avif}', { eager: true });
declare const __ALLOW_EXAMPLES__: boolean;
const ejemplos: Record<string, () => Promise<{ default: ImageMetadata }>> = __ALLOW_EXAMPLES__
  ? import.meta.glob<{ default: ImageMetadata }>('../assets/ejemplo/portada.jpg')
  : {};

/** Resuelve la ruta de la foto de portada de ajustes.json ('../assets/x.jpg', relativa a src/content/). */
export async function heroImage(p: string, allowExamples: boolean): Promise<ImageMetadata | undefined> {
  const key = '../' + p.replace(/^(\.\.\/)+/, '');
  if (portadas[key]) return portadas[key].default;
  if (allowExamples && ejemplos[key]) return (await ejemplos[key]()).default;
  return undefined;
}
