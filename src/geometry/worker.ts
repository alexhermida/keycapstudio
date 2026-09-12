import wasmUrl from 'manifold-3d/manifold.wasm?url';
import { generateKeycap, initializeKernel } from './generate';
import type { GenerateRequest, GenerateResponse } from './types';

const kernel = initializeKernel(wasmUrl);
self.onmessage = async ({ data }: MessageEvent<GenerateRequest>) => {
  let result: GenerateResponse;
  try {
    result = { id: data.id, model: generateKeycap(await kernel, data.artwork, data.size) };
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
