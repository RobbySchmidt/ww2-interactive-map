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
      <div v-if="results.length === 0" class="search-empty">Keine Treffer für „{{ query }}"</div>
      <div
        v-for="(r, i) in results"
        :key="r.key"
        class="search-item"
        :class="{ 'search-item--active': i === selectedIndex }"
        @mouseenter="selectedIndex = i"
        @click="selectResult(r)"
      >
        <span class="search-item-type" :style="{ color: TYPE_COLORS[r.type] }">{{ TYPE_LABELS[r.type] }}</span>
        <div class="search-item-body">
          <div class="search-item-title">{{ r.title }}</div>
          <div v-if="r.sub" class="search-item-sub">{{ r.sub }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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

const emit = defineEmits<{
  (e: 'select-battle', battle: Battle): void
  (e: 'select-operation', op: Operation): void
  (e: 'select-city', city: City): void
  (e: 'select-event', event: HistEvent): void
  (e: 'select-division', division: DivisionMarker): void
}>()

const root = ref<HTMLDivElement>()
const inputEl = ref<HTMLInputElement>()
const query = ref('')
const open = ref(false)
const selectedIndex = ref(0)

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

function clearQuery() {
  query.value = ''
  selectedIndex.value = 0
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
  if (results.value.length === 0) return
  selectedIndex.value =
    (selectedIndex.value + delta + results.value.length) % results.value.length
}

function confirmSelection() {
  const r = results.value[selectedIndex.value]
  if (r) selectResult(r)
}

function selectResult(r: SearchResult) {
  const d = r.data
  switch (d.kind) {
    case 'battle':
      emit('select-battle', d.battle)
      break
    case 'operation':
      emit('select-operation', d.op)
      break
    case 'city':
      emit('select-city', d.city)
      break
    case 'event':
      emit('select-event', d.event)
      break
    case 'division':
      emit('select-division', d.division)
      break
    case 'person':
      // Bei Personen: erste verknüpfte Schlacht aufrufen — pragmatisch und sofort nützlich
      if (d.battles.length > 0) emit('select-battle', d.battles[0]!)
      else if (d.divisions.length > 0) emit('select-division', d.divisions[0]!)
      break
  }
  query.value = ''
  open.value = false
  inputEl.value?.blur()
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
</style>
