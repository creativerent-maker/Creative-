import { describe, it, expect } from 'vitest';
import { project } from '../../src/lib/projection';

describe('project (same maths as legacy/calculadora.html)', () => {
  it('16:9, width 300 cm, throw 1.5 -> distance 450 cm', () => {
    const r = project({ known: 'width', value: 300, ratio: '16:9', trMin: 1.5 });
    expect(r.D).toEqual([450, 450]);
    expect(r.H[0]).toBeCloseTo(168.75, 2);
    expect(r.DG[0]).toBeCloseTo(344.18, 1);
  });
  it('distance 450 cm with a 1.2–1.5 zoom gives width 300–375 cm', () => {
    const r = project({ known: 'dist', value: 450, ratio: '16:9', trMin: 1.5, trMax: 1.2 });
    expect(r.W[0]).toBeCloseTo(300, 5);
    expect(r.W[1]).toBeCloseTo(375, 5);
  });
  it('diagonal input converts through the aspect ratio', () => {
    const r = project({ known: 'diag', value: 254, ratio: '4:3', trMin: 1 });
    expect(r.W[0]).toBeCloseTo(203.2, 1);
  });
});
