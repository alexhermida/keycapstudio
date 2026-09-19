import r1Blank from './assets/oem-r1-1u-blank.bin?url';
import r1Exterior from './assets/oem-r1-1u-exterior.bin?url';
import r2Blank from './assets/oem-r2-1u-blank.bin?url';
import r2Exterior from './assets/oem-r2-1u-exterior.bin?url';
import r3Blank from './assets/oem-r3-1u-blank.bin?url';
import r3Exterior from './assets/oem-r3-1u-exterior.bin?url';
import r4Blank from './assets/oem-r4-1u-blank.bin?url';
import r4Exterior from './assets/oem-r4-1u-exterior.bin?url';
import r5Blank from './assets/oem-row5-blank.bin?url';
import r5Exterior from './assets/oem-row5-exterior.bin?url';
import r5w125Blank from './assets/oem-r5-1_25u-blank.bin?url';
import r5w125Exterior from './assets/oem-r5-1_25u-exterior.bin?url';
import r5w150Blank from './assets/oem-r5-1_5u-blank.bin?url';
import r5w150Exterior from './assets/oem-r5-1_5u-exterior.bin?url';
import r5w175Blank from './assets/oem-r5-1_75u-blank.bin?url';
import r5w175Exterior from './assets/oem-r5-1_75u-exterior.bin?url';

export interface KeyVariant {
  id: string;
  row: number;
  width: number;
  blankUrl: string;
  exteriorUrl: string;
  legendCenter: readonly [number, number];
  physicalStatus: 'sample-checked' | 'experimental';
}

/** The UI only offers these generated combinations; the list is not a keyboard layout. */
export const KEY_VARIANTS: readonly KeyVariant[] = [
  {
    id: 'oem-r1-1u',
    row: 1,
    width: 1,
    blankUrl: r1Blank,
    exteriorUrl: r1Exterior,
    legendCenter: [0, 1.75],
    physicalStatus: 'experimental',
  },
  {
    id: 'oem-r2-1u',
    row: 2,
    width: 1,
    blankUrl: r2Blank,
    exteriorUrl: r2Exterior,
    legendCenter: [0, 1.75],
    physicalStatus: 'experimental',
  },
  {
    id: 'oem-r3-1u',
    row: 3,
    width: 1,
    blankUrl: r3Blank,
    exteriorUrl: r3Exterior,
    legendCenter: [0, 1.75],
    physicalStatus: 'experimental',
  },
  {
    id: 'oem-r4-1u',
    row: 4,
    width: 1,
    blankUrl: r4Blank,
    exteriorUrl: r4Exterior,
    legendCenter: [0, 1.75],
    physicalStatus: 'experimental',
  },
  {
    id: 'oem-r5-1u',
    row: 5,
    width: 1,
    blankUrl: r5Blank,
    exteriorUrl: r5Exterior,
    legendCenter: [0, 1.75],
    physicalStatus: 'sample-checked',
  },
  {
    id: 'oem-r5-1_25u',
    row: 5,
    width: 1.25,
    blankUrl: r5w125Blank,
    exteriorUrl: r5w125Exterior,
    legendCenter: [0, 1.75],
    physicalStatus: 'experimental',
  },
  {
    id: 'oem-r5-1_5u',
    row: 5,
    width: 1.5,
    blankUrl: r5w150Blank,
    exteriorUrl: r5w150Exterior,
    legendCenter: [0, 1.75],
    physicalStatus: 'experimental',
  },
  {
    id: 'oem-r5-1_75u',
    row: 5,
    width: 1.75,
    blankUrl: r5w175Blank,
    exteriorUrl: r5w175Exterior,
    legendCenter: [0, 1.75],
    physicalStatus: 'experimental',
  },
];

export const DEFAULT_VARIANT_ID = 'oem-r5-1u';

export function getVariant(id: string): KeyVariant {
  const variant = KEY_VARIANTS.find((candidate) => candidate.id === id);
  if (!variant) throw new Error('This key variant is not supported.');
  return variant;
}
