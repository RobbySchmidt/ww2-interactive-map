<template>
  <div ref="container" class="war-map" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl, { Map as MlMap, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { frontLineAt, sovietRegionAt, SNAPSHOTS } from '~/data/easternFront'
import { axisCountryCodesAt } from '~/data/axisControl'
import polygonClipping, { type Geom, type MultiPolygon, type Polygon as ClipPolygon } from 'polygon-clipping'
import { activeBattlesAt, type Battle } from '~/data/battles'
import {
  divisionsForSnapshot,
  nearestSnapshotDate,
  type DivisionMarker,
} from '~/data/divisions'
import { citiesForActiveBattles } from '~/data/cities'
import {
  buildChevron,
  buildThrustPath,
  OPERATIONS,
  type Operation,
} from '~/data/operations'

// Pfeile bleiben nach Operations-Ende noch FADE_DAYS sichtbar und werden linear
// ausgeblendet. Verhindert das harte Verschwinden am Stichtag und macht den
// Übergang zur Nachfolge-Operation visuell weicher.
const OPERATION_FADE_DAYS = 14
const OPERATION_FADE_MS = OPERATION_FADE_DAYS * 86_400_000
// Labels erscheinen erst, sobald der Pfeil zu ≥ 30% gewachsen ist — vermeidet
// hektisches Platz-Springen am Operations-Start.
const OPERATION_LABEL_MIN_PROGRESS = 0.3
import { CATEGORY_COLORS, CATEGORY_LABELS, type HistEvent } from '~/data/events'
import { BATTLES } from '~/data/battles'
import { RAILWAYS } from '~/data/railways'
import type { BattlePOI, POICategory } from '~/data/battle-pois'
import {
  distanceToLineKm,
  haversineKm,
  pointInPolygonFC,
  pointInPolygonOrMultiFC,
  type LngLat,
} from '~/lib/geo'
import { seasonInfo } from '~/lib/season'
import { fetchWikiSummary } from '~/lib/wikipedia'

const props = defineProps<{
  currentDate: Date
  baseLayer: 'map' | 'satellite'
  pinnedEvent: HistEvent | null
  weatherEnabled: boolean
  railwayEnabled: boolean
  pois: BattlePOI[]
}>()

const emit = defineEmits<{
  (e: 'battle-click', battle: Battle): void
  (e: 'operation-click', operation: Operation): void
  (e: 'pin-focus'): void
  (e: 'pin-dismiss'): void
}>()

const container = ref<HTMLDivElement>()
let map: MlMap | null = null
let eventPin: Marker | null = null
let locationPopup: maplibregl.Popup | null = null
let divisionPopup: maplibregl.Popup | null = null
let operationPopup: maplibregl.Popup | null = null
let poiPopup: maplibregl.Popup | null = null

const SNAPSHOT_DATES = SNAPSHOTS.map((s) => s.date)

const DATE_FMT_SHORT = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.de/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 18,
      attribution: '© OpenStreetMap-Mitwirkende · Stil openstreetmap.de',
    },
    satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Tiles © Esri',
    },
  },
  layers: [
    { id: 'osm', type: 'raster', source: 'osm', layout: { visibility: 'visible' } },
    { id: 'satellite', type: 'raster', source: 'satellite', layout: { visibility: 'none' } },
    {
      id: 'desaturate-overlay',
      type: 'background',
      paint: { 'background-color': '#1a1a1a', 'background-opacity': 0.35 },
    },
    {
      id: 'weather-tint',
      type: 'background',
      paint: { 'background-color': '#ffffff', 'background-opacity': 0 },
    },
  ],
}

function setBaseLayer(mode: 'map' | 'satellite') {
  if (!map) return
  map.setLayoutProperty('osm', 'visibility', mode === 'map' ? 'visible' : 'none')
  map.setLayoutProperty('satellite', 'visibility', mode === 'satellite' ? 'visible' : 'none')
}

function updateWeather() {
  if (!map || !map.getLayer('weather-tint')) return
  if (!props.weatherEnabled) {
    map.setPaintProperty('weather-tint', 'background-opacity', 0)
    return
  }
  const info = seasonInfo(props.currentDate)
  if (info.color === null) {
    map.setPaintProperty('weather-tint', 'background-opacity', 0)
    return
  }
  map.setPaintProperty('weather-tint', 'background-color', info.color)
  map.setPaintProperty('weather-tint', 'background-opacity', info.opacity)
}

function updateRailways() {
  if (!map) return
  const vis = props.railwayEnabled ? 'visible' : 'none'
  if (map.getLayer('railways-halo')) map.setLayoutProperty('railways-halo', 'visibility', vis)
  if (map.getLayer('railways-line')) map.setLayoutProperty('railways-line', 'visibility', vis)
}

// ─── POI-Icons (Kategorie-spezifisch, als SVG → addImage) ──────────────────
const POI_ICONS: Record<POICategory, { color: string; path: string }> = {
  building: {
    color: '#22d3ee',
    path: 'M3 21V9l9-6 9 6v12h-6v-7h-6v7H3z',
  },
  industry: {
    color: '#fb923c',
    path: 'M2 22V8l5 3.5V8l5 3.5V8l5 3.5V4h3v18H2zm3-3h2v-2H5v2zm0-4h2v-2H5v2zm4 4h2v-2H9v2zm0-4h2v-2H9v2zm4 4h2v-2h-2v2zm0-4h2v-2h-2v2z',
  },
  transport: {
    color: '#a78bfa',
    path: 'M4 16.5C4 18.43 5.57 20 7.5 20L6 21.5v.5h12v-.5L16.5 20c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8 1.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM6 11V6h12v5H6z',
  },
  terrain: {
    color: '#34d399',
    path: 'M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z',
  },
  symbolic: {
    color: '#facc15',
    path: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  },
}

