<template>
  <div class="timeline-root">
    <div class="timeline-bar">
      <button
        class="ctrl-btn ctrl-btn--play"
        :aria-label="isPlaying ? 'Pause' : 'Abspielen'"
        @click="togglePlay"
      >
        <svg v-if="!isPlaying" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
        </svg>
      </button>

      <div class="timeline-meta">
        <div class="timeline-date">{{ formattedDate }}</div>
        <div class="timeline-label">{{ contextLabel }}</div>
      </div>

      <div class="timeline-controls">
        <div class="control-group">
          <span class="control-label">Intervall</span>
          <DarkSelect v-model="interval" :options="intervalOptions" />
        </div>
        <div class="control-group">
          <span class="control-label">Tempo</span>
          <DarkSelect v-model="speedMs" :options="speedOptions" />
        </div>
        <div class="control-group">
          <span class="control-label">Karte</span>
          <DarkSelect v-model="baseLayerLocal" :options="baseLayerOptions" />
        </div>

        <div class="layer-toggles" role="group" aria-label="Zusatzlayer">
          <button
            type="button"
            class="layer-toggle"
            :class="{ 'layer-toggle--active': weatherEnabled }"
            :title="weatherEnabled ? `Wetter ausblenden · ${currentSeason.label}` : `Wetter einblenden · ${currentSeason.label}`"
            :aria-pressed="weatherEnabled"
            aria-label="Wetter/Rasputitsa"
            @click="toggleWeather"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path :d="currentSeason.iconPath" />
            </svg>
          </button>
          <button
            type="button"
            class="layer-toggle"
            :class="{ 'layer-toggle--active': railwayEnabled }"
            :title="railwayEnabled ? 'Eisenbahn ausblenden' : 'Eisenbahn-Hauptstrecken einblenden'"
            :aria-pressed="railwayEnabled"
            aria-label="Eisenbahn"
            @click="toggleRailway"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="4" y1="9" x2="20" y2="9" />
              <line x1="4" y1="15" x2="20" y2="15" />
              <line x1="7" y1="6" x2="7" y2="18" />
              <line x1="11" y1="6" x2="11" y2="18" />
              <line x1="13" y1="6" x2="13" y2="18" />
              <line x1="17" y1="6" x2="17" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="slider-wrap">
      <input
        type="range"
        :min="minMs"
        :max="maxMs"
        :step="stepMs"
        :value="currentMs"
        :style="{ '--progress': progressPct + '%' }"
        class="slider"
        @input="onScrub(($event.target as HTMLInputElement).valueAsNumber)"
      />
      <div class="ticks">
        <div
          v-for="snap in visibleSnapshots"
          :key="snap.date"
          class="tick"
          :style="{ left: tickPosition(snap.date) + '%' }"
          :title="`${snap.date} · ${snap.label}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { SNAPSHOTS, TIMELINE_START, TIMELINE_END, findSnapshotBracket } from '~/data/easternFront'
import { seasonInfo } from '~/lib/season'
import DarkSelect from './DarkSelect.vue'

type Interval = 'day' | 'week' | 'month'
type BaseLayer = 'map' | 'satellite'

const intervalOptions = [
  { value: 'day' as Interval, label: 'Tag' },
  { value: 'week' as Interval, label: 'Woche' },
  { value: 'month' as Interval, label: 'Monat' },
]
const speedOptions = [
  { value: 500, label: 'langsam' },
  { value: 200, label: 'normal' },
  { value: 80, label: 'schnell' },
]
const baseLayerOptions = [
  { value: 'map' as BaseLayer, label: 'Straßenkarte' },
  { value: 'satellite' as BaseLayer, label: 'Satellit' },
]

const props = defineProps<{
  modelValue: Date
  baseLayer: BaseLayer
  weatherEnabled: boolean
  railwayEnabled: boolean
  /** Optionaler Min-Bound (z.B. Schlacht-Start im Battle-Modus). */
  rangeMin?: Date
  /** Optionaler Max-Bound (z.B. Schlacht-Ende im Battle-Modus). */
  rangeMax?: Date
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', date: Date): void
  (e: 'update:baseLayer', mode: BaseLayer): void
  (e: 'update:weatherEnabled', v: boolean): void
  (e: 'update:railwayEnabled', v: boolean): void
}>()

const interval = ref<Interval>('week')
const speedMs = ref(200)
const isPlaying = ref(false)
const baseLayerLocal = ref<BaseLayer>(props.baseLayer)

watch(baseLayerLocal, (v) => emit('update:baseLayer', v))
watch(() => props.baseLayer, (v) => (baseLayerLocal.value = v))

const currentSeason = computed(() => seasonInfo(props.modelValue))

