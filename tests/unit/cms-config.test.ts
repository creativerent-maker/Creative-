import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { parse } from 'yaml';

const cfg = parse(fs.readFileSync('public/admin/config.yml', 'utf8'));
const col = (name: string) => cfg.collections.find((c: { name: string }) => c.name === name);
const names = (fields: { name: string }[]) => fields.map((f) => f.name).sort();

describe('Sveltia CMS config', () => {
  it('uses the GitHub backend on this repo', () => {
    expect(cfg.backend.name).toBe('github');
    expect(cfg.backend.repo).toBe('creativerent-maker/Creative-');
  });

  it('works collection fields match the content schema (except internal ejemplo flag)', () => {
    expect(names(col('trabajos').fields)).toEqual(
      ['ca', 'destacado', 'en', 'es', 'fecha', 'galeria', 'lugar', 'portada', 'portadaAlt', 'publicado', 'servicios', 'tipoCliente'].sort(),
    );
  });

  it('works store JSON files in src/content/trabajos with images in src/assets/trabajos', () => {
    const c = col('trabajos');
    expect(c.folder).toBe('src/content/trabajos');
    expect(c.format).toBe('json');
    expect(c.media_folder).toBe('/src/assets/trabajos');
    expect(c.public_folder).toBe('../../assets/trabajos');
  });

  it('services can be edited but not created or deleted', () => {
    expect(col('servicios').create).toBe(false);
    expect(col('servicios').delete).toBe(false);
  });

  it('client type and service options match the site lists', async () => {
    const { tiposCliente, servicioIds } = await import('../../src/lib/works');
    const f = (n: string) => col('trabajos').fields.find((x: { name: string }) => x.name === n);
    expect(f('tipoCliente').options.map((o: { value: string }) => o.value)).toEqual([...tiposCliente]);
    expect(f('servicios').options.map((o: { value: string }) => o.value)).toEqual([...servicioIds]);
  });

  it('phone photos are converted to webp, max 2400 px', () => {
    const t = cfg.media_libraries.default.config.transformations.raster_image;
    expect(t).toMatchObject({ format: 'webp', width: 2400, height: 2400 });
  });
});

describe('Sveltia CMS config (review fixes)', () => {
  it('slugs are ASCII without accents (URLs sin tildes)', () => {
    expect(cfg.slug).toMatchObject({ encoding: 'ascii', clean_accents: true });
  });
  it('empty optional fields are omitted so the schema never sees ""', () => {
    expect(cfg.output?.omit_empty_optional_fields).toBe(true);
  });
});