async function loadPoiIcons() {
  if (!map) return
  for (const [cat, def] of Object.entries(POI_ICONS) as [POICategory, typeof POI_ICONS['building']][]) {
    const id = `poi-icon-${cat}`
    if (map.hasImage(id)) continue
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="48" height="48">
      <circle cx="16" cy="16" r="14" fill="rgba(15,15,15,0.95)" stroke="${def.color}" stroke-width="2"/>
      <g transform="translate(8 8) scale(0.667)" fill="${def.color}"><path d="${def.path}"/></g>
    </svg>`
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new Image(48, 48)
    img.src = url
    try {
      await img.decode()
      if (!map.hasImage(id)) map.addImage(id, img, { pixelRatio: 2 })
    } catch {
      // Browser unterstützt decode() nicht — geräuschlos überspringen
    } finally {
      URL.revokeObjectURL(url)
    }
  }
}

function updatePois() {
  if (!map) return
  const fc: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: 'FeatureCollection',
    features: props.pois.map((p) => ({
      type: 'Feature',
      properties: {
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        wikipediaSlug: p.wikipediaSlug ?? '',
      },
      geometry: { type: 'Point', coordinates: p.coordinates },
    })),
  }
  const src = map.getSource('pois') as maplibregl.GeoJSONSource | undefined
  if (src) src.setData(fc)
}

function escapePopupHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!
  })
}

const CATEGORY_BADGES: Record<POICategory, string> = {
  building: 'Gebäude',
  industry: 'Industrie',
  transport: 'Verkehr',
  terrain: 'Gelände',
  symbolic: 'Symbol',
}

function buildCustomImageHtml(poi: BattlePOI): string {
  const ci = poi.customImage
  if (!ci) return ''
  const safeUrl = escapePopupHtml(ci.url)
  const alt = escapePopupHtml(poi.name)
  const creditBits: string[] = []
  if (ci.credit) creditBits.push(escapePopupHtml(ci.credit))
  if (ci.license) creditBits.push(escapePopupHtml(ci.license))
  if (ci.source && !ci.credit) creditBits.push(escapePopupHtml(ci.source))
  const credit = creditBits.length
    ? `<div class="poi-pop-credit">${creditBits.join(' · ')}</div>`
    : ''
  if (ci.sourceUrl) {
    return `<a href="${escapePopupHtml(ci.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="poi-pop-img-link">
      <img src="${safeUrl}" alt="${alt}" loading="lazy"/>${credit}</a>`
  }
  return `<div class="poi-pop-img-link">
    <img src="${safeUrl}" alt="${alt}" loading="lazy"/>${credit}</div>`
}

async function showPoiPopup(poi: BattlePOI) {
  if (!map) return
  poiPopup?.remove()
  const badge = CATEGORY_BADGES[poi.category]
  const color = POI_ICONS[poi.category].color
  const customImgHtml = buildCustomImageHtml(poi)
  const placeholderImg = customImgHtml || '<div class="poi-pop-img poi-pop-img--placeholder"></div>'
  const initialHtml = `
    <div class="poi-pop">
      ${placeholderImg}
      <div class="poi-pop-body">
        <div class="poi-pop-badge" style="color:${color};border-color:${color}">${badge}</div>
        <div class="poi-pop-title">${escapePopupHtml(poi.name)}</div>
        <div class="poi-pop-desc">${escapePopupHtml(poi.description)}</div>
      </div>
    </div>`
  poiPopup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: false,
    maxWidth: '320px',
    className: 'poi-popup',
    offset: 22,
  })
    .setLngLat(poi.coordinates)
    .setHTML(initialHtml)
    .addTo(map)

  if (!poi.wikipediaSlug) return
  const wiki = await fetchWikiSummary(poi.wikipediaSlug)
  // Popup könnte zwischenzeitlich geschlossen worden sein
  if (!poiPopup || !wiki) return
  // customImage (zeitgetreues Kriegsfoto) hat Vorrang vor Wikipedia-Thumb (oft modern).
  // Wikipedia-Bild nur als Fallback, wenn kein customImage hinterlegt ist.
  const imgHtml = customImgHtml
    ? customImgHtml
    : wiki.thumbnail
      ? `<a href="${wiki.url}" target="_blank" rel="noopener noreferrer" class="poi-pop-img-link">
           <img src="${wiki.thumbnail.source}" alt="${escapePopupHtml(wiki.title)}" loading="lazy"/>
         </a>`
      : ''
  const linkHtml = `<a class="poi-pop-link" href="${wiki.url}" target="_blank" rel="noopener noreferrer">Auf Wikipedia weiterlesen ↗</a>`
  poiPopup.setHTML(`
    <div class="poi-pop">
      ${imgHtml}
      <div class="poi-pop-body">
        <div class="poi-pop-badge" style="color:${color};border-color:${color}">${badge}</div>
        <div class="poi-pop-title">${escapePopupHtml(poi.name)}</div>
        <div class="poi-pop-desc">${escapePopupHtml(poi.description)}</div>
        ${linkHtml}
      </div>
    </div>`)
}

function updateFront() {
  if (!map || !map.isStyleLoaded()) return
  const line = frontLineAt(props.currentDate)

  const lineSrc = map.getSource('front-line') as maplibregl.GeoJSONSource | undefined
  if (lineSrc) lineSrc.setData(line)

  updateAxisCountriesClipped()
}

// Cache der Country-Geometries: NE50m-GeoJSON wird einmal beim Map-Init geladen
// und hier per ADM0_A3-Code abgelegt. Beim Datums-Scrub clippen wir die Geometrie
// gegen die Sowjet-Region (Difference) — Ergebnis ist die Achsen-Seite.
const countryGeoms = new Map<string, GeoJSON.Geometry>()
let countryGeomsLoaded = false

async function loadCountryGeoms() {
  try {
    const res = await fetch('/data/ne_50m_admin_0_countries.json')
    const fc = (await res.json()) as GeoJSON.FeatureCollection
    for (const f of fc.features) {
      const code = (f.properties as Record<string, unknown>)?.ADM0_A3
      if (typeof code === 'string') countryGeoms.set(code, f.geometry)
    }
    countryGeomsLoaded = true
    updateAxisCountriesClipped()
  } catch (e) {
    console.warn('[WarMap] Konnte Country-Geometries nicht laden:', e)
  }
}

/** Wandelt GeoJSON-Polygon/MultiPolygon in das von polygon-clipping erwartete Format. */
function geomToClip(geom: GeoJSON.Geometry): MultiPolygon | null {
  if (geom.type === 'Polygon') return [geom.coordinates as ClipPolygon]
  if (geom.type === 'MultiPolygon') return geom.coordinates as MultiPolygon
  return null
}

function buildClippedAxisCountriesFC(date: Date): GeoJSON.FeatureCollection<GeoJSON.MultiPolygon> {
  const codes = axisCountryCodesAt(date)
  const soviet = sovietRegionAt(date)
  const sovietMulti: MultiPolygon = [soviet.coordinates as ClipPolygon]

  const features: GeoJSON.Feature<GeoJSON.MultiPolygon>[] = []
  for (const code of codes) {
    const geom = countryGeoms.get(code)
    if (!geom) continue
    const countryMulti = geomToClip(geom)
    if (!countryMulti) continue
    let clipped: Geom
    try {
      clipped = polygonClipping.difference(countryMulti, sovietMulti)
    } catch {
      // Bei (sehr seltenen) numerischen Edge-Cases das Country uneinheitlich rendern
      clipped = countryMulti
    }
    if (!clipped.length) continue
    features.push({
      type: 'Feature',
      properties: { ADM0_A3: code },
      geometry: { type: 'MultiPolygon', coordinates: clipped as GeoJSON.Position[][][] },
    })
  }
  return { type: 'FeatureCollection', features }
}

function updateAxisCountriesClipped() {
  if (!map || !countryGeomsLoaded) return
  const src = map.getSource('axis-countries') as maplibregl.GeoJSONSource | undefined
  if (!src) return
  src.setData(buildClippedAxisCountriesFC(props.currentDate))
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!
  })
}

function buildLocationQueryHtml(lng: number, lat: number): string {
  const point: LngLat = [lng, lat]
  const date = props.currentDate

  // 1) Seite: Achse (rot eingefärbte Country-Fläche), Sowjet (östlich der Front),
  //    sonst neutral/alliiert. Reihenfolge: zuerst Achse prüfen, weil die
  //    geclippte Country-Geometrie schon korrekt ländergrenzentreu beschnitten ist.
  const axisCountriesFC = buildClippedAxisCountriesFC(date)
  const inAxis = pointInPolygonOrMultiFC(point, axisCountriesFC)
  let sideLabel: string
  let sideColor: string
  if (inAxis) {
    sideLabel = 'Achsenkontrolle'
    sideColor = '#b91c1c'
  } else {
    const sovietFC: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: sovietRegionAt(date) }],
    }
    if (pointInPolygonFC(point, sovietFC)) {
      sideLabel = 'sowjetisches Gebiet'
      sideColor = '#facc15'
    } else {
      sideLabel = 'neutral / alliiert'
      sideColor = '#737373'
    }
  }

  // 2) Entfernung zur Frontlinie
  const front = frontLineAt(date)
  const frontCoords = front.geometry.coordinates as LngLat[]
  const distKm = distanceToLineKm(point, frontCoords)

  // 3) Nächste Schlacht (aktiv ODER beliebige, Distanz zum Zentrum)
  const ts = date.getTime()
  let nearestActiveBattle: { name: string; dist: number } | null = null
  let nearestAnyBattle: { name: string; dist: number; year: number } | null = null
  for (const b of BATTLES) {
    const d = haversineKm(point, b.coordinates as LngLat)
    const start = new Date(b.start).getTime()
    const end = new Date(b.end).getTime()
    if (ts >= start && ts <= end) {
      if (!nearestActiveBattle || d < nearestActiveBattle.dist) {
        nearestActiveBattle = { name: b.name, dist: d }
      }
    }
    if (!nearestAnyBattle || d < nearestAnyBattle.dist) {
      nearestAnyBattle = { name: b.name, dist: d, year: new Date(b.start).getFullYear() }
    }
  }

  const fmtKm = (km: number) =>
    km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km).toLocaleString('de-DE')} km`
  const fmtLngLat = `${lat.toFixed(3)}° N, ${lng.toFixed(3)}° E`

  let html = `
    <div class="locq">
      <div class="locq-coords">${fmtLngLat}</div>
      <div class="locq-date">am ${DATE_FMT_SHORT.format(date)}</div>
      <div class="locq-row">
        <span class="locq-dot" style="background: ${sideColor}"></span>
        <span class="locq-side">${sideLabel}</span>
      </div>
      <div class="locq-row">
        <span class="locq-label">Front</span>
        <span class="locq-val">${fmtKm(distKm)}</span>
      </div>
  `

  if (nearestActiveBattle && nearestActiveBattle.dist < 500) {
    const id = BATTLES.find((b) => b.name === nearestActiveBattle!.name)?.id
    html += `
      <div class="locq-row">
        <span class="locq-label">Aktive Schlacht</span>
        <button class="locq-battle-link" data-battle-id="${id}" type="button">${escapeHtml(nearestActiveBattle.name)}</button>
        <span class="locq-dim">· ${fmtKm(nearestActiveBattle.dist)}</span>
      </div>
    `
  } else if (nearestAnyBattle && nearestAnyBattle.dist < 300) {
    const id = BATTLES.find((b) => b.name === nearestAnyBattle!.name)?.id
    html += `
      <div class="locq-row">
        <span class="locq-label">Nächste Schlacht</span>
        <button class="locq-battle-link" data-battle-id="${id}" type="button">${escapeHtml(nearestAnyBattle.name)}</button>
        <span class="locq-dim">${nearestAnyBattle.year} · ${fmtKm(nearestAnyBattle.dist)}</span>
      </div>
    `
  }

  html += '</div>'
  return html
}

function showLocationQuery(lngLat: maplibregl.LngLat) {
  if (!map) return
  if (locationPopup) {
    locationPopup.remove()
    locationPopup = null
  }
  locationPopup = new maplibregl.Popup({
    closeButton: true,
    closeOnClick: true,
    maxWidth: '280px',
    className: 'locq-popup',
  })
    .setLngLat(lngLat)
    .setHTML(buildLocationQueryHtml(lngLat.lng, lngLat.lat))
    .addTo(map)

  // Battle-Link im Popup mit Click-Handler verknüpfen
  const el = locationPopup.getElement()
  el?.querySelectorAll<HTMLButtonElement>('.locq-battle-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const id = btn.dataset.battleId
      const battle = BATTLES.find((b) => b.id === id)
      if (battle) {
        emit('battle-click', battle)
        locationPopup?.remove()
        locationPopup = null
      }
    })
  })
}

