import Module from 'manifold-3d';
import type { Manifold, CrossSection, ManifoldToplevel, Mesh } from 'manifold-3d';
import { KEYCAP, topHeight } from './config';
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
  const allocated: (Manifold | CrossSection)[] = [];
  const keep = <T extends Manifold | CrossSection>(solid: T): T => {
    allocated.push(solid);
    return solid;
  };
  const { Manifold: M, CrossSection: C } = kernel;
  try {
    function shellVolume(bottomWidth: number, topWidth: number, lower: number, roofOffset: number) {
      const section = keep(
        keep(C.square(bottomWidth - 2 * KEYCAP.cornerRadius, true)).offset(
          KEYCAP.cornerRadius,
          'Round',
          2,
          32,
        ),
      );
      const ratio = topWidth / bottomWidth;
      const extruded = keep(section.extrude(12, 0, 0, [ratio, ratio]));
      const refined = keep(extruded.refineToLength(KEYCAP.surfaceResolution));
      const warped = keep(
        refined.warp((v) => {
          v[2] = lower + (v[2] / 12) * (topHeight(v[0], v[1]) - roofOffset - lower);
        }),
      );
      return warped;
    }
    const outside = shellVolume(KEYCAP.bottomWidth, KEYCAP.topWidth, 0, 0);
    const cavity = shellVolume(
      KEYCAP.bottomWidth - 2 * KEYCAP.wallThickness,
      KEYCAP.topWidth - 2 * KEYCAP.wallThickness,
      -1,
      KEYCAP.roofThickness,
    );
    const shell = keep(outside.subtract(cavity));
    const stem = keep(
      keep(
        M.cylinder(12, KEYCAP.stemOuterDiameter / 2, KEYCAP.stemOuterDiameter / 2, 64),
      ).translate([0, 0, KEYCAP.stemBottom]),
    );
    const joined = keep(keep(shell.add(stem)).intersect(outside));
    const socketHeight = KEYCAP.stemBottom + KEYCAP.socketDepth + 1;
    const a = keep(
      keep(M.cube([KEYCAP.socketSpan, KEYCAP.socketArm, socketHeight], true)).translate([
        0,
        0,
        socketHeight / 2 - 1,
      ]),
    );
    const b = keep(
      keep(M.cube([KEYCAP.socketArm, KEYCAP.socketSpan, socketHeight], true)).translate([
        0,
        0,
        socketHeight / 2 - 1,
      ]),
    );
    const full = keep(joined.subtract(keep(a.add(b))));
    const sections = artwork.paths.map((path) => keep(new C(path.contours, path.fillRule)));
    if (!sections.length) throw new Error('SVG has no filled shapes.');
    const combined = keep(C.union(sections));
    const scaled = keep(combined.scale(size));
    if (scaled.area() < 0.02) throw new Error('SVG has no usable filled area at this size.');
    const prism = keep(scaled.extrude(15));
    // Intersect with the very same tessellated outer surface used by the body.
    // This gives an exact flush surface and a 0.5 mm vertical inlay depth.
    const lowerSurface = keep(outside.translate([0, 0, -KEYCAP.legendDepth]));
    const band = keep(outside.subtract(lowerSurface));
    const legend = keep(prism.intersect(band));
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
