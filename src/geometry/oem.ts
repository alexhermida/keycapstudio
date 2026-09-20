import { loadSolid } from './meshAsset';
import type { ManifoldToplevel } from 'manifold-3d';
import { OEM_CUSTOMIZATION, validateOemCustomization } from './config';
import { getVariant } from './variants';

const customAssets = import.meta.glob('./assets/*-c*-h*.bin', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** Caller owns both solids and must delete them. */
export async function loadOemBlank(
  kernel: ManifoldToplevel,
  variantId: string,
  radiusMm: number = OEM_CUSTOMIZATION.radiusDefault,
  heightDeltaMm: number = OEM_CUSTOMIZATION.heightDefault,
) {
  validateOemCustomization(radiusMm, heightDeltaMm);
  const variant = getVariant(variantId);
  const custom = radiusMm !== 1 || heightDeltaMm !== 0;
  const stem = `${variant.id}-c${radiusMm * 4}-h${heightDeltaMm * 4}`;
  const blankUrl = custom ? customAssets[`./assets/${stem}-blank.bin`] : variant.blankUrl;
  const exteriorUrl = custom ? customAssets[`./assets/${stem}-exterior.bin`] : variant.exteriorUrl;
  if (!blankUrl || !exteriorUrl) throw new Error('This OEM size combination is unavailable.');
  const full = await loadSolid(kernel, blankUrl);
  try {
    return { full, outside: await loadSolid(kernel, exteriorUrl) };
  } catch (error) {
    full.delete();
    throw error;
  }
}
