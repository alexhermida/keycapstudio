import type { CrossSection, Manifold, ManifoldToplevel } from 'manifold-3d';
import { KEYCAP, OEM_SHAPE, validateDimensions, type OemDimensions } from './config';
import type { CurrentBlank } from './template';

/** Build an adjustable shell around the unchanged insertion region of a borrowed reference.
 * Caller owns both returned solids. No scaling or warping is applied to the stem. */
export function createOemBlank(
  kernel: ManifoldToplevel,
  dimensions: OemDimensions,
  reference: Manifold,
): CurrentBlank {
  validateDimensions(dimensions);
  const allocated: (Manifold | CrossSection)[] = [];
  const keep = <T extends Manifold | CrossSection>(solid: T): T => {
    allocated.push(solid);
    return solid;
  };
  let result: CurrentBlank | undefined;
  const { Manifold: M, CrossSection: C } = kernel;
  const { width, depth, frontHeight, rearHeight, radius } = dimensions;
  const { wall, roof, taperPerHeight: taper, dishDepth, stemJoinHeight, stemRegion } = OEM_SHAPE;
  try {
    // Solve the centerline roof plane at its intersections with the tapered sides.
    const frontY = -depth / 2 + taper * frontHeight;
    const rearY = depth / 2 - taper * rearHeight;
    const roofHeight = (x: number, y: number) => {
      const center = frontHeight + ((y - frontY) / (rearY - frontY)) * (rearHeight - frontHeight);
      const halfTop = width / 2 - taper * (center + dishDepth);
      return center + dishDepth * (x / halfTop) ** 2;
    };
    const section = (w: number, d: number, r: number) =>
      keep(keep(C.square([w - 2 * r, d - 2 * r], true)).offset(r, 'Round', 2, 32));
    const height = 16;
    const tapered = (w: number, d: number, r: number) =>
      keep(
        section(w, d, r).extrude(height, 0, 0, [
          1 - (2 * taper * height) / w,
          1 - (2 * taper * height) / d,
        ]),
      );
    const roofVolume = (offset: number) => {
      const block = keep(C.square([width + 2, depth + 2], true));
      const refined = keep(keep(block.extrude(height)).refineToLength(KEYCAP.surfaceResolution));
      return keep(
        refined.warp((v) => {
          v[2] = -1 + (v[2] / height) * (roofHeight(v[0], v[1]) - offset + 1);
        }),
      );
    };
    const outside = keep(tapered(width, depth, radius).intersect(roofVolume(0)));
    const cavityTaper = keep(
      tapered(width - 2 * wall, depth - 2 * wall, Math.max(0.2, radius - wall)).translate([
        0, 0, -1,
      ]),
    );
    const cavity = keep(cavityTaper.intersect(roofVolume(roof)));
    const shell = keep(outside.subtract(cavity));

    // The reference opening, bevel, depth, and Z position are retained through 4.5 mm.
    const region = keep(
      keep(M.cube([stemRegion, stemRegion, stemJoinHeight + 1], true)).translate([
        0,
        0,
        (stemJoinHeight - 1) / 2,
      ]),
    );
    const stem = keep(reference.intersect(region));
    const joinSection = keep(stem.slice(stemJoinHeight - 0.001));
    const extension = keep(
      keep(joinSection.extrude(height - stemJoinHeight)).translate([0, 0, stemJoinHeight - 0.001]),
    );
    const full = keep(keep(keep(shell.add(stem)).add(extension)).intersect(outside));
    if (full.status() !== 'NoError' || outside.status() !== 'NoError')
      throw new Error('Invalid keycap measurements.');
    const parts = full.decompose();
    const connected = parts.length === 1;
    parts.forEach((part) => part.delete());
    if (!connected) throw new Error('Invalid keycap measurements.');
    result = { full, outside };
    return result;
  } finally {
    for (let i = allocated.length - 1; i >= 0; i--) {
      const solid = allocated[i];
      if (solid !== result?.full && solid !== result?.outside) solid.delete();
    }
  }
}
