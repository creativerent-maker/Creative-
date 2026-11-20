import { describe, it, expect } from 'vitest';
import { launchBlockers } from '../../src/lib/launch';

describe('launchBlockers', () => {
  it('flags legal placeholders', () => {
    const b = launchBlockers({ 'src/content/legal/aviso-legal.es.md': 'Titular: **[RAZÓN SOCIAL]**, CIF [CIF]' });
    expect(b.join('\n')).toMatch(/aviso-legal\.es\.md.*\[RAZÓN SOCIAL\]/);
    expect(b.join('\n')).toMatch(/\[CIF\]/);
  });
  it('flags the placeholder CMS auth URL', () => {
    const b = launchBlockers({ 'public/admin/config.yml': 'base_url: https://sveltia-cms-auth.example.workers.dev' });
    expect(b).toHaveLength(1);
  });
  it('passes clean content', () => {
    expect(launchBlockers({ 'src/content/legal/x.md': 'Titular: Creative Rent SL, CIF B12345678', 'public/admin/config.yml': 'base_url: https://auth.creativerent.workers.dev' })).toEqual([]);
  });
});
