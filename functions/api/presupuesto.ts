import { validateQuote, quoteEmail } from '../../src/lib/quote';

interface Env { RESEND_API_KEY: string; TURNSTILE_SECRET: string; QUOTE_TO: string; QUOTE_FROM: string }
type Ctx = { request: Request; env: Env };

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export async function onRequestPost({ request, env }: Ctx): Promise<Response> {
  let input: unknown;
  try { input = await request.json(); } catch { return json({ ok: false, errors: { _: 'invalid_json' } }, 400); }
  const v = validateQuote(input);
  if (!v.ok) return json({ ok: false, errors: v.errors }, 400);

  const form = new FormData();
  form.append('secret', env.TURNSTILE_SECRET);
  form.append('response', v.data.turnstileToken);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) form.append('remoteip', ip);
  const ts = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const tsJson = (await ts.json().catch(() => ({}))) as { success?: boolean };
  if (!tsJson.success) return json({ ok: false, errors: { turnstileToken: 'invalid' } }, 400);

  const mail = quoteEmail(v.data);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: `Web Creative Rent <${env.QUOTE_FROM}>`, to: [env.QUOTE_TO], reply_to: v.data.email, ...mail }),
  });
  if (!res.ok) return json({ ok: false, errors: { _: 'send_failed' } }, 502);
  return json({ ok: true });
}
