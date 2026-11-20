import type { ImageMetadata } from 'astro';
const all = import.meta.glob<{ default: ImageMetadata }>('../assets/**/*.{jpg,jpeg,png,webp,avif,svg}', { eager: true });
/** Resuelve una ruta de ajustes.json ('../assets/x.jpg', relativa a src/content/) a un ImageMetadata. */
export function assetFromSettings(p: string): ImageMetadata | undefined {
  const key = '../' + p.replace(/^(\.\.\/)+/, '');
  return all[key]?.default;
}