function clearEventPin() {
  if (eventPin) {
    eventPin.remove()
    eventPin = null
  }
}

function updateEventPin() {
  if (!map) return
  clearEventPin()
  const ev = props.pinnedEvent
  if (!ev || !ev.coordinates) return

  const color = CATEGORY_COLORS[ev.category]
  const wrap = document.createElement('div')
  wrap.className = 'event-pin-wrap'

  // Label oberhalb der Nadel: Klick öffnet Info im Feed, X schließt Pin
  const label = document.createElement('div')
  label.className = 'event-pin-label'
  label.title = 'Ereignis im Feed öffnen'
  label.innerHTML = `
    <button class="event-pin-close" aria-label="Stecknadel schließen" title="Schließen">
      <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
    <div class="event-pin-cat" style="color: ${color}">${CATEGORY_LABELS[ev.category]}</div>
    <div class="event-pin-title">${ev.title.replace(/</g, '&lt;')}</div>
  `
  label.addEventListener('click', (e) => {
    e.stopPropagation()
    emit('pin-focus')
  })
  const closeBtn = label.querySelector<HTMLButtonElement>('.event-pin-close')
  closeBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    emit('pin-dismiss')
  })
  wrap.appendChild(label)

  // Eigentliche Stecknadel — Klick öffnet ebenfalls die Info im Feed
  const pin = document.createElement('button')
  pin.className = 'event-pin'
  pin.setAttribute('aria-label', 'Ereignis im Feed öffnen')
  pin.title = 'Ereignis im Feed öffnen'
  pin.style.color = color
  pin.innerHTML = `
    <svg viewBox="0 0 24 32" width="28" height="36" aria-hidden="true">
      <path d="M12 0 C 5 0, 0 5, 0 12 C 0 21, 12 32, 12 32 C 12 32, 24 21, 24 12 C 24 5, 19 0, 12 0 Z"
            fill="currentColor" stroke="rgba(0,0,0,0.6)" stroke-width="1.5"/>
      <circle cx="12" cy="11" r="4.5" fill="rgba(0,0,0,0.6)"/>
    </svg>
  `
  pin.addEventListener('click', (e) => {
    e.stopPropagation()
    emit('pin-focus')
  })
  wrap.appendChild(pin)

  // anchor: 'bottom' — Spitze der Nadel sitzt am genauen Punkt
  eventPin = new maplibregl.Marker({ element: wrap, anchor: 'bottom' })
    .setLngLat(ev.coordinates)
    .addTo(map)
}

