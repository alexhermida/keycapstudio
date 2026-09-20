import type { OemDimensions } from '../geometry/config';
import { useEffect, useState } from 'react';
import type { Artwork, GenerateResponse, KeycapModel } from '../geometry/types';

interface Result {
  artwork: Artwork;
  size: number;
  dimensions: OemDimensions;
  model?: KeycapModel;
  error?: string;
}
export function useKeycap(artwork: Artwork, size: number, dimensions: OemDimensions) {
  const [result, setResult] = useState<Result>();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let worker: Worker | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const debounce = setTimeout(() => {
      try {
        worker = new Worker(new URL('../geometry/worker.ts', import.meta.url), { type: 'module' });
        const fail = (message: string) => {
          clearTimeout(timeout);
          worker?.terminate();
          setResult({ artwork, size, dimensions, error: message });
        };
        worker.onmessage = ({ data }: MessageEvent<GenerateResponse>) => {
          clearTimeout(timeout);
          if ('error' in data) fail(data.error);
          else setResult({ artwork, size, dimensions, model: data.model });
        };
        worker.onerror = () =>
          fail('The geometry engine could not start. Reload the page or try another browser.');
        timeout = setTimeout(
          () => fail('This icon took too long to generate. Simplify its paths and try again.'),
          45000,
        );
        worker.postMessage({ id: attempt, artwork, size, dimensions });
      } catch {
        setResult({
          artwork,
          size,
          dimensions,
          error: 'This browser could not start the geometry engine.',
        });
      }
    }, 180);
    return () => {
      clearTimeout(debounce);
      clearTimeout(timeout);
      worker?.terminate();
    };
  }, [artwork, size, dimensions, attempt]);
  const current =
    result?.artwork === artwork && result.size === size && result.dimensions === dimensions;
  return {
    model: result?.model,
    error: current ? result.error : undefined,
    pending: !current,
    retry: () => {
      setResult(undefined);
      setAttempt((n) => n + 1);
    },
  };
}
