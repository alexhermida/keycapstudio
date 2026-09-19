import wasmUrl from 'manifold-3d/manifold.wasm?url';
import { generateFromBlank, initializeKernel } from './generate';
import { loadOemBlank } from './oem';
import { getVariant } from './variants';
import type { GenerateRequest, GenerateResponse } from './types';

const kernel = initializeKernel(wasmUrl);
self.onmessage = async ({ data }: MessageEvent<GenerateRequest>) => {
  let result: GenerateResponse;
  try {
    const variant = getVariant(data.variantId);
    const ready = await kernel;
    const { full, outside } = await loadOemBlank(ready, variant.id);
    try {
      result = {
        id: data.id,
        model: generateFromBlank(ready, full, outside, data.artwork, data.size, [
          ...variant.legendCenter,
        ]),
      };
    } finally {
      full.delete();
      outside.delete();
    }
  } catch (error) {
    result = {
      id: data.id,
      error: error instanceof Error ? error.message : 'Could not generate this keycap.',
    };
  }
  if ('model' in result) {
    const { body, legend } = result.model;
    self.postMessage(result, {
      transfer: [
        body.positions.buffer,
        body.indices.buffer,
        legend.positions.buffer,
        legend.indices.buffer,
      ],
    });
  } else self.postMessage(result);
};
