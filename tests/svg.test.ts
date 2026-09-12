// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { parseArtwork } from '../src/svg/parse';
import { EXAMPLES } from '../src/examples';

const svg = (content: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 20 100 100">${content}</svg>`;
describe('SVG ingestion', () => {
  it('centers transformed disconnected filled paths and preserves aspect ratio', () => {
    const art = parseArtwork(
      svg('<g transform="translate(10 20)"><path d="M0 0H20V40H0"/><path d="M60 0H80V40H60"/></g>'),
    );
    expect(art.paths).toHaveLength(2);
    expect(art.aspectRatio).toBe(2);
    const points = art.paths.flatMap((p) => p.contours.flat());
    expect(Math.min(...points.map((p) => p[0]))).toBe(-0.5);
    expect(Math.max(...points.map((p) => p[0]))).toBe(0.5);
    expect(Math.max(...points.map((p) => p[1]))).toBe(0.25);
  });
  it('preserves evenodd hole semantics', () => {
    expect(parseArtwork(EXAMPLES.orbit).paths[0].fillRule).toBe('EvenOdd');
    expect(parseArtwork(EXAMPLES.orbit).paths[0].contours).toHaveLength(2);
  });
  it.each([
    ['<script>alert(1)</script>', 'element'],
    ['<image href="https://example.com/private.png"/>', 'element'],
    ['<path d="M20 30H40V50Z" stroke="red"/>', 'Convert strokes'],
    ['<g stroke="red"><path d="M20 30H40V50Z"/></g>', 'Convert strokes'],
    ['<path d="M20 30H40V50Z" style="filter:blur(3px)"/>', 'style'],
    ['<path d="M20 30H40V50Z" fill="url(#paint)"/>', 'references'],
    ['<path d="M20 30H40V50Z" opacity="0.5"/>', 'Transparent'],
    ['<path d="M20 30 INVALID"/>', 'path data'],
    ['<path d="M20 30H40V50Z" transform="translate(bad)"/>', 'transform'],
    ['<path d="M20 30H40V50Z" onclick="alert(1)"/>', 'attribute'],
  ])('rejects unsupported or unsafe input: %s', (content, error) =>
    expect(() => parseArtwork(svg(content))).toThrow(error),
  );
  it('rejects empty, malformed, oversized, and out-of-viewBox input', () => {
    expect(() => parseArtwork(svg(''))).toThrow('no usable');
    expect(() => parseArtwork('<svg>')).toThrow();
    expect(() => parseArtwork(' '.repeat(150001))).toThrow('too large');
    expect(() => parseArtwork(svg('<path d="M0 0H20V40Z"/>'))).toThrow('viewBox');
    expect(() => parseArtwork('<!DOCTYPE svg><svg/>')).toThrow('declarations');
  });
  it('accepts filled cubic curves without an explicit close command', () => {
    const art = parseArtwork(
      svg('<path fill="#66aa55" d="M20 30 C20 50 40 50 40 30 C40 20 20 20 20 30"/>'),
    );
    expect(art.paths[0].contours[0].length).toBeGreaterThan(20);
    expect(art.sourceColor).toBe('#66aa55');
  });
});
