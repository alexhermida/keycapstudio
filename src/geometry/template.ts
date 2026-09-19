import type { CrossSection, Manifold, ManifoldToplevel } from 'manifold-3d';
import { KEYCAP, topHeight } from './config';
import { attachStem } from './stem';

/**
 * The complete current blank and the solid envelope used for the legend.
 * Both returned Manifold objects are owned by the caller and must be deleted.
 */
export interface CurrentBlank {
  full: Manifold;
  outside: Manifold;
}

/**
 * Build the procedural baseline without applying artwork.
 *
 * The envelope is deliberately kept separate from the hollow blank: the
 * legend band is cut from the same tessellated exterior surface later on.
 */
export function createCurrentBlank(kernel: ManifoldToplevel): CurrentBlank {
  const allocated: (Manifold | CrossSection)[] = [];
  const keep = <T extends Manifold | CrossSection>(solid: T): T => {
    allocated.push(solid);
    return solid;
  };
  let result: CurrentBlank | undefined;
  const { CrossSection: C } = kernel;
  try {
    function roundedSection(width: number) {
      return keep(
        keep(C.square(width - 2 * KEYCAP.cornerRadius, true)).offset(
          KEYCAP.cornerRadius,
          'Round',
          2,
          32,
        ),
      );
    }
    function shellVolume(bottomWidth: number, topWidth: number, lower: number, roofOffset: number) {
      const section = roundedSection(bottomWidth);
      const ratio = topWidth / bottomWidth;
      const extruded = keep(section.extrude(12, 0, 0, [ratio, ratio]));
      const refined = keep(extruded.refineToLength(KEYCAP.surfaceResolution));
      return keep(
        refined.warp((v) => {
          v[2] = lower + (v[2] / 12) * (topHeight(v[0], v[1]) - roofOffset - lower);
        }),
      );
    }

    // Shape the roof independently so the corrected outer sides remain planar.
    const roof = shellVolume(KEYCAP.bottomWidth, KEYCAP.bottomWidth, 0, 0);
    const half = KEYCAP.bottomWidth / 2;
    const envelopeHeight = Math.max(topHeight(half, -half), topHeight(half, half)) + 1;
    const scale =
      1 -
      ((KEYCAP.bottomWidth - KEYCAP.topWidth) / KEYCAP.bottomWidth) *
        (envelopeHeight / KEYCAP.taperReferenceHeight);
    const taper = keep(
      roundedSection(KEYCAP.bottomWidth).extrude(envelopeHeight, 0, 0, [scale, scale]),
    );
    const outside = keep(taper.intersect(roof));
    const cavity = shellVolume(
      KEYCAP.bottomWidth - 2 * KEYCAP.wallThickness,
      KEYCAP.topWidth - 2 * KEYCAP.wallThickness,
      -1,
      KEYCAP.roofThickness,
    );
    const shell = keep(outside.subtract(cavity));
    const full = keep(attachStem(kernel, shell, outside));
    result = { full, outside };
    return result;
  } finally {
    for (let i = allocated.length - 1; i >= 0; i--) {
      const solid = allocated[i];
      if (!result || (solid !== result.full && solid !== result.outside)) solid.delete();
    }
  }
}
