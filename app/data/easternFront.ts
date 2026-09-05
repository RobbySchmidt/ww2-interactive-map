/**
 * Ostfront 1941-1945 — vereinfachte Wochen-Snapshots der Frontlinie.
 *
 * WICHTIG: Diese Daten sind eine grobe Annäherung für den Prototyp.
 * Frontverläufe stammen aus öffentlich verfügbaren Übersichten
 * (Wikipedia, Glantz-Standardwerke). Keine historisch-präzise Forschungsarbeit.
 *
 * Jeder Snapshot hat exakt 15 Frontlinien-Punkte (Süd → Nord) an festen
 * Breitengraden, damit zwischen Snapshots linear interpoliert werden kann.
 *
 * Lat 59.5 ist die „Leningrad-Kerbe“: während der Blockade (Sep 1941 – Jan 1944)
 * lag die deutsche Front südlich/östlich der Stadt (Tosno–Ljuban–Wolchow, ~31.5°E),
 * die Stadt selbst und die Karelische Landenge blieben sowjetisch. Ohne diesen
 * Stützpunkt lag Leningrad in der roten Achsen-Fläche. Lat 60 wird in der
 * Blockade-Phase auf ~29.7 (Peterhof) gesetzt, damit die Stadt östlich der Linie liegt.
 *
 * Lat 42 ist der südlichste Stützpunkt und wird so gesetzt, dass die Linie an
 * einer natürlichen Geografie endet — Schwarzes Meer / Adria / Kaukasus-Kamm
 * — statt mitten in einem Land aufzuhören. Historisch gab es bei lat 42 selten
 * eine echte Kampflinie; der Punkt ist primär ein „visueller Anker".
 *
 * Die rote Achsen-Fläche selbst wird NICHT mehr aus einem freien Polygon gebaut,
 * sondern vom Country-Layer: jedes betroffene Land wird ländergrenzentreu
 * gerendert und gegen die Sowjet-Region (alles östlich der Frontlinie) geclippt.
 * Siehe `axisControl.ts` für die Land-Definitionen und `WarMap.client.vue` für
 * die Clipping-Logik.
 */

export const LAT_BANDS = [42, 44, 46, 47.5, 49, 50.5, 52, 53, 54, 55, 56, 57.5, 59, 59.5, 60] as const

export interface FrontSnapshot {
  date: string // ISO YYYY-MM-DD
  label: string
  /** 14 Längengrade, entsprechen LAT_BANDS (Süd → Nord) */
  frontLons: number[]
}

