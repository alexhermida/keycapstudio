import { beforeAll, describe, expect, it } from 'vitest';
import type { ManifoldToplevel } from 'manifold-3d';
import { generateKeycap, initializeKernel } from '../src/geometry/generate';
import { KEYCAP } from '../src/geometry/config';
import type { Artwork, KeycapModel, MeshData } from '../src/geometry/types';

let kernel: ManifoldToplevel;
export const square: Artwork = {
  aspectRatio: 1,
  paths: [
    {
      fillRule: 'EvenOdd',
      contours: [
        [
          [-0.5, -0.5],
          [0.5, -0.5],
          [0.5, 0.5],
          [-0.5, 0.5],
        ],
      ],
    },
  ],
};
function solid(mesh: MeshData) {
  return new kernel.Manifold(
    new kernel.Mesh({
      numProp: 3,
      vertProperties: mesh.positions,
      triVerts: mesh.indices,
      tolerance: 1e-5,
    }),
  );
}
function assertClosed(mesh: MeshData) {
  const edges = new Map<string, number>();
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const t = Array.from(mesh.indices.slice(i, i + 3));
    expect(new Set(t).size).toBe(3);
    for (let j = 0; j < 3; j++) {
      const a = t[j],
        b = t[(j + 1) % 3];
      const key = a < b ? `${a},${b}` : `${b},${a}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  }
  expect([...edges.values()].every((n) => n === 2)).toBe(true);
}
beforeAll(async () => {
  kernel = await initializeKernel();
}, 30000);
describe('keycap solids', () => {
  let model: KeycapModel;
  beforeAll(() => {
    model = generateKeycap(kernel, square, 8);
  }, 30000);
  it('produces closed, positive-volume meshes and conserves volume', () => {
    assertClosed(model.body);
    assertClosed(model.legend);
    expect(model.bodyVolume).toBeGreaterThan(300);
    expect(model.legendVolume).toBeCloseTo(8 * 8 * KEYCAP.legendDepth, 2);
    expect(model.bodyVolume + model.legendVolume).toBeCloseTo(model.totalVolume, 3);
    const body = solid(model.body),
      legend = solid(model.legend),
      overlap = body.intersect(legend);
    expect(body.status()).toBe('NoError');
    expect(legend.status()).toBe('NoError');
    const bodyParts = body.decompose();
    expect(bodyParts).toHaveLength(1);
    bodyParts.forEach((part) => part.delete());
    expect(overlap.volume()).toBeLessThan(1e-4);
    expect(legend.boundingBox().min[2]).toBeGreaterThanOrEqual(
      KEYCAP.frontMidHeight - KEYCAP.legendDepth - 0.001,
    );
    expect(body.boundingBox().max[2]).toBeGreaterThan(11.5);
    body.delete();
    legend.delete();
    overlap.delete();
  });
  it('keeps the base dimensions and opens the stem socket into the underside', () => {
    const body = solid(model.body);
    expect(body.boundingBox().min[0]).toBeCloseTo(-9, 3);
    expect(body.boundingBox().max[0]).toBeCloseTo(9, 3);
    const probe = kernel.Manifold.cube([0.5, 0.5, 3], true).translate([0, 0, 2.5]);
    const overlap = body.intersect(probe);
    expect(overlap.volume()).toBeLessThan(1e-6);
    body.delete();
    probe.delete();
    overlap.delete();
  });
  it('supports holes and disconnected islands at maximum size', () => {
    const art: Artwork = {
      aspectRatio: 1,
      paths: [
        {
          fillRule: 'EvenOdd',
          contours: [
            square.paths[0].contours[0],
            [
              [-0.3, -0.3],
              [0.3, -0.3],
              [0.3, 0.3],
              [-0.3, 0.3],
            ],
          ],
        },
        {
          fillRule: 'NonZero',
          contours: [
            [
              [-0.1, -0.1],
              [0.1, -0.1],
              [0.1, 0.1],
              [-0.1, 0.1],
            ],
          ],
        },
      ],
    };
    const result = generateKeycap(kernel, art, 11);
    assertClosed(result.body);
    assertClosed(result.legend);
    expect(result.legendVolume).toBeCloseTo(121 * (0.64 + 0.04) * 0.5, 2);
  }, 30000);
  it('is deterministic and validates size', () => {
    const again = generateKeycap(kernel, square, 8);
    expect(again.body.indices).toEqual(model.body.indices);
    expect(again.body.positions).toEqual(model.body.positions);
    for (const size of [NaN, 0, 12])
      expect(() => generateKeycap(kernel, square, size)).toThrow('size');
  }, 30000);
});
