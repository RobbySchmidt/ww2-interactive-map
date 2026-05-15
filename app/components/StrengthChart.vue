<template>
  <div class="chart-root" :class="{ 'chart-root--closed': !isOpen }">
    <button
      class="chart-toggle"
      :aria-label="isOpen ? 'Kräftediagramm schließen' : 'Kräftediagramm öffnen'"
      @click="$emit('toggle')"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path
          d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"
        />
      </svg>
    </button>

    <div v-if="isOpen" class="chart-panel">
      <header class="chart-header">
        <div class="chart-title">Kräfteverhältnis</div>
        <div class="chart-date">{{ formattedDate }}</div>
      </header>

      <div class="chart-section">
        <div class="chart-section-head">
          <span class="chart-section-label">Personalstärke</span>
          <span class="chart-section-unit">Mio</span>
        </div>
        <div class="chart-legend">
          <span class="legend-item legend-item--soviet">
            <span class="legend-swatch" /> Sowjet
            <span class="legend-val">{{ interpolated.sovietStrength.toFixed(2) }}</span>
          </span>
          <span class="legend-item legend-item--axis">
            <span class="legend-swatch" /> Achse
            <span class="legend-val">{{ interpolated.axisStrength.toFixed(2) }}</span>
          </span>
        </div>
        <svg :viewBox="`0 0 ${W} ${H}`" class="chart-svg">
          <!-- Y-Gridlines -->
          <g class="grid">
            <line v-for="i in 4" :key="`gs${i}`" :x1="0" :y1="(i * H) / 4" :x2="W" :y2="(i * H) / 4" />
          </g>
          <!-- Sowjet (gelb) -->
          <polyline
            class="line line--soviet"
            :points="strengthPath('sovietStrength', maxStrength)"
          />
          <!-- Achse (rot) -->
          <polyline
            class="line line--axis"
            :points="strengthPath('axisStrength', maxStrength)"
          />
          <!-- Now-Linie -->
          <line :x1="nowX" :y1="0" :x2="nowX" :y2="H" class="now-line" />
          <!-- Punkt am aktuellen Datum -->
          <circle :cx="nowX" :cy="strengthY(interpolated.sovietStrength, maxStrength)" r="3.5" class="now-dot now-dot--soviet" />
          <circle :cx="nowX" :cy="strengthY(interpolated.axisStrength, maxStrength)" r="3.5" class="now-dot now-dot--axis" />
        </svg>
      </div>

      <div class="chart-section">
        <div class="chart-section-head">
          <span class="chart-section-label">Panzerproduktion</span>
          <span class="chart-section-unit">Stück / Quartal</span>
        </div>
        <div class="chart-legend">
          <span class="legend-item legend-item--soviet">
            <span class="legend-swatch" /> Sowjet
            <span class="legend-val">{{ fmt(Math.round(interpolated.sovietTanks)) }}</span>
          </span>
          <span class="legend-item legend-item--axis">
            <span class="legend-swatch" /> Achse
            <span class="legend-val">{{ fmt(Math.round(interpolated.axisTanks)) }}</span>
          </span>
        </div>
        <svg :viewBox="`0 0 ${W} ${H}`" class="chart-svg">
          <g class="grid">
            <line v-for="i in 4" :key="`gt${i}`" :x1="0" :y1="(i * H) / 4" :x2="W" :y2="(i * H) / 4" />
          </g>
          <polyline class="line line--soviet" :points="strengthPath('sovietTanks', maxTanks)" />
          <polyline class="line line--axis" :points="strengthPath('axisTanks', maxTanks)" />
          <line :x1="nowX" :y1="0" :x2="nowX" :y2="H" class="now-line" />
          <circle :cx="nowX" :cy="strengthY(interpolated.sovietTanks, maxTanks)" r="3.5" class="now-dot now-dot--soviet" />
          <circle :cx="nowX" :cy="strengthY(interpolated.axisTanks, maxTanks)" r="3.5" class="now-dot now-dot--axis" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  STRENGTH_DATA,
  STRENGTH_START,
  STRENGTH_END,
  interpolateStrengthAt,
  type StrengthSnapshot,
} from '~/data/strength'