function updateOperations() {
  if (!map) return
  const features: GeoJSON.Feature<GeoJSON.LineString>[] = []
  const nowMs = props.currentDate.getTime()

  for (const op of OPERATIONS) {
    const startMs = new Date(op.start).getTime()
    const endMs = new Date(op.end).getTime()
    if (nowMs < startMs) continue
    if (nowMs > endMs + OPERATION_FADE_MS) continue

    // Pfad-Progress: linear während [start, end], danach konstant 1.
    // Alpha: 1 während aktiv, linear → 0 über OPERATION_FADE_DAYS nach Ende.
    const span = Math.max(1, endMs - startMs)
    const t = Math.min(1, (nowMs - startMs) / span)
    const alpha =
      nowMs <= endMs ? 1 : Math.max(0, 1 - (nowMs - endMs) / OPERATION_FADE_MS)

    for (let i = 0; i < op.thrusts.length; i++) {
      const thrust = op.thrusts[i]!
      const { points, tangent } = buildThrustPath(thrust, t)
      features.push({
        type: 'Feature',
        properties: {
          side: op.side,
          opId: op.id,
          kind: 'shaft',
          alpha,
          // Thrust-Label auch auf Schaft/Chevron mitnehmen, damit beim Hover über
          // den Pfeil (nicht nur über die Textbeschriftung) der Befehlshaber-Name
          // im Tooltip erscheint.
          label: thrust.label ?? null,
        },
        geometry: { type: 'LineString', coordinates: points },
      })
      // Chevron-Pfeilspitze am aktuellen Endpunkt
      const tip = points[points.length - 1]!
      const shaftLen = Math.hypot(
        thrust.end[0] - thrust.start[0],
        thrust.end[1] - thrust.start[1],
      )
      const wingLen = Math.min(Math.max(shaftLen * 0.18, 0.35), 1.1)
      const chevron = buildChevron(tip, tangent, wingLen)
      features.push({
        type: 'Feature',
        properties: {
          side: op.side,
          opId: op.id,
          kind: 'chevron',
          alpha,
          label: thrust.label ?? null,
        },
        geometry: { type: 'LineString', coordinates: chevron },
      })
      // Label entlang des AKTUELL gewachsenen Pfeil-Abschnitts (nicht des
      // vollen Pfads) — sonst sitzt das Label am Bézier-Mittelpunkt, auch
      // bevor der Pfeil dort angekommen ist. Mit dem gewachsenen Pfad
      // wandert das Label sanft mit dem Pfeil mit und bleibt auf der
      // sichtbaren Linie. Erst ab 30% Progress, um Platz-Springen ganz am
      // Anfang (kurze Linien sind kaum sichtbar/lesbar) zu vermeiden.
      if (thrust.label && t >= OPERATION_LABEL_MIN_PROGRESS) {
        features.push({
          type: 'Feature',
          properties: {
            side: op.side,
            opId: op.id,
            kind: 'label',
            alpha,
            label: thrust.label,
          },
          geometry: { type: 'LineString', coordinates: points },
        })
      }
    }
  }

  const src = map.getSource('operations-arrows') as maplibregl.GeoJSONSource | undefined
  if (src) src.setData({ type: 'FeatureCollection', features })
}

