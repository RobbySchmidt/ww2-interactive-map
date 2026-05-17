<template>
  <div ref="root" class="search-root" :class="{ 'search-root--open': open }">
    <div class="search-input-wrap">
      <svg viewBox="0 0 24 24" width="14" height="14" class="search-icon" fill="currentColor">
        <path
          d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5 1.49-1.49-5-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"
        />
      </svg>
      <input
        ref="inputEl"
        v-model="query"
        type="text"
        class="search-input"
        placeholder="Suche Stadt, Schlacht, Operation, Person …"
        autocomplete="off"
        spellcheck="false"
        @focus="open = true"
        @keydown.escape="onEscape"
        @keydown.down.prevent="moveSelection(1)"
        @keydown.up.prevent="moveSelection(-1)"
        @keydown.enter.prevent="confirmSelection"
      />
      <button v-if="query" class="search-clear" aria-label="Eingabe löschen" @click="clearQuery">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
          />
        </svg>
      </button>
    </div>

    <div v-if="open && query.trim().length >= 1" class="search-results">
      <div v-if="visibleItems.length === 0" class="search-empty">Keine Treffer für „{{ query }}"</div>
      <template v-for="(item, i) in visibleItems" :key="item.key">
        <div
          v-if="item.kind === 'top'"
          class="search-item"
          :class="{
            'search-item--active': i === selectedIndex,
            'search-item--expanded':
              item.result.data.kind === 'person' && expandedPersons.has(item.result.key),
          }"
          @mouseenter="selectedIndex = i"
          @click="handleItemSelect(item)"
        >
          <span class="search-item-type" :style="{ color: TYPE_COLORS[item.result.type] }">
            {{ TYPE_LABELS[item.result.type] }}
          </span>
          <div class="search-item-body">
            <div class="search-item-title">{{ item.result.title }}</div>
            <div v-if="item.result.sub" class="search-item-sub">{{ item.result.sub }}</div>
          </div>
          <span
            v-if="item.expandable"
            class="search-item-chevron"
            :class="{ 'search-item-chevron--open': expandedPersons.has(item.result.key) }"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </span>
        </div>
        <div
          v-else
          class="search-item search-item--sub"
          :class="{ 'search-item--active': i === selectedIndex }"
          @mouseenter="selectedIndex = i"
          @click="handleItemSelect(item)"
        >
          <span class="search-sub-bullet" aria-hidden="true">↳</span>
          <div class="search-item-body">
            <div class="search-item-title">{{ item.label }}</div>
            <div class="search-item-sub">{{ item.sub }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { BATTLES, type Battle } from '~/data/battles'
import { OPERATIONS, type Operation } from '~/data/operations'
import { CITIES, type City } from '~/data/cities'
import { EVENTS, type HistEvent } from '~/data/events'
import { DIVISIONS, type DivisionMarker } from '~/data/divisions'

type ResultType = 'battle' | 'operation' | 'city' | 'event' | 'division' | 'person'

interface SearchResult {
  key: string
  type: ResultType
  title: string
  sub: string
  haystack: string
  data:
    | { kind: 'battle'; battle: Battle }
    | { kind: 'operation'; op: Operation }
    | { kind: 'city'; city: City }
    | { kind: 'event'; event: HistEvent }
    | { kind: 'division'; division: DivisionMarker }
    | { kind: 'person'; person: string; battles: Battle[]; divisions: DivisionMarker[] }
}

export interface SearchPin {
  coordinates: [number, number]
  color: string
  type: ResultType
  title: string
  sub?: string
}

const emit = defineEmits<{
  (e: 'select-battle', battle: Battle): void
  (e: 'select-operation', op: Operation): void
  (e: 'select-city', city: City): void
  (e: 'select-event', event: HistEvent): void
  (e: 'select-division', division: DivisionMarker): void
  (e: 'drop-pin', pin: SearchPin): void
}>()

/** Geometrischer Mittelpunkt des ersten Rings eines City-Polygons. */
function cityCenter(city: City): [number, number] {
  const ring = city.geometry.coordinates[0]!
  let sx = 0, sy = 0
  for (const [x, y] of ring) { sx += x; sy += y }
  return [sx / ring.length, sy / ring.length]
}

/** Mittelpunkt der Stoßrichtungs-Endpunkte einer Operation. */
function operationCenter(op: Operation): [number, number] {
  const ends = op.thrusts.map((t) => t.end)
  const cx = ends.reduce((s, p) => s + p[0], 0) / ends.length
  const cy = ends.reduce((s, p) => s + p[1], 0) / ends.length
  return [cx, cy]
}

const root = ref<HTMLDivElement>()
const inputEl = ref<HTMLInputElement>()
const query = ref('')
const open = ref(false)
const selectedIndex = ref(0)
// Welche Personen aktuell aufgeklappt sind, damit ihre einzelnen Positionen
// (Schlachten + Verbands-Snapshots) sichtbar und anwählbar werden.
const expandedPersons = ref<Set<string>>(new Set())

const TYPE_LABELS: Record<ResultType, string> = {
  battle: 'Schlacht',
  operation: 'Operation',
  city: 'Stadt',
  event: 'Ereignis',
  division: 'Verband',
  person: 'Person',
}

const TYPE_COLORS: Record<ResultType, string> = {
  battle: '#ef4444',
  operation: '#facc15',
  city: '#0891b2',
  event: '#a3a3a3',
  division: '#7c3aed',
  person: '#16a34a',
}

const TYPE_PRIORITY: Record<ResultType, number> = {
  city: 0,
  battle: 1,
  operation: 2,
  person: 3,
  event: 4,
  division: 5,
}

/** Statischer Suchindex aus allen Quellen. */
const INDEX = computed<SearchResult[]>(() => {
  const items: SearchResult[] = []

  for (const b of BATTLES) {
    const commanders = b.forces
      .map((f) => f.commander ?? '')
      .filter(Boolean)
      .join(' · ')
    items.push({
      key: `battle:${b.id}`,
      type: 'battle',
      title: b.name,
      sub: `${new Date(b.start).getFullYear()}${commanders ? ' · ' + commanders : ''}`,
      haystack: `${b.name} ${commanders} ${b.summary}`.toLowerCase(),
      data: { kind: 'battle', battle: b },
    })
  }

  for (const op of OPERATIONS) {
    items.push({
      key: `op:${op.id}`,
      type: 'operation',
      title: op.name,
      sub: `${new Date(op.start).getFullYear()} · ${op.side === 'axis' ? 'Achse' : 'Sowjet'}`,
      haystack: `${op.name} ${op.summary}`.toLowerCase(),
      data: { kind: 'operation', op },
    })
  }

  for (const c of CITIES) {
    items.push({
      key: `city:${c.id}`,
      type: 'city',
      title: c.name,
      sub: '',
      haystack: c.name.toLowerCase(),
      data: { kind: 'city', city: c },
    })
  }

  for (const ev of EVENTS) {
    items.push({
      key: `event:${ev.id}`,
      type: 'event',
      title: ev.title,
      sub: new Date(ev.date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      haystack: `${ev.title} ${ev.description}`.toLowerCase(),
      data: { kind: 'event', event: ev },
    })
  }

  for (const d of DIVISIONS) {
    items.push({
      key: `div:${d.snapshot}:${d.label}`,
      type: 'division',
      title: d.fullName,
      sub: `${d.snapshot}${d.commander ? ' · ' + d.commander : ''}`,
      haystack: `${d.fullName} ${d.label} ${d.commander ?? ''}`.toLowerCase(),
      data: { kind: 'division', division: d },
    })
  }

  // Personen aus Battles + Divisions ableiten
  const personMap = new Map<string, { battles: Battle[]; divisions: DivisionMarker[] }>()
  const addPerson = (name: string | undefined, battle?: Battle, div?: DivisionMarker) => {
    if (!name) return
    // Bei "Schukow / Konew" → einzelne Personen aufsplitten
    for (const raw of name.split(/[/·]/)) {
      const n = raw.trim()
      if (!n) continue
      // † und Klammern entfernen
      const clean = n.replace(/†/g, '').replace(/\([^)]*\)/g, '').trim()
      if (!clean) continue
      let entry = personMap.get(clean)
      if (!entry) {
        entry = { battles: [], divisions: [] }
        personMap.set(clean, entry)
      }
      if (battle) entry.battles.push(battle)
      if (div) entry.divisions.push(div)
    }
  }
  for (const b of BATTLES) {
    for (const f of b.forces) addPerson(f.commander, b)
  }
  for (const d of DIVISIONS) addPerson(d.commander, undefined, d)

  for (const [person, entry] of personMap) {
    const refs: string[] = []
    if (entry.battles.length > 0) refs.push(`${entry.battles.length} Schlacht(en)`)
    if (entry.divisions.length > 0) refs.push(`${entry.divisions.length} Verband-Position(en)`)
    items.push({
      key: `person:${person}`,
      type: 'person',
      title: person,
      sub: refs.join(' · '),
      haystack: person.toLowerCase(),
      data: { kind: 'person', person, battles: entry.battles, divisions: entry.divisions },
    })
  }

  return items
})

type VisibleItem =
  | {
      kind: 'top'
      key: string
      result: SearchResult
      /** Hat dieses Top-Item einen Ausklapp-Chevron? (Personen mit > 1 Position) */
      expandable: boolean
    }
  | {
      kind: 'sub-battle'
      key: string
      parentKey: string
      battle: Battle
      label: string
      sub: string
    }
  | {
      kind: 'sub-division'
      key: string
      parentKey: string
      division: DivisionMarker
      label: string
      sub: string
    }

const results = computed<SearchResult[]>(() => {
  const q = query.value.trim().toLowerCase()
  if (q.length < 1) return []
  const tokens = q.split(/\s+/).filter(Boolean)
  const matches = INDEX.value.filter((r) => tokens.every((t) => r.haystack.includes(t)))
  // Sortierung: Titel-Treffer am Anfang (Wortanfang) > Titel-Treffer > sonstige; dann Type-Priorität; dann Alpha
  matches.sort((a, b) => {
    const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1
    const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1
    if (aStarts !== bStarts) return aStarts - bStarts
    const aTitle = a.title.toLowerCase().includes(q) ? 0 : 1
    const bTitle = b.title.toLowerCase().includes(q) ? 0 : 1
    if (aTitle !== bTitle) return aTitle - bTitle
    if (TYPE_PRIORITY[a.type] !== TYPE_PRIORITY[b.type])
      return TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type]
    return a.title.localeCompare(b.title)
  })
  return matches.slice(0, 10)
})

