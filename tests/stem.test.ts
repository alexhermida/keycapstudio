import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { CrossSection, Manifold, ManifoldToplevel } from 'manifold-3d';
import { initializeKernel } from '../src/geometry/generate';
import { attachStem } from '../src/geometry/stem';

let kernel: ManifoldToplevel;
let outside: Manifold;
let shell: Manifold;
const allocated: (Manifold | CrossSection)[] = [];
function keep<T extends Manifold | CrossSection>(solid: T): T {
  allocated.push(solid);
  return solid;
}

beforeAll(async () => {
  kernel = await initializeKernel();
  const { Manifold: M } = kernel;
  // An original, simple flat-roof shell isolates stem behavior from roof generation.
  outside = keep(keep(M.cube([18, 18, 12], true)).translate([0, 0, 6]));
  const cavity = keep(keep(M.cube([15.4, 15.4, 12], true)).translate([0, 0, 4.4]));
  shell = keep(outside.subtract(cavity));
}, 30000);

afterAll(() => {
  for (let i = allocated.length - 1; i >= 0; i--) allocated[i].delete();
});

describe('stem assembly', () => {
  it('joins the boss to the roof and clips it to the supplied exterior', () => {
    const body = keep(attachStem(kernel, shell, outside));
    expect(body.status()).toBe('NoError');
    expect(body.volume()).toBeGreaterThan(shell.volume());
    const parts = body.decompose().map(keep);
    expect(parts).toHaveLength(1);
    expect(body.boundingBox()).toEqual(outside.boundingBox());
    expect(keep(body.subtract(outside)).isEmpty()).toBe(true);
    expect(keep(shell.subtract(body)).isEmpty()).toBe(true);
  });

  it('preserves the boss start, cross opening, and blind socket depth', () => {
    const body = keep(attachStem(kernel, shell, outside));
    const { CrossSection: C } = kernel;
    const circle = keep(C.circle(2.8, 64));
    const cross = keep(
      keep(C.square([4.04, 1.194], true)).add(keep(C.square([1.194, 4.04], true))),
    );
    const socket = keep(circle.subtract(cross));
    const window = keep(C.square(6, true));
    for (const z of [0.99, 1.01, 2.5, 4.59, 4.61, 10]) {
      const center = keep(keep(body.slice(z)).intersect(window));
      if (z < 1) expect(center.isEmpty()).toBe(true);
      else {
        const expected = z < 4.6 ? socket : circle;
        const missing = keep(expected.subtract(center));
        const extra = keep(center.subtract(expected));
        expect(missing.area() + extra.area()).toBeLessThan(1e-5);
      }
    }
  });

  it('keeps borrowed inputs and returned solids usable after temporary cleanup', () => {
    const before = [shell, outside].map((solid) => ({
      volume: solid.volume(),
      vertices: Array.from(solid.getMesh().vertProperties),
      triangles: Array.from(solid.getMesh().triVerts),
    }));
    const first = keep(attachStem(kernel, shell, outside));
    const second = keep(attachStem(kernel, shell, outside));
    // Force evaluation only after both calls have freed their local temporaries.
    expect(first.volume()).toBe(second.volume());
    expect(first.getMesh().vertProperties).toEqual(second.getMesh().vertProperties);
    expect(first.getMesh().triVerts).toEqual(second.getMesh().triVerts);
    [shell, outside].forEach((solid, i) => {
      expect(solid.status()).toBe('NoError');
      expect(solid.volume()).toBe(before[i].volume);
      expect(Array.from(solid.getMesh().vertProperties)).toEqual(before[i].vertices);
      expect(Array.from(solid.getMesh().triVerts)).toEqual(before[i].triangles);
    });
  });
});
