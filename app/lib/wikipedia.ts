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

// ---------------------------------------------------------------------------
// Bildnachweise (Urheber + Lizenz) — Pflicht für CC-BY/CC-BY-SA-Bilder.
// Weder Summary- noch Media-List-API liefern Lizenzdaten, deshalb ein
// zusätzlicher Query gegen die MediaWiki-API (prop=imageinfo, extmetadata).
// de.wikipedia.org beantwortet das auch für Commons-Dateien (Shared Repo).
// ---------------------------------------------------------------------------

export interface WikiImageCredit {
  /** Datei-Titel wie angefragt, z.B. "Datei:Foo.jpg". */
  title: string
  /** Urheber bzw. geforderte Attribution als Plain-Text. */
  author?: string
  /** Kurzname der Lizenz, z.B. "CC BY-SA 3.0 de" oder "Public domain". */
  license?: string
  licenseUrl?: string
  /** Beschreibungsseite der Datei (Commons oder de.wikipedia). */
  descriptionUrl?: string
}

const CREDIT_PREFIX = 'wiki:credit:v1:'
const CREDIT_BATCH = 50

function stripHtml(html: string): string {
  return html
    // Commons liefert bei mehrsprachigen Artist-Feldern die Übersetzung in
    // einem <span style="display: none;"> — das ist kein sichtbarer Text und
    // würde sonst als "unbekanntUnknown author" ankleben. Komplett entfernen.
    .replace(/<span[^>]*display:\s*none[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<br\s*\/?>/gi, ' ')
    // Block-Enden als Trenner, damit Listeneinträge nicht zusammenkleben.
    .replace(/<\/(span|div|p|li|td|tr|bdi)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Leitet aus einer upload.wikimedia.org-URL den Datei-Titel ab
 * (letztes Pfadsegment, URL-dekodiert). Für Thumbnails wird das
 * Original-Segment vor "/NNNpx-…" genommen.
 */
export function fileTitleFromUrl(url: string): string | null {
  try {
    const path = new URL(url).pathname
    const parts = path.split('/').filter(Boolean)
    if (!parts.length) return null
    let name = parts[parts.length - 1]!
    const thumbIdx = parts.indexOf('thumb')
    if (thumbIdx >= 0 && parts.length >= 2) name = parts[parts.length - 2]!
    const decoded = decodeURIComponent(name)
    return decoded ? `Datei:${decoded}` : null
  } catch {
    return null
  }
}

/** "Urheber · Lizenz" — was in Bildunterschrift/Credit-Badge angezeigt wird. */
export function formatCredit(c: WikiImageCredit | null | undefined): string {
  if (!c) return 'Wikimedia Commons'
  const bits: string[] = []
  const author =
    c.author && c.author.length > 110 ? c.author.slice(0, 107).trimEnd() + '…' : c.author
  if (author) bits.push(author)
  // Bundesarchiv-Attributionen enthalten die Lizenz bereits ("… / CC-BY-SA 3.0");
  // dann nicht noch einmal anhängen.
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (c.license && !(author && norm(author).includes(norm(c.license).replace(/de$/, '')))) {
    bits.push(c.license)
  }
  return bits.length ? bits.join(' · ') : 'Wikimedia Commons'
}

/**
 * Holt Urheber + Lizenz für eine Liste von Datei-Titeln. Ergebnis ist nach
 * dem angefragten Titel indiziert. Pro Titel 24h im LocalStorage gecached,
 * nur fehlende Titel gehen in Batches à 50 an die API. Fehler → leeres Objekt
 * für den Batch, die UI fällt dann auf "Wikimedia Commons" zurück.
 */
export async function fetchImageCredits(
  titles: string[],
): Promise<Record<string, WikiImageCredit>> {
  const out: Record<string, WikiImageCredit> = {}
  const missing: string[] = []
  for (const t of [...new Set(titles)]) {
    const cached = readCache<WikiImageCredit>(CREDIT_PREFIX + t)
    if (cached) {
      if (cached.data) out[t] = cached.data
    } else {
      missing.push(t)
    }
  }

  for (let i = 0; i < missing.length; i += CREDIT_BATCH) {
    const batch = missing.slice(i, i + CREDIT_BATCH)
    try {
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        formatversion: '2',
        origin: '*',
        prop: 'imageinfo',
        iiprop: 'extmetadata|url',
        iiextmetadatafilter: 'Artist|Attribution|LicenseShortName|LicenseUrl',
        titles: batch.join('|'),
      })
      const res = await fetch(`https://de.wikipedia.org/w/api.php?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) continue
      const json = (await res.json()) as {
        query?: {
          normalized?: Array<{ from: string; to: string }>
          pages?: Array<{
            title: string
            imageinfo?: Array<{
              descriptionurl?: string
              extmetadata?: Record<string, { value?: string }>
            }>
          }>
        }
      }
      // API normalisiert Titel (Unterstriche → Leerzeichen etc.); zurückmappen.
      const toRequested = new Map<string, string>()
      for (const n of json.query?.normalized ?? []) toRequested.set(n.to, n.from)
      for (const page of json.query?.pages ?? []) {
        const requested = toRequested.get(page.title) ?? page.title
        const info = page.imageinfo?.[0]
        const meta = info?.extmetadata ?? {}
        const attribution = meta.Attribution?.value
        const artist = meta.Artist?.value
        const credit: WikiImageCredit = {
          title: requested,
          author: stripHtml(attribution || artist || '') || undefined,
          license: stripHtml(meta.LicenseShortName?.value ?? '') || undefined,
          licenseUrl: meta.LicenseUrl?.value || undefined,
          descriptionUrl: info?.descriptionurl,
        }
        out[requested] = credit
        writeCache<WikiImageCredit>(CREDIT_PREFIX + requested, credit)
      }
      // Titel ohne Treffer (gelöscht/umbenannt) negativ cachen — spart Wiederholungen.
      for (const t of batch) {
        if (!out[t]) writeCache<WikiImageCredit>(CREDIT_PREFIX + t, null)
      }
    } catch {
      // Netzwerkfehler: Batch überspringen, UI zeigt generischen Hinweis
    }
  }
  return out
}
