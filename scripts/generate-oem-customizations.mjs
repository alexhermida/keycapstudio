import { spawnSync } from 'node:child_process';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const openscad = '/Applications/OpenSCAD.app/Contents/MacOS/openscad';
const source = 'docs/plans/keyv2-oem-customizable.scad';
const temporary = '_tmp/oem-customizations';
const output = 'src/geometry/assets';
const catalogue = [
  [1, 1],
  [2, 1],
  [3, 1],
  [4, 1],
  [5, 1],
  [5, 1.25],
  [5, 1.5],
  [5, 1.75],
];
// Quarter-millimeter steps, including the untouched OEM value (c4/h0).
const radii = [2, 3, 4, 5, 6];
const heights = [-2, -1, 0, 1, 2];

const revision = spawnSync('git', ['rev-parse', 'HEAD'], {
  cwd: '_tmp/KeyV2',
  encoding: 'utf8',
});
if (revision.status !== 0 || revision.stdout.trim() !== '19f0d2faadd4949634c93f38d1a66869d29e8f43')
  throw new Error('KeyV2 checkout is not at the pinned revision.');
const version = spawnSync(openscad, ['--version'], { encoding: 'utf8' });
if (`${version.stdout}${version.stderr}`.trim() !== 'OpenSCAD version 2026.03.07')
  throw new Error('OpenSCAD version differs from the pinned generator.');
mkdirSync(temporary, { recursive: true });
mkdirSync(output, { recursive: true });

function readStl(filename) {
  const bytes = readFileSync(filename);
  const positions = [];
  const indices = [];
  const lookup = new Map();
  const add = (point) => {
    if (point.some((value) => !Number.isFinite(value)))
      throw new Error(`Invalid point: ${filename}`);
    const key = point.map((value) => Math.round(value * 1e5)).join(',');
    let index = lookup.get(key);
    if (index === undefined) {
      index = positions.length / 3;
      positions.push(...point);
      lookup.set(key, index);
    }
    indices.push(index);
  };
  if (bytes.length === 84 + bytes.readUInt32LE(80) * 50) {
    for (let offset = 84; offset < bytes.length; offset += 50)
      for (let vertex = 0; vertex < 3; vertex++)
        add([0, 1, 2].map((axis) => bytes.readFloatLE(offset + 12 + (vertex * 3 + axis) * 4)));
  } else {
    for (const match of bytes
      .toString('utf8')
      .matchAll(/\bvertex\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/g))
      add(match.slice(1).map(Number));
  }
  if (!positions.length || indices.length % 3) throw new Error(`Invalid STL: ${filename}`);
  const order = Array.from({ length: positions.length / 3 }, (_, index) => index).sort(
    (left, right) => {
      for (let axis = 0; axis < 3; axis++) {
        const difference = positions[left * 3 + axis] - positions[right * 3 + axis];
        if (difference) return difference;
      }
      return 0;
    },
  );
  const remap = new Uint32Array(order.length);
  const stablePositions = [];
  order.forEach((oldIndex, newIndex) => {
    remap[oldIndex] = newIndex;
    stablePositions.push(
      ...positions
        .slice(oldIndex * 3, oldIndex * 3 + 3)
        .map((value) => Math.round(value * 1e5) / 1e5),
    );
  });
  const faces = [];
  for (let offset = 0; offset < indices.length; offset += 3) {
    const face = indices.slice(offset, offset + 3).map((index) => remap[index]);
    const smallest = face.indexOf(Math.min(...face));
    faces.push([face[smallest], face[(smallest + 1) % 3], face[(smallest + 2) % 3]]);
  }
  faces.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  return { positions: stablePositions, indices: faces.flat() };
}

function saveMesh(filename, mesh, baseZ) {
  const { positions, indices } = mesh;
  const result = Buffer.allocUnsafe(12 + positions.length * 4 + indices.length * 4);
  result.write('KCAP', 0);
  result.writeUInt32LE(positions.length / 3, 4);
  result.writeUInt32LE(indices.length, 8);
  positions.forEach((value, index) =>
    result.writeFloatLE(index % 3 === 2 ? value - baseZ : value, 12 + index * 4),
  );
  indices.forEach((value, index) =>
    result.writeUInt32LE(value, 12 + positions.length * 4 + index * 4),
  );
  writeFileSync(filename, result);
  return createHash('sha256').update(result).digest('hex');
}

const manifest = [];
for (const [row, width] of catalogue) {
  for (const radius of radii) {
    for (const height of heights) {
      if (radius === 4 && height === 0) continue;
      const stem = `oem-r${row}-${String(width).replace('.', '_')}u-c${radius}-h${height}`;
      const meshes = {};
      for (const kind of ['blank', 'exterior']) {
        const filename = `${temporary}/${stem}-${kind}.stl`;
        const result = spawnSync(
          openscad,
          [
            '-D',
            `row=${row}`,
            '-D',
            `width_u=${width}`,
            '-D',
            `radius_mm=${radius / 4}`,
            '-D',
            `height_delta_mm=${height / 4}`,
            '-D',
            `exterior=${kind === 'exterior'}`,
            '-o',
            filename,
            source,
          ],
          {
            encoding: 'utf8',
            env: { ...process.env, OPENSCADPATH: `${process.cwd()}/_tmp/KeyV2` },
          },
        );
        if (result.status !== 0) throw new Error(`${stem} ${kind}: ${result.stderr}`);
        meshes[kind] = readStl(filename);
      }
      const baseZ = Math.min(...meshes.blank.positions.filter((_, index) => index % 3 === 2));
      const exteriorBaseZ = Math.min(
        ...meshes.exterior.positions.filter((_, index) => index % 3 === 2),
      );
      if (Math.abs(baseZ - exteriorBaseZ) > 1e-4)
        throw new Error(`${stem}: blank/exterior Z origins disagree`);
      const record = {
        row,
        width,
        radiusMm: radius / 4,
        heightDeltaMm: height / 4,
        baseZ,
        meshes: {},
      };
      for (const kind of ['blank', 'exterior']) {
        record.meshes[kind] = {
          sha256: saveMesh(`${output}/${stem}-${kind}.bin`, meshes[kind], baseZ),
          vertices: meshes[kind].positions.length / 3,
          triangles: meshes[kind].indices.length / 3,
        };
      }
      manifest.push(record);
      process.stdout.write(`${stem}\n`);
    }
  }
}
writeFileSync(
  'docs/plans/oem-customization-manifest.json',
  `${JSON.stringify(manifest, null, 2)}\n`,
);
