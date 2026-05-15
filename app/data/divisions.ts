/**
 * Großverband-Marker pro Snapshot.
 *
 * Für ausgewählte Schlüsseldaten Heeresgruppen-/Armee-/Front-Positionen.
 * Bewusst nur die historisch prägenden Verbände — kein Anspruch auf Vollständigkeit.
 */

export type Side = 'axis' | 'soviet'

export interface DivisionMarker {
  /** ISO-Datum eines bestehenden SNAPSHOTS in easternFront.ts */
  snapshot: string
  side: Side
  /** Kurzlabel auf der Karte, z.B. "HG Mitte" */
  label: string
  /** Längere Bezeichnung im Tooltip */
  fullName: string
  commander?: string
  coordinates: [number, number]
}

export const DIVISIONS: DivisionMarker[] = [
  // ---------- 1941-06-21 — Vortag Barbarossa ----------
  {
    snapshot: '1941-06-21',
    side: 'axis',
    label: 'HG Nord',
    fullName: 'Heeresgruppe Nord',
    commander: 'Wilhelm Ritter von Leeb',
    coordinates: [22.5, 55.7],
  },
  {
    snapshot: '1941-06-21',
    side: 'axis',
    label: 'HG Mitte',
    fullName: 'Heeresgruppe Mitte',
    commander: 'Fedor von Bock',
    coordinates: [22.0, 53.0],
  },
  {
    snapshot: '1941-06-21',
    side: 'axis',
    label: 'HG Süd',
    fullName: 'Heeresgruppe Süd',
    commander: 'Gerd von Rundstedt',
    coordinates: [23.5, 50.0],
  },
  {
    snapshot: '1941-06-21',
    side: 'soviet',
    label: 'Nordwestfr.',
    fullName: 'Nordwestfront',
    commander: 'F. I. Kusnezow',
    coordinates: [25.0, 56.5],
  },
  {
    snapshot: '1941-06-21',
    side: 'soviet',
    label: 'Westfr.',
    fullName: 'Westfront',
    commander: 'D. G. Pawlow',
    coordinates: [27.5, 53.5],
  },
  {
    snapshot: '1941-06-21',
    side: 'soviet',
    label: 'Südwestfr.',
    fullName: 'Südwestfront',
    commander: 'M. P. Kirponos',
    coordinates: [27.0, 49.5],
  },

  // ---------- 1941-12-05 — Moskau-Tore ----------
  {
    snapshot: '1941-12-05',
    side: 'axis',
    label: '3. PzGr.',
    fullName: '3. Panzergruppe',
    commander: 'Georg-Hans Reinhardt',
    coordinates: [36.5, 56.5],
  },
  {
    snapshot: '1941-12-05',
    side: 'axis',
    label: '4. PzGr.',
    fullName: '4. Panzergruppe',
    commander: 'Erich Hoepner',
    coordinates: [36.0, 55.8],
  },
  {
    snapshot: '1941-12-05',
    side: 'axis',
    label: '2. PzA.',
    fullName: '2. Panzerarmee',
    commander: 'Heinz Guderian',
    coordinates: [38.0, 53.8],
  },
  {
    snapshot: '1941-12-05',
    side: 'axis',
    label: '6. Armee',
    fullName: '6. Armee',
    commander: 'Walter von Reichenau',
    coordinates: [37.0, 49.5],
  },
  {
    snapshot: '1941-12-05',
    side: 'soviet',
    label: 'Kal. Fr.',
    fullName: 'Kalininer Front',
    commander: 'Iwan Konew',
    coordinates: [35.5, 57.0],
  },
  {
    snapshot: '1941-12-05',
    side: 'soviet',
    label: 'Westfr.',
    fullName: 'Westfront',
    commander: 'Georgi Schukow',
    coordinates: [37.5, 55.5],
  },
  {
    snapshot: '1941-12-05',
    side: 'soviet',
    label: 'Südwestfr.',
    fullName: 'Südwestfront',
    commander: 'Semjon Timoschenko',
    coordinates: [37.5, 51.0],
  },

  // ---------- 1942-11-19 — Stalingrad / Beginn Uranus ----------
  {
    snapshot: '1942-11-19',
    side: 'axis',
    label: '6. Armee',
    fullName: '6. Armee',
    commander: 'Friedrich Paulus',
    coordinates: [44.0, 48.7],
  },
  {
    snapshot: '1942-11-19',
    side: 'axis',
    label: '4. PzA.',
    fullName: '4. Panzerarmee',
    commander: 'Hermann Hoth',
    coordinates: [43.5, 47.5],
  },
  {
    snapshot: '1942-11-19',
    side: 'axis',
    label: '3. Rum.',
    fullName: '3. Rumänische Armee',
    commander: 'Petre Dumitrescu',
    coordinates: [42.0, 49.0],
  },
  {
    snapshot: '1942-11-19',
    side: 'axis',
    label: '4. Rum.',
    fullName: '4. Rumänische Armee',
    commander: 'Constantin Constantinescu',
    coordinates: [45.0, 47.0],
  },
  {
    snapshot: '1942-11-19',
    side: 'axis',
    label: '1. PzA.',
    fullName: '1. Panzerarmee (Kaukasus)',
    commander: 'Ewald von Kleist',
    coordinates: [43.5, 44.0],
  },
  {
    snapshot: '1942-11-19',
    side: 'soviet',
    label: 'Südwestfr.',
    fullName: 'Südwestfront',
    commander: 'Nikolai Watutin',
    coordinates: [41.5, 49.7],
  },
  {
    snapshot: '1942-11-19',
    side: 'soviet',
    label: 'Donfr.',
    fullName: 'Don-Front',
    commander: 'Konstantin Rokossowski',
    coordinates: [43.0, 49.5],
  },
  {
    snapshot: '1942-11-19',
    side: 'soviet',
    label: 'Stalingradfr.',
    fullName: 'Stalingrader Front',
    commander: 'Andrej Jerjomenko',
    coordinates: [45.5, 47.8],
  },

  // ---------- 1943-07-05 — Beginn Kursk ----------
  {
    snapshot: '1943-07-05',
    side: 'axis',
    label: '9. Armee',
    fullName: '9. Armee (Nordflanke Kursk)',
    commander: 'Walter Model',
    coordinates: [36.0, 53.0],
  },
  {
    snapshot: '1943-07-05',
    side: 'axis',
    label: '4. PzA.',
    fullName: '4. Panzerarmee (Südflanke Kursk)',
    commander: 'Hermann Hoth',
    coordinates: [36.0, 50.3],
  },
  {
    snapshot: '1943-07-05',
    side: 'axis',
    label: 'AAbt. Kempf',
    fullName: 'Armeeabteilung Kempf',
    commander: 'Werner Kempf',
    coordinates: [37.5, 49.8],
  },
  {
    snapshot: '1943-07-05',
    side: 'soviet',
    label: 'Zentralfr.',
    fullName: 'Zentralfront (Nord-Kursker Bogen)',
    commander: 'Konstantin Rokossowski',
    coordinates: [36.0, 52.5],
  },
  {
    snapshot: '1943-07-05',
    side: 'soviet',
    label: 'Wor. Fr.',
    fullName: 'Woronescher Front (Süd-Kursker Bogen)',
    commander: 'Nikolai Watutin',
    coordinates: [35.0, 51.0],
  },
  {
    snapshot: '1943-07-05',
    side: 'soviet',
    label: 'Steppenfr.',
    fullName: 'Steppenfront (Reserve)',
    commander: 'Iwan Konew',
    coordinates: [38.5, 51.5],
  },

  // ---------- 1944-06-22 — Beginn Bagration ----------
  {
    snapshot: '1944-06-22',
    side: 'axis',
    label: '3. PzA.',
    fullName: '3. Panzerarmee',
    commander: 'Georg-Hans Reinhardt',
    coordinates: [30.0, 55.2],
  },
  {
    snapshot: '1944-06-22',
    side: 'axis',
    label: '4. Armee',
    fullName: '4. Armee',
    commander: 'Kurt von Tippelskirch',
    coordinates: [30.5, 53.9],
  },
  {
    snapshot: '1944-06-22',
    side: 'axis',
    label: '9. Armee',
    fullName: '9. Armee',
    commander: 'Hans Jordan',
    coordinates: [29.0, 53.0],
  },
  {
    snapshot: '1944-06-22',
    side: 'axis',
    label: '2. Armee',
    fullName: '2. Armee',
    commander: 'Walter Weiß',
    coordinates: [26.5, 52.0],
  },
  {
    snapshot: '1944-06-22',
    side: 'soviet',
    label: '1. Balt. Fr.',
    fullName: '1. Baltische Front',
    commander: 'Iwan Bagramjan',
    coordinates: [30.5, 56.0],
  },
  {
    snapshot: '1944-06-22',
    side: 'soviet',
    label: '3. Bel. Fr.',
    fullName: '3. Belorussische Front',
    commander: 'Iwan Tschernjachowski',
    coordinates: [31.0, 54.8],
  },
  {
    snapshot: '1944-06-22',
    side: 'soviet',
    label: '2. Bel. Fr.',
    fullName: '2. Belorussische Front',
    commander: 'Georgi Sacharow',
    coordinates: [31.5, 53.5],
  },
  {
    snapshot: '1944-06-22',
    side: 'soviet',
    label: '1. Bel. Fr.',
    fullName: '1. Belorussische Front',
    commander: 'Konstantin Rokossowski',
    coordinates: [29.5, 52.0],
  },

  // ---------- 1945-04-16 — Berliner Operation ----------
  {
    snapshot: '1945-04-16',
    side: 'axis',
    label: '3. PzA.',
    fullName: '3. Panzerarmee',
    commander: 'Hasso von Manteuffel',
    coordinates: [14.0, 53.5],
  },
  {
    snapshot: '1945-04-16',
    side: 'axis',
    label: '9. Armee',
    fullName: '9. Armee (Seelower Höhen)',
    commander: 'Theodor Busse',
    coordinates: [14.5, 52.5],
  },
  {
    snapshot: '1945-04-16',
    side: 'axis',
    label: '4. PzA.',
    fullName: '4. Panzerarmee',
    commander: 'Fritz-Hubert Gräser',
    coordinates: [14.7, 51.3],
  },
  {
    snapshot: '1945-04-16',
    side: 'soviet',
    label: '2. Bel. Fr.',
    fullName: '2. Belorussische Front',
    commander: 'Konstantin Rokossowski',
    coordinates: [14.0, 53.8],
  },
  {
    snapshot: '1945-04-16',
    side: 'soviet',
    label: '1. Bel. Fr.',
    fullName: '1. Belorussische Front',
    commander: 'Georgi Schukow',
    coordinates: [14.8, 52.6],
  },
  {
    snapshot: '1945-04-16',
    side: 'soviet',
    label: '1. Ukr. Fr.',
    fullName: '1. Ukrainische Front',
    commander: 'Iwan Konew',
    coordinates: [14.8, 51.5],
  },
]

export function divisionsForSnapshot(date: string): DivisionMarker[] {
  return DIVISIONS.filter((d) => d.snapshot === date)
}

/** Datum des Snapshots, der `date` am nächsten liegt. */
export function nearestSnapshotDate(date: Date, snapshots: string[]): string {
  const ts = date.getTime()
  let bestDate = snapshots[0]!
  let bestDelta = Math.abs(new Date(bestDate).getTime() - ts)
  for (const s of snapshots) {
    const d = Math.abs(new Date(s).getTime() - ts)
    if (d < bestDelta) {
      bestDelta = d
      bestDate = s
    }
  }
  return bestDate
}
