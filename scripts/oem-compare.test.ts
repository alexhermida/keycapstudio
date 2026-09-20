// @vitest-environment jsdom
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import { EXAMPLES } from '../src/examples';
import { exportThreeMf } from '../src/export/threeMf';
import { generateFromBlank, initializeKernel } from '../src/geometry/generate';
import { createCurrentBlank } from '../src/geometry/template';
import { parseArtwork } from '../src/svg/parse';

const directory = '_tmp/oem-template-comparison/';

function readStl(kernel: Awaited<ReturnType<typeof initializeKernel>>, name: string) {
  const bytes = readFileSync(`${directory}${name}`);
  const positions: number[] = [];
  const indices: number[] = [];
  const vertices = new Map<string, number>();
  const add = (point: number[]) => {
    const key = point.map((value) => Math.round(value * 1e5)).join(',');
    let index = vertices.get(key);
    if (index === undefined) {
      index = positions.length / 3;
      positions.push(...point);
      vertices.set(key, index);
    }
    indices.push(index);
  };
  if (bytes.length === 84 + bytes.readUInt32LE(80) * 50) {
    for (let offset = 84; offset < bytes.length; offset += 50)
      for (let vertex = 0; vertex < 3; vertex++)
        add([0, 1, 2].map((axis) => bytes.readFloatLE(offset + 12 + (vertex * 3 + axis) * 4)));
  } else {
    const matches = [
      ...bytes.toString('utf8').matchAll(/\bvertex\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/g),
    ];
    expect(matches.length % 3).toBe(0);
    for (const match of matches) add(match.slice(1).map(Number));
  }
  const solid = new kernel.Manifold(
    new kernel.Mesh({
      numProp: 3,
      vertProperties: new Float32Array(positions),
      triVerts: new Uint32Array(indices),
      tolerance: 1e-5,
    }),
  );
  expect(solid.status()).toBe('NoError');
  return solid;
}

it('generates a matched inlay on both blanks and checks the OEM size range', async () => {
  const kernel = await initializeKernel();
  const artwork = parseArtwork(EXAMPLES.spark);
  const templates = [
    ['current', 'current_template.stl', 'current_exterior.stl', [0, 0]],
    ['keyv2_oem_row5', 'keyv2_oem_row5_reference.stl', 'keyv2_oem_row5_exterior.stl', [0, 1.75]],
  ] as const;
  const results: Record<string, unknown> = {};
  const controlLegendVolumes = new Map<number, number>();
  for (const [label, blankName, outsideName, center] of templates) {
    const current = label === 'current' ? createCurrentBlank(kernel) : undefined;
    const blank = current?.full ?? readStl(kernel, blankName);
    const outside = current?.outside ?? readStl(kernel, outsideName);
    try {
      for (const size of [3, 8, 11]) {
        const model = generateFromBlank(kernel, blank, outside, artwork, size, [...center]);
        if (label === 'current') controlLegendVolumes.set(size, model.legendVolume);
        else expect(model.legendVolume).toBeCloseTo(controlLegendVolumes.get(size)!, 4);
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
        const overlap = body.intersect(legend);
        const union = body.add(legend);
        const missing = blank.subtract(union);
        const extra = union.subtract(blank);
        const pieces = body.decompose();
        expect(body.status()).toBe('NoError');
        expect(legend.status()).toBe('NoError');
        if (size === 8) expect(pieces.length).toBe(1);
        if (label === 'keyv2_oem_row5') {
          expect(overlap.volume()).toBeLessThan(1e-4);
          expect(missing.volume() + extra.volume()).toBeLessThan(1e-3);
        }
        const key = `${label}_${size}mm`;
        results[key] = {
          bodyVolume: model.bodyVolume,
          legendVolume: model.legendVolume,
          totalVolume: model.totalVolume,
          legendBounds: legend.boundingBox(),
          overlapVolume: overlap.volume(),
          reconstructionDifferenceVolume: missing.volume() + extra.volume(),
          bodyComponents: pieces.length,
        };
        if (size === 8) {
          const bytes = exportThreeMf(model, '#263447', '#e2a544');
          const name = `${label}_same_svg.3mf`;
          writeFileSync(`${directory}${name}`, bytes);
          const archive = unzipSync(bytes);
          const xml = strFromU8(archive['3D/3dmodel.model']);
          expect(xml).toContain('name="Body"');
          expect(xml).toContain('name="Legend"');
          expect(xml).toContain('name="Custom Keycap"');
          (results[key] as Record<string, unknown>).export = {
            filename: name,
            sha256: createHash('sha256').update(bytes).digest('hex'),
          };
        }
        pieces.forEach((piece) => piece.delete());
        body.delete();
        legend.delete();
        overlap.delete();
        union.delete();
        missing.delete();
        extra.delete();
      }
    } finally {
      blank.delete();
      outside.delete();
    }
  }
  writeFileSync(`${directory}inlay-results.json`, JSON.stringify(results, null, 2));
}, 120000);

it('keeps the central socket and exports a valid inlay for isolated corner-radius probes', async () => {
  const kernel = await initializeKernel();
  const artwork = parseArtwork(EXAMPLES.spark);
  const reference = readStl(kernel, 'keyv2_oem_row5_reference.stl');
  const socketRegion = kernel.Manifold.cube([6, 6, 4], true).translate([0, 0, 2]);
  const referenceSocket = reference.intersect(socketRegion);
  try {
    for (const radius of ['0_5', '1_5']) {
      const blank = readStl(kernel, `customization-radius-${radius}.stl`);
      const outside = readStl(kernel, `customization-radius-${radius}-exterior.stl`);
      try {
        const candidateSocket = blank.intersect(socketRegion);
        const socketDelta = candidateSocket.subtract(referenceSocket);
        const socketMissing = referenceSocket.subtract(candidateSocket);
        const outsideDifference = blank.subtract(outside);
        expect(socketDelta.volume() + socketMissing.volume()).toBeLessThan(1e-4);
        expect(outsideDifference.volume()).toBeLessThan(1e-4);
        for (const solid of [candidateSocket, socketDelta, socketMissing, outsideDifference])
          solid.delete();

        for (const size of [3, 8, 11]) {
          const model = generateFromBlank(kernel, blank, outside, artwork, size, [0, 1.75]);
          expect(model.legendVolume).toBeGreaterThan(0);
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
          const overlap = body.intersect(legend);
          const parts = body.decompose();
          expect(parts).toHaveLength(1);
          expect(overlap.volume()).toBeLessThan(1e-4);
          if (size === 8) {
            const bytes = exportThreeMf(model, '#263447', '#e2a544');
            const archive = unzipSync(bytes);
            const xml = strFromU8(archive['3D/3dmodel.model']);
            expect(xml).toContain('name="Body"');
            expect(xml).toContain('name="Legend"');
            expect(xml).toContain('name="Custom Keycap"');
            expect(Object.keys(archive).some((name) => name.endsWith('.gcode'))).toBe(false);
            writeFileSync(`${directory}customization-radius-${radius}-spark.3mf`, bytes);
          }
          for (const solid of [...parts, body, legend, overlap]) solid.delete();
        }
      } finally {
        blank.delete();
        outside.delete();
      }
    }
  } finally {
    referenceSocket.delete();
    socketRegion.delete();
    reference.delete();
  }
}, 120000);
