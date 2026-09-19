import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import { createHash } from 'node:crypto';

const root = '_tmp/oem-template-comparison/';
const output = 'src/geometry/assets/';
mkdirSync(output, { recursive: true });

for (const [source, target, expectedHash] of [
  [
    'keyv2_oem_row5_reference.stl',
    'oem-row5-blank.bin',
    '678fd91b61a492947b7586aa6f9607332749f3563a52e83d052bc7c11eab4e13',
  ],
  [
    'keyv2_oem_row5_exterior.stl',
    'oem-row5-exterior.bin',
    '865b18bb304d0ddafe3a5cec2afdc7e6be590672a4cf8c9fd2b681273f91c3c2',
  ],
]) {
  const stl = readFileSync(root + source);
  if (createHash('sha256').update(stl).digest('hex') !== expectedHash)
    throw new Error(`Unexpected source mesh: ${source}`);
  const vertices = [];
  const indices = [];
  const lookup = new Map();
  const add = (coordinates) => {
    const key = coordinates.map((value) => Math.round(value * 1e5)).join(',');
    let index = lookup.get(key);
    if (index === undefined) {
      index = vertices.length / 3;
      vertices.push(...coordinates);
      lookup.set(key, index);
    }
    indices.push(index);
  };
  if (stl.length === 84 + stl.readUInt32LE(80) * 50) {
    for (let offset = 84; offset < stl.length; offset += 50)
      for (let vertex = 0; vertex < 3; vertex++)
        add([0, 1, 2].map((axis) => stl.readFloatLE(offset + 12 + (vertex * 3 + axis) * 4)));
  } else {
    const matches = stl.toString('utf8').matchAll(/\bvertex\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/g);
    for (const match of matches) add(match.slice(1).map(Number));
  }
  if (!vertices.length || !indices.length || indices.length % 3)
    throw new Error(`Invalid ${source}`);
  const result = Buffer.allocUnsafe(12 + vertices.length * 4 + indices.length * 4);
  result.write('KCAP', 0);
  result.writeUInt32LE(vertices.length / 3, 4);
  result.writeUInt32LE(indices.length, 8);
  vertices.forEach((value, index) => result.writeFloatLE(value, 12 + index * 4));
  indices.forEach((value, index) =>
    result.writeUInt32LE(value, 12 + vertices.length * 4 + index * 4),
  );
  writeFileSync(output + target, result);
  process.stdout.write(
    `${target}: ${vertices.length / 3} vertices, ${indices.length / 3} triangles\n`,
  );
}
