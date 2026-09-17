import { beforeAll, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import type { ManifoldToplevel } from 'manifold-3d';
import { generateKeycap, initializeKernel } from '../src/geometry/generate';
import { KEYCAP, topHeight } from '../src/geometry/config';
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
  it.each([
    [3, '3d5071d95925e18525d65c0a14e65f3e3170fb8610cadb351d93bed25c22d6ea'],
    [8, '726f3de7071decb352957197409d3659db131eed8a236db6b7d0301c9f2a4af3'],
    [11, '716ad4575c953131bb054337e53391394d4183c700911e75202aa95d84697a96'],
  ] as const)('preserves the pre-extraction mesh baseline at legend size %s', (size, digest) => {
    // Captured before extracting stem generation. Review geometry/calibration changes
    // before updating these fingerprints; do not regenerate them to hide a regression.
    const result = generateKeycap(kernel, square, size);
    const hash = createHash('sha256');
    for (const mesh of [result.body, result.legend])
      for (const array of [mesh.positions, mesh.indices])
        hash.update(new Uint8Array(array.buffer, array.byteOffset, array.byteLength));
    expect(hash.digest('hex')).toBe(digest);
  });
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
  it.each([
    ['front', 1, -1],
    ['rear', 1, 1],
    ['left', 0, -1],
    ['right', 0, 1],
  ] as const)('keeps the %s exterior face planar for bed contact', (_, axis, sign) => {
    const { positions, indices } = model.body;
    const slope = (KEYCAP.bottomWidth - KEYCAP.topWidth) / (2 * KEYCAP.taperReferenceHeight);
    let sideFaces = 0;
    for (let i = 0; i < indices.length; i += 3) {
      const [a, b, c] = [0, 1, 2].map((offset) =>
        Array.from(positions.slice(indices[i + offset] * 3, indices[i + offset] * 3 + 3)),
      );
      const u = b.map((value, j) => value - a[j]);
      const v = c.map((value, j) => value - a[j]);
      const normal = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
      ];
      // Ignore the roof, inner walls, rounded corners, and degenerate slivers.
      if (
        Math.hypot(...normal) < 1e-6 ||
        (sign * normal[axis]) / Math.hypot(...normal) < 0.9 ||
        Math.abs((a[1 - axis] + b[1 - axis] + c[1 - axis]) / 3) > 5 ||
        [a, b, c].some((point) => sign * point[axis] < 6)
      )
        continue;
      sideFaces++;
      for (const point of [a, b, c]) {
        // This becomes bed Z after laying this plane down. No shallow pockets.
        const distance =
          (KEYCAP.bottomWidth / 2 - sign * point[axis] - slope * point[2]) / Math.hypot(1, slope);
        expect(Math.abs(distance)).toBeLessThan(1e-5);
      }
    }
    expect(sideFaces).toBeGreaterThan(1);
    // Nothing protrudes past the face and lifts it away from the bed.
    for (let i = 0; i < positions.length; i += 3)
      expect(sign * positions[i + axis] + slope * positions[i + 2]).toBeLessThanOrEqual(
        KEYCAP.bottomWidth / 2 + 1e-5,
      );
  });
  it('retains the existing boss and blind cross socket at every critical height', () => {
    const body = solid(model.body);
    const { CrossSection: C } = kernel;
    const allocated = [];
    const circle = C.circle(2.8, 64);
    const a = C.square([4.04, 1.194], true);
    const b = C.square([1.194, 4.04], true);
    const cross = a.add(b);
    const socket = circle.subtract(cross);
    const window = C.square(6, true);
    allocated.push(circle, a, b, cross, socket, window);
    try {
      for (const z of [0.99, 1.01, 2.5, 4.59, 4.61]) {
        const slice = body.slice(z);
        const center = slice.intersect(window);
        allocated.push(slice, center);
        if (z < 1) expect(center.isEmpty()).toBe(true);
        else {
          const expected = z < 4.6 ? socket : circle;
          const missing = expected.subtract(center);
          const extra = center.subtract(expected);
          allocated.push(missing, extra);
          expect(missing.area() + extra.area()).toBeLessThan(1e-5);
        }
      }
    } finally {
      allocated.forEach((section) => section.delete());
      body.delete();
    }
  });
  it('keeps the curved legend top flush and the inlay depth unchanged', () => {
    const { positions, indices } = model.legend;
    let topFaces = 0;
    for (let i = 0; i < indices.length; i += 3) {
      const [a, b, c] = [0, 1, 2].map((offset) =>
        Array.from(positions.slice(indices[i + offset] * 3, indices[i + offset] * 3 + 3)),
      );
      const u = b.map((value, j) => value - a[j]);
      const v = c.map((value, j) => value - a[j]);
      const normal = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
      ];
      if (normal[2] / Math.hypot(...normal) < 0.5) continue;
      topFaces++;
      for (const point of [a, b, c]) {
        // Faceted approximation of the unchanged analytic dish, not an emboss.
        expect(Math.abs(point[2] - topHeight(point[0], point[1]))).toBeLessThan(0.01);
      }
    }
    expect(topFaces).toBeGreaterThan(10);
    expect(model.legendVolume).toBeCloseTo(64 * 0.5, 3);
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
