import { describe, it, expect, vi } from 'vitest';
import { validateQuote } from '../../src/lib/quote';
import { onRequestPost } from '../../functions/api/presupuesto';

const good = {
  nombre: '  Ana Puig ', organizacion: 'Ajuntament', email: 'ana@example.org', telefono: '600000000',
  tipoEvento: 'institucional', fecha: '2027-05-10', lugar: 'Plaça Major', asistentes: '300',
  mensaje: 'Necesitamos sonido y escenario.', privacidad: true, turnstileToken: 'tok',
};

describe('validateQuote', () => {
  it('accepts a complete payload and trims whitespace', () => {
    const r = validateQuote(good);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.nombre).toBe('Ana Puig');
  });
  it('rejects an empty name', () => { const r = validateQuote({ ...good, nombre: '   ' }); expect(r.ok).toBe(false); if (!r.ok) expect(r.errors).toHaveProperty('nombre'); });
  it('rejects an invalid email', () => { const r = validateQuote({ ...good, email: 'no-es-email' }); if (!r.ok) expect(r.errors).toHaveProperty('email'); else throw new Error('accepted'); });
  it('rejects a 5001-char message', () => { const r = validateQuote({ ...good, mensaje: 'x'.repeat(5001) }); if (!r.ok) expect(r.errors).toHaveProperty('mensaje'); else throw new Error('accepted'); });
  it('rejects when privacy is not accepted', () => { const r = validateQuote({ ...good, privacidad: false }); if (!r.ok) expect(r.errors).toHaveProperty('privacidad'); else throw new Error('accepted'); });
  it('rejects a missing turnstile token', () => { const { turnstileToken, ...rest } = good; const r = validateQuote(rest); if (!r.ok) expect(r.errors).toHaveProperty('turnstileToken'); else throw new Error('accepted'); });
  it('rejects an unknown event type', () => { const r = validateQuote({ ...good, tipoEvento: 'boda' }); if (!r.ok) expect(r.errors).toHaveProperty('tipoEvento'); else throw new Error('accepted'); });
  it('rejects non-object input', () => { expect(validateQuote(null).ok).toBe(false); expect(validateQuote('x').ok).toBe(false); });
});

describe('onRequestPost', () => {
  const env = { RESEND_API_KEY: 'k', TURNSTILE_SECRET: 's', QUOTE_TO: 'info@creativerent.es', QUOTE_FROM: 'web@creativerent.es' };
  const req = (body: unknown) => new Request('https://x/api/presupuesto', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

  it('invalid turnstile -> 400 and Resend is never called', async () => {
    const fetchMock = vi.fn(async (url: string) => new Response(JSON.stringify({ success: url.includes('turnstile') ? false : true })));
    vi.stubGlobal('fetch', fetchMock);
    const res = await onRequestPost({ request: req(good), env } as never);
    expect(res.status).toBe(400);
    expect(fetchMock.mock.calls.some(([u]) => String(u).includes('resend'))).toBe(false);
    vi.unstubAllGlobals();
  });

  it('valid request -> sends to QUOTE_TO with reply_to = client and returns 200', async () => {
    const fetchMock = vi.fn(async (url: string) => new Response(JSON.stringify(url.includes('turnstile') ? { success: true } : { id: '1' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await onRequestPost({ request: req(good), env } as never);
    expect(res.status).toBe(200);
    const call = fetchMock.mock.calls.find(([u]) => String(u).includes('api.resend.com'))!;
    const sent = JSON.parse((call[1] as RequestInit).body as string);
    expect(sent.to).toEqual(['info@creativerent.es']);
    expect(sent.reply_to).toBe('ana@example.org');
    vi.unstubAllGlobals();
  });

  it('invalid payload -> 400 without calling anything', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const res = await onRequestPost({ request: req({ ...good, email: 'x' }), env } as never);
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('mail provider failure -> 502', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => url.includes('turnstile') ? new Response(JSON.stringify({ success: true })) : new Response('err', { status: 500 })));
    const res = await onRequestPost({ request: req(good), env } as never);
    expect(res.status).toBe(502);
    vi.unstubAllGlobals();
  });
});
