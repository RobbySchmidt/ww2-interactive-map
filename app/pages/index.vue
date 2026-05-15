<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand">
        <div class="brand-mark">II.WK</div>
        <div>
          <h1 class="brand-title">Ostfront 1941–1945</h1>
          <div class="brand-sub">Frontverlauf · Großschlachten · Truppenstärken</div>
        </div>
      </div>
      <div v-if="activeBattle" class="header-mode">
        <span class="header-mode-label">Schlacht-Detail</span>
        <span class="header-mode-name">{{ activeBattle.name }}</span>
        <button class="header-mode-leave" type="button" @click="leaveBattleMode">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Zurück zur Welt
        </button>
      </div>
      <div v-else class="header-note">Prototyp · Daten sind angenäherte Wochen-Snapshots</div>
    </header>

    <main class="map-area">
      <ClientOnly>
        <WarMap
          ref="mapRef"
          :current-date="currentDate"
          :base-layer="baseLayer"
          :pinned-event="pinnedEvent"
          :weather-enabled="weatherEnabled"
          :railway-enabled="railwayEnabled"
          :pois="activePois"
          @battle-click="onBattleClick"
          @pin-focus="onPinFocus"
          @pin-dismiss="pinnedEvent = null"
        />
        <template #fallback>
          <div class="map-loading">Karte wird geladen …</div>
        </template>
      </ClientOnly>

      <EventsFeed
        ref="feedRef"
        :current-date="currentDate"
        :is-open="feedOpen"
        :active-event-id="pinnedEvent?.id ?? null"
        :date-range="activeBattle ? { start: timelineRange.min, end: timelineRange.max } : undefined"
        :range-title="activeBattle ? `Ereignisse der Schlacht` : undefined"
        @toggle="feedOpen = !feedOpen"
        @event-click="onEventClick"
      />

      <SearchBar
        @select-battle="onBattleClick"
        @select-operation="onOperationSelect"
        @select-city="onCitySelect"
        @select-event="onEventClick"
        @select-division="onDivisionSelect"
      />

      <CasualtyTicker :current-date="currentDate" @select-battle="onBattleClick" />

      <StrengthChart
        :current-date="currentDate"
        :is-open="chartOpen"
        @toggle="chartOpen = !chartOpen"
      />

      <BattleDetail
        :battle="selectedBattle"
        :battle-mode="battleMode"
        @close="selectedBattle = null"
        @enter-battle-mode="enterBattleMode"
        @leave-battle-mode="leaveBattleMode"
      />
    </main>

    <Timeline
      v-model="currentDate"
      v-model:base-layer="baseLayer"
      v-model:weather-enabled="weatherEnabled"
      v-model:railway-enabled="railwayEnabled"
      :range-min="timelineRange.min"
      :range-max="timelineRange.max"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import WarMap from '~/components/WarMap.client.vue'
import Timeline from '~/components/Timeline.vue'
import BattleDetail from '~/components/BattleDetail.vue'
import EventsFeed from '~/components/EventsFeed.vue'
import SearchBar from '~/components/SearchBar.vue'
import CasualtyTicker from '~/components/CasualtyTicker.vue'
import StrengthChart from '~/components/StrengthChart.vue'
import { TIMELINE_START, TIMELINE_END } from '~/data/easternFront'
import { BATTLES, type Battle } from '~/data/battles'
import { EVENTS, type HistEvent } from '~/data/events'
import type { Operation } from '~/data/operations'
import type { City } from '~/data/cities'
import type { DivisionMarker } from '~/data/divisions'
import { poisForBattle } from '~/data/battle-pois'

const currentDate = ref<Date>(new Date(TIMELINE_START))
const baseLayer = ref<'map' | 'satellite'>('map')
const weatherEnabled = ref(false)
const railwayEnabled = ref(false)
const selectedBattle = ref<Battle | null>(null)
const pinnedEvent = ref<HistEvent | null>(null)
const feedOpen = ref(true)
const chartOpen = ref(false)
const battleMode = ref(false)
const mapRef = ref<InstanceType<typeof WarMap> | null>(null)
const feedRef = ref<InstanceType<typeof EventsFeed> | null>(null)

