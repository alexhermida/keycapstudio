// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { strFromU8, unzipSync } from 'fflate';
import { exportThreeMf } from '../src/export/threeMf';
import type { KeycapModel } from '../src/geometry/types';

const tetra = {
  positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]),
  indices: new Uint32Array([0, 2, 1, 0, 1, 3, 0, 3, 2, 1, 2, 3]),
};
const model: KeycapModel = {
  body: tetra,
  legend: tetra,
  bodyVolume: 1,
  legendVolume: 1,
  totalVolume: 2,
};
it('exports one assembly with two named, separately assigned parts and no print profile', () => {
  const bytes = exportThreeMf(model, '#112233', '#aabbcc');
  const archive = unzipSync(bytes);
  expect(Object.keys(archive).sort()).toEqual(
    [
      '3D/3dmodel.model',
      'Metadata/model_settings.config',
      '[Content_Types].xml',
      '_rels/.rels',
    ].sort(),
  );
  const doc = new DOMParser().parseFromString(
    strFromU8(archive['3D/3dmodel.model']),
    'application/xml',
  );
  expect(doc.querySelector('parsererror')).toBeNull();
  expect(doc.documentElement.getAttribute('unit')).toBe('millimeter');
  expect([...doc.querySelectorAll('object')].map((o) => o.getAttribute('name'))).toEqual([
    'Body',
    'Legend',
    'Custom Keycap',
  ]);
  expect(doc.querySelectorAll('build item')).toHaveLength(1);
  expect([...doc.querySelectorAll('component')].map((o) => o.getAttribute('objectid'))).toEqual([
    '2',
    '3',
  ]);
  expect(doc.querySelectorAll('base')).toHaveLength(2);
  const config = new DOMParser().parseFromString(
    strFromU8(archive['Metadata/model_settings.config']),
    'application/xml',
  );
  expect(
    [...config.querySelectorAll('part metadata[key="extruder"]')].map((e) =>
      e.getAttribute('value'),
    ),
  ).toEqual(['1', '2']);
  expect(exportThreeMf(model, '#112233', '#aabbcc')).toEqual(bytes);
});
it('does not allow arbitrary markup through color inputs', () => {
  expect(() => exportThreeMf(model, '"/><x/>', '#ffffff')).toThrow('hex');
});