const props = defineProps<{ currentDate: Date; isOpen: boolean }>()
defineEmits<{ (e: 'toggle'): void }>()

const W = 320
const H = 70

const tStart = STRENGTH_START.getTime()
const tEnd = STRENGTH_END.getTime()
const tSpan = tEnd - tStart

const maxStrength = computed(() => {
  let m = 0
  for (const s of STRENGTH_DATA) {
    if (s.sovietStrength > m) m = s.sovietStrength
    if (s.axisStrength > m) m = s.axisStrength
  }
  return Math.ceil(m)
})

const maxTanks = computed(() => {
  let m = 0
  for (const s of STRENGTH_DATA) {
    if (s.sovietTanks > m) m = s.sovietTanks
    if (s.axisTanks > m) m = s.axisTanks
  }
  return Math.ceil(m / 1000) * 1000
})

const interpolated = computed(() => interpolateStrengthAt(props.currentDate))

const nowX = computed(() => {
  const ts = props.currentDate.getTime()
  const clamped = Math.max(tStart, Math.min(tEnd, ts))
  return ((clamped - tStart) / tSpan) * W
})

function strengthX(snap: StrengthSnapshot): number {
  return ((new Date(snap.date).getTime() - tStart) / tSpan) * W
}

function strengthY(value: number, max: number): number {
  // Leichter Top-Padding damit Punkte nicht abschneiden
  const padded = H - 4
  return 2 + padded - (value / max) * padded
}

function strengthPath(key: 'sovietStrength' | 'axisStrength' | 'sovietTanks' | 'axisTanks', max: number): string {
  return STRENGTH_DATA.map((s) => `${strengthX(s).toFixed(2)},${strengthY(s[key], max).toFixed(2)}`).join(' ')
}

const FMT = new Intl.NumberFormat('de-DE')
function fmt(n: number): string {
  return FMT.format(n)
}

const DATE_FMT = new Intl.DateTimeFormat('de-DE', { month: 'short', year: 'numeric' })
const formattedDate = computed(() => DATE_FMT.format(props.currentDate))
</script>

<style scoped>
.chart-root {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: row-reverse;
  gap: 8px;
  z-index: 7;
}

.chart-toggle {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 15, 15, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  align-self: flex-end;
}

.chart-toggle:hover {
  background: rgba(40, 40, 40, 0.92);
}

.chart-panel {
  width: 360px;
  background: rgba(15, 15, 15, 0.94);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 14px;
  color: #f5f5f5;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.chart-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: #a3a3a3;
}

.chart-date {
  font-size: 12px;
  color: #d4d4d4;
}

.chart-section-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.chart-section-label {
  font-size: 11px;
  font-weight: 600;
  color: #d4d4d4;
}

.chart-section-unit {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #737373;
}

.chart-legend {
  display: flex;
  gap: 14px;
  margin-bottom: 4px;
  font-size: 11px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #a3a3a3;
}

.legend-swatch {
  width: 12px;
  height: 2px;
  border-radius: 1px;
}

.legend-item--soviet .legend-swatch { background: #facc15; }
.legend-item--axis .legend-swatch { background: #ef4444; }

.legend-val {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-weight: 600;
  color: #f5f5f5;
  margin-left: 2px;
  font-size: 10px;
}

.chart-svg {
  display: block;
  width: 100%;
  height: 70px;
  overflow: visible;
}

.grid line {
  stroke: rgba(255, 255, 255, 0.04);
  stroke-width: 1;
}

.line {
  fill: none;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.line--soviet { stroke: #facc15; }
.line--axis { stroke: #ef4444; }

.now-line {
  stroke: rgba(255, 255, 255, 0.4);
  stroke-width: 1;
  stroke-dasharray: 2 2;
}

.now-dot {
  stroke: #0a0a0a;
  stroke-width: 1.5;
}

.now-dot--soviet { fill: #facc15; }
.now-dot--axis { fill: #ef4444; }
</style>
