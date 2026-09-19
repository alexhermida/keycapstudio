import { beforeAll, describe, expect, it } from 'vitest';
import type { ManifoldToplevel } from 'manifold-3d';
import { initializeKernel, meshData } from '../src/geometry/generate';
import { KEYCAP } from '../src/geometry/config';
import { createCurrentBlank } from '../src/geometry/template';

let kernel: ManifoldToplevel;

beforeAll(async () => {
  kernel = await initializeKernel();
}, 30000);

describe('current blank extraction', () => {
  it('returns a complete blank and a matching exterior envelope', () => {
    const { full, outside } = createCurrentBlank(kernel);
    try {
      expect(full.status()).toBe('NoError');
      expect(outside.status()).toBe('NoError');
      expect(full.volume()).toBeGreaterThan(300);
      expect(outside.volume()).toBeGreaterThan(full.volume());
      expect(outside.boundingBox()).toEqual(full.boundingBox());
      expect(outside.boundingBox().min).toEqual([
        -KEYCAP.bottomWidth / 2,
        -KEYCAP.bottomWidth / 2,
        0,
      ]);
      expect(meshData(full.getMesh()).indices.length).toBeGreaterThan(0);
      expect(meshData(outside.getMesh()).indices.length).toBeGreaterThan(0);
    } finally {
      full.delete();
      outside.delete();
    }
  }, 30000);
});
