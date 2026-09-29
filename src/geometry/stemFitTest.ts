import type { Manifold, ManifoldToplevel } from 'manifold-3d';
import { meshData } from './generate';
import { oemDefaults } from './config';
import { createOemBlank } from './parametric';
import type { MeshData } from './types';

export const STEM_FIT_SAMPLES = [
  { label: 'A', deltaMm: -0.05 },
  { label: 'B', deltaMm: 0 },
  { label: 'C', deltaMm: 0.05 },
  { label: 'D', deltaMm: 0.1 },
] as const;

const GLYPHS: Record<string, string[]> = {
  A: ['010', '101', '111', '101', '101'],
  B: ['110', '101', '110', '101', '110'],
  C: ['011', '100', '100', '100', '011'],
  D: ['110', '101', '101', '101', '110'],
};

export interface StemFitSample {
  label: string;
  deltaMm: number;
  mesh: MeshData;
}

/** Crops the adjusted production socket and joins a small print base and raised letter.
 * Samples are spaced in X and opened upward for inspection after slicing. */
export function generateStemFitSamples(
  kernel: ManifoldToplevel,
  reference: Manifold,
): StemFitSample[] {
  const { Manifold: M } = kernel;
  return STEM_FIT_SAMPLES.map(({ label, deltaMm }, index) => {
    const blank = createOemBlank(kernel, oemDefaults(4), reference, deltaMm);
    const allocated: Manifold[] = [];
    const keep = (solid: Manifold) => {
      allocated.push(solid);
      return solid;
    };
    try {
      const crop = keep(keep(M.cube([7, 7, 4.5], true)).translate([0, 0, 2.25]));
      const socket = keep(blank.full.intersect(crop));
      const pad = keep(keep(M.cube([13, 10, 1.4], true)).translate([0, 0, 5.1]));
      const pixels: Manifold[] = [];
      GLYPHS[label].forEach((row, y) => {
        [...row].forEach((cell, x) => {
          if (cell === '1')
            pixels.push(
              keep(
                keep(M.cube([0.48, 0.48, 0.4], true)).translate([3.9 + x * 0.5, 1 - y * 0.5, 4.2]),
              ),
            );
        });
      });
      const letter = keep(M.union(pixels));
      const sample = keep(keep(socket.add(pad)).add(letter));
      const oriented = keep(keep(sample.rotate([180, 0, 0])).translate([index * 15, 0, 5.8]));
      if (oriented.status() !== 'NoError') throw new Error('Could not create stem fit samples.');
      return { label, deltaMm, mesh: meshData(oriented.getMesh()) };
    } finally {
      for (let i = allocated.length - 1; i >= 0; i--) allocated[i].delete();
      blank.full.delete();
      blank.outside.delete();
    }
  });
}