const DATE_FMT_SHORT = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

/** Flache Sicht der Ergebnisse, inkl. inline ausgeklappter Personen-Sub-Items. */
const visibleItems = computed<VisibleItem[]>(() => {
  const out: VisibleItem[] = []
  for (const r of results.value) {
    const expandable =
      r.data.kind === 'person' && r.data.battles.length + r.data.divisions.length > 1
    out.push({ kind: 'top', key: r.key, result: r, expandable })
    if (r.data.kind === 'person' && expandedPersons.value.has(r.key)) {
      const d = r.data
      const subItems: VisibleItem[] = []
      for (const b of d.battles) {
        subItems.push({
          kind: 'sub-battle',
          key: `${r.key}>battle:${b.id}`,
          parentKey: r.key,
          battle: b,
          label: `Schlacht: ${b.name}`,
          sub: DATE_FMT_SHORT.format(new Date(b.start)),
        })
      }
      for (const div of d.divisions) {
        subItems.push({
          kind: 'sub-division',
          key: `${r.key}>div:${div.snapshot}:${div.label}`,
          parentKey: r.key,
          division: div,
          label: `${div.label} — ${div.fullName}`,
          sub: DATE_FMT_SHORT.format(new Date(div.snapshot)),
        })
      }
      // Chronologisch sortieren: Schlachten nach Start, Verbände nach Snapshot.
      // ISO-Daten (YYYY-MM-DD) sortieren lexikographisch korrekt chronologisch.
      subItems.sort((a, b) => {
        const da = a.kind === 'sub-battle' ? a.battle.start : a.kind === 'sub-division' ? a.division.snapshot : ''
        const db = b.kind === 'sub-battle' ? b.battle.start : b.kind === 'sub-division' ? b.division.snapshot : ''
        return da.localeCompare(db)
      })
      out.push(...subItems)
    }
  }
  return out
})

