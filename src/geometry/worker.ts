import wasmUrl from 'manifold-3d/manifold.wasm?url';
import { generateOemKeycap, initializeKernel } from './generate';
import { loadSolid } from './meshAsset';
import referenceUrl from './assets/oem-row5-blank.bin?url';
import type { GenerateRequest, GenerateResponse } from './types';

const kernel = initializeKernel(wasmUrl);
self.onmessage = async ({ data }: MessageEvent<GenerateRequest>) => {
  let result: GenerateResponse;
  try {
    const ready = await kernel;
    const reference = await loadSolid(ready, referenceUrl);
    try {
      result = {
        id: data.id,
        model: generateOemKeycap(
          ready,
          reference,
          data.dimensions,
          data.stemFitDeltaMm,
          data.artwork,
          data.size,
        ),
      };
    } finally {
      reference.delete();
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
