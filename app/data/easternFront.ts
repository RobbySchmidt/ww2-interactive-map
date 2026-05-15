/**
 * Ostfront 1941-1945 — vereinfachte Wochen-Snapshots
 *
 * WICHTIG: Diese Daten sind eine grobe Annäherung für den Prototyp.
 * Frontverläufe und Verlustzahlen stammen aus öffentlich verfügbaren Übersichten
 * (Wikipedia, Glantz-Standardwerke). Keine historisch-präzise Forschungsarbeit.
 *
 * Jeder Snapshot hat exakt 12 Frontlinien-Punkte (Süd → Nord) an festen
 * Breitengraden, damit zwischen Snapshots linear interpoliert werden kann.
 */

export const LAT_BANDS = [46, 47.5, 49, 50.5, 52, 53, 54, 55, 56, 57.5, 59, 60] as const

export interface FrontSnapshot {
  date: string // ISO YYYY-MM-DD
  label: string
  /** 12 Längengrade, entsprechen LAT_BANDS (Süd → Nord) */
  frontLons: number[]
}

export const SNAPSHOTS: FrontSnapshot[] = [
  {
    date: '1941-06-21',
    label: 'Vortag Unternehmen Barbarossa',
    frontLons: [28.5, 27.5, 25.0, 23.7, 23.2, 23.0, 22.8, 22.5, 22.0, 22.0, 22.5, 23.5],
  },
  {
    date: '1941-07-15',
    label: 'Vorstoß zur Düna · Schlacht von Smolensk beginnt',
    frontLons: [29.0, 29.0, 28.5, 28.5, 30.0, 30.5, 28.5, 27.5, 28.5, 27.0, 26.0, 26.5],
  },
  {
    date: '1941-09-15',
    label: 'Kiewer Kesselschlacht · Leningrad eingeschlossen',
    frontLons: [34.5, 33.5, 33.0, 32.5, 33.0, 33.5, 32.5, 31.5, 31.0, 30.5, 30.5, 30.5],
  },
  {
    date: '1941-12-05',
    label: 'Höchster Vormarsch vor Moskau · Sowjetische Gegenoffensive beginnt',
    frontLons: [37.5, 38.5, 37.5, 37.0, 37.5, 38.5, 39.0, 37.0, 35.0, 33.0, 32.5, 32.0],
  },
  {
    date: '1942-04-15',
    label: 'Stabilisierung nach sowjetischer Winteroffensive',
    frontLons: [37.5, 38.0, 37.5, 36.5, 35.0, 35.5, 34.5, 33.0, 32.5, 31.5, 31.0, 30.5],
  },
  {
    date: '1942-08-15',
    label: 'Fall Blau · Vorstoß zum Kaukasus und Stalingrad',
    frontLons: [43.0, 43.5, 43.0, 41.5, 39.5, 36.0, 34.5, 33.0, 32.5, 31.5, 31.0, 30.5],
  },
  {
    date: '1942-11-19',
    label: 'Höchster Vormarsch im Süden · Beginn Operation Uranus',
    frontLons: [46.0, 45.5, 44.5, 42.5, 39.5, 36.0, 34.5, 33.0, 32.5, 31.5, 31.0, 30.5],
  },
  {
    date: '1943-02-15',
    label: 'Nach Kapitulation Stalingrads · Charkow zurückerobert',
    frontLons: [39.0, 38.5, 36.5, 35.5, 35.5, 34.5, 33.5, 33.0, 32.5, 31.5, 31.0, 30.5],
  },
  {
    date: '1943-07-05',
    label: 'Beginn Schlacht bei Kursk (Unternehmen Zitadelle)',
    frontLons: [39.0, 38.5, 37.0, 33.5, 35.5, 38.0, 35.5, 34.0, 32.5, 31.5, 31.0, 30.5],
  },
  {
    date: '1943-11-06',
    label: 'Befreiung Kiews · Front am Dnepr',
    frontLons: [34.5, 34.0, 33.0, 30.5, 31.5, 32.5, 32.5, 32.0, 31.5, 30.5, 30.0, 29.5],
  },
  {
    date: '1944-01-27',
    label: 'Aufhebung der Blockade Leningrads',
    frontLons: [33.0, 32.5, 31.5, 28.5, 29.0, 30.0, 30.5, 30.0, 29.5, 28.5, 28.0, 27.5],
  },
  {
    date: '1944-06-22',
    label: 'Beginn Operation Bagration',
    frontLons: [29.5, 28.5, 27.0, 25.5, 27.5, 29.0, 30.5, 28.5, 27.5, 27.0, 27.5, 28.0],
  },
  {
    date: '1944-08-15',
    label: 'Heeresgruppe Mitte vernichtet · Weichsel erreicht',
    frontLons: [26.5, 25.0, 24.0, 22.0, 21.5, 22.5, 23.0, 23.5, 24.0, 25.5, 27.0, 27.5],
  },
  {
    date: '1945-01-12',
    label: 'Beginn Weichsel-Oder-Operation',
    frontLons: [20.5, 19.5, 20.5, 20.0, 21.0, 21.0, 21.0, 21.5, 21.5, 22.5, 24.0, 24.5],
  },
  {
    date: '1945-02-15',
    label: 'Sowjetische Truppen erreichen die Oder',
    frontLons: [17.5, 16.5, 18.0, 15.5, 14.8, 14.5, 15.5, 18.5, 19.5, 22.0, 23.5, 23.5],
  },
  {
    date: '1945-04-16',
    label: 'Beginn Berliner Operation',
    frontLons: [15.5, 14.5, 16.0, 14.7, 14.5, 14.0, 13.5, 17.0, 18.0, 21.5, 23.5, 23.5],
  },
  {
    date: '1945-05-08',
    label: 'Bedingungslose Kapitulation des Deutschen Reiches',
    frontLons: [13.5, 13.5, 13.0, 12.0, 11.7, 11.2, 11.0, 11.5, 13.0, 21.0, 23.5, 23.5],
  },
]

