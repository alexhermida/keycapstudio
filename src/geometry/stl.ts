import type { MeshData } from './types';

/** Serialize a triangle mesh as a binary STL in millimeters. */
export function binaryStl(mesh: MeshData, name: string): Uint8Array {
  if (mesh.indices.length % 3 !== 0) throw new Error('STL mesh must contain complete triangles.');

  const triangleCount = mesh.indices.length / 3;
  const bytes = new Uint8Array(84 + triangleCount * 50);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < Math.min(name.length, 80); i++) bytes[i] = name.charCodeAt(i) & 0xff;
  view.setUint32(80, triangleCount, true);

  const vertex = (index: number, coordinate: number) => mesh.positions[index * 3 + coordinate];
  for (let triangle = 0; triangle < triangleCount; triangle++) {
    const offset = 84 + triangle * 50;
    const indices = [
      mesh.indices[triangle * 3],
      mesh.indices[triangle * 3 + 1],
      mesh.indices[triangle * 3 + 2],
    ];
    const a = indices[0];
    const b = indices[1];
    const c = indices[2];
    const ab = [
      vertex(b, 0) - vertex(a, 0),
      vertex(b, 1) - vertex(a, 1),
      vertex(b, 2) - vertex(a, 2),
    ];
    const ac = [
      vertex(c, 0) - vertex(a, 0),
      vertex(c, 1) - vertex(a, 1),
      vertex(c, 2) - vertex(a, 2),
    ];
    const normal = [
      ab[1] * ac[2] - ab[2] * ac[1],
      ab[2] * ac[0] - ab[0] * ac[2],
      ab[0] * ac[1] - ab[1] * ac[0],
    ];
    const length = Math.hypot(...normal) || 1;
    normal.forEach((component, coordinate) =>
      view.setFloat32(offset + coordinate * 4, component / length, true),
    );
    indices.forEach((index, vertexIndex) => {
      for (let coordinate = 0; coordinate < 3; coordinate++)
        view.setFloat32(
          offset + 12 + (vertexIndex * 3 + coordinate) * 4,
          vertex(index, coordinate),
          true,
        );
    });
  }
  return bytes;
}
