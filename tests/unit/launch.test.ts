import { describe, it, expect } from 'vitest';
import { launchBlockers } from '../../src/lib/launch';

describe('launchBlockers', () => {
  it('flags legal placeholders', () => {
    const b = launchBlockers({ 'src/content/legal/aviso-legal.es.md': 'Titular: **[RAZÓN SOCIAL]**, CIF [CIF]' });
    expect(b.join('\n')).toMatch(/aviso-legal\.es\.md.*\[RAZÓN SOCIAL\]/);
    expect(b.join('\n')).toMatch(/\[CIF\]/);
  });
  it('passes clean content', () => {
    expect(launchBlockers({ 'src/content/legal/x.md': 'Titular: Creative Rent SL, CIF B12345678' })).toEqual([]);
  });
});
