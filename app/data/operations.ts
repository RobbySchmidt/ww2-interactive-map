/**
 * Großoffensiven als animierte Stoßrichtungs-Pfeile.
 * Jeder Pfeil wächst während [start, end] linear bis zur vollen Länge.
 * Pfeile mit `control` werden als quadratische Bézier-Kurven gerendert.
 */

export type OperationSide = 'axis' | 'soviet'

export interface Thrust {
  start: [number, number]
  end: [number, number]
  control?: [number, number]
  label?: string
}

export interface Operation {
  id: string
  name: string
  side: OperationSide
  start: string
  end: string
  thrusts: Thrust[]
  summary: string
}

export const OPERATIONS: Operation[] = [
  {
    id: 'barbarossa',
    name: 'Unternehmen Barbarossa',
    side: 'axis',
    start: '1941-06-22',
    end: '1941-09-26',
    thrusts: [
      { start: [22.5, 55.5], end: [30.3, 59.9], control: [25.5, 58.5], label: 'HG Nord' },
      { start: [23.7, 52.5], end: [36.5, 55.3], control: [30.0, 54.5], label: 'HG Mitte' },
      { start: [23.5, 50.5], end: [38.5, 48.5], control: [30.5, 49.5], label: 'HG Süd' },
    ],
    summary:
      'Dreigleisiger deutscher Überfall auf die Sowjetunion mit den Heeresgruppen Nord (Leningrad), Mitte (Moskau) und Süd (Kiew/Donbass).',
  },
  {
    id: 'kiev-pocket-1941',
    name: 'Kiewer Kesselschlacht',
    side: 'axis',
    start: '1941-08-23',
    end: '1941-09-26',
    thrusts: [
      { start: [32.0, 53.5], end: [33.3, 50.4], control: [34.6, 52.0], label: 'Guderian' },
      { start: [33.5, 48.5], end: [33.3, 50.4], control: [32.0, 49.3], label: 'Kleist' },
    ],
    summary:
      'Doppelzangenangriff Guderians (2. Panzergruppe) und Kleists (1. Panzergruppe), der bei Lochwiza die sowjetische Südwestfront einkesselte.',
  },
  {
    id: 'vyazma-bryansk',
    name: 'Doppelschlacht von Wjasma-Brjansk',
    side: 'axis',
    start: '1941-09-30',
    end: '1941-10-20',
    thrusts: [
      // Wjasma-Kessel: Nord- und Süd-Zange von Westen, treffen sich östlich Wjasma
      { start: [32.0, 56.2], end: [34.6, 55.2], control: [33.5, 56.3], label: 'Hoth (3. PzGr)' },
      { start: [33.0, 53.8], end: [34.6, 55.0], control: [33.5, 54.6], label: 'Hoepner (4. PzGr)' },
      // Brjansk-Kessel: Guderian aus dem Süden nordwärts
      { start: [33.0, 51.7], end: [34.5, 53.3], control: [33.2, 52.7], label: 'Guderian (2. PzGr)' },
    ],
    summary:
      'Doppelte Kesselschlacht zur Eröffnung der Operation Taifun, in der drei sowjetische Frontverbände bei Wjasma und Brjansk vernichtet wurden.',
  },
  {
    id: 'taifun',
    name: 'Unternehmen Taifun',
    side: 'axis',
    start: '1941-09-30',
    end: '1941-12-05',
    thrusts: [
      { start: [33.5, 56.5], end: [37.0, 56.2], control: [35.0, 57.0] },
      { start: [34.5, 55.0], end: [37.6, 55.75], control: [36.0, 55.5], label: 'HG Mitte' },
      { start: [35.5, 53.5], end: [37.6, 54.2], control: [37.0, 53.7], label: 'Guderian → Tula' },
    ],
    summary:
      'Konzentrische deutsche Offensive der HG Mitte mit dem Ziel Moskau, die im Dezember 1941 in den Vororten der Hauptstadt zum Stehen kam.',
  },
  {
    id: 'moscow-counter',
    name: 'Sowjetische Winteroffensive vor Moskau',
    side: 'soviet',
    start: '1941-12-05',
    end: '1942-04-15',
    thrusts: [
      { start: [37.0, 56.2], end: [33.5, 56.0], control: [35.0, 56.8], label: 'Kalininer Front' },
      { start: [37.6, 55.75], end: [34.5, 55.0], control: [36.0, 55.8], label: 'Schukow' },
      { start: [37.6, 54.2], end: [35.0, 53.5], control: [36.5, 54.0] },
    ],
    summary:
      'Sowjetische Gegenoffensive unter Schukow, die die Wehrmacht 100-250 km von Moskau zurückwarf und den Mythos der Unbesiegbarkeit zerstörte.',
  },
  {
    id: 'fall-blau',
    name: 'Fall Blau (Sommeroffensive 1942)',
    side: 'axis',
    start: '1942-06-28',
    end: '1942-11-19',
    thrusts: [
      { start: [36.5, 51.0], end: [44.5, 48.7], control: [41.0, 50.5], label: 'HG B → Stalingrad' },
      { start: [37.5, 49.5], end: [44.65, 43.75], control: [41.0, 46.0], label: 'HG A → Kaukasus' },
    ],
    summary:
      'Divergierende deutsche Sommeroffensive 1942 mit der HG B Richtung Stalingrad und der HG A in den Kaukasus zu den Ölfeldern.',
  },
  {
    id: 'uranus',
    name: 'Operation Uranus',
    side: 'soviet',
    start: '1942-11-19',
    end: '1942-11-23',
    thrusts: [
      { start: [42.5, 49.5], end: [43.5, 48.7], control: [42.5, 49.0], label: 'SW-Front' },
      { start: [44.5, 47.5], end: [43.5, 48.7], control: [44.5, 48.2], label: 'Stalingrader Front' },
    ],
    summary:
      "Sowjetische Zangenoperation, die bei Kalatsch am Don die 6. Armee Paulus' in Stalingrad einschloss und die Wende des Krieges einleitete.",
  },
  {
    id: 'kharkov-1943',
    name: 'Mansteins Gegenschlag',
    side: 'axis',
    start: '1943-02-19',
    end: '1943-03-15',
    thrusts: [
      { start: [37.5, 48.5], end: [36.25, 50.0], control: [37.5, 49.5], label: 'Manstein' },
      { start: [35.5, 48.8], end: [36.6, 50.6], control: [35.8, 49.8] },
    ],
    summary:
      'Mansteins „Rochade" — deutscher Gegenschlag aus dem Süden, der Charkow und Belgorod zurückeroberte und die Front kurzzeitig stabilisierte.',
  },
  {
    id: 'kursk-citadel',
    name: 'Unternehmen Zitadelle',
    side: 'axis',
    start: '1943-07-05',
    end: '1943-07-16',
    thrusts: [
      { start: [36.1, 52.97], end: [36.2, 51.7], control: [36.8, 52.3], label: '9. Armee (Model)' },
      { start: [36.6, 50.6], end: [36.2, 51.7], control: [35.5, 51.2], label: '4. Pz. (Hoth)' },
    ],
    summary:
      'Gescheiterter deutscher Zangenangriff auf den Kursker Bogen — die letzte strategische Offensive der Wehrmacht im Osten.',
  },
  {
    id: 'rumyantsev',
    name: 'Belgorod-Charkow-Operation',
    side: 'soviet',
    start: '1943-08-03',
    end: '1943-08-23',
    thrusts: [
      { start: [36.2, 51.7], end: [36.6, 50.6], label: 'Woronesch-Front' },
      { start: [36.5, 51.2], end: [36.25, 50.0], control: [36.0, 50.7], label: 'Steppen-Front' },
    ],
    summary:
      'Sowjetischer Gegenstoß aus dem Kursker Bogen heraus, der Belgorod und Charkow zurückeroberte und die deutsche Südfront aufriss.',
  },
  {
    id: 'dnieper',
    name: 'Schlacht am Dnepr',
    side: 'soviet',
    start: '1943-08-26',
    end: '1943-12-23',
    thrusts: [
      { start: [32.0, 54.8], end: [27.7, 53.0], control: [30.0, 54.2] },
      { start: [34.0, 52.0], end: [30.5, 50.45], control: [32.5, 51.3], label: 'Kiew' },
      { start: [36.25, 50.0], end: [32.0, 48.5], control: [34.0, 49.3] },
      { start: [38.0, 48.0], end: [35.0, 47.8], control: [36.5, 47.6] },
    ],
    summary:
      'Breitfrontiger sowjetischer Vormarsch von der Smolensk-Charkow-Linie bis zum Dnepr mit Bildung mehrerer Brückenköpfe und Befreiung Kiews.',
  },
  {
    id: 'korsun-op',
    name: 'Korsun-Kesselschlacht',
    side: 'soviet',
    start: '1944-01-24',
    end: '1944-02-17',
    thrusts: [
      { start: [30.5, 49.5], end: [31.2, 49.0], control: [30.5, 49.0], label: '1. Ukr. Front' },
      { start: [32.5, 48.5], end: [31.2, 49.0], control: [32.5, 49.0], label: '2. Ukr. Front' },
    ],
    summary:
      'Sowjetische Zangenoperation am Dnepr-Bogen, die zwei deutsche Korps („Tscherkassy-Kessel") westlich des Dnepr einschloss.',
  },
  {
    id: 'crimea-op-1944',
    name: 'Krim-Offensive 1944',
    side: 'soviet',
    start: '1944-04-08',
    end: '1944-05-12',
    thrusts: [
      { start: [33.7, 46.2], end: [33.5, 44.6], control: [33.5, 45.3], label: 'Perekop' },
      { start: [36.5, 45.4], end: [33.5, 44.6], control: [35.0, 44.7], label: 'Kertsch' },
    ],
    summary:
      'Sowjetische Befreiung der Krim durch konzentrischen Angriff über Perekop und Kertsch, die mit dem Fall Sewastopols endete.',
  },
  {
    id: 'bagration-op',
    name: 'Operation Bagration',
    side: 'soviet',
    start: '1944-06-22',
    end: '1944-08-19',
    thrusts: [
      { start: [30.2, 55.2], end: [23.7, 53.0], control: [27.0, 54.6], label: '1. Balt. Front' },
      { start: [30.5, 54.5], end: [22.0, 53.5], control: [26.0, 54.2], label: '3. Bel. Front' },
      { start: [30.7, 53.9], end: [21.5, 52.8], control: [26.0, 53.5], label: '2. Bel. Front' },
      { start: [29.2, 53.1], end: [21.0, 52.2], control: [25.5, 52.6], label: '1. Bel. Front' },
    ],
    summary:
      'Vernichtende sowjetische Sommeroffensive 1944, die die HG Mitte zerschlug und die Rote Armee vom Dnepr bis an die Weichsel vor Warschau brachte.',
  },
  {
    id: 'lvov-sandomierz-op',
    name: 'Lwiw-Sandomierz-Operation',
    side: 'soviet',
    start: '1944-07-13',
    end: '1944-08-29',
    thrusts: [
      { start: [25.6, 49.55], end: [24.0, 49.8], label: 'Lwiw' },
      { start: [25.6, 50.0], end: [21.75, 50.68], control: [23.5, 50.5], label: '1. Ukr. Front' },
    ],
    summary:
      '1. Ukrainische Front unter Konew stieß von Tarnopol bis zur Weichsel vor und schuf den strategisch wichtigen Brückenkopf von Sandomierz.',
  },
  {
    id: 'iasi-kishinev',
    name: 'Jassy-Kischinjow-Operation',
    side: 'soviet',
    start: '1944-08-20',
    end: '1944-08-29',
    thrusts: [
      { start: [27.6, 47.5], end: [27.0, 46.0], control: [27.0, 46.8], label: '2. Ukr. Front' },
      { start: [29.0, 46.5], end: [27.5, 45.8], control: [28.7, 45.9], label: '3. Ukr. Front' },
      { start: [27.5, 46.2], end: [26.1, 44.4], control: [26.5, 45.3] },
    ],
    summary:
      'Sowjetischer Zangenangriff zur Vernichtung der HG Südukraine, der Rumänien zum Seitenwechsel zwang und die Balkanfront kollabieren ließ.',
  },
  {
    id: 'budapest-op',
    name: 'Budapester Operation',
    side: 'soviet',
    start: '1944-10-29',
    end: '1945-02-13',
    thrusts: [
      { start: [21.0, 47.5], end: [19.1, 47.7], control: [20.0, 47.9], label: '2. Ukr. Front' },
      { start: [20.5, 46.0], end: [18.9, 47.3], control: [19.0, 46.6], label: '3. Ukr. Front' },
    ],
    summary:
      'Konzentrische sowjetische Umfassung von Budapest aus Norden und Süden der Donau, die nach langer Belagerung im Februar 1945 fiel.',
  },
  {
    id: 'vistula-oder-op',
    name: 'Weichsel-Oder-Operation',
    side: 'soviet',
    start: '1945-01-12',
    end: '1945-02-02',
    thrusts: [
      {
        start: [21.0, 52.2],
        end: [14.65, 52.6],
        control: [18.0, 52.6],
        label: '1. Bel. Fr. (Schukow)',
      },
      {
        start: [21.75, 50.68],
        end: [15.0, 51.5],
        control: [18.5, 51.2],
        label: '1. Ukr. Fr. (Konew)',
      },
    ],
    summary:
      'Massiver sowjetischer Vorstoß aus den Weichsel-Brückenköpfen bis zur Oder, der die Rote Armee auf 60 km an Berlin heranführte.',
  },
  {
    id: 'east-prussia-op',
    name: 'Ostpreußische Operation',
    side: 'soviet',
    start: '1945-01-13',
    end: '1945-04-25',
    thrusts: [
      { start: [22.8, 54.4], end: [20.5, 54.7], control: [21.8, 54.9], label: '3. Bel. Front' },
      { start: [22.0, 53.5], end: [19.5, 54.3], control: [20.5, 53.7], label: '2. Bel. Front' },
      { start: [20.0, 55.5], end: [20.5, 54.7], control: [19.8, 55.0] },
    ],
    summary:
      'Sowjetische Einkesselung und Zerschlagung der HG Mitte in Ostpreußen, die mit dem Sturm auf Königsberg im April 1945 endete.',
  },
  {
    id: 'spring-awakening-op',
    name: 'Unternehmen Frühlingserwachen',
    side: 'axis',
    start: '1945-03-06',
    end: '1945-03-16',
    thrusts: [
      { start: [18.0, 47.0], end: [18.8, 46.3], control: [18.0, 46.6], label: '6. SS-Pz.-Armee' },
      { start: [17.5, 46.5], end: [18.5, 46.0], control: [17.7, 46.1] },
    ],
    summary:
      'Letzte deutsche Großoffensive des Krieges am Plattensee, mit der Hitler die ungarischen Ölfelder zurückerobern wollte — schon nach 10 Tagen gescheitert.',
  },
  {
    id: 'vienna-op',
    name: 'Wiener Operation',
    side: 'soviet',
    start: '1945-03-16',
    end: '1945-04-15',
    thrusts: [
      { start: [18.0, 47.5], end: [16.4, 48.2], control: [17.0, 48.0], label: '3. Ukr. Front' },
      { start: [18.5, 48.3], end: [16.4, 48.2], control: [17.5, 48.5] },
    ],
    summary:
      'Sowjetischer Vorstoß aus Ungarn nach Österreich, der mit der Einnahme Wiens am 13. April 1945 abgeschlossen wurde.',
  },
  {
    id: 'berlin-op',
    name: 'Berliner Operation',
    side: 'soviet',
    start: '1945-04-16',
    end: '1945-05-02',
    thrusts: [
      { start: [14.65, 52.6], end: [13.4, 52.5], control: [14.0, 52.7], label: '1. Bel. (Schukow)' },
      { start: [14.7, 51.9], end: [13.4, 52.4], control: [13.9, 52.0], label: '1. Ukr. (Konew)' },
      { start: [14.5, 53.4], end: [13.0, 53.0], control: [13.8, 53.3], label: '2. Bel.' },
    ],
    summary:
      'Schlussoffensive der Roten Armee mit konzentrischer Umfassung Berlins durch die Fronten Schukows, Konews und Rokossowskis.',
  },
]

