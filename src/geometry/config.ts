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
