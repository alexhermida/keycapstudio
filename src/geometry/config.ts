/** Millimeters. Historical procedural blank; retained for rollback and comparison. */
export const KEYCAP = Object.freeze({
  bottomWidth: 18,
  topWidth: 13.8,
  /** Height at which the planar taper reaches topWidth; not the dish's maximum. */
  taperReferenceHeight: 11.3,
  cornerRadius: 1,
  frontMidHeight: 10,
  rearMidHeight: 10.8,
  frontDishDepth: 0.8,
  rearDishDepth: 1,
  wallThickness: 1.3,
  roofThickness: 1.6,
  stemOuterDiameter: 5.6,
  stemBottom: 1,
  socketSpan: 4.04,
  socketArm: 1.194,
  socketDepth: 3.6,
  legendDepth: 0.5,
  surfaceResolution: 0.7,
  minLegendSize: 3,
  maxLegendSize: 11,
  defaultLegendSize: 8,
});

/** Bounded KeyV2 mesh catalogue; these are experimental choices, not an OEM standard. */
export const OEM_CUSTOMIZATION = Object.freeze({
  radiusMin: 0.5,
  radiusMax: 1.5,
  radiusDefault: 1,
  heightMin: -0.5,
  heightMax: 0.5,
  heightDefault: 0,
  step: 0.25,
});

export function validateOemCustomization(radiusMm: number, heightDeltaMm: number): void {
  const { radiusMin, radiusMax, heightMin, heightMax, step } = OEM_CUSTOMIZATION;
  if (
    !Number.isFinite(radiusMm) ||
    !Number.isFinite(heightDeltaMm) ||
    radiusMm < radiusMin ||
    radiusMm > radiusMax ||
    heightDeltaMm < heightMin ||
    heightDeltaMm > heightMax ||
    !Number.isInteger(radiusMm / step) ||
    !Number.isInteger(heightDeltaMm / step)
  )
    throw new Error('Choose an offered OEM corner radius and height adjustment.');
}

/** +Y is the rear. A shallow parabolic dish interpolates the observed edges. */
export function topHeight(x: number, y: number): number {
  const t = Math.max(0, Math.min(1, y / KEYCAP.topWidth + 0.5));
  const center = KEYCAP.frontMidHeight + t * (KEYCAP.rearMidHeight - KEYCAP.frontMidHeight);
  const dish = KEYCAP.frontDishDepth + t * (KEYCAP.rearDishDepth - KEYCAP.frontDishDepth);
  return center + dish * ((2 * x) / KEYCAP.topWidth) ** 2;
}

export type OemRow = 1 | 2 | 3 | 4;
export interface OemDimensions {
  width: number;
  depth: number;
  frontHeight: number;
  rearHeight: number;
  radius: number;
}

/** Reference rim heights converted to edge midpoints using the assumed 0.8 mm dish.
 * +Y is rear. See ADR 0006 for provenance and modeling assumptions. */
export const OEM_ROWS = {
  1: { frontHeight: 9.3, rearHeight: 7.1 },
  2: { frontHeight: 8.5, rearHeight: 7.2 },
  3: { frontHeight: 8.5, rearHeight: 8.2 },
  4: { frontHeight: 10, rearHeight: 10.6 },
} as const;
export const OEM_SHAPE = Object.freeze({
  dishDepth: 0.8,
  taperPerHeight: 0.18,
  wall: 1.3,
  roof: 1.6,
  stemJoinHeight: 4.5,
  stemRegion: 7,
});
export const DIMENSION_LIMITS = {
  width: { min: 17.5, max: 32.8, step: 0.1 },
  depth: { min: 17.5, max: 18.5, step: 0.1 },
  frontHeight: { min: 6.8, max: 12.5, step: 0.1 },
  rearHeight: { min: 6.8, max: 12.5, step: 0.1 },
  radius: { min: 0.5, max: 1.5, step: 0.1 },
} as const;
export function oemDefaults(row: OemRow, widthU = 1): OemDimensions {
  const widths: Record<number, number> = { 1: 18, 1.25: 22.8, 1.5: 27.5, 1.75: 32.3 };
  if (!OEM_ROWS[row] || !widths[widthU]) throw new Error('Invalid keycap measurements.');
  return { width: widths[widthU], depth: 18, ...OEM_ROWS[row], radius: 1 };
}
export function validateDimensions(dimensions: OemDimensions): void {
  for (const key of Object.keys(DIMENSION_LIMITS) as (keyof OemDimensions)[]) {
    const value = dimensions[key];
    const { min, max } = DIMENSION_LIMITS[key];
    if (!Number.isFinite(value) || value < min || value > max)
      throw new Error('Invalid keycap measurements.');
  }
}
