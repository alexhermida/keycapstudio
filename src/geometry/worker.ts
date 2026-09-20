import wasmUrl from 'manifold-3d/manifold.wasm?url';
import { generateFromBlank, initializeKernel } from './generate';
import { loadSolid } from './meshAsset';
import { createOemBlank } from './parametric';
import referenceUrl from './assets/oem-row5-blank.bin?url';
import type { GenerateRequest, GenerateResponse } from './types';

const kernel = initializeKernel(wasmUrl);
self.onmessage = async ({ data }: MessageEvent<GenerateRequest>) => {
  let result: GenerateResponse;
  try {
    const ready = await kernel;
    const reference = await loadSolid(ready, referenceUrl);
    let blank;
    try {
      blank = createOemBlank(ready, data.dimensions, reference);
    } finally {
      reference.delete();
    }
    const { full, outside } = blank;
    try {
      result = {
        id: data.id,
        model: generateFromBlank(ready, full, outside, data.artwork, data.size),
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
