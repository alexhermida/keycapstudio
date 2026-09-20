import { readFileSync } from 'node:fs';
import { beforeAll, expect, test } from 'vitest';
import type { ManifoldToplevel } from 'manifold-3d';
import { initializeKernel, generateFromBlank } from '../src/geometry/generate';
import { createOemBlank } from '../src/geometry/parametric';
import {
  DIMENSION_LIMITS,
  OEM_SHAPE,
  oemDefaults,
  validateDimensions,
  type OemDimensions,
  type OemRow,
} from '../src/geometry/config';

let kernel: ManifoldToplevel;
beforeAll(async () => {
  kernel = await initializeKernel();
});
function reference() {
  const bytes = readFileSync('src/geometry/assets/oem-row5-blank.bin');
  const count = bytes.readUInt32LE(4) * 3;
  return new kernel.Manifold(
    new kernel.Mesh({
      numProp: 3,
      vertProperties: Float32Array.from({ length: count }, (_, i) => bytes.readFloatLE(12 + i * 4)),
      triVerts: Uint32Array.from({ length: bytes.readUInt32LE(8) }, (_, i) =>
        bytes.readUInt32LE(12 + count * 4 + i * 4),
      ),
      tolerance: 1e-5,
    }),
  );
}
const artwork = {
  aspectRatio: 1,
  paths: [
    {
      fillRule: 'NonZero' as const,
      contours: [
        [
          [-0.5, -0.5],
          [0.5, -0.5],
          [0.5, 0.5],
          [-0.5, 0.5],
        ] as [number, number][],
      ],
    },
  ],
};

test.each([1, 2, 3, 4] as OemRow[])(
  'R%s has an 18 mm base, valid partition and unchanged socket',
  (row) => {
    const ref = reference();
    const blank = createOemBlank(kernel, oemDefaults(row), ref);
    try {
      const bounds = blank.full.boundingBox();
      expect(bounds.max[0] - bounds.min[0]).toBeCloseTo(18, 5);
      expect(bounds.max[1] - bounds.min[1]).toBeCloseTo(18, 5);
      // Section at X=0 measures the actual front/rear edge centers, not the corners.
      const rotated = blank.outside.rotate([0, 90, 0]);
      const section = rotated.slice(0);
      const points = section.toPolygons().flat();
      const edgeHeight = (sign: number) =>
        Math.max(
          ...points
            .filter(([z, y]) => Math.abs(sign * y + OEM_SHAPE.taperPerHeight * z - 9) < 1e-4)
            .map(([z]) => z),
        );
      expect(edgeHeight(-1)).toBeCloseTo(oemDefaults(row).frontHeight, 2);
      expect(edgeHeight(1)).toBeCloseTo(oemDefaults(row).rearHeight, 2);
      section.delete();
      rotated.delete();
      const region = kernel.Manifold.cube([7, 7, 4.49], true).translate([0, 0, 2.245]);
      const oldStem = ref.intersect(region),
        newStem = blank.full.intersect(region);
      const removed = oldStem.subtract(newStem),
        added = newStem.subtract(oldStem);
      expect(removed.volume()).toBeLessThan(1e-5);
      expect(added.volume()).toBeLessThan(1e-5);
      [region, oldStem, newStem, removed, added].forEach((s) => s.delete());
      const model = generateFromBlank(kernel, blank.full, blank.outside, artwork, 8);
      expect(model.legendVolume).toBeCloseTo(32, 3);
      expect(model.bodyVolume + model.legendVolume).toBeCloseTo(model.totalVolume, 3);
      for (const data of [model.body, model.legend]) {
        const solid = new kernel.Manifold(
          new kernel.Mesh({
            numProp: 3,
            vertProperties: data.positions,
            triVerts: data.indices,
            tolerance: 1e-5,
          }),
        );
        expect(solid.status()).toBe('NoError');
        expect(solid.volume()).toBeGreaterThan(0);
        solid.delete();
      }
    } finally {
      ref.delete();
      blank.full.delete();
      blank.outside.delete();
    }
  },
);

test('all combinations of measurement extrema retain valid connected solids and an inlay', () => {
  const ref = reference();
  const keys = Object.keys(DIMENSION_LIMITS) as (keyof OemDimensions)[];
  try {
    for (let mask = 0; mask < 32; mask++) {
      const dimensions = oemDefaults(4);
      keys.forEach((key, i) => {
        dimensions[key] = DIMENSION_LIMITS[key][mask & (1 << i) ? 'max' : 'min'];
      });
      const blank = createOemBlank(kernel, dimensions, ref);
      try {
        expect(blank.full.status()).toBe('NoError');
        const model = generateFromBlank(kernel, blank.full, blank.outside, artwork, 8);
        expect(model.legendVolume).toBeCloseTo(32, 3);
      } finally {
        blank.full.delete();
        blank.outside.delete();
      }
    }
  } finally {
    ref.delete();
  }
}, 120000);

test('rejects nonfinite and unsupported dimensions before geometry', () => {
  for (const key of Object.keys(DIMENSION_LIMITS) as (keyof OemDimensions)[])
    for (const value of [
      NaN,
      Infinity,
      DIMENSION_LIMITS[key].min - 0.01,
      DIMENSION_LIMITS[key].max + 0.01,
    ])
      expect(() => validateDimensions({ ...oemDefaults(4), [key]: value })).toThrow();
});