function clearQuery() {
  query.value = ''
  selectedIndex.value = 0
  expandedPersons.value = new Set()
  inputEl.value?.focus()
}

function onEscape() {
  if (query.value) {
    clearQuery()
  } else {
    open.value = false
    inputEl.value?.blur()
  }
}

function moveSelection(delta: number) {
  const count = visibleItems.value.length
  if (count === 0) return
  selectedIndex.value = (selectedIndex.value + delta + count) % count
}

function confirmSelection() {
  const item = visibleItems.value[selectedIndex.value]
  if (item) handleItemSelect(item)
}

function closeSearch() {
  query.value = ''
  open.value = false
  expandedPersons.value = new Set()
  inputEl.value?.blur()
}

function togglePersonExpand(key: string) {
  // Set neu erstellen, damit Vue die Änderung trackt
  const next = new Set(expandedPersons.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedPersons.value = next
}

function dropPin(type: ResultType, title: string, coords: [number, number], sub?: string) {
  emit('drop-pin', {
    coordinates: coords,
    color: TYPE_COLORS[type],
    type,
    title,
    sub: sub || undefined,
  })
}
function dropPinFor(r: SearchResult, coords: [number, number]) {
  dropPin(r.type, r.title, coords, r.sub)
}

function handleItemSelect(item: VisibleItem) {
  if (item.kind === 'top') {
    const r = item.result
    const d = r.data
    // Aufklappbare Personen → expand statt navigieren
    if (item.expandable && d.kind === 'person') {
      togglePersonExpand(r.key)
      return
    }
    switch (d.kind) {
      case 'battle':
        dropPinFor(r, d.battle.coordinates)
        emit('select-battle', d.battle)
        break
      case 'operation':
        dropPinFor(r, operationCenter(d.op))
        emit('select-operation', d.op)
        break
      case 'city':
        dropPinFor(r, cityCenter(d.city))
        emit('select-city', d.city)
        break
      case 'event':
        // Event hat schon den dedizierten pinnedEvent-Pfad (mit X-Button etc.),
        // ein zusätzlicher Search-Pin wäre Doppelung.
        emit('select-event', d.event)
        break
      case 'division':
        dropPinFor(r, d.division.coordinates)
        emit('select-division', d.division)
        break
      case 'person':
        // Person mit genau einer Position → direkt navigieren + Pin auf die Position
        if (d.battles.length > 0) {
          dropPinFor(r, d.battles[0]!.coordinates)
          emit('select-battle', d.battles[0]!)
        } else if (d.divisions.length > 0) {
          dropPinFor(r, d.divisions[0]!.coordinates)
          emit('select-division', d.divisions[0]!)
        }
        break
    }
    closeSearch()
  } else if (item.kind === 'sub-battle') {
    dropPin('battle', item.battle.name, item.battle.coordinates, item.sub)
    emit('select-battle', item.battle)
    closeSearch()
  } else if (item.kind === 'sub-division') {
    dropPin('division', item.division.fullName, item.division.coordinates, item.sub)
    emit('select-division', item.division)
    closeSearch()
  }
}

function onDocClick(e: MouseEvent) {
  if (!open.value || !root.value) return
  if (!root.value.contains(e.target as Node)) open.value = false
}

function onGlobalKeydown(e: KeyboardEvent) {
  // Cmd/Ctrl+K → Suche fokussieren
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    inputEl.value?.focus()
    inputEl.value?.select()
  }
}

