/** Comprobaciones que bloquean el build de producción (npm run build:prod). */
const RULES: { test: RegExp; files: RegExp; msg: string }[] = [
  { test: /\[(RAZÓN SOCIAL|CIF|DOMICILIO SOCIAL)\]/g, files: /src\/content\/legal\//, msg: 'faltan datos fiscales' },
];

export function launchBlockers(files: Record<string, string>): string[] {
  const out: string[] = [];
  for (const [path, content] of Object.entries(files)) {
    for (const r of RULES) {
      if (!r.files.test(path)) continue;
      const found = [...new Set(content.match(r.test) ?? [])];
      if (found.length) out.push(`${path}: ${r.msg} (${found.join(', ')})`);
    }
  }
  return out;
}