function updateDivisions() {
  if (!map) return
  const nearest = nearestSnapshotDate(props.currentDate, SNAPSHOT_DATES)
  const divs = divisionsForSnapshot(nearest)
  const fc: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: 'FeatureCollection',
    features: divs.map((d) => ({
      type: 'Feature',
      properties: {
        label: d.label,
        side: d.side,
        fullName: d.fullName,
        commander: d.commander ?? '',
      },
      geometry: { type: 'Point', coordinates: d.coordinates },
    })),
  }
  const src = map.getSource('divisions') as maplibregl.GeoJSONSource | undefined
  if (src) src.setData(fc)
}

function updateBattles() {
  if (!map) return
  const active = activeBattlesAt(props.currentDate)
  const fc: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: 'FeatureCollection',
    features: active.map((b) => ({
      type: 'Feature',
      properties: { id: b.id, major: b.major, name: b.name },
      geometry: { type: 'Point', coordinates: b.coordinates },
    })),
  }
  const src = map.getSource('battles') as maplibregl.GeoJSONSource | undefined
  if (src) src.setData(fc)
  updateContestedCities(active)
}

function updateContestedCities(activeBattles: Battle[]) {
  if (!map) return
  const cities = citiesForActiveBattles(activeBattles.map((b) => b.id))
  const fc: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
    type: 'FeatureCollection',
    features: cities.map((c) => ({
      type: 'Feature',
      properties: { name: c.name },
      geometry: c.geometry,
    })),
  }
  const src = map.getSource('contested-cities') as maplibregl.GeoJSONSource | undefined
  if (src) src.setData(fc)
}

