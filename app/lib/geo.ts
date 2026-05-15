/**
 * Geo-Hilfsfunktionen: Distanz (Haversine), Punkt-in-Polygon (Ray Casting).
 * Koordinaten konsequent als [lon, lat] (GeoJSON).
 */

export type LngLat = [number, number]

const EARTH_RADIUS_KM = 6371

/** Großkreisdistanz zwischen zwei Punkten in km. */
export function haversineKm(a: LngLat, b: LngLat): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const [lon1, lat1] = a
  const [lon2, lat2] = b
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(s))
}

/** Ray-Casting: Punkt im Polygon-Ring? Ring als Array von [lon, lat], geschlossen oder offen. */
export function pointInRing(point: LngLat, ring: LngLat[]): boolean {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!
    const [xj, yj] = ring[j]!
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/** Liegt Punkt in irgendeinem Polygon-Feature der FeatureCollection? */
export function pointInPolygonFC(
  point: LngLat,
  fc: GeoJSON.FeatureCollection<GeoJSON.Polygon>,
): boolean {
  for (const feat of fc.features) {
    const coords = feat.geometry.coordinates
    if (coords.length === 0) continue
    const outer = coords[0] as LngLat[]
    if (pointInRing(point, outer)) return true
  }
  return false
}

/** Minimaler Abstand (km) vom Punkt zu einer LineString-Polylinie. */
export function distanceToLineKm(point: LngLat, line: LngLat[]): number {
  if (line.length === 0) return Infinity
  if (line.length === 1) return haversineKm(point, line[0]!)
  let min = Infinity
  // Approximation: minimaler Abstand zu Segment-Endpunkten (gut genug für Front-Distanz)
  // Für mehr Präzision: Projektion auf Segment, aber Overkill hier.
  for (const v of line) {
    const d = haversineKm(point, v)
    if (d < min) min = d
  }
  // Zusätzlich für jedes Segment: Abstand zum Mittelpunkt als grober Refiner
  for (let i = 0; i < line.length - 1; i++) {
    const mid: LngLat = [
      (line[i]![0] + line[i + 1]![0]) / 2,
      (line[i]![1] + line[i + 1]![1]) / 2,
    ]
    const d = haversineKm(point, mid)
    if (d < min) min = d
  }
  return min
}