/** Operationen aktiv zum gegebenen Datum (start ≤ date ≤ end). */
export function activeOperationsAt(date: Date): Operation[] {
  const ts = date.getTime()
  return OPERATIONS.filter(
    (op) => new Date(op.start).getTime() <= ts && new Date(op.end).getTime() >= ts,
  )
}

/** Fortschritt einer Operation am gegebenen Datum, geclamped auf [0, 1]. */
export function operationProgress(op: Operation, date: Date): number {
  const ts = date.getTime()
  const a = new Date(op.start).getTime()
  const b = new Date(op.end).getTime()
  if (b <= a) return 1
  return Math.max(0, Math.min(1, (ts - a) / (b - a)))
}

/** Quadratische Bézier-Auswertung. P0=start, P1=control, P2=end. */
export function quadraticBezier(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
): [number, number] {
  const u = 1 - t
  return [
    u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
  ]
}

/** Tangente einer quadratischen Bézier bei Parameter t. */
export function quadraticBezierTangent(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
): [number, number] {
  return [
    2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]),
    2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]),
  ]
}

/**
 * Generiert Polylinie für einen Pfeil bis zum Fortschritts-Parameter t ∈ [0, 1].
 * Gibt Polylinien-Punkte und den normierten Tangenten-Vektor am Endpunkt zurück.
 */
