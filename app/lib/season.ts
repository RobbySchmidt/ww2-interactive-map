/**
 * Saison-/Wetter-Logik für die Ostfront-Karte.
 *
 * Bildet das Klima Mittel-/Osteuropas in vier didaktische Phasen ab:
 *  - winter         (Schnee, gefrorener Boden)
 *  - spring-mud     (Rasputitsa: Schneeschmelze + Regen → Schlammperiode)
 *  - summer         (Trocken, idealer Bewegungszeitraum)
 *  - autumn-mud     (Rasputitsa: Herbstregen vor dem Frost)
 *
 * Die Grenzen sind grob; in der Praxis liefen Frühjahrs- und Herbst-Tauwetter
 * von Süd nach Nord versetzt ab. Für eine visuelle Indikator-Schicht reicht
 * eine einheitliche Klassifikation.
 */

export type Season = 'winter' | 'spring-mud' | 'summer' | 'autumn-mud'

export interface SeasonInfo {
  season: Season
  /** Anzeige-Label im UI */
  label: string
  /** Tint-Farbe (Hex); null wenn keine Tönung. */
  color: string | null
  /** Opacity 0..1 für den background-Layer; 0 wenn keine Tönung. */
  opacity: number
  /** SVG-Pfad (24×24 viewBox) für ein passendes Wetter-Icon. */
  iconPath: string
}

/**
 * Klassifiziert ein Datum nach Saison. Schwellen liegen an
 * Mitte-Monats-Daten, die etwa der Realität in Russland/Polen/Belarus
 * entsprechen.
 */
export function seasonAt(date: Date): Season {
  const m = date.getUTCMonth() // 0=Jan
  const d = date.getUTCDate()

  // Winter: 1. Dez – 15. Mär
  if (m === 11) return 'winter'
  if (m === 0 || m === 1) return 'winter'
  if (m === 2 && d <= 15) return 'winter'

  // Frühjahrs-Rasputitsa: 16. Mär – 15. Mai
  if (m === 2 && d >= 16) return 'spring-mud'
  if (m === 3) return 'spring-mud'
  if (m === 4 && d <= 15) return 'spring-mud'

  // Sommer: 16. Mai – 15. Okt
  if (m === 4 && d >= 16) return 'summer'
  if (m >= 5 && m <= 8) return 'summer'
  if (m === 9 && d <= 15) return 'summer'

  // Herbst-Rasputitsa: 16. Okt – 30. Nov
  return 'autumn-mud'
}

// SVG-Pfade (alle 24×24, monochrom, fill="currentColor")
const ICON_SNOW =
  'M12 2v20M5 5l14 14M19 5L5 19M2 12h20M4.5 8.5l15 7M19.5 8.5l-15 7'
const ICON_MUD =
  'M3 17c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2v4H3v-4zM5 11c1.5 0 1.5-1.5 3-1.5S9.5 11 11 11s1.5-1.5 3-1.5S15.5 11 17 11s1.5-1.5 3-1.5'
const ICON_SUN =
  'M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-6.66l1.42-1.42M4.92 19.08l1.42-1.42m0-12.32L4.92 3.92m14.16 14.16l1.42 1.42M12 7a5 5 0 100 10 5 5 0 000-10z'

const INFO: Record<Season, Omit<SeasonInfo, 'season'>> = {
  winter: {
    label: 'Winter · Frost & Schnee',
    color: '#dde6ef',
    opacity: 0.22,
    iconPath: ICON_SNOW,
  },
  'spring-mud': {
    label: 'Frühjahrs-Rasputitsa · Schlammperiode',
    color: '#8b6f4a',
    opacity: 0.24,
    iconPath: ICON_MUD,
  },
  summer: {
    label: 'Sommer · trockene Operationsphase',
    color: null,
    opacity: 0,
    iconPath: ICON_SUN,
  },
  'autumn-mud': {
    label: 'Herbst-Rasputitsa · Schlammperiode',
    color: '#7a5a3a',
    opacity: 0.24,
    iconPath: ICON_MUD,
  },
}

export function seasonInfo(date: Date): SeasonInfo {
  const s = seasonAt(date)
  return { season: s, ...INFO[s] }
}