function addLayers() {
  if (!map) return
  // Natural Earth Admin-0 — Source wird bei jedem Datums-Scrub mit Country-
  // Polygonen befüllt, die vorher gegen die Sowjet-Region geclippt wurden
  // (polygon-clipping difference). So zeigt das Reich 1945 nur die West-Hälfte
  // rot, nicht das ganze Land — und Belarus/Ukraine/Russland wachsen bzw.
  // schrumpfen ländergrenzentreu mit der Front-Bewegung.
  map.addSource('axis-countries', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })
  map.addSource('front-line', {
    type: 'geojson',
    data: frontLineAt(props.currentDate),
  })
  map.addSource('contested-cities', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })
  map.addSource('operations-arrows', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })
  const railwayFC: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
    type: 'FeatureCollection',
    features: RAILWAYS.map((r) => ({
      type: 'Feature',
      properties: { id: r.id, name: r.name, importance: r.importance },
      geometry: { type: 'LineString', coordinates: r.coordinates },
    })),
  }
  map.addSource('railways', { type: 'geojson', data: railwayFC })
  // Eisenbahnen: Halo + dünne helle Linie. Doppelte Optik andeutet Schienenpaar.
  map.addLayer({
    id: 'railways-halo',
    type: 'line',
    source: 'railways',
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
      visibility: 'none',
    },
    paint: {
      'line-color': '#1f1f1f',
      'line-width': [
        'match',
        ['get', 'importance'],
        'main', 3.5,
        'secondary', 2.5,
        2.5,
      ],
      'line-opacity': 0.75,
    },
  })
  map.addLayer({
    id: 'railways-line',
    type: 'line',
    source: 'railways',
    layout: {
      'line-cap': 'butt',
      'line-join': 'round',
      visibility: 'none',
    },
    paint: {
      'line-color': '#d4d4d4',
      'line-width': [
        'match',
        ['get', 'importance'],
        'main', 1.4,
        'secondary', 1,
        1,
      ],
      'line-opacity': 0.9,
      'line-dasharray': [3, 2],
    },
  })
  // Ländergrenzentreue Achsenstaaten-Färbung — Source wird dynamisch befüllt mit
  // gegen Sowjet-Region geclippten Country-Polygonen. Kein Filter mehr nötig.
  map.addLayer({
    id: 'axis-countries-fill',
    type: 'fill',
    source: 'axis-countries',
    paint: {
      'fill-color': '#8b1e1e',
      'fill-opacity': 0.35,
    },
  })
  map.addLayer({
    id: 'axis-countries-outline',
    type: 'line',
    source: 'axis-countries',
    paint: {
      'line-color': '#8b1e1e',
      'line-width': 1,
      'line-opacity': 0.5,
    },
  })
  map.addLayer({
    id: 'front-line',
    type: 'line',
    source: 'front-line',
    paint: {
      'line-color': '#ff3b3b',
      'line-width': 3,
      'line-opacity': 0.95,
      'line-dasharray': [2, 1.5],
    },
  })
  map.addLayer({
    id: 'contested-cities-fill',
    type: 'fill',
    source: 'contested-cities',
    paint: {
      'fill-color': '#ef4444',
      'fill-opacity': 0.55,
    },
  })
  map.addLayer({
    id: 'contested-cities-outline',
    type: 'line',
    source: 'contested-cities',
    paint: {
      'line-color': '#ef4444',
      'line-width': 1.5,
      'line-opacity': 0.9,
    },
  })
  // Operations: thick semi-transparent halo below, sharp line above (per side).
  // Label-Features (kind='label') werden ausgefiltert — sie sind nur als Träger
  // für den Symbol-Layer da, sollen aber nicht als Linie sichtbar sein.
  map.addLayer({
    id: 'operations-arrows-halo',
    type: 'line',
    source: 'operations-arrows',
    filter: ['!=', ['get', 'kind'], 'label'],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': [
        'match',
        ['get', 'side'],
        'axis', '#7f1d1d',
        'soviet', '#a16207',
        '#666',
      ],
      'line-width': 8,
      'line-opacity': ['*', 0.25, ['coalesce', ['get', 'alpha'], 1]],
    },
  })
  map.addLayer({
    id: 'operations-arrows-line',
    type: 'line',
    source: 'operations-arrows',
    filter: ['!=', ['get', 'kind'], 'label'],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': [
        'match',
        ['get', 'side'],
        'axis', '#b91c1c',
        'soviet', '#facc15',
        '#888',
      ],
      'line-width': 3.5,
      'line-opacity': ['*', 0.95, ['coalesce', ['get', 'alpha'], 1]],
    },
  })

  // Pfeil-Labels (Befehlshaber/Verbands-Namen entlang der Bézier-Kurve).
  // `symbol-placement: line-center` setzt das Label einmalig in die Mitte der
  // Linie; MapLibre dreht den Text bei Bedarf, damit er nicht auf dem Kopf
  // steht. `text-allow-overlap: false` lässt MapLibre überlappende Labels
  // automatisch ausblenden — bewusst, statt zwingend alle anzuzeigen.
  // minzoom 4 vermeidet Label-Klumpen in der Weltansicht.
  map.addLayer({
    id: 'operations-arrows-label',
    type: 'symbol',
    source: 'operations-arrows',
    filter: ['==', ['get', 'kind'], 'label'],
    minzoom: 4,
    layout: {
      'symbol-placement': 'line-center',
      'text-field': ['get', 'label'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 11,
      'text-letter-spacing': 0.02,
      'text-padding': 4,
      'text-allow-overlap': false,
      'text-ignore-placement': false,
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': [
        'match',
        ['get', 'side'],
        'axis', '#7f1d1d',
        'soviet', '#854d0e',
        '#333',
      ],
      'text-halo-width': 2.5,
      'text-halo-blur': 0.3,
      'text-opacity': ['coalesce', ['get', 'alpha'], 1],
    },
  })

  // Operations-Klick: Pfeile öffnen das OperationDetail-Panel.
  // Click-Handler liegt auf dem Halo, das einen breiteren Treffer-Bereich bietet
  // als die schmale Linie. Beide Layer ändern den Cursor auf Pointer beim Hover.
  const onOperationClick = (e: maplibregl.MapLayerMouseEvent) => {
    const f = e.features?.[0]
    if (!f) return
    const opId = f.properties?.opId as string | undefined
    const op = OPERATIONS.find((o) => o.id === opId)
    if (op) emit('operation-click', op)
  }
  map.on('click', 'operations-arrows-halo', onOperationClick)
  map.on('click', 'operations-arrows-line', onOperationClick)
  map.on('click', 'operations-arrows-label', onOperationClick)
  // Hover-Tooltip auf den Pfeilen: zeigt Operations-Name + Stoßrichtungs-Label.
  // mousemove statt nur mouseenter, damit das Popup dem Cursor folgt während
  // man den Pfeil entlang fährt.
  const updateOperationHoverPopup = (e: maplibregl.MapLayerMouseEvent) => {
    if (!map) return
    const f = e.features?.[0]
    if (!f) return
    const opId = f.properties?.opId as string | undefined
    const op = OPERATIONS.find((o) => o.id === opId)
    if (!op) return
    const thrustLabel = f.properties?.label as string | null | undefined
    const text = thrustLabel ? `${op.name} · ${thrustLabel}` : op.name
    map.getCanvas().style.cursor = 'pointer'
    if (operationPopup) {
      operationPopup.setLngLat(e.lngLat).setText(text)
    } else {
      operationPopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        // MapLibre-Default ist 240px — bei kombinierten Operations-/Thrust-Namen
        // wie „Belgorod-Charkow-Operation · Woronesch-Front" wird das knapp.
        maxWidth: 'none',
        className: 'operation-popup',
      })
        .setLngLat(e.lngLat)
        .setText(text)
        .addTo(map)
    }
  }
  const clearOperationHoverPopup = () => {
    if (!map) return
    map.getCanvas().style.cursor = ''
    operationPopup?.remove()
    operationPopup = null
  }
  for (const layerId of [
    'operations-arrows-halo',
    'operations-arrows-line',
    'operations-arrows-label',
  ]) {
    map.on('mouseenter', layerId, updateOperationHoverPopup)
    map.on('mousemove', layerId, updateOperationHoverPopup)
    map.on('mouseleave', layerId, clearOperationHoverPopup)
  }

  // Schlachten als native circle-Layer — pin-genau im WebGL-Frame der Karte
  map.addSource('battles', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })
  map.addLayer({
    id: 'battles-glow',
    type: 'circle',
    source: 'battles',
    filter: ['==', ['get', 'major'], true],
    paint: {
      'circle-radius': 14,
      'circle-color': '#ef4444',
      'circle-opacity': 0.28,
      'circle-blur': 0.6,
    },
  })
  map.addLayer({
    id: 'battles-circle',
    type: 'circle',
    source: 'battles',
    paint: {
      'circle-radius': ['case', ['get', 'major'], 8, 5.5],
      'circle-color': ['case', ['get', 'major'], '#ef4444', '#facc15'],
      'circle-stroke-color': '#1a1a1a',
      'circle-stroke-width': 2,
    },
  })

  map.on('click', 'battles-circle', (e) => {
    const f = e.features?.[0]
    if (!f) return
    const id = f.properties?.id as string | undefined
    const battle = BATTLES.find((b) => b.id === id)
    if (battle) emit('battle-click', battle)
  })
  map.on('mouseenter', 'battles-circle', () => {
    if (map) map.getCanvas().style.cursor = 'pointer'
  })
  map.on('mouseleave', 'battles-circle', () => {
    if (map) map.getCanvas().style.cursor = ''
  })

  // Verbände als Symbol-Labels — frame-genau im WebGL-Frame der Karte
  map.addSource('divisions', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })
  map.addLayer({
    id: 'divisions-label',
    type: 'symbol',
    source: 'divisions',
    layout: {
      'text-field': ['get', 'label'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 12,
      'text-allow-overlap': true,
      'text-ignore-placement': true,
      'text-padding': 2,
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': [
        'match',
        ['get', 'side'],
        'axis', '#8b1e1e',
        'soviet', '#a16207',
        '#444',
      ],
      'text-halo-width': 2.5,
      'text-halo-blur': 0.3,
    },
  })

  // ─── POI-Layer (im Schlacht-Detail-Modus) ───────────────────────────────
  map.addSource('pois', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  })
  map.addLayer({
    id: 'pois-symbol',
    type: 'symbol',
    source: 'pois',
    layout: {
      'icon-image': ['concat', 'poi-icon-', ['get', 'category']],
      'icon-size': 0.55,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-anchor': 'center',
      'text-field': ['get', 'name'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 11,
      'text-anchor': 'left',
      'text-offset': [1.4, 0],
      'text-allow-overlap': true,
      'text-ignore-placement': true,
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#0a0a0a',
      'text-halo-width': 2,
      'text-halo-blur': 0.4,
    },
  })

  map.on('click', 'pois-symbol', (e) => {
    const f = e.features?.[0]
    if (!f) return
    const id = f.properties?.id as string | undefined
    const poi = props.pois.find((p) => p.id === id)
    if (poi) showPoiPopup(poi)
  })
  map.on('mouseenter', 'pois-symbol', () => {
    if (map) map.getCanvas().style.cursor = 'pointer'
  })
  map.on('mouseleave', 'pois-symbol', () => {
    if (map) map.getCanvas().style.cursor = ''
  })

  map.on('mouseenter', 'divisions-label', (e) => {
    if (!map) return
    const f = e.features?.[0]
    if (!f) return
    const fullName = (f.properties?.fullName as string) ?? ''
    const commander = (f.properties?.commander as string) ?? ''
    const text = commander ? `${fullName} · ${commander}` : fullName
    const geom = f.geometry as GeoJSON.Point
    const lngLat = geom.coordinates as [number, number]
    map.getCanvas().style.cursor = 'help'
    divisionPopup?.remove()
    divisionPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
      maxWidth: 'none',
      className: 'division-popup',
    })
      .setLngLat(lngLat)
      .setText(text)
      .addTo(map)
  })
  map.on('mouseleave', 'divisions-label', () => {
    if (!map) return
    map.getCanvas().style.cursor = ''
    divisionPopup?.remove()
    divisionPopup = null
  })
}