export const SNAPSHOTS: FrontSnapshot[] = [
  {
    date: '1941-06-21',
    label: 'Vortag Unternehmen Barbarossa',
    // lat 42 = Schwarzes Meer östlich der bulgarischen Küste (visueller Anker)
    // lat 44 = Schwarzmeer-Küste östlich Constanta
    frontLons: [28.5, 29.5, 28.5, 27.5, 25.0, 23.7, 23.2, 23.0, 22.8, 22.5, 22.0, 22.0, 22.5, 23.0, 23.5],
  },
  {
    date: '1941-07-15',
    label: 'Vorstoß zur Düna · Schlacht von Smolensk beginnt',
    frontLons: [29.0, 29.5, 29.0, 29.0, 28.5, 28.5, 30.0, 30.5, 28.5, 27.5, 28.5, 27.0, 26.0, 26.3, 26.5],
  },
  {
    date: '1941-09-15',
    label: 'Kiewer Kesselschlacht · Leningrad eingeschlossen',
    // lat 42 = Schwarzes Meer südöstlich der Krim
    frontLons: [36.0, 34.5, 34.5, 33.5, 33.0, 32.5, 33.0, 33.5, 32.5, 31.5, 31.0, 30.5, 31.5, 31.5, 29.7],
  },
  {
    date: '1941-12-05',
    label: 'Höchster Vormarsch vor Moskau · Sowjetische Gegenoffensive beginnt',
    // lat 42 = Schwarzes Meer östlich der Krim, südwestlich Krasnodar
    frontLons: [39.0, 39.5, 37.5, 38.5, 37.5, 37.0, 37.5, 38.5, 39.0, 37.0, 35.0, 33.0, 32.5, 31.8, 29.7],
  },
  {
    date: '1942-04-15',
    label: 'Stabilisierung nach sowjetischer Winteroffensive',
    frontLons: [39.0, 38.5, 37.5, 38.0, 37.5, 36.5, 35.0, 35.5, 34.5, 33.0, 32.5, 31.5, 31.0, 31.5, 29.7],
  },
  {
    date: '1942-08-15',
    label: 'Fall Blau · Vorstoß zum Kaukasus und Stalingrad',
    // lat 42 = Großer Kaukasus West (Sotschi-Krasnaja-Poljana-Höhe)
    frontLons: [41.0, 41.0, 43.0, 43.5, 43.0, 41.5, 39.5, 36.0, 34.5, 33.0, 32.5, 31.5, 31.0, 31.5, 29.7],
  },
  {
    date: '1942-11-19',
    label: 'Höchster Vormarsch im Süden · Beginn Operation Uranus',
    // lat 42 = Großer Kaukasus-Hauptkamm (natürliche Barriere, deutsche Vorrückung endet dort)
    frontLons: [43.0, 45.0, 46.0, 45.5, 44.5, 42.5, 39.5, 36.0, 34.5, 33.0, 32.5, 31.5, 31.0, 31.5, 29.7],
  },
  {
    date: '1943-02-15',
    label: 'Nach Kapitulation Stalingrads · Charkow zurückerobert',
    frontLons: [41.0, 40.0, 39.0, 38.5, 36.5, 35.5, 35.5, 34.5, 33.5, 33.0, 32.5, 31.5, 31.0, 31.5, 29.7],
  },
  {
    date: '1943-07-05',
    label: 'Beginn Schlacht bei Kursk (Unternehmen Zitadelle)',
    frontLons: [40.0, 38.5, 39.0, 38.5, 37.0, 33.5, 35.5, 38.0, 35.5, 34.0, 32.5, 31.5, 31.0, 31.5, 29.7],
  },
  {
    date: '1943-11-06',
    label: 'Befreiung Kiews · Front am Dnepr',
    // lat 42 = Schwarzes Meer südlich der Krim
    frontLons: [35.0, 35.0, 34.5, 34.0, 33.0, 30.5, 31.5, 32.5, 32.5, 32.0, 31.5, 30.5, 31.5, 31.5, 29.7],
  },
  {
    date: '1944-01-27',
    label: 'Aufhebung der Blockade Leningrads',
    frontLons: [33.0, 33.5, 33.0, 32.5, 31.5, 28.5, 29.0, 30.0, 30.5, 30.0, 29.5, 28.5, 28.0, 27.8, 27.5],
  },
  {
    date: '1944-06-22',
    label: 'Beginn Operation Bagration',
    // lat 42 = Schwarzes Meer westlich Krim (Krim Mai 1944 befreit)
    frontLons: [29.0, 29.5, 29.5, 28.5, 27.0, 25.5, 27.5, 29.0, 30.5, 28.5, 27.5, 27.0, 27.5, 27.8, 28.0],
  },
  {
    date: '1944-08-15',
    label: 'Heeresgruppe Mitte vernichtet · Weichsel erreicht',
    frontLons: [28.0, 29.0, 26.5, 25.0, 24.0, 22.0, 21.5, 22.5, 23.0, 23.5, 24.0, 25.5, 27.0, 27.3, 27.5],
  },
  {
    date: '1944-09-15',
    label: 'Balkanwende · Rumänien befreit, Karpaten-Bogen erreicht',
    // Bulgarien wechselt 8./9.9., Rumänien-Front kollabiert nach König-Coup (23.8.).
    // Front am Karpaten-Hauptkamm und entlang der Weichsel; im Norden vor Tallinn/Riga.
    // lat 42 = Griechisch-bulgarische Berge (Bulgarien jetzt sowjet-alliiert)
    // lat 44 = Yugoslawisch-bulgarische Grenze
    // lat 46-49 = Karpaten-Bogen (Hauptkamm)
    // lat 50.5-53 = Weichsel-Front bei Warschau
    // lat 54-59 = baltische Front vor Tallinn/Riga
    frontLons: [23.0, 22.5, 22.5, 22.5, 22.5, 22.0, 22.5, 23.0, 23.5, 24.5, 25.5, 26.5, 27.0, 27.3, 27.5],
  },
  {
    date: '1945-01-12',
    label: 'Beginn Weichsel-Oder-Operation',
    // lat 42 = Adria-Küste an der albanischen/montenegrinischen Küste
    frontLons: [19.0, 20.0, 20.5, 19.5, 20.5, 20.0, 21.0, 21.0, 21.0, 21.5, 21.5, 22.5, 24.0, 24.3, 24.5],
  },
  {
    date: '1945-02-15',
    label: 'Sowjetische Truppen erreichen die Oder',
    frontLons: [18.0, 18.5, 17.5, 16.5, 18.0, 15.5, 14.8, 14.5, 15.5, 18.5, 19.5, 22.0, 23.5, 23.5, 23.5],
  },
  {
    date: '1945-04-16',
    label: 'Beginn Berliner Operation',
    frontLons: [17.0, 16.5, 15.5, 14.5, 16.0, 14.7, 14.5, 14.0, 13.5, 17.0, 18.0, 21.5, 23.5, 23.5, 23.5],
  },
  {
    date: '1945-05-08',
    label: 'Bedingungslose Kapitulation des Deutschen Reiches',
    // lat 42 = Adria-Küste an Süd-Dalmatien/Albanien
    frontLons: [16.0, 14.5, 13.5, 13.5, 13.0, 12.0, 11.7, 11.2, 11.0, 11.5, 13.0, 21.0, 23.5, 23.5, 23.5],
  },
]