function toggleWeather() {
  emit('update:weatherEnabled', !props.weatherEnabled)
}

function toggleRailway() {
  emit('update:railwayEnabled', !props.railwayEnabled)
}

const minMs = computed(() => (props.rangeMin ?? TIMELINE_START).getTime())
const maxMs = computed(() => (props.rangeMax ?? TIMELINE_END).getTime())
const stepMs = 60 * 60 * 24 * 1000 // 1 Tag Granularität für slider

const currentMs = computed(() => props.modelValue.getTime())
const progressPct = computed(
  () => ((currentMs.value - minMs.value) / (maxMs.value - minMs.value)) * 100,
)

const DATE_FMT = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const formattedDate = computed(() => DATE_FMT.format(props.modelValue))

const contextLabel = computed(() => {
  const { a, b, t } = findSnapshotBracket(props.modelValue)
  if (t === 0 || a === b) return a.label
  return t < 0.5 ? `nach: ${a.label}` : `vor: ${b.label}`
})

function tickPosition(dateStr: string): number {
  const t = new Date(dateStr).getTime()
  return ((t - minMs.value) / (maxMs.value - minMs.value)) * 100
}

const visibleSnapshots = computed(() =>
  SNAPSHOTS.filter((s) => {
    const t = new Date(s.date).getTime()
    return t >= minMs.value && t <= maxMs.value
  }),
)

function stepSizeMs(): number {
  switch (interval.value) {
    case 'day':
      return 24 * 60 * 60 * 1000
    case 'week':
      return 7 * 24 * 60 * 60 * 1000
    case 'month':
      return 30 * 24 * 60 * 60 * 1000
  }
}

function onScrub(ms: number) {
  emit('update:modelValue', new Date(ms))
}

let timer: ReturnType<typeof setInterval> | null = null

function togglePlay() {
  if (isPlaying.value) {
    stopPlay()
  } else {
    startPlay()
  }
}

function startPlay() {
  if (timer) return
  isPlaying.value = true
  // Bei Wiedergabe am Ende: von vorne beginnen
  if (props.modelValue.getTime() >= maxMs.value) {
    emit('update:modelValue', new Date(minMs.value))
  }
  timer = setInterval(() => {
    const next = props.modelValue.getTime() + stepSizeMs()
    if (next >= maxMs.value) {
      emit('update:modelValue', new Date(maxMs.value))
      stopPlay()
    } else {
      emit('update:modelValue', new Date(next))
    }
  }, speedMs.value)
}

function stopPlay() {
  isPlaying.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

watch([speedMs, interval], () => {
  if (isPlaying.value) {
    stopPlay()
    startPlay()
  }
})

onBeforeUnmount(() => stopPlay())
</script>

<style scoped>
.timeline-root {
  background: rgba(15, 15, 15, 0.92);
  backdrop-filter: blur(8px);
  color: #f5f5f5;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 14px 20px 18px;
}

.timeline-bar {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 10px;
}

.ctrl-btn {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  background: #facc15;
  color: #0a0a0a;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
  flex-shrink: 0;
}

.ctrl-btn:hover {
  background: #fde047;
}

.timeline-meta {
  flex: 1;
  min-width: 0;
}

.timeline-date {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.timeline-label {
  font-size: 13px;
  color: #a3a3a3;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.timeline-controls {
  display: flex;
  gap: 14px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.control-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #737373;
}

.layer-toggles {
  display: flex;
  align-items: stretch;
  gap: 4px;
  padding-left: 10px;
  margin-left: 6px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.layer-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  align-self: flex-end;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #a3a3a3;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.layer-toggle:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e5e5e5;
}

.layer-toggle--active {
  background: rgba(250, 204, 21, 0.18);
  border-color: rgba(250, 204, 21, 0.55);
  color: #facc15;
}

.layer-toggle--active:hover {
  background: rgba(250, 204, 21, 0.26);
  color: #fde047;
}

.slider-wrap {
  position: relative;
  padding: 8px 0 4px;
}

.slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(
    90deg,
    rgba(239, 68, 68, 0.6) 0%,
    rgba(239, 68, 68, 0.6) var(--progress, 0%),
    rgba(255, 255, 255, 0.12) var(--progress, 0%),
    rgba(255, 255, 255, 0.12) 100%
  );
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: #fff;
  border: 3px solid #ef4444;
  cursor: grab;
}

.slider::-webkit-slider-thumb:active {
  cursor: grabbing;
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: #fff;
  border: 3px solid #ef4444;
  cursor: grab;
}

.ticks {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 8px;
  pointer-events: none;
}

.tick {
  position: absolute;
  width: 2px;
  height: 8px;
  background: rgba(255, 255, 255, 0.45);
  transform: translateX(-50%);
}
</style>