export function buildThrustPath(
  thrust: Thrust,
  t: number,
): { points: [number, number][]; tangent: [number, number] } {
  if (t <= 0) {
    return { points: [thrust.start, thrust.start], tangent: [0, 1] }
  }
  const tClamped = Math.min(1, t)

  let points: [number, number][]
  let tan: [number, number]

  if (thrust.control) {
    const steps = 24
    points = []
    for (let i = 0; i <= steps; i++) {
      const localT = (i / steps) * tClamped
      points.push(quadraticBezier(localT, thrust.start, thrust.control, thrust.end))
    }
    tan = quadraticBezierTangent(tClamped, thrust.start, thrust.control, thrust.end)
  } else {
    const tip: [number, number] = [
      thrust.start[0] + (thrust.end[0] - thrust.start[0]) * tClamped,
      thrust.start[1] + (thrust.end[1] - thrust.start[1]) * tClamped,
    ]
    points = [thrust.start, tip]
    tan = [thrust.end[0] - thrust.start[0], thrust.end[1] - thrust.start[1]]
  }

  const len = Math.hypot(tan[0], tan[1])
  const normalized: [number, number] = len > 0 ? [tan[0] / len, tan[1] / len] : [0, 1]
  return { points, tangent: normalized }
}

/**
 * Erzeugt Chevron-Punkte (V-Form) für die Pfeilspitze.
 * Die Spitze sitzt am `tip`, die Flügel zeigen zurück gegen die Tangenten-Richtung.
 * `wingLen` in Grad (Längen-/Breitengrad-Einheiten).
 */
export function buildChevron(
  tip: [number, number],
  tangentNorm: [number, number],
  wingLen: number,
): [number, number][] {
  const [tx, ty] = tangentNorm
  // Punkt "hinter" der Spitze (gegen Tangente)
  const back: [number, number] = [tip[0] - tx * wingLen, tip[1] - ty * wingLen]
  // Senkrechte (90° CCW): (-ty, tx)
  const sideways = wingLen * 0.45
  const left: [number, number] = [back[0] + -ty * sideways, back[1] + tx * sideways]
  const right: [number, number] = [back[0] - -ty * sideways, back[1] - tx * sideways]
  // Linie: linker Flügel → Spitze → rechter Flügel
  return [left, tip, right]
}
