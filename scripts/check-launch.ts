import { readdirSync, readFileSync } from 'node:fs';
import { launchBlockers } from '../src/lib/launch.ts';

const files: Record<string, string> = {};
for (const f of readdirSync('src/content/legal')) files[`src/content/legal/${f}`] = readFileSync(`src/content/legal/${f}`, 'utf8');
files['public/admin/config.yml'] = readFileSync('public/admin/config.yml', 'utf8');
if (process.env.SITE_ENV !== 'production') {
  console.log('Build de pruebas: comprobaciones de lanzamiento omitidas.');
  process.exit(0);
}
const blockers = launchBlockers(files);
if (blockers.length) {
  console.error('No se puede publicar en producción todavía:\n- ' + blockers.join('\n- '));
  process.exit(1);
}
console.log('Comprobaciones de lanzamiento: OK');
