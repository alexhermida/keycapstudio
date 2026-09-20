// @vitest-environment jsdom
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { initializeKernel, generateFromBlank } from '../src/geometry/generate';
import { OEM_CUSTOMIZATION, validateOemCustomization } from '../src/geometry/config';
import { EXAMPLES } from '../src/examples';
import { parseArtwork } from '../src/svg/parse';
import manifest from '../docs/plans/oem-customization-manifest.json';

function readSolid(kernel: Awaited<ReturnType<typeof initializeKernel>>, filename: string) {
  const bytes = readFileSync(`src/geometry/assets/${filename}`);
  const vertexCount = bytes.readUInt32LE(4);
  const indexCount = bytes.readUInt32LE(8);
  expect(bytes.toString('ascii', 0, 4)).toBe('KCAP');
  expect(bytes.length).toBe(12 + vertexCount * 12 + indexCount * 4);
  const positions = new Float32Array(vertexCount * 3);
  const indices = new Uint32Array(indexCount);
  for (let i = 0; i < positions.length; i++) positions[i] = bytes.readFloatLE(12 + i * 4);
  for (let i = 0; i < indices.length; i++)
    indices[i] = bytes.readUInt32LE(12 + positions.length * 4 + i * 4);
  const solid = new kernel.Manifold(
    new kernel.Mesh({ numProp: 3, vertProperties: positions, triVerts: indices, tolerance: 1e-5 }),
  );
  expect(solid.status()).toBe('NoError');
  return solid;
}

test('only offered OEM measurement steps are accepted', () => {
  for (let radius = 0.5; radius <= 1.5; radius += 0.25)
    for (let height = -0.5; height <= 0.5; height += 0.25)
      expect(() => validateOemCustomization(radius, height)).not.toThrow();
  for (const [radius, height] of [
    [0.6, 0],
    [1, 0.1],
    [2, 0],
    [1, Number.NaN],
  ])
    expect(() => validateOemCustomization(radius, height)).toThrow();
  expect(OEM_CUSTOMIZATION.radiusDefault).toBe(1);
  expect(OEM_CUSTOMIZATION.heightDefault).toBe(0);
});

test('height changes the actual OEM mesh while the original remains the reference', async () => {
  const kernel = await initializeKernel();
  const reference = readSolid(kernel, 'oem-row5-blank.bin');
  const taller = readSolid(kernel, 'oem-r5-1u-c4-h2-blank.bin');
  const shorter = readSolid(kernel, 'oem-r5-1u-c4-h-2-blank.bin');
  try {
    const height = (solid: typeof reference) => {
      const bounds = solid.boundingBox();
      return bounds.max[2] - bounds.min[2];
    };
    expect(height(taller) - height(reference)).toBeCloseTo(0.5, 2);
    expect(height(reference) - height(shorter)).toBeCloseTo(0.5, 2);
  } finally {
    reference.delete();
    taller.delete();
    shorter.delete();
  }
});

test('every generated OEM measurement has a valid blank, exterior, and inlay', async () => {
  const kernel = await initializeKernel();
  const artwork = parseArtwork(EXAMPLES.spark);
  expect(manifest).toHaveLength(8 * (5 * 5 - 1));
  const ids = new Set<string>();
  for (const entry of manifest) {
    const stem = `oem-r${entry.row}-${String(entry.width).replace('.', '_')}u-c${entry.radiusMm * 4}-h${entry.heightDeltaMm * 4}`;
    expect(ids.has(stem)).toBe(false);
    ids.add(stem);
    expect(entry.radiusMm !== 1 || entry.heightDeltaMm !== 0).toBe(true);
    for (const kind of ['blank', 'exterior'] as const) {
      const bytes = readFileSync(`src/geometry/assets/${stem}-${kind}.bin`);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(entry.meshes[kind].sha256);
    }
    const blank = readSolid(kernel, `${stem}-blank.bin`);
    const exterior = readSolid(kernel, `${stem}-exterior.bin`);
    try {
      const extra = blank.subtract(exterior);
      expect(extra.volume(), stem).toBeLessThan(1e-3);
      extra.delete();
      const model = generateFromBlank(kernel, blank, exterior, artwork, 8, [0, 1.75]);
      expect(model.bodyVolume + model.legendVolume).toBeCloseTo(model.totalVolume, 3);
      expect(model.legendVolume).toBeGreaterThan(0);
    } finally {
      blank.delete();
      exterior.delete();
    }
  }
}, 180000);
