<template>
  <Transition name="ticker">
    <div v-if="est" class="ticker" @click="$emit('select-battle', est.battle)">
      <div class="ticker-flame">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path
            d="M12 23c-4.4 0-8-3.6-8-8 0-2.8 1.4-4.7 2.7-6.5C8 6.7 9.3 4.9 9.3 2.5c0-.2.1-.3.3-.4.1-.1.3-.1.5 0 1.7.7 2.9 2.4 2.9 4.4 1.4-1.2 2.2-3 2.2-4.9 0-.2.1-.3.3-.4.1-.1.3-.1.4 0 2.4 1.5 5.1 5.7 5.1 9.8 0 7.4-3.6 12-8 12z"
          />
        </svg>
      </div>
      <div class="ticker-main">
        <div class="ticker-header">
          <span class="ticker-name">{{ est.battle.name }}</span>
          <span class="ticker-day">Tag {{ est.daysElapsed }} / {{ est.totalDays }}</span>
        </div>
        <div class="ticker-numbers">
          <div class="ticker-side ticker-side--soviet">
            <span class="ticker-label">Sowjet</span>
            <span class="ticker-value">{{ fmt(est.sovietCumulative) }}</span>
          </div>
          <div class="ticker-side ticker-side--axis">
            <span class="ticker-label">Achse</span>
            <span class="ticker-value">{{ fmt(est.axisCumulative) }}</span>
          </div>
          <div class="ticker-side ticker-side--total">
            <span class="ticker-label">Σ Verluste</span>
            <span class="ticker-value ticker-value--total">{{ fmt(est.combinedCumulative) }}</span>
          </div>
          <div class="ticker-side ticker-side--rate">
            <span class="ticker-label">pro Tag</span>
            <span class="ticker-value ticker-value--rate">~{{ fmt(est.combinedDaily) }}</span>
          </div>
        </div>
        <div class="ticker-progress">
          <div class="ticker-progress-bar" :style="{ width: progressPct + '%' }" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BATTLES, type Battle } from '~/data/battles'
import { estimateCasualties, pickProminentBattle } from '~/lib/casualties'

const props = defineProps<{ currentDate: Date }>()
defineEmits<{ (e: 'select-battle', battle: Battle): void }>()

const prominent = computed<Battle | null>(() => pickProminentBattle(BATTLES, props.currentDate))
const est = computed(() => (prominent.value ? estimateCasualties(prominent.value, props.currentDate) : null))
const progressPct = computed(() => (est.value ? Math.round(est.value.progress * 100) : 0))

const FMT = new Intl.NumberFormat('de-DE')
function fmt(n: number): string {
  return FMT.format(n)
}
</script>

<style scoped>
.ticker {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 560px;
  width: calc(100% - 480px);
  min-width: 320px;
  background: rgba(15, 15, 15, 0.94);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: stretch;
  gap: 12px;
  z-index: 7;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 24px rgba(239, 68, 68, 0.15);
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.ticker:hover {
  border-color: rgba(239, 68, 68, 0.7);
  transform: translateX(-50%) translateY(-2px);
}

.ticker-flame {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.6));
  animation: flame-flicker 1.4s ease-in-out infinite alternate;
}

@keyframes flame-flicker {
  from {
    opacity: 0.85;
    transform: scale(1);
  }
  to {
    opacity: 1;
    transform: scale(1.08);
  }
}

.ticker-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ticker-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.ticker-name {
  font-size: 13px;
  font-weight: 700;
  color: #f5f5f5;
  letter-spacing: -0.01em;
}

.ticker-day {
  font-size: 10px;
  color: #a3a3a3;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.ticker-numbers {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.ticker-side {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.ticker-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #737373;
}

.ticker-value {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
}

.ticker-side--soviet .ticker-value { color: #facc15; }
.ticker-side--axis .ticker-value { color: #ef4444; }
.ticker-value--total { color: #f5f5f5; }
.ticker-value--rate { color: #d4d4d4; }

.ticker-progress {
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.ticker-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, rgba(250, 204, 21, 0.8), rgba(239, 68, 68, 0.8));
  transition: width 0.2s ease;
}

.ticker-enter-active,
.ticker-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.ticker-enter-from,
.ticker-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
