import { execSync } from 'node:child_process';
import path from 'node:path';
import type http from 'node:http';
import { serve } from './server';

let servers: http.Server[] = [];
export async function setup() {
  const root = path.resolve(__dirname, '../..');
  if (!process.env.E2E_SKIP_BUILD) {
    execSync('npx astro build --outDir dist-preview', { cwd: root, stdio: 'ignore', env: { ...process.env, SITE_ENV: 'preview' } });
    execSync('npx astro build --outDir dist-prod', { cwd: root, stdio: 'ignore', env: { ...process.env, SITE_ENV: 'production' } });
  }
  servers = [await serve(path.join(root, 'dist-preview'), 4391), await serve(path.join(root, 'dist-prod'), 4392)];
}
export async function teardown() { servers.forEach((s) => s.close()); }
