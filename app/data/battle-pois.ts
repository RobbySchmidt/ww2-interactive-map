/**
 * Points of Interest innerhalb einzelner Schlachten.
 * Werden im Schlacht-Detail-Modus auf der Karte angezeigt.
 *
 * Daten liegen pro Schlacht als JSON unter `app/data/pois/{battleId}.json`.
 * Diese Datei aggregiert sie via Vite-Glob-Import, sodass neue Schlacht-POI-
 * Dateien automatisch eingelesen werden, sobald sie ins Verzeichnis fallen.
 */

export type POICategory = 'building' | 'terrain' | 'industry' | 'transport' | 'symbolic'

export interface BattlePOI {
  /** Foreign Key zu Battle.id */
  battleId: string
  /** Eindeutige ID, kebab-case, mit Battle-Präfix */
  id: string
  /** Anzeigename im Label + Popup-Header */
  name: string
  /** 1–2 Sätze, was diesen Ort besonders/umkämpft machte */
  description: string
  /** [lng, lat] WGS84 */
  coordinates: [number, number]
  /**
   * Optional: Quelle der Koordinaten — für Refine-Tracking.
   *  - 'wikipedia'  → aus Wikipedia-Summary-API coordinates-Feld (sehr präzise)
   *  - 'wikidata'   → aus Wikidata-Item via P625 (sehr präzise)
   *  - 'osm'        → aus OSM Overpass mit historic/military-Tag (präzise)
   *  - 'nominatim'  → aus Nominatim-Search (mittel, Stadt-Mitte/Straße)
   *  - 'manual'     → hand-recherchiert (variabel)
   *  - 'original'   → vom ursprünglichen Recherche-Agent gesetzt
   */
  coordinatesSource?: 'wikipedia' | 'wikidata' | 'osm' | 'nominatim' | 'manual' | 'original'
  category: POICategory
  /** Optional: de.wiki-Slug für Lead-Text + Bild im Popup */
  wikipediaSlug?: string
  /**
   * Optional: hand-recherchiertes Bild aus Wikimedia Commons o.ä., wenn kein
   * Wikipedia-Artikel existiert. Lizenz + Credit sind Pflicht (CC/Bundesarchiv).
   */
  customImage?: {
    /** Direkt-URL zum Bild (Commons-Thumb ~640px empfohlen) */
    url: string
    /** Quelle, z.B. "Wikimedia Commons" oder "Bundesarchiv" */
    source?: string
    /** Lizenz-Kürzel, z.B. "CC BY-SA 3.0" oder "Public Domain" */
    license?: string
    /** Urheber/Credit, z.B. "Bundesarchiv, Bild 183-..." oder Fotograf */
    credit?: string
    /** Link zur Commons-Dateibeschreibungsseite */
    sourceUrl?: string
  }
}

const modules = import.meta.glob<BattlePOI[]>('./pois/*.json', {
  eager: true,
  import: 'default',
})

export const BATTLE_POIS: BattlePOI[] = Object.values(modules).flat()

export function poisForBattle(battleId: string): BattlePOI[] {
  return BATTLE_POIS.filter((p) => p.battleId === battleId)
}
