import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { beforeAll, expect, test } from 'vitest';
import { strFromU8, unzipSync } from 'fflate';
import type { Manifold, ManifoldToplevel } from 'manifold-3d';
import { STEM_FIT, oemDefaults, validateStemFitDeltaMm } from '../src/geometry/config';
import { generateFromBlank, initializeKernel } from '../src/geometry/generate';
import { createOemBlank } from '../src/geometry/parametric';
import { generateStemFitSamples, STEM_FIT_SAMPLES } from '../src/geometry/stemFitTest';
import { exportStemFitTest } from '../src/export/threeMf';

let kernel: ManifoldToplevel;
beforeAll(async () => {
  kernel = await initializeKernel();
});
function reference(): Manifold {
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

test('zero exactly preserves the current generation output', () => {
  const ref = reference();
  const old = createOemBlank(kernel, oemDefaults(4), ref);
  const zero = createOemBlank(kernel, oemDefaults(4), ref, 0);
  try {
    const a = generateFromBlank(kernel, old.full, old.outside, artwork, 8);
    const b = generateFromBlank(kernel, zero.full, zero.outside, artwork, 8);
    expect(b).toEqual(a);
    const hash = createHash('sha256');
    for (const mesh of [b.body, b.legend]) {
      hash.update(new Uint8Array(mesh.positions.buffer));
      hash.update(new Uint8Array(mesh.indices.buffer));
    }
    // Captured from HEAD before the stem-fit implementation, using this reference asset.
    expect(hash.digest('hex')).toBe(
      '6273b39f3773b72ac47baeef02e59ca0853130b0bb8968c63f323a6250a1d546',
    );
  } finally {
    [old.full, old.outside, zero.full, zero.outside, ref].forEach((solid) => solid.delete());
  }
});

test('signed fit is monotonic and confined to the straight gripping region', () => {
  const ref = reference();
  const deltas = [-0.1, -0.05, 0, 0.05, 0.1, 0.15];
  const blanks = deltas.map((delta) => createOemBlank(kernel, oemDefaults(4), ref, delta));
  try {
    const volumes = blanks.map((blank) => blank.full.volume());
    expect(volumes).toEqual([...volumes].sort((a, b) => b - a));
    const baseline = blanks[2];
    const grip = kernel.Manifold.cube(
      [7, 7, STEM_FIT.gripTop - STEM_FIT.gripBottom],
      true,
    ).translate([0, 0, (STEM_FIT.gripTop + STEM_FIT.gripBottom) / 2]);
    try {
      for (const [i, blank] of blanks.entries()) {
        expect(blank.full.status()).toBe('NoError');
        expect(blank.full.boundingBox()).toEqual(baseline.full.boundingBox());
        expect(blank.outside.volume()).toBeCloseTo(baseline.outside.volume(), 6);
        const removed = baseline.full.subtract(blank.full);
        const added = blank.full.subtract(baseline.full);
        const change = removed.add(added);
        const outsideChange = change.subtract(grip);
        expect(outsideChange.volume()).toBeLessThan(1e-5);
        if (i < 2) {
          expect(added.volume()).toBeGreaterThan(0.5);
          expect(removed.volume()).toBeLessThan(1e-5);
        }
        if (i > 2) {
          expect(removed.volume()).toBeGreaterThan(0.5);
          expect(added.volume()).toBeLessThan(1e-5);
        }
        const model = generateFromBlank(kernel, blank.full, blank.outside, artwork, 8);
        expect(model.legendVolume).toBeCloseTo(32, 3);
        expect(model.bodyVolume + model.legendVolume).toBeCloseTo(model.totalVolume, 3);
        const body = new kernel.Manifold(
          new kernel.Mesh({
            numProp: 3,
            vertProperties: model.body.positions,
            triVerts: model.body.indices,
            tolerance: 1e-5,
          }),
        );
        const legend = new kernel.Manifold(
          new kernel.Mesh({
            numProp: 3,
            vertProperties: model.legend.positions,
            triVerts: model.legend.indices,
            tolerance: 1e-5,
          }),
        );
        expect(body.status()).toBe('NoError');
        expect(legend.status()).toBe('NoError');
        const overlap = body.intersect(legend);
        expect(overlap.volume()).toBeLessThan(1e-5);
        [removed, added, change, outsideChange, body, legend, overlap].forEach((solid) =>
          solid.delete(),
        );
      }
    } finally {
      grip.delete();
    }
  } finally {
    blanks.forEach(({ full, outside }) => {
      full.delete();
      outside.delete();
    });
    ref.delete();
  }
}, 60000);

test.each([NaN, Infinity, -Infinity, -0.15, 0.2, 0.03])('rejects invalid stem fit %s', (delta) => {
  expect(() => validateStemFitDeltaMm(delta)).toThrow();
});

test('test file has four named, watertight, visibly lettered samples at the documented deltas', () => {
  const ref = reference();
  try {
    const samples = generateStemFitSamples(kernel, ref);
    expect(samples.map(({ label, deltaMm }) => ({ label, deltaMm }))).toEqual(STEM_FIT_SAMPLES);
    for (const sample of samples) {
      const solid = new kernel.Manifold(
        new kernel.Mesh({
          numProp: 3,
          vertProperties: sample.mesh.positions,
          triVerts: sample.mesh.indices,
          tolerance: 1e-5,
        }),
      );
      expect(solid.status()).toBe('NoError');
      expect(solid.volume()).toBeGreaterThan(100);
      const index = samples.indexOf(sample);
      const letterRegion = kernel.Manifold.cube([2, 3, 0.45], true).translate([
        index * 15 + 4.4,
        0,
        1.6,
      ]);
      const raisedLetter = solid.intersect(letterRegion);
      expect(raisedLetter.volume()).toBeGreaterThan(0.1);
      [solid, letterRegion, raisedLetter].forEach((part) => part.delete());
    }
    const xml = strFromU8(unzipSync(exportStemFitTest(samples))['3D/3dmodel.model']);
    expect(xml.match(/<item objectid=/g)).toHaveLength(4);
    for (const sample of samples)
      expect(xml).toContain(`name="${sample.label} ${sample.deltaMm.toFixed(2)} mm"`);
  } finally {
    ref.delete();
  }
}, 60000);
