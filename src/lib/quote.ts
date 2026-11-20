export const TIPOS_EVENTO = ['institucional', 'corporativo', 'congreso', 'fiesta-popular', 'otro'] as const;
export interface Quote {
  nombre: string; organizacion: string; email: string; telefono: string;
  tipoEvento: (typeof TIPOS_EVENTO)[number]; fecha: string; lugar: string; asistentes: string;
  mensaje: string; turnstileToken: string;
}
type Result = { ok: true; data: Quote } | { ok: false; errors: Record<string, string> };

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateQuote(input: unknown): Result {
  if (!input || typeof input !== 'object') return { ok: false, errors: { _: 'invalid' } };
  const i = input as Record<string, unknown>;
  const d = {
    nombre: str(i.nombre), organizacion: str(i.organizacion), email: str(i.email), telefono: str(i.telefono),
    tipoEvento: str(i.tipoEvento), fecha: str(i.fecha), lugar: str(i.lugar), asistentes: str(i.asistentes),
    mensaje: str(i.mensaje), turnstileToken: str(i.turnstileToken),
  };
  const e: Record<string, string> = {};
  if (!d.nombre || d.nombre.length > 120) e.nombre = 'required';
  if (!EMAIL.test(d.email) || d.email.length > 160) e.email = 'invalid';
  if (!(TIPOS_EVENTO as readonly string[]).includes(d.tipoEvento)) e.tipoEvento = 'invalid';
  if (!d.mensaje || d.mensaje.length > 5000) e.mensaje = 'required';
  if (i.privacidad !== true) e.privacidad = 'required';
  if (!d.turnstileToken) e.turnstileToken = 'required';
  if (d.organizacion.length > 160) e.organizacion = 'too_long';
  if (d.telefono.length > 40) e.telefono = 'too_long';
  if (d.lugar.length > 160) e.lugar = 'too_long';
  if (d.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)) e.fecha = 'invalid';
  if (d.asistentes && !/^\d{1,7}$/.test(d.asistentes)) e.asistentes = 'invalid';
  return Object.keys(e).length ? { ok: false, errors: e } : { ok: true, data: d as Quote };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function quoteEmail(q: Quote): { subject: string; text: string; html: string } {
  const rows: [string, string][] = [
    ['Nombre', q.nombre], ['Organización', q.organizacion], ['Email', q.email], ['Teléfono', q.telefono],
    ['Tipo de acto', q.tipoEvento], ['Fecha', q.fecha], ['Lugar', q.lugar], ['Asistentes', q.asistentes],
  ];
  const filled = rows.filter(([, v]) => v);
  return {
    subject: `Solicitud de presupuesto: ${q.nombre}${q.organizacion ? ` (${q.organizacion})` : ''}`,
    text: filled.map(([k, v]) => `${k}: ${v}`).join('\n') + `\n\n${q.mensaje}`,
    html: `<table>${filled.map(([k, v]) => `<tr><th align="left">${k}</th><td>${esc(v)}</td></tr>`).join('')}</table><p>${esc(q.mensaje).replace(/\n/g, '<br>')}</p>`,
  };
}
