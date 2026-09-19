import { describe, expect, it } from 'vitest';
import { binaryStl } from '../src/geometry/stl';
import type { MeshData } from '../src/geometry/types';

const triangle: MeshData = {
  positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
  indices: new Uint32Array([0, 1, 2]),
};

describe('binary STL export', () => {
  it('writes all three vertices in each triangle record', () => {
    const bytes = binaryStl(triangle, 'test');
    const view = new DataView(bytes.buffer);
    expect(bytes.byteLength).toBe(134);
    expect(view.getUint32(80, true)).toBe(1);
    expect(Array.from({ length: 9 }, (_, index) => view.getFloat32(96 + index * 4, true))).toEqual([
      0, 0, 0, 1, 0, 0, 0, 1, 0,
    ]);
  });
});
