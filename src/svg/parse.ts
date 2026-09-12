import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { SVGPathData } from 'svg-pathdata';
import type { Artwork, FilledPath, Point } from '../geometry/types';

export const MAX_SVG_BYTES = 150_000;
const TAGS = new Set(['svg', 'g', 'path', 'title', 'desc']);
const ATTRS = new Set([
  'xmlns',
  'viewBox',
  'width',
  'height',
  'id',
  'version',
  'd',
  'transform',
  'fill',
  'fill-rule',
  'stroke',
  'stroke-width',
  'opacity',
  'fill-opacity',
  'style',
]);
const STYLE = new Set(['fill', 'fill-rule', 'stroke', 'stroke-width', 'opacity', 'fill-opacity']);
const NUMBER = '[-+]?(?:\\d*\\.\\d+|\\d+\\.?\\d*)(?:[eE][-+]?\\d+)?';
const NUMBER_LIST = new RegExp(`^\\s*${NUMBER}(?:[\\s,]+${NUMBER})*\\s*$`);

function validateTransform(value: string) {
  const arity: Record<string, number[]> = {
    matrix: [6],
    translate: [1, 2],
    scale: [1, 2],
    rotate: [1, 3],
    skewX: [1],
    skewY: [1],
  };
  let end = 0;
  for (const match of value.matchAll(/([a-zA-Z]+)\s*\(([^)]*)\)/g)) {
    if (value.slice(end, match.index).replace(/[\s,]/g, ''))
      throw new Error('Invalid SVG transform.');
    const args = match[2]
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (
      !NUMBER_LIST.test(match[2]) ||
      !arity[match[1]]?.includes(args.length) ||
      args.some((n) => !Number.isFinite(n) || Math.abs(n) > 1e6)
    )
      throw new Error('Invalid or unsupported SVG transform.');
    end = match.index + match[0].length;
  }
  if (!end || value.slice(end).trim()) throw new Error('Invalid SVG transform.');
}

