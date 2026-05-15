/**
 * Wikipedia REST-API-Anbindung (de.wikipedia.org) mit LocalStorage-Cache.
 *
 * Holt für einen Slug die Summary-Daten (Lead-Plaintext + Hauptbild) und
 * cached sie für 24 Stunden. Reduziert Round-Trips und macht das Detail-Panel
 * beim erneuten Öffnen sofort verfügbar.
 */

export interface WikiSummary {
  /** Kanonischer Titel laut Wikipedia (kann durch Redirects abweichen). */
  title: string
  /** 2–4 Sätze Plain-Text-Lead des Artikels. */
  extract: string
  /** Thumbnail-URL (~640px breit). */
  thumbnail?: { source: string; width: number; height: number }
  /** Original-Bild-URL (volle Auflösung, nur für Lightbox/Klick). */
  originalImage?: { source: string; width: number; height: number }
  /** Desktop-URL des Wikipedia-Artikels (de.wikipedia.org/wiki/...). */
  url: string
}

const SUMMARY_PREFIX = 'wiki:de:'
const GALLERY_PREFIX = 'wiki:de:gallery:v2:'
const TTL_MS = 24 * 60 * 60 * 1000

interface CacheEntry<T> {
  ts: number
  data: T | null
}

function readCache<T>(key: string): CacheEntry<T> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CacheEntry<T>
    if (Date.now() - parsed.ts > TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache<T>(key: string, data: T | null) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ ts: Date.now(), data } satisfies CacheEntry<T>),
    )
  } catch {
    // LocalStorage voll oder deaktiviert — geräuschlos ignorieren
  }
}

/**
 * Holt die Wikipedia-Summary für einen Slug.
 * Gibt null zurück, wenn der Artikel nicht existiert (404) oder eine
 * Begriffsklärungsseite ist.
 *
 * Slug-Format: roher Wikipedia-URL-Teil mit Unterstrichen,
 *   z.B. 'Schlacht_von_Stalingrad'
 */
export async function fetchWikiSummary(slug: string): Promise<WikiSummary | null> {
  const key = SUMMARY_PREFIX + slug
  const cached = readCache<WikiSummary>(key)
  if (cached) return cached.data

  try {
    const res = await fetch(
      `https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) {
      writeCache<WikiSummary>(key, null)
      return null
    }
    const json = (await res.json()) as {
      type?: string
      title: string
      extract: string
      thumbnail?: { source: string; width: number; height: number }
      originalimage?: { source: string; width: number; height: number }
      content_urls?: { desktop?: { page?: string } }
    }
    if (json.type === 'disambiguation') {
      writeCache<WikiSummary>(key, null)
      return null
    }
    const data: WikiSummary = {
      title: json.title,
      extract: json.extract,
      thumbnail: json.thumbnail,
      originalImage: json.originalimage,
      url:
        json.content_urls?.desktop?.page ??
        `https://de.wikipedia.org/wiki/${encodeURIComponent(slug)}`,
    }
    writeCache<WikiSummary>(key, data)
    return data
  } catch {
    return null
  }
}

export interface WikiImage {
  /** Mittlere Auflösung (~800px) — für Galerie-Grid. */
  thumb: string
  /** Original-Datei in voller Auflösung. */
  original: string
  /** Datei-Titel (z.B. "Datei:Foo.jpg") — Quellennachweis-Link. */
  title: string
}

const SKIP_KEYWORDS = [
  'map',
  'karte',
  'diagram',
  'wappen',
  '_coa',
  '-coa',
  'flag_of',
  'flagge',
  'badge',
  'commons-logo',
  'icon',
  'symbol',
  'encirclement',
  'orden',
]

function isLikelyPhotograph(title: string): boolean {
  const t = title.toLowerCase()
  if (t.endsWith('.svg') || t.endsWith('.gif')) return false
  for (const kw of SKIP_KEYWORDS) {
    if (t.includes(kw)) return false
  }
  return true
}

/**
 * Wandelt eine Thumbnail-URL in eine Vollauflösung-URL um.
 * Eingabe:  //upload.wikimedia.org/wikipedia/commons/thumb/5/52/Foo.jpg/500px-Foo.jpg
 * Ausgabe:  https://upload.wikimedia.org/wikipedia/commons/5/52/Foo.jpg
 */
function thumbToOriginal(src: string): string {
  const withProto = src.startsWith('//') ? `https:${src}` : src
  const match = withProto.match(/^(https?:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/thumb\/(.+)\/[^/]+$/)
  if (!match) return withProto
  return `${match[1]}/${match[2]}`
}

/** Normalisiert eine Wikimedia-URL (protocol-relative → https). */
function normalizeUrl(src: string): string {
  return src.startsWith('//') ? `https:${src}` : src
}

/**
 * Holt die Bildergalerie eines Wikipedia-Artikels.
 * Filtert SVG-Karten, Wappen, Flaggen, Diagramme automatisch heraus.
 * Liefert max. 16 wahrscheinliche Foto-Bilder.
 */
export async function fetchWikiGallery(slug: string): Promise<WikiImage[]> {
  const key = GALLERY_PREFIX + slug
  const cached = readCache<WikiImage[]>(key)
  if (cached) return cached.data ?? []

  try {
    const res = await fetch(
      `https://de.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(slug)}`,
      { headers: { Accept: 'application/json' } },
    )
    if (!res.ok) {
      writeCache<WikiImage[]>(key, null)
      return []
    }
    const json = (await res.json()) as {
      items: Array<{
        type?: string
        title?: string
        showInGallery?: boolean
        srcset?: Array<{ src: string; scale?: string }>
      }>
    }
    const filtered = json.items
      .filter((it) => it.type === 'image')
      .filter((it) => it.showInGallery !== false)
      .filter((it) => it.title && isLikelyPhotograph(it.title))
      .filter((it) => it.srcset?.[0]?.src)
      .slice(0, 16)
      .map<WikiImage>((it) => {
        const src = it.srcset![0]!.src
        return {
          thumb: normalizeUrl(src),
          original: thumbToOriginal(src),
          title: it.title!,
        }
      })
    writeCache<WikiImage[]>(key, filtered)
    return filtered
  } catch {
    return []
  }
}
