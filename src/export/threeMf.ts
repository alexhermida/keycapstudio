import { strToU8, zipSync } from 'fflate';
import type { KeycapModel, MeshData } from '../geometry/types';

export const MODEL_NS = 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02';
const xml = '<?xml version="1.0" encoding="UTF-8"?>';

function meshXml(mesh: MeshData, id: number, name: string, material: number): string {
  const vertices: string[] = [],
    triangles: string[] = [];
  for (let i = 0; i < mesh.positions.length; i += 3) {
    const xyz = mesh.positions.slice(i, i + 3);
    if (!xyz.every(Number.isFinite)) throw new Error('Invalid mesh coordinate.');
    vertices.push(`<vertex x="${xyz[0]}" y="${xyz[1]}" z="${xyz[2]}"/>`);
  }
  for (let i = 0; i < mesh.indices.length; i += 3)
    triangles.push(
      `<triangle v1="${mesh.indices[i]}" v2="${mesh.indices[i + 1]}" v3="${mesh.indices[i + 2]}"/>`,
    );
  return `<object id="${id}" name="${name}" type="model" pid="1" pindex="${material}"><mesh><vertices>${vertices.join('')}</vertices><triangles>${triangles.join('')}</triangles></mesh></object>`;
}

/** Model-only 3MF: no machine profile, filament presets, user data, or G-code. */
export function exportThreeMf(
  model: KeycapModel,
  bodyColor: string,
  legendColor: string,
): Uint8Array<ArrayBuffer> {
  if (![bodyColor, legendColor].every((c) => /^#[0-9a-f]{6}$/i.test(c)))
    throw new Error('Colors must be six-digit hex values.');
  const modelXml = `${xml}<model unit="millimeter" xml:lang="en-US" xmlns="${MODEL_NS}"><metadata name="Title">Custom Keycap</metadata><resources><basematerials id="1"><base name="Body" displaycolor="${bodyColor.toUpperCase()}FF"/><base name="Legend" displaycolor="${legendColor.toUpperCase()}FF"/></basematerials>${meshXml(model.body, 2, 'Body', 0)}${meshXml(model.legend, 3, 'Legend', 1)}<object id="4" name="Custom Keycap" type="model"><components><component objectid="2"/><component objectid="3"/></components></object></resources><build><item objectid="4"/></build></model>`;
  const config = `${xml}<config><object id="4"><metadata key="name" value="Custom Keycap"/><part id="2" subtype="normal_part"><metadata key="name" value="Body"/><metadata key="extruder" value="1"/></part><part id="3" subtype="normal_part"><metadata key="name" value="Legend"/><metadata key="extruder" value="2"/></part></object></config>`;
  const files: Record<string, string> = {
    '[Content_Types].xml': `${xml}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/><Default Extension="config" ContentType="application/xml"/></Types>`,
    '_rels/.rels': `${xml}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>`,
    '3D/3dmodel.model': modelXml,
    'Metadata/model_settings.config': config,
  };
  return zipSync(
    Object.fromEntries(
      Object.entries(files).map(([name, text]) => [
        name,
        [strToU8(text), { mtime: new Date(2020, 0, 1) }],
      ]),
    ),
    { level: 6 },
  );
}