/** Parse a detached XML document only. Original markup is never inserted in the page. */
export function parseArtwork(source: string): Artwork {
  if (new TextEncoder().encode(source).length > MAX_SVG_BYTES)
    throw new Error('SVG is too large. Use a file smaller than 150 KB.');
  if (/<!DOCTYPE|<!ENTITY|<\?/i.test(source.replace(/^\s*<\?xml[^?]*\?>/i, '')))
    throw new Error('SVG declarations and external resources are not supported.');
  const document = new DOMParser().parseFromString(source, 'image/svg+xml');
  if (document.querySelector('parsererror')) throw new Error('This file is not valid SVG XML.');
  const root = document.documentElement;
  if (root.localName !== 'svg' || root.namespaceURI !== 'http://www.w3.org/2000/svg')
    throw new Error('Choose a valid SVG file.');
  const nodes = [root, ...root.querySelectorAll('*')];
  if (nodes.length > 256)
    throw new Error('SVG is too complex. Simplify the icon to fewer than 256 elements.');
  let commands = 0;
  for (const node of nodes) {
    if (!TAGS.has(node.tagName) || (node.tagName === 'svg' && node !== root))
      throw new Error(
        `Unsupported SVG element: ${node.localName}. Export a simple filled-path SVG.`,
      );
    for (const attr of node.attributes) {
      if (!ATTRS.has(attr.name))
        throw new Error(
          `Unsupported SVG attribute: ${attr.name}. Export plain SVG paths without effects or external resources.`,
        );
      if (/url\s*\(|var\s*\(/i.test(attr.value))
        throw new Error('SVG gradients, patterns, and external references are not supported.');
    }
    const properties = new Map<string, string>();
    for (const key of STYLE)
      if (node.hasAttribute(key)) properties.set(key, node.getAttribute(key)!.trim());
    for (const entry of (node.getAttribute('style') ?? '').split(';').filter((s) => s.trim())) {
      const [key, ...values] = entry.split(':');
      if (!STYLE.has(key.trim()) || values.length !== 1)
        throw new Error('Unsupported SVG style. Export plain filled paths.');
      properties.set(key.trim(), values[0].trim());
    }
    if (properties.has('stroke') && properties.get('stroke') !== 'none')
      throw new Error('Convert strokes to filled paths in your SVG editor, then upload again.');
    for (const key of ['opacity', 'fill-opacity']) {
      if (properties.has(key) && Number(properties.get(key)) !== 1)
        throw new Error('Transparent artwork is not supported. Export opaque filled paths.');
    }
    if (
      properties.has('fill-rule') &&
      !['nonzero', 'evenodd'].includes(properties.get('fill-rule')!)
    )
      throw new Error('Unsupported SVG fill rule.');
    const fill = properties.get('fill');
    if (fill && !/^(none|#[0-9a-f]{3}|#[0-9a-f]{6}|[a-z]+|rgb\([\d\s,.%]+\))$/i.test(fill))
      throw new Error('Use simple opaque SVG fill colors.');
    if (node.hasAttribute('transform')) validateTransform(node.getAttribute('transform')!);
    if (node.tagName === 'path') {
      try {
        const data = new SVGPathData(node.getAttribute('d') ?? '');
        commands += data.commands.length;
        if (
          data.commands.length === 0 ||
          Object.values(data.commands).some((c) =>
            Object.values(c).some(
              (v) => typeof v === 'number' && (!Number.isFinite(v) || Math.abs(v) > 1e6),
            ),
          )
        )
          throw new Error();
      } catch {
        throw new Error('Invalid SVG path data. Re-export the icon as plain SVG.');
      }
    }
    if (commands > 2000) throw new Error('SVG has too many curves. Simplify it before uploading.');
  }
  const viewBox = root.getAttribute('viewBox');
  let viewport: number[] | undefined;
  if (viewBox) {
    viewport = viewBox
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (
      !NUMBER_LIST.test(viewBox) ||
      viewport.length !== 4 ||
      viewport.some((n) => !Number.isFinite(n)) ||
      viewport[2] <= 0 ||
      viewport[3] <= 0
    )
      throw new Error('SVG viewBox must have a positive width and height.');
  }
  const data = new SVGLoader().parse(source);
  const paths: FilledPath[] = [];
  let count = 0;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const colors = new Set<string>();
  for (const path of data.paths) {
    const style = path.userData?.style as { fill?: string; fillRule?: string } | undefined;
    if (style?.fill === 'none') continue;
    const contours: Point[][] = [];
    for (const subpath of path.subPaths) {
      const points: Point[] = subpath.getPoints(16).map((p) => [p.x, p.y]);
      if (points.length < 3) continue;
      count += points.length;
      if (count > 20_000) throw new Error('SVG is too detailed. Simplify its paths.');
      for (const [x, y] of points) {
        if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 1e8 || Math.abs(y) > 1e8)
          throw new Error('SVG contains invalid coordinates.');
        if (
          viewport &&
          (x < viewport[0] - 0.01 ||
            y < viewport[1] - 0.01 ||
            x > viewport[0] + viewport[2] + 0.01 ||
            y > viewport[1] + viewport[3] + 0.01)
        )
          throw new Error(
            'Artwork extends outside its viewBox. Trim the paths or resize the SVG canvas.',
          );
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
      contours.push(points);
    }
    if (contours.length)
      paths.push({ contours, fillRule: style?.fillRule === 'evenodd' ? 'EvenOdd' : 'NonZero' });
    colors.add(`#${path.color.getHexString()}`);
  }
  const width = maxX - minX,
    height = maxY - minY;
  if (!paths.length || width <= 1e-8 || height <= 1e-8)
    throw new Error('SVG has no usable filled area.');
  const scale = Math.max(width, height);
  for (const path of paths)
    for (const contour of path.contours)
      for (const p of contour) {
        p[0] = (p[0] - (minX + maxX) / 2) / scale;
        p[1] = -(p[1] - (minY + maxY) / 2) / scale;
      }
  return {
    paths,
    aspectRatio: width / height,
    sourceColor: colors.size === 1 ? [...colors][0] : undefined,
  };
}