onMounted(() => {
  if (!container.value) return
  map = new maplibregl.Map({
    container: container.value,
    style: OSM_STYLE,
    center: [30, 53],
    zoom: 3.6,
    attributionControl: { compact: true },
  })
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right')

  map.on('load', async () => {
    addLayers()
    setBaseLayer(props.baseLayer)
    updateWeather()
    updateRailways()
    updateBattles()
    updateDivisions()
    updateOperations()
    updateEventPin()
    await loadPoiIcons()
    updatePois()
    // Country-Geometries lazy laden; sobald da, befüllt loadCountryGeoms()
    // die axis-countries-Source per updateAxisCountriesClipped().
    loadCountryGeoms()
  })

  // Rechtsklick: Standort-Abfrage
  map.on('contextmenu', (e) => showLocationQuery(e.lngLat))
})

onBeforeUnmount(() => {
  clearEventPin()
  locationPopup?.remove()
  locationPopup = null
  divisionPopup?.remove()
  divisionPopup = null
  operationPopup?.remove()
  operationPopup = null
  poiPopup?.remove()
  poiPopup = null
  map?.remove()
  map = null
})

watch(() => props.currentDate, () => {
  updateFront()
  updateBattles()
  updateDivisions()
  updateOperations()
  updateWeather()
})

watch(() => props.pinnedEvent, () => updateEventPin())

watch(() => props.baseLayer, (mode) => setBaseLayer(mode))

watch(() => props.weatherEnabled, () => updateWeather())
watch(() => props.railwayEnabled, () => updateRailways())
watch(() => props.pois, () => {
  poiPopup?.remove()
  poiPopup = null
  updatePois()
}, { deep: false })

defineExpose({
  flyTo: (coordinates: [number, number], zoom = 6) => {
    map?.flyTo({ center: coordinates, zoom, duration: 1400 })
  },
})
</script>

<style>
.war-map {
  width: 100%;
  height: 100%;
  position: relative;
}

.event-pin-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.event-pin-label {
  pointer-events: auto;
  position: relative;
  background: rgba(15, 15, 15, 0.94);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  padding: 6px 22px 6px 10px;
  margin-bottom: 4px;
  max-width: 240px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
  text-align: center;
  cursor: pointer;
  transition: background 0.12s ease;
}