/**
 * Topografisch ausgerichtete Rückseite des Axis-Polygons.
 * Folgt grob: Ostseeküste → Norddeutsche Tiefebene → Westgrenze Reich → Alpen →
 * Donau/Balkan → bulgarische Schwarzmeerküste → Donaudelta zurück Richtung Front-Anker.
 */
const BACK_FULL: [number, number][] = [
  // Ostseeküste west: vom Front-Anker bei 60°N nach Westen
  [19.0, 59.0], // Finnischer Meerbusen
  [17.0, 57.5], // offene Ostsee zwischen Schweden und Baltikum
  [14.5, 55.5], // Bornholm-Höhe
  [12.5, 54.5], // Lübecker Bucht
  [10.5, 54.5], // Kieler Bucht
  [9.0, 54.6], // Schleswig
  // Nordseeküste & Westgrenze Reich
  [8.5, 53.5], // Bremerhaven
  [7.0, 53.3], // Niederländisch-deutsche Grenze
  [6.0, 51.0], // Rheinland (Aachen-Region)
  [6.5, 49.5], // Saarland
  [7.5, 47.6], // Basel/Schweizer Grenze
  // Südgrenze über Alpen und Balkan
  [10.5, 47.4], // Bodensee
  [13.0, 47.0], // Bayerische Alpen
  [15.0, 46.5], // Steiermark/Slowenien
  [16.5, 46.0], // Marburg/Maribor
  [18.5, 45.8], // SW-Ungarn / Slawonien
  [20.5, 45.0], // Banat/Vojvodina
  [22.5, 44.5], // Jugoslawisch-rumänische Grenze
  [25.0, 43.6], // Donau (Bulg./Rum. Grenze)
  [27.0, 42.3], // Bulgarisches Hinterland
  // Bulgarische Schwarzmeerküste
  [27.7, 42.6], // Burgas
  [27.95, 43.2], // Varna
  [28.05, 43.75], // Kap Kaliakra
  [28.65, 44.2], // Constanza
  [29.6, 45.0], // Donaudelta / Sulina
  [29.7, 45.5], // Bessarabische Küste
]

function buildBack(snapshot: FrontSnapshot): [number, number][] {
  const southFront = snapshot.frontLons[0]!

  // Spätkriegsphase: Rumänien/Balkan außerhalb der Achse → kompakte Rückseite
  if (southFront < 22) {
    return [
      [19.0, 59.0],
      [17.0, 57.5],
      [14.5, 55.5],
      [12.5, 54.5],
      [10.5, 54.5],
      [9.0, 54.6],
      [8.5, 53.5],
      [7.0, 53.3],
      [6.0, 51.0],
      [6.5, 49.5],
      [7.5, 47.6],
      [10.5, 47.4],
      [13.0, 47.0],
      [15.0, 46.5],
      [Math.max(southFront + 1, 14), 46.3],
    ]
  }

  // Normale Phase: volle Rückseite
  const back = [...BACK_FULL]

  // Wenn Front im Süden weit östlich (Ukraine/Krim/Kaukasus) verläuft,
  // folgen wir der Schwarzmeerküste weiter nach Osten statt direkt zur Front zu schließen
  if (southFront > 32) {
    back.push([30.5, 46.5]) // Odessa-Küste
    back.push([32.5, 46.2]) // Cherson
  }
  if (southFront > 35) {
    back.push([33.5, 44.6]) // Sewastopol/Krim Süd
    back.push([35.5, 44.7]) // Krim Süd-Ost
    back.push([36.4, 45.3]) // Kertsch-Straße
  }
  if (southFront > 39) {
    back.push([37.5, 46.7]) // Asowsches Meer Süd-Ost
    back.push([39.0, 47.0]) // Rostow-Annäherung
  }

  return back
}

/**
 * Optionale Kaukasus-„Zunge" für Snapshots mit deutschem Vorstoß südlich 46°N.
 */
