import type { Manifold, ManifoldToplevel } from 'manifold-3d';
function decodeMesh(bytes: ArrayBuffer) {
  const view = new DataView(bytes);
  if (bytes.byteLength < 12 || String.fromCharCode(...new Uint8Array(bytes, 0, 4)) !== 'KCAP')
    throw new Error('OEM template has an invalid header.');
  const vertexCount = view.getUint32(4, true);
  const indexCount = view.getUint32(8, true);
  if (
    vertexCount === 0 ||
    indexCount === 0 ||
    indexCount % 3 !== 0 ||
    bytes.byteLength !== 12 + vertexCount * 12 + indexCount * 4
  )
    throw new Error('OEM template has invalid dimensions.');
  const vertProperties = new Float32Array(vertexCount * 3);
  const triVerts = new Uint32Array(indexCount);
  for (let i = 0; i < vertProperties.length; i++) {
    const value = view.getFloat32(12 + i * 4, true);
    if (!Number.isFinite(value)) throw new Error('OEM template has invalid coordinates.');
    vertProperties[i] = value;
  }
  for (let i = 0; i < indexCount; i++) {
    const value = view.getUint32(12 + vertexCount * 12 + i * 4, true);
    if (value >= vertexCount) throw new Error('OEM template has invalid indices.');
    triVerts[i] = value;
  }
  return { numProp: 3, vertProperties, triVerts, tolerance: 1e-5 };
}

export async function loadSolid(kernel: ManifoldToplevel, url: string): Promise<Manifold> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not load the OEM template.');
  const solid = new kernel.Manifold(new kernel.Mesh(decodeMesh(await response.arrayBuffer())));
  if (solid.status() !== 'NoError') {
    solid.delete();
    throw new Error('OEM template is not a valid solid.');
  }
  return solid;
}