// ---------- Frontlinien-Glättung: Catmull-Rom-Spline + leichte Welligkeit ----------

const SAMPLES_PER_SEGMENT = 10

/** Catmull-Rom-Interpolation (uniform — reicht für glatte Form). */
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t
  const t3 = t2 * t
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  )
}

/**
 * Glättet die Frontlinie aus 15 Lat-Band-Stützpunkten zu einer Kurve mit
 * ~130 Punkten — Catmull-Rom-Spline (uniform) plus zwei überlagerte
 * Sinus-Welligkeiten auf der Lon-Achse, damit die Front nicht wie eine
 * gerade Polyline aussieht.
 */
function smoothFrontCoords(frontLons: number[]): [number, number][] {
  const n = frontLons.length
  const points: [number, number][] = frontLons.map((lon, i) => [lon, LAT_BANDS[i]!])
  const out: [number, number][] = []

  for (let i = 0; i < n - 1; i++) {
    const p0 = i === 0 ? points[0]! : points[i - 1]!
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p3 = i === n - 2 ? points[n - 1]! : points[i + 2]!

    for (let s = 0; s < SAMPLES_PER_SEGMENT; s++) {
      const t = s / SAMPLES_PER_SEGMENT
      const lon = catmullRom(p0[0], p1[0], p2[0], p3[0], t)
      const lat = catmullRom(p0[1], p1[1], p2[1], p3[1], t)

      const idx = i * SAMPLES_PER_SEGMENT + s
      const wave = Math.sin(idx * 0.71) * 0.08 + Math.sin(idx * 1.37 + 1.5) * 0.05

      out.push([lon + wave, lat])
    }
  }

  out.push(points[n - 1]!)
  return out
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

/**
 * Hängt das Nord-Anhängsel (finnisch-sowjetische Front von der Karelischen
 * Landenge über Swir/Onega bis Petsamo) an, solange die finnische Front aktiv
 * war — 25.06.1941 bis zum Waffenstillstand 19.09.1944.
 *
 * Zwei Keyframes, dazwischen wird linear interpoliert:
 *  - BORDER: Grenze von 1940 (Sommer 1941 vor dem finnischen Vorstoß, und
 *    wieder ab August 1944 nach dem sowjetischen Wyborg-Petrosawodsk-Angriff)
 *  - ONEGA: Stellung Beloostrow – Swir – Onega-Westufer – Powenez – Uchta
 *    (Dez 1941 bis Juni 1944, Petrosawodsk finnisch besetzt)
 *
 * Süd-Anhängsel ist nicht mehr nötig: lat 44 ist Teil der Hauptfront-Daten.
 */
const KARELIAN_FRONT_END_TS = new Date('1944-09-19').getTime()
const BARBAROSSA_START_TS = new Date('1941-06-25').getTime()

const KARELIA_BORDER: [number, number][] = [
  [27.8, 60.55], // Finnischer Meerbusen, Grenze 1940 bei Virolahti
  [29.0, 61.0],
  [30.0, 61.3], // Ladoga-Nordwestufer
  [31.3, 61.7],
  [30.8, 62.6],
  [30.2, 64.0],
  [30.0, 65.5],
  [30.0, 67.5],
  [30.0, 69.0], // Petsamo / Polarmeer
]
const KARELIA_ONEGA: [number, number][] = [
  [30.0, 60.15], // Beloostrow / Sestrorezk — Nordrand Leningrads
  [30.6, 60.35], // Ladoga-Westufer
  [32.5, 60.7], // Swir-Mündung (Lodeinoje Pole)
  [35.5, 61.0], // Swir-Quelle / Onega-Südufer
  [35.2, 62.0], // Onega-Westufer, östlich Petrosawodsk
  [34.8, 62.9], // Powenez / Medweschjegorsk
  [33.0, 64.5], // Massel-Front / Rugosero
  [31.0, 65.5], // Uchta
  [30.0, 69.0], // Petsamo / Polarmeer
]
const KARELIA_KEYFRAMES: { ts: number; pts: [number, number][] }[] = [
  { ts: new Date('1941-06-25').getTime(), pts: KARELIA_BORDER },
  { ts: new Date('1941-09-01').getTime(), pts: KARELIA_BORDER },
  { ts: new Date('1941-12-06').getTime(), pts: KARELIA_ONEGA },
  { ts: new Date('1944-06-20').getTime(), pts: KARELIA_ONEGA },
  { ts: new Date('1944-08-10').getTime(), pts: KARELIA_BORDER },
  { ts: new Date('1944-09-19').getTime(), pts: KARELIA_BORDER },
]

function karelianExtensionAt(ts: number): [number, number][] {
  for (let i = 0; i < KARELIA_KEYFRAMES.length - 1; i++) {
    const a = KARELIA_KEYFRAMES[i]!
    const b = KARELIA_KEYFRAMES[i + 1]!
    if (ts >= a.ts && ts <= b.ts) {
      const t = (ts - a.ts) / (b.ts - a.ts)
      return a.pts.map((p, k) => {
        const q = b.pts[k]!
        return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]
      })
    }
  }
  return KARELIA_BORDER
}

