import type { Manifold, ManifoldToplevel } from 'manifold-3d';
import { STEM_FIT, validateStemFitDeltaMm } from './config';

/** Edit only the straight gripping faces of the pinned reference socket.
 * The entrance below Z=1, blind roof above Z=3.5, and cross end walls remain borrowed.
 * Borrows reference; a nonzero result is caller-owned. Zero returns the same borrowed solid. */
export function applyStemFit(
  kernel: ManifoldToplevel,
  reference: Manifold,
  stemFitDeltaMm: number,
): Manifold {
  validateStemFitDeltaMm(stemFitDeltaMm);
  if (stemFitDeltaMm === 0) return reference;
  const { Manifold: M } = kernel;
  const allocated: Manifold[] = [];
  const keep = (solid: Manifold) => {
    allocated.push(solid);
    return solid;
  };
  const {
    gripBottom,
    gripTop,
    verticalArmWidth,
    horizontalArmWidth,
    verticalReach,
    horizontalReach,
  } = STEM_FIT;
  const cross = (delta: number) => {
    const height = gripTop - gripBottom;
    const center = (gripTop + gripBottom) / 2;
    const vertical = keep(
      keep(M.cube([verticalArmWidth + delta, verticalReach, height], true)).translate([
        0,
        0,
        center,
      ]),
    );
    const horizontal = keep(
      keep(M.cube([horizontalReach, horizontalArmWidth + delta, height], true)).translate([
        0,
        0,
        center,
      ]),
    );
    return keep(vertical.add(horizontal));
  };
  try {
    const adjusted = cross(stemFitDeltaMm);
    if (stemFitDeltaMm > 0) return reference.subtract(adjusted);
    const referenceCross = cross(0);
    const band = keep(referenceCross.subtract(adjusted));
    const voidBand = keep(band.subtract(reference));
    return reference.add(voidBand);
  } finally {
    for (let i = allocated.length - 1; i >= 0; i--) allocated[i].delete();
  }
}