.event-pin-label:hover {
  background: rgba(25, 25, 25, 0.96);
}

.event-pin-close {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #a3a3a3;
  cursor: pointer;
  padding: 0;
}

.event-pin-close:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #f5f5f5;
}

.event-pin-cat {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 2px;
}

.event-pin-title {
  font-size: 12px;
  font-weight: 600;
  color: #f5f5f5;
  line-height: 1.25;
  font-family: 'Inter', system-ui, sans-serif;
}

.event-pin {
  pointer-events: auto;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: block;
  filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.6));
  animation: pin-drop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom center;
}

.event-pin:hover {
  transform: scale(1.08);
}

@keyframes pin-drop {
  0% {
    transform: translateY(-30px) scale(0.6);
    opacity: 0;
  }
  60% {
    transform: translateY(2px) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}


.maplibregl-ctrl-attrib-inner {
  font-size: 10px;
}

/* POI-Popup im Schlacht-Detail-Modus */
.maplibregl-popup.poi-popup .maplibregl-popup-content {
  background: rgba(15, 15, 15, 0.97);
  color: #f5f5f5;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 0;
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

.maplibregl-popup.poi-popup .maplibregl-popup-tip {
  border-top-color: rgba(15, 15, 15, 0.97);
  border-bottom-color: rgba(15, 15, 15, 0.97);
}

.maplibregl-popup.poi-popup .maplibregl-popup-close-button {
  color: #fff;
  font-size: 22px;
  padding: 0 8px;
  background: rgba(0, 0, 0, 0.45);
  border-bottom-left-radius: 8px;
  z-index: 2;
}

.poi-pop {
  width: 300px;
}

.poi-pop-img-link,
.poi-pop-img {
  display: block;
  width: 100%;
  height: 160px;
  background: #1a1a1a;
}

.poi-pop-img-link {
  position: relative;
}

.poi-pop-img-link img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: saturate(0.9);
}

.poi-pop-img-link:hover img {
  filter: saturate(1.1);
}

.poi-pop-credit {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 8px;
  background: linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0));
  color: rgba(255,255,255,0.85);
  font-size: 9px;
  letter-spacing: 0.02em;
  text-align: right;
  pointer-events: none;
  font-family: 'Inter', system-ui, sans-serif;
}

.poi-pop-img--placeholder {
  background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
}

.poi-pop-body {
  padding: 10px 14px 14px;
}

.poi-pop-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 2px 7px;
  border-radius: 3px;
  border: 1px solid;
  margin-bottom: 6px;
}

.poi-pop-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin-bottom: 6px;
}

.poi-pop-desc {
  font-size: 12px;
  line-height: 1.5;
  color: #c4c4c4;
}

.poi-pop-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 11px;
  color: #facc15;
  text-decoration: none;
  border-bottom: 1px solid rgba(250, 204, 21, 0.3);
  padding-bottom: 1px;
}

.poi-pop-link:hover {
  color: #fde047;
  border-bottom-color: rgba(250, 204, 21, 0.7);
}

/* Tooltip-Popup für Verbands-Labels */
.maplibregl-popup.division-popup .maplibregl-popup-content {
  background: rgba(15, 15, 15, 0.94);
  color: #f5f5f5;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-family: 'Inter', system-ui, sans-serif;
  white-space: nowrap;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.maplibregl-popup.division-popup .maplibregl-popup-tip {
  border-top-color: rgba(15, 15, 15, 0.94);
  border-bottom-color: rgba(15, 15, 15, 0.94);
}

/* Tooltip-Popup für Operations-Pfeile (Hover) */
.maplibregl-popup.operation-popup .maplibregl-popup-content {
  background: rgba(15, 15, 15, 0.94);
  color: #f5f5f5;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-family: 'Inter', system-ui, sans-serif;
  white-space: nowrap;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.maplibregl-popup.operation-popup .maplibregl-popup-tip {
  border-top-color: rgba(15, 15, 15, 0.94);
  border-bottom-color: rgba(15, 15, 15, 0.94);
}

/* Standort-Abfrage Popup */
.maplibregl-popup.locq-popup .maplibregl-popup-content {
  background: rgba(15, 15, 15, 0.96);
  backdrop-filter: blur(8px);
  color: #f5f5f5;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', system-ui, sans-serif;
}

.maplibregl-popup.locq-popup .maplibregl-popup-tip {
  border-top-color: rgba(15, 15, 15, 0.96);
  border-bottom-color: rgba(15, 15, 15, 0.96);
}

.maplibregl-popup.locq-popup .maplibregl-popup-close-button {
  color: #a3a3a3;
  font-size: 18px;
  padding: 4px 8px;
  background: none;
}

.maplibregl-popup.locq-popup .maplibregl-popup-close-button:hover {
  color: #f5f5f5;
  background: rgba(255, 255, 255, 0.06);
}

.locq-coords {
  font-size: 11px;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  color: #a3a3a3;
  letter-spacing: 0.02em;
}

.locq-date {
  font-size: 10px;
  color: #737373;
  margin-bottom: 8px;
}

.locq-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 3px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.locq-row:first-of-type {
  border-top: none;
  padding-top: 6px;
}

.locq-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  flex-shrink: 0;
}

.locq-side {
  font-weight: 600;
  color: #f5f5f5;
}

.locq-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #737373;
  min-width: 90px;
}

.locq-val {
  color: #e5e5e5;
}

.locq-dim {
  color: #737373;
  font-size: 11px;
}

.locq-battle-link {
  background: none;
  border: none;
  color: #facc15;
  font: inherit;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: rgba(250, 204, 21, 0.3);
  text-underline-offset: 2px;
  text-align: left;
}

.locq-battle-link:hover {
  color: #fde047;
  text-decoration-color: rgba(250, 204, 21, 0.7);
}
</style>