function extendFrontEnds(front: [number, number][], date: Date): [number, number][] {
  const ts = date.getTime()
  const result: [number, number][] = [...front]

  if (ts >= BARBAROSSA_START_TS && ts <= KARELIAN_FRONT_END_TS) {
    result.push(...karelianExtensionAt(ts))
  }

  return result
}

export function frontLineAt(date: Date): GeoJSON.Feature<GeoJSON.LineString> {
  const { a, b, t } = findSnapshotBracket(date)
  const lons = t === 0 ? a.frontLons : interpolateFront(a, b, t)
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: extendFrontEnds(smoothFrontCoords(lons), date),
    },
  }
}

/**
 * Baut ein Polygon, das die gesamte Sowjet-erreichte Region umfasst — alles
 * östlich der (ggf. um Karelien verlängerten) Frontlinie, mit klaren Süd-/
 * Nord-Grenzen. Wird zum Clippen der Country-Polygone genutzt: Difference
 * (Country − Sowjet-Region) ergibt nur die Achsen-Seite jedes Landes.
 *
 * Begrenzung:
 *  - Süden: lat 40 (deckt die Kaukasus-Südflanke von RUS bis zur aserbaidschan.
 *    Grenze ab — Dagestan reicht bis ~41° N. lat 42 reichte nicht weit genug.)
 *  - Norden: Schrägung vom nördlichsten Front-Punkt nach (lon 40, lat 85) —
 *    schließt Norwegen-Finnmark westlich davon aus, deckt aber Nowaja Semlja,
 *    Sewernaja Semlja und Franz-Josef-Land (bis ~82° N) ab
 *  - Osten: lon 180 plus ein zweites Polygon für Tschukotka westlich der
 *    Datumsgrenze (NE-Geometrie von RUS reicht bis lon -169). Vorher endete die
 *    Region bei lon 100, dadurch blieben Sibirien und der Ferne Osten als
 *    „Achse" rot stehen.
 */
export function sovietRegionAt(date: Date): GeoJSON.MultiPolygon {
  const { a, b, t } = findSnapshotBracket(date)
  const lons = t === 0 ? a.frontLons : interpolateFront(a, b, t)
  const front = extendFrontEnds(smoothFrontCoords(lons), date)

  const ring: [number, number][] = [
    ...front,
    [40, 85],
    [180, 85],
    [180, 40],
    [front[0]![0], 40],
    front[0]!,
  ]
  const farEast: [number, number][] = [
    [-180, 40],
    [-165, 40],
    [-165, 85],
    [-180, 85],
    [-180, 40],
  ]
  return { type: 'MultiPolygon', coordinates: [[ring], [farEast]] }
}

export const TIMELINE_START = new Date(SNAPSHOTS[0]!.date)
export const TIMELINE_END = new Date(SNAPSHOTS[SNAPSHOTS.length - 1]!.date)