// Im Battle-Modus zoomen wir den Zeitstrahl auf den Schlacht-Bereich.
const activeBattle = computed(() => (battleMode.value ? selectedBattle.value : null))
const activePois = computed(() => (activeBattle.value ? poisForBattle(activeBattle.value.id) : []))
const timelineRange = computed(() => {
  if (activeBattle.value) {
    return {
      min: new Date(activeBattle.value.start),
      max: new Date(activeBattle.value.end),
    }
  }
  return { min: TIMELINE_START, max: TIMELINE_END }
})

function enterBattleMode() {
  if (!selectedBattle.value) return
  battleMode.value = true
  const battle = selectedBattle.value
  // Datum in den Schlacht-Bereich clampen
  const ts = currentDate.value.getTime()
  const start = new Date(battle.start).getTime()
  const end = new Date(battle.end).getTime()
  if (ts < start || ts > end) {
    currentDate.value = new Date((start + end) / 2)
  }
  // Wenn POIs vorhanden, näher rein (Stadt-Maßstab) — sonst operativer Zoom
  const hasPois = poisForBattle(battle.id).length > 0
  mapRef.value?.flyTo(battle.coordinates, hasPois ? 12 : 7)
}

function leaveBattleMode() {
  battleMode.value = false
  mapRef.value?.flyTo([30, 53], 3.6)
}

// Wenn die ausgewählte Schlacht weggeklickt wird, Battle-Mode automatisch verlassen.
watch(selectedBattle, (b) => {
  if (!b && battleMode.value) battleMode.value = false
})

function onPinFocus() {
  const ev = pinnedEvent.value
  if (!ev) return
  feedOpen.value = true
  if (ev.coordinates) mapRef.value?.flyTo(ev.coordinates, 6)
  setDateClamped(new Date(ev.date))
  nextTick(() => feedRef.value?.scrollToEvent(ev.id))
}

function onBattleClick(battle: Battle) {
  selectedBattle.value = battle
  mapRef.value?.flyTo(battle.coordinates, 6)
  // Wenn aktuelles Datum außerhalb der Schlacht liegt, in die Mitte springen.
  // Sonst Position des Nutzers innerhalb der Schlacht beibehalten.
  const start = new Date(battle.start).getTime()
  const end = new Date(battle.end).getTime()
  const ts = currentDate.value.getTime()
  if (ts < start || ts > end) {
    setDateClamped(new Date((start + end) / 2))
  }
}

function onEventClick(event: HistEvent) {
  pinnedEvent.value = event
  if (event.coordinates) {
    mapRef.value?.flyTo(event.coordinates, 6)
  }
  setDateClamped(new Date(event.date))
}

function setDateClamped(d: Date) {
  const ts = Math.min(Math.max(d.getTime(), TIMELINE_START.getTime()), TIMELINE_END.getTime())
  currentDate.value = new Date(ts)
}

function onOperationSelect(op: Operation) {
  // Mittelpunkt aller Thrust-Endpunkte als Anflugziel
  const ends = op.thrusts.map((t) => t.end)
  const cx = ends.reduce((s, p) => s + p[0], 0) / ends.length
  const cy = ends.reduce((s, p) => s + p[1], 0) / ends.length
  mapRef.value?.flyTo([cx, cy], 5)
  // Datum auf Mitte der Operation
  const start = new Date(op.start).getTime()
  const end = new Date(op.end).getTime()
  setDateClamped(new Date((start + end) / 2))
}

function onCitySelect(city: City) {
  // Geometrischer Mittelpunkt des ersten Rings
  const ring = city.geometry.coordinates[0]!
  let sx = 0,
    sy = 0
  for (const [x, y] of ring) {
    sx += x
    sy += y
  }
  const cx = sx / ring.length
  const cy = sy / ring.length
  mapRef.value?.flyTo([cx, cy], 8)
}

