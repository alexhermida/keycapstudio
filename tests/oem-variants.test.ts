// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { expect, test } from 'vitest';
import { initializeKernel, generateFromBlank } from '../src/geometry/generate';
import { KEY_VARIANTS } from '../src/geometry/variants';
import { parseArtwork } from '../src/svg/parse';
import { EXAMPLES } from '../src/examples';
import manifest from '../docs/plans/oem-variant-manifest.json';

function assetName(id: string, kind: 'blank' | 'exterior') {
  return id === 'oem-r5-1u' ? `oem-row5-${kind}.bin` : `${id}-${kind}.bin`;
}

function readSolid(kernel: Awaited<ReturnType<typeof initializeKernel>>, filename: string) {
  const bytes = readFileSync(`src/geometry/assets/${filename}`);
  const vertices = bytes.readUInt32LE(4);
  const triangles = bytes.readUInt32LE(8);
  expect(bytes.toString('ascii', 0, 4)).toBe('KCAP');
  expect(bytes.length).toBe(12 + vertices * 12 + triangles * 4);
  const positions = new Float32Array(vertices * 3);
  const indices = new Uint32Array(triangles);
  for (let i = 0; i < positions.length; i++) positions[i] = bytes.readFloatLE(12 + i * 4);
  for (let i = 0; i < indices.length; i++)
    indices[i] = bytes.readUInt32LE(12 + positions.length * 4 + i * 4);
  const solid = new kernel.Manifold(
    new kernel.Mesh({ numProp: 3, vertProperties: positions, triVerts: indices, tolerance: 1e-5 }),
  );
  expect(solid.status()).toBe('NoError');
  return solid;
}

test('each offered OEM row/width has a matched solid and usable inlay', async () => {
  const kernel = await initializeKernel();
  const artwork = parseArtwork(EXAMPLES.spark);
  expect(new Set(KEY_VARIANTS.map((variant) => variant.id)).size).toBe(KEY_VARIANTS.length);
  const legendVolumes = new Map<number, number[]>();
  for (const variant of KEY_VARIANTS) {
    if (variant.id !== 'oem-r5-1u') {
      const record = manifest.find(
        (item) => item.row === variant.row && item.width === variant.width,
      );
      expect(record).toBeDefined();
      for (const kind of ['blank', 'exterior'] as const) {
        const bytes = readFileSync(`src/geometry/assets/${assetName(variant.id, kind)}`);
        expect(createHash('sha256').update(bytes).digest('hex')).toBe(
          record!.meshes[kind].assetSha256,
        );
      }
    }
    const full = readSolid(kernel, assetName(variant.id, 'blank'));
    const outside = readSolid(kernel, assetName(variant.id, 'exterior'));
    try {
      const extra = full.subtract(outside);
      expect(extra.volume()).toBeLessThan(1e-4);
      extra.delete();
      for (const size of [3, 8, 11]) {
        const model = generateFromBlank(kernel, full, outside, artwork, size, [
          ...variant.legendCenter,
        ]);
        expect(model.legendVolume).toBeGreaterThan(0);
        expect(model.bodyVolume + model.legendVolume).toBeCloseTo(model.totalVolume, 3);
        const volumes = legendVolumes.get(size) ?? [];
        volumes.push(model.legendVolume);
        legendVolumes.set(size, volumes);
        if (size === 8) {
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
          const parts = body.decompose();
          const overlap = body.intersect(legend);
          const reconstructed = body.add(legend);
          const missing = full.subtract(reconstructed);
          const extra = reconstructed.subtract(full);
          expect(parts).toHaveLength(1);
          expect(overlap.volume()).toBeLessThan(1e-4);
          expect(missing.volume() + extra.volume()).toBeLessThan(1e-3);
          for (const solid of [...parts, body, legend, overlap, reconstructed, missing, extra])
            solid.delete();
        }
      }
    } finally {
      full.delete();
      outside.delete();
    }
  }
  for (const volumes of legendVolumes.values())
    for (const volume of volumes) expect(volume).toBeCloseTo(volumes[0], 3);
}, 120000);
