export type Point = [number, number];
export interface FilledPath {
  contours: Point[][];
  fillRule: 'NonZero' | 'EvenOdd';
}
export interface Artwork {
  paths: FilledPath[];
  aspectRatio: number;
  sourceColor?: string;
}
export interface MeshData {
  positions: Float32Array;
  indices: Uint32Array;
}
export interface KeycapModel {
  body: MeshData;
  legend: MeshData;
  bodyVolume: number;
  legendVolume: number;
  totalVolume: number;
}
export interface GenerateRequest {
  id: number;
  artwork: Artwork;
  size: number;
  variantId: string;
}
export type GenerateResponse = { id: number; model: KeycapModel } | { id: number; error: string };