function onDivisionSelect(div: DivisionMarker) {
  mapRef.value?.flyTo(div.coordinates, 6)
  setDateClamped(new Date(div.snapshot))
}

// ESC schließt einen aktiven Event-Pin
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && pinnedEvent.value) {
    pinnedEvent.value = null
  }
}

// ---------- URL-State ----------
let urlSyncReady = false

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  const params = new URLSearchParams(window.location.search)
  const d = params.get('d')
  if (d) {
    const date = new Date(d)
    if (!isNaN(date.getTime())) setDateClamped(date)
  }
  const layer = params.get('layer')
  if (layer === 'satellite' || layer === 'map') baseLayer.value = layer
  if (params.get('w') === '1') weatherEnabled.value = true
  if (params.get('r') === '1') railwayEnabled.value = true
  const b = params.get('b')
  if (b) {
    const battle = BATTLES.find((x) => x.id === b)
    if (battle) selectedBattle.value = battle
  }
  if (params.get('mode') === 'battle' && selectedBattle.value) {
    battleMode.value = true
  }
  const e = params.get('e')
  if (e) {
    const event = EVENTS.find((x) => x.id === e)
    if (event) pinnedEvent.value = event
  }

  // Auf nächsten Tick: zur passenden Position fliegen (mapRef ist dann verfügbar)
  nextTick(() => {
    if (battleMode.value && selectedBattle.value) {
      const hasPois = poisForBattle(selectedBattle.value.id).length > 0
      mapRef.value?.flyTo(selectedBattle.value.coordinates, hasPois ? 12 : 7)
    } else if (pinnedEvent.value?.coordinates) {
      mapRef.value?.flyTo(pinnedEvent.value.coordinates, 6)
    } else if (selectedBattle.value) {
      mapRef.value?.flyTo(selectedBattle.value.coordinates, 6)
    }
    urlSyncReady = true
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})

watch(
  [currentDate, selectedBattle, pinnedEvent, baseLayer, weatherEnabled, railwayEnabled, battleMode],
  () => {
    if (!urlSyncReady || typeof window === 'undefined') return
    const params = new URLSearchParams()
    params.set('d', currentDate.value.toISOString().slice(0, 10))
    if (selectedBattle.value) params.set('b', selectedBattle.value.id)
    if (pinnedEvent.value) params.set('e', pinnedEvent.value.id)
    if (baseLayer.value === 'satellite') params.set('layer', 'satellite')
    if (weatherEnabled.value) params.set('w', '1')
    if (railwayEnabled.value) params.set('r', '1')
    if (battleMode.value) params.set('mode', 'battle')
    const url = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', url)
  },
)
</script>

<style scoped>
.app-shell {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  background: #0a0a0a;
  color: #f5f5f5;
  font-family: 'Inter', system-ui, sans-serif;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(15, 15, 15, 0.92);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 5;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  background: #ef4444;
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  letter-spacing: -0.02em;
}

.brand-title {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.brand-sub {
  font-size: 11px;
  color: #a3a3a3;
  margin-top: 2px;
}

.header-note {
  font-size: 11px;
  color: #737373;
}

.header-mode {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(250, 204, 21, 0.1);
  border: 1px solid rgba(250, 204, 21, 0.35);
  border-radius: 6px;
  padding: 5px 10px 5px 12px;
}

.header-mode-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #facc15;
}

.header-mode-name {
  font-size: 12px;
  color: #f5f5f5;
  font-weight: 600;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-mode-leave {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #e5e5e5;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.header-mode-leave:hover {
  background: rgba(255, 255, 255, 0.14);
}

.map-area {
  position: relative;
  overflow: hidden;
}

.map-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #737373;
  font-size: 14px;
}
</style>
