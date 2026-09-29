import wasmUrl from 'manifold-3d/manifold.wasm?url';
import referenceUrl from './assets/oem-row5-blank.bin?url';
import { initializeKernel } from './generate';
import { loadSolid } from './meshAsset';
import { generateStemFitSamples } from './stemFitTest';
import { exportStemFitTest } from '../export/threeMf';

self.onmessage = async () => {
  try {
    const kernel = await initializeKernel(wasmUrl);
    const reference = await loadSolid(kernel, referenceUrl);
    try {
      const bytes = exportStemFitTest(generateStemFitSamples(kernel, reference));
      self.postMessage({ bytes }, { transfer: [bytes.buffer] });
    } finally {
      reference.delete();
    }
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : 'Could not create stem fit test.',
    });
  }
};
