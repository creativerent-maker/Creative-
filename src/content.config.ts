import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { servicioIds, tiposCliente } from './lib/works';

// En producción no se cargan las entradas de ejemplo (ni se emiten sus imágenes).
const PROD = process.env.SITE_ENV === 'production';
const entries = PROD ? ['*.json', '!ejemplo-*.json'] : '*.json';

const texto = z.object({ titulo: z.string().optional(), texto: z.string().optional() });

const trabajos = defineCollection({
  loader: glob({ pattern: entries, base: './src/content/trabajos' }),
  schema: ({ image }) =>
    z.object({
      fecha: z.coerce.date(),
      lugar: z.string(),
      tipoCliente: z.enum(tiposCliente),
      servicios: z.array(z.enum(servicioIds)).default([]),
      portada: image(),
      portadaAlt: z.string().default(''),
      galeria: z.array(image()).default([]),
      destacado: z.boolean().default(false),
      publicado: z.boolean().default(true),
      ejemplo: z.boolean().optional(),
      es: z.object({ titulo: z.string().min(1), texto: z.string().default('') }),
      ca: texto.optional(),
      en: texto.optional(),
    }),
});

const servicioTexto = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  titulo: z.string(),
  frase: z.string(),
  texto: z.string(),
  incluye: z.array(z.string()).default([]),
});

const servicios = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/servicios' }),
  schema: ({ image }) =>
    z.object({
      orden: z.number().int().min(1).max(8),
      foto: image().optional(),
      es: servicioTexto,
      ca: servicioTexto,
      en: servicioTexto,
    }),
});

const clientes = defineCollection({
  loader: glob({ pattern: entries, base: './src/content/clientes' }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      logo: image(),
      enlace: z.union([z.literal(''), z.string().url()]).optional(),
      orden: z.preprocess((v) => (v === '' || v === null ? undefined : v), z.number().default(99)),
      ejemplo: z.boolean().optional(),
    }),
});

export const collections = { trabajos, servicios, clientes };
