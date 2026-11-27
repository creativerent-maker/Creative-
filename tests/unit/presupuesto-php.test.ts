import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PORT = 4398;
const URL = `http://127.0.0.1:${PORT}/api/presupuesto.php`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cr-php-'));
const mailFile = path.join(tmp, 'mail.log');
let php: ChildProcess;

beforeAll(async () => {
  php = spawn('php', ['-S', `127.0.0.1:${PORT}`, '-t', 'public'], {
    env: { ...process.env, QUOTE_MAIL_FILE: mailFile, QUOTE_RATE_DIR: tmp, QUOTE_MIN_SECONDS: '0' },
    stdio: 'ignore',
  });
  for (let i = 0; i < 50; i++) { try { await fetch(URL); break; } catch { await new Promise((r) => setTimeout(r, 100)); } }
});
afterAll(() => php.kill());
beforeEach(() => { fs.rmSync(mailFile, { force: true }); for (const f of fs.readdirSync(tmp)) if (f.startsWith('rate-')) fs.rmSync(path.join(tmp, f)); });

const good = {
  nombre: '  Ana Puig ', organizacion: 'Ajuntament', email: 'ana@example.org', telefono: '600000000',
  tipoEvento: 'institucional', fecha: '2027-05-10', lugar: 'Plaça Major', asistentes: '300',
  mensaje: 'Necesitamos sonido y escenario.\nGracias.', privacidad: true, web: '', t: 0,
};
const post = (body: unknown) => fetch(URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

describe('api/presupuesto.php', () => {
  it('valid request -> 200 and mails info@ with Reply-To = client', async () => {
    const r = await post(good);
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true });
    const mail = fs.readFileSync(mailFile, 'utf8');
    expect(mail).toContain('To: info@creativerent.es');
    expect(mail).toContain('Reply-To: ana@example.org');
    expect(mail).toContain('Ana Puig');
    expect(mail).toContain('Plaça Major');
  });

  it.each([
    ['empty name', { nombre: '  ' }, 'nombre'],
    ['invalid email', { email: 'no-es-email' }, 'email'],
    ['email with header injection', { email: 'a@b.com\r\nBcc: x@y.com' }, 'email'],
    ['message over 5000 chars', { mensaje: 'x'.repeat(5001) }, 'mensaje'],
    ['privacy not accepted', { privacidad: false }, 'privacidad'],
    ['unknown event type', { tipoEvento: 'boda' }, 'tipoEvento'],
  ])('%s -> 400, nothing sent', async (_n, over, field) => {
    const r = await post({ ...good, ...over });
    expect(r.status).toBe(400);
    expect((await r.json()).errors).toHaveProperty(field);
    expect(fs.existsSync(mailFile)).toBe(false);
  });

  it('filled honeypot -> pretends success but sends nothing', async () => {
    const r = await post({ ...good, web: 'http://spam.example' });
    expect(r.status).toBe(200);
    expect(fs.existsSync(mailFile)).toBe(false);
  });

  it('newlines in single-line fields never reach mail headers', async () => {
    await post({ ...good, nombre: 'Ana\r\nBcc: x@y.com' });
    const headers = fs.readFileSync(mailFile, 'utf8').split('\n\n')[0];
    expect(headers).not.toMatch(/^Bcc:/m);
  });

  it('more than 5 requests from one IP within an hour -> 429', async () => {
    for (let i = 0; i < 5; i++) expect((await post(good)).status).toBe(200);
    expect((await post(good)).status).toBe(429);
  });

  it('GET -> 405', async () => {
    expect((await fetch(URL)).status).toBe(405);
  });
});
