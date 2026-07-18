import { AppError } from '@/utils/app-error.js';

export type Position = [number, number];
export type PolygonGeometry = { type: 'Polygon'; coordinates: Position[][] };

export function validatePolygonGeometry(geometry: PolygonGeometry) {
  if (geometry.type !== 'Polygon' || !Array.isArray(geometry.coordinates) || !geometry.coordinates[0]) throw new AppError('A GeoJSON Polygon is required.', 400);
  const ring = geometry.coordinates[0];
  if (ring.length < 4) throw new AppError('Polygon must have at least four positions.', 400);
  for (const [longitude, latitude] of ring) {
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) throw new AppError('Polygon coordinates are outside valid longitude/latitude ranges.', 400);
  }
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) throw new AppError('Polygon must be closed.', 400);
  if (hasSelfIntersection(ring)) throw new AppError('Self-intersecting polygons are not allowed.', 400);
  return geometry;
}

export function calculatePolygonAreaAcres(geometry: PolygonGeometry) {
  const ring = geometry.coordinates[0];
  const centerLat = ring.reduce((sum, point) => sum + point[1], 0) / ring.length;
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLon = Math.cos((centerLat * Math.PI) / 180) * 111_320;
  let area = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    area += x1 * metersPerDegreeLon * (y2 * metersPerDegreeLat) - x2 * metersPerDegreeLon * (y1 * metersPerDegreeLat);
  }
  return Number((Math.abs(area / 2) / 4046.8564224).toFixed(3));
}

export function polygonCenter(geometry: PolygonGeometry): Position {
  const ring = geometry.coordinates[0].slice(0, -1);
  const longitude = ring.reduce((sum, point) => sum + point[0], 0) / ring.length;
  const latitude = ring.reduce((sum, point) => sum + point[1], 0) / ring.length;
  return [Number(longitude.toFixed(6)), Number(latitude.toFixed(6))];
}

export function createDefaultBoundary(center: Position, areaAcres = 4): PolygonGeometry {
  const delta = Math.sqrt(areaAcres * 4046.8564224) / 111_320 / 2;
  const [longitude, latitude] = center;
  return {
    type: 'Polygon',
    coordinates: [[
      [longitude - delta, latitude - delta],
      [longitude + delta, latitude - delta],
      [longitude + delta, latitude + delta],
      [longitude - delta, latitude + delta],
      [longitude - delta, latitude - delta],
    ]],
  };
}

function hasSelfIntersection(ring: Position[]) {
  for (let i = 0; i < ring.length - 1; i += 1) {
    for (let j = i + 2; j < ring.length - 1; j += 1) {
      if (i === 0 && j === ring.length - 2) continue;
      if (segmentsIntersect(ring[i], ring[i + 1], ring[j], ring[j + 1])) return true;
    }
  }
  return false;
}

function segmentsIntersect(a: Position, b: Position, c: Position, d: Position) {
  const ccw = (p1: Position, p2: Position, p3: Position) => (p3[1] - p1[1]) * (p2[0] - p1[0]) > (p2[1] - p1[1]) * (p3[0] - p1[0]);
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