// SelectedIndex in den gültigen Range clampen, wenn sich die sichtbare Liste
// ändert (Query-Wechsel, Person aufgeklappt/zusammengeklappt).
watch(visibleItems, (items) => {
  if (selectedIndex.value >= items.length) {
    selectedIndex.value = Math.max(0, items.length - 1)
  }
})

// Beim Query-Wechsel die expandierten Personen zurücksetzen — sonst hängt
// ein Person-Eintrag in der neuen Trefferliste evtl. weiterhin aufgeklappt.
watch(query, () => {
  expandedPersons.value = new Set()
  selectedIndex.value = 0
})

onMounted(() => {
  document.addEventListener('mousedown', onDocClick)
  document.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocClick)
  document.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<style scoped>
.search-root {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 420px;
  max-width: calc(100vw - 460px);
  z-index: 9;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 15, 15, 0.94);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 8px 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.search-root--open .search-input-wrap {
  border-color: rgba(250, 204, 21, 0.4);
}

.search-icon {
  color: #737373;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #f5f5f5;
  font-size: 13px;
  outline: none;
  font-family: 'Inter', system-ui, sans-serif;
}

.search-input::placeholder {
  color: #737373;
}

.search-clear {
  background: rgba(255, 255, 255, 0.06);
  border: none;
  color: #a3a3a3;
  border-radius: 4px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.search-clear:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #f5f5f5;
}

.search-results {
  margin-top: 6px;
  background: rgba(15, 15, 15, 0.97);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  max-height: 420px;
  overflow-y: auto;
}

.search-empty {
  padding: 14px 16px;
  font-size: 12px;
  color: #737373;
  text-align: center;
}

.search-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.search-item:last-child {
  border-bottom: none;
}

.search-item--active {
  background: rgba(255, 255, 255, 0.06);
}

.search-item-type {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  min-width: 64px;
  padding-top: 2px;
  flex-shrink: 0;
}

.search-item-body {
  flex: 1;
  min-width: 0;
}

.search-item-title {
  font-size: 13px;
  color: #f5f5f5;
  font-weight: 500;
  line-height: 1.25;
}

.search-item-sub {
  font-size: 11px;
  color: #a3a3a3;
  margin-top: 2px;
}

.search-item-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(22, 163, 74, 0.15);
  color: #4ade80;
  transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
  flex-shrink: 0;
  margin-left: 8px;
  align-self: center;
}

.search-item:hover .search-item-chevron {
  background: rgba(22, 163, 74, 0.25);
  color: #86efac;
}

.search-item-chevron--open {
  transform: rotate(180deg);
  background: rgba(250, 204, 21, 0.18);
  color: #facc15;
}

.search-item:hover .search-item-chevron--open {
  background: rgba(250, 204, 21, 0.28);
  color: #fde047;
}

.search-item--expanded {
  background: rgba(22, 163, 74, 0.08);
}

.search-item--sub {
  padding-left: 28px;
  background: rgba(255, 255, 255, 0.015);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.search-item--sub.search-item--active {
  background: rgba(255, 255, 255, 0.07);
}

.search-sub-bullet {
  color: #525252;
  font-size: 13px;
  min-width: 14px;
  padding-top: 2px;
  flex-shrink: 0;
}

.search-item--sub .search-item-title {
  font-size: 12px;
  color: #d4d4d4;
  font-weight: 400;
}

.search-item--sub .search-item-sub {
  font-size: 10px;
  color: #737373;
}
</style>
