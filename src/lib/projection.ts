/** Cálculo de proyección (en cm). Ratio de óptica = distancia ÷ ancho de imagen. */
export const ASPECT = { '16:9': 16 / 9, '16:10': 16 / 10, '4:3': 4 / 3 } as const;
export type Aspect = keyof typeof ASPECT;
export type Known = 'width' | 'height' | 'diag' | 'dist';
export interface ProjectInput { known: Known; value: number; ratio: Aspect; trMin: number; trMax?: number }
export interface ProjectResult { W: [number, number]; H: [number, number]; DG: [number, number]; D: [number, number]; trLo: number; trHi: number }

export function project({ known, value: v, ratio, trMin, trMax }: ProjectInput): ProjectResult {
  const r = ASPECT[ratio];
  const tr2 = trMax && trMax > 0 ? trMax : trMin;
  const trLo = Math.min(trMin, tr2), trHi = Math.max(trMin, tr2);
  let W: [number, number], D: [number, number];
  if (known === 'dist') {
    D = [v, v];
    W = [v / trHi, v / trLo];
  } else {
    const w = known === 'width' ? v : known === 'height' ? v * r : (v * r) / Math.hypot(r, 1);
    W = [w, w];
    D = [w * trLo, w * trHi];
  }
  const H = W.map((w) => w / r) as [number, number];
  const DG = W.map((w) => Math.hypot(w, w / r)) as [number, number];
  return { W, H, DG, D, trLo, trHi };
}