const CAUCASUS_POCKETS: Record<string, GeoJSON.Polygon> = {
  '1942-08-15': {
    type: 'Polygon',
    coordinates: [[
      [37.5, 45.8],
      [40.5, 45.8],
      [42.5, 44.8],
      [43.0, 44.0],
      [42.0, 43.2],
      [40.0, 43.7],
      [38.0, 44.5],
      [37.5, 45.8],
    ]],
  },
  '1942-11-19': {
    type: 'Polygon',
    coordinates: [[
      [37.0, 46.5],
      [41.5, 46.5],
      [45.0, 46.0], // Kalmückische Steppe östliches Ende
      [45.5, 44.8],
      [44.5, 43.7],
      [43.5, 43.0],
      [42.0, 43.0],
      [40.0, 43.5],
      [37.5, 44.5],
      [37.0, 46.5],
    ]],
  },
  '1943-02-15': {
    type: 'Polygon',
    // Rückzug aus Kaukasus, Kuban-Brückenkopf
    coordinates: [[
      [37.5, 46.3],
      [39.5, 46.3],
      [40.0, 45.0],
      [38.0, 44.5],
      [36.8, 45.5],
      [37.5, 46.3],
    ]],
  },
}

/**
 * Baut Haupt-Polygon (Front + Rückseite) aus einem Snapshot.
 */
export function buildAxisPolygon(snapshot: FrontSnapshot): GeoJSON.Feature<GeoJSON.Polygon> {
  const front: [number, number][] = snapshot.frontLons.map((lon, i) => [lon, LAT_BANDS[i]!])
  const back = buildBack(snapshot)
  const ring: [number, number][] = [...front, ...back, front[0]!]
  return {
    type: 'Feature',
    properties: { kind: 'main' },
    geometry: { type: 'Polygon', coordinates: [ring] },
  }
}

/**
 * Interpoliert linear zwischen zwei Snapshots für einen Zwischenzeitpunkt.
 */
export function interpolateFront(a: FrontSnapshot, b: FrontSnapshot, t: number): number[] {
  const clamped = Math.max(0, Math.min(1, t))
  return a.frontLons.map((lon, i) => lon + (b.frontLons[i]! - lon) * clamped)
}

export function findSnapshotBracket(date: Date): { a: FrontSnapshot; b: FrontSnapshot; t: number } {
  const ts = date.getTime()
  const first = SNAPSHOTS[0]!
  const last = SNAPSHOTS[SNAPSHOTS.length - 1]!
  if (ts <= new Date(first.date).getTime()) return { a: first, b: first, t: 0 }
  if (ts >= new Date(last.date).getTime()) return { a: last, b: last, t: 0 }

  for (let i = 0; i < SNAPSHOTS.length - 1; i++) {
    const a = SNAPSHOTS[i]!
    const b = SNAPSHOTS[i + 1]!
    const ta = new Date(a.date).getTime()
    const tb = new Date(b.date).getTime()
    if (ts >= ta && ts <= tb) {
      return { a, b, t: (ts - ta) / (tb - ta) }
    }
  }
  return { a: last, b: last, t: 0 }
}

function nearestSnapshotKey(date: Date): string {
  const ts = date.getTime()
  let best = SNAPSHOTS[0]!.date
  let bestDelta = Math.abs(new Date(best).getTime() - ts)
  for (const s of SNAPSHOTS) {
    const d = Math.abs(new Date(s.date).getTime() - ts)
    if (d < bestDelta) {
      bestDelta = d
      best = s.date
    }
  }
  return best
}

/**
 * Liefert eine FeatureCollection: Haupt-Polygon plus optionale Pockets
 * (Kaukasus-Salient für mittlere Kriegsjahre).
 */
export function axisFeaturesAt(date: Date): GeoJSON.FeatureCollection<GeoJSON.Polygon> {
  const { a, b, t } = findSnapshotBracket(date)
  const lons = t === 0 ? a.frontLons : interpolateFront(a, b, t)
  const snap: FrontSnapshot = { date: a.date, label: a.label, frontLons: lons }
  const features: GeoJSON.Feature<GeoJSON.Polygon>[] = [buildAxisPolygon(snap)]

  const pocketKey = nearestSnapshotKey(date)
  const pocket = CAUCASUS_POCKETS[pocketKey]
  if (pocket) {
    features.push({ type: 'Feature', properties: { kind: 'caucasus' }, geometry: pocket })
  }

  return { type: 'FeatureCollection', features }
}

export function frontLineAt(date: Date): GeoJSON.Feature<GeoJSON.LineString> {
  const { a, b, t } = findSnapshotBracket(date)
  const lons = t === 0 ? a.frontLons : interpolateFront(a, b, t)
  const coords: [number, number][] = lons.map((lon, i) => [lon, LAT_BANDS[i]!])
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: coords },
  }
}

export const TIMELINE_START = new Date(SNAPSHOTS[0]!.date)
export const TIMELINE_END = new Date(SNAPSHOTS[SNAPSHOTS.length - 1]!.date)
