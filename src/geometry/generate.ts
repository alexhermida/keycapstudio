import Module from 'manifold-3d';
import type { Manifold, CrossSection, ManifoldToplevel, Mesh } from 'manifold-3d';
import { KEYCAP } from './config';
import { createCurrentBlank } from './template';
import type { Artwork, KeycapModel, MeshData } from './types';

export async function initializeKernel(wasmUrl?: string): Promise<ManifoldToplevel> {
  const kernel = await Module(wasmUrl ? { locateFile: () => wasmUrl } : undefined);
  kernel.setup();
  return kernel;
}

/** Weld property-boundary duplicates using Manifold's explicit merge mapping. */
export function meshData(mesh: Mesh): MeshData {
  const parent = Array.from({ length: mesh.vertProperties.length / mesh.numProp }, (_, i) => i);
  for (let i = 0; i < mesh.mergeFromVert.length; i++)
    parent[mesh.mergeFromVert[i]] = mesh.mergeToVert[i];
  const root = (i: number): number => {
    while (parent[i] !== i) i = parent[i];
    return i;
  };
  const map = new Map<number, number>();
  const positions: number[] = [];
  const indices = new Uint32Array(mesh.triVerts.length);
  for (let i = 0; i < indices.length; i++) {
    const v = root(mesh.triVerts[i]);
    if (!map.has(v)) {
      map.set(v, positions.length / 3);
      positions.push(...mesh.vertProperties.slice(v * mesh.numProp, v * mesh.numProp + 3));
    }
    indices[i] = map.get(v)!;
  }
  return { positions: new Float32Array(positions), indices };
}

export function generateKeycap(
  kernel: ManifoldToplevel,
  artwork: Artwork,
  size: number,
): KeycapModel {
  if (!Number.isFinite(size) || size < KEYCAP.minLegendSize || size > KEYCAP.maxLegendSize)
    throw new Error('Legend size must be between 3 and 11 mm.');
  const blank = createCurrentBlank(kernel);
  try {
    return generateFromBlank(kernel, blank.full, blank.outside, artwork, size);
  } finally {
    blank.full.delete();
    blank.outside.delete();
  }
}

/** Apply the existing inlay operation to a borrowed blank and matching exterior. */
export function generateFromBlank(
  kernel: ManifoldToplevel,
  full: Manifold,
  outside: Manifold,
  artwork: Artwork,
  size: number,
  legendCenter: [number, number] = [0, 0],
): KeycapModel {
  if (!Number.isFinite(size) || size < KEYCAP.minLegendSize || size > KEYCAP.maxLegendSize)
    throw new Error('Legend size must be between 3 and 11 mm.');
  if (legendCenter.some((value) => !Number.isFinite(value)))
    throw new Error('Legend center must be finite.');
  const allocated: (Manifold | CrossSection)[] = [];
  const keep = <T extends Manifold | CrossSection>(solid: T): T => {
    allocated.push(solid);
    return solid;
  };
  const { CrossSection: C } = kernel;
  try {
    const sections = artwork.paths.map((path) => keep(new C(path.contours, path.fillRule)));
    if (!sections.length) throw new Error('SVG has no filled shapes.');
    const combined = keep(C.union(sections));
    const scaled = keep(combined.scale(size));
    if (scaled.area() < 0.02) throw new Error('SVG has no usable filled area at this size.');
    const placed =
      legendCenter[0] || legendCenter[1] ? keep(scaled.translate(legendCenter)) : scaled;
    const prism = keep(placed.extrude(15));
    // Intersect with the very same tessellated outer surface used by the body.
    // This gives an exact flush surface and a 0.5 mm vertical inlay depth.
    const lowerSurface = keep(outside.translate([0, 0, -KEYCAP.legendDepth]));
    const band = keep(outside.subtract(lowerSurface));
    const legend = keep(prism.intersect(band));
    const expectedLegendVolume = scaled.area() * KEYCAP.legendDepth;
    if (
      Math.abs(legend.volume() - expectedLegendVolume) > Math.max(1e-3, expectedLegendVolume * 0.01)
    )
      throw new Error('This icon extends beyond the usable key top. Reduce its size.');
    const body = keep(full.subtract(legend));
    if (body.status() !== 'NoError' || legend.status() !== 'NoError' || legend.isEmpty())
      throw new Error('This icon could not produce valid solids. Try a simpler SVG.');
    const overlap = keep(body.intersect(legend));
    if (overlap.volume() > 1e-5) throw new Error('Body and legend unexpectedly overlap.');
    const totalVolume = full.volume();
    if (Math.abs(body.volume() + legend.volume() - totalVolume) > 1e-3)
      throw new Error('Legend does not fit within the keycap roof.');
    return {
      body: meshData(body.getMesh()),
      legend: meshData(legend.getMesh()),
      bodyVolume: body.volume(),
      legendVolume: legend.volume(),
      totalVolume,
    };
  } finally {
    for (let i = allocated.length - 1; i >= 0; i--) allocated[i].delete();
  }
}
