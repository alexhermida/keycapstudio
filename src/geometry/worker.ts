import wasmUrl from 'manifold-3d/manifold.wasm?url';
import { generateFromBlank, initializeKernel } from './generate';
import { loadOemBlank } from './oem';
import { OEM_ROW5 } from './config';
import type { GenerateRequest, GenerateResponse } from './types';

const kernel = initializeKernel(wasmUrl);
const blank = kernel.then(loadOemBlank);
self.onmessage = async ({ data }: MessageEvent<GenerateRequest>) => {
  let result: GenerateResponse;
  try {
    const { full, outside } = await blank;
    result = {
      id: data.id,
      model: generateFromBlank(await kernel, full, outside, data.artwork, data.size, [
        ...OEM_ROW5.legendCenter,
      ]),
    };
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
