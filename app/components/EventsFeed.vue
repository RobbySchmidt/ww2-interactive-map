<template>
  <div class="feed-root" :class="{ 'feed-root--closed': !isOpen }">
    <button
      class="feed-toggle"
      :aria-label="isOpen ? 'Ereignis-Feed schließen' : 'Ereignis-Feed öffnen'"
      @click="$emit('toggle')"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path v-if="isOpen" d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
        <path v-else d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
      </svg>
    </button>

    <aside v-if="isOpen" class="feed-panel">
      <header class="feed-header">
        <div class="feed-title">{{ rangeTitle ?? 'An diesem Tag' }}</div>
        <div class="feed-date">{{ formattedDate }}</div>
        <div v-if="!dateRange" class="feed-window">
          <button
            v-for="opt in WINDOW_OPTIONS"
            :key="opt"
            :class="['feed-window-btn', { 'feed-window-btn--active': opt === windowDays }]"
            @click="windowDays = opt"
          >
            ±{{ opt }}d
          </button>
        </div>
      </header>

      <div class="feed-list">
        <div v-if="events.length === 0" class="feed-empty">
          Keine Ereignisse im Zeitfenster.
        </div>
        <article
          v-for="event in events"
          :key="event.id"
          :ref="(el) => registerCardRef(event.id, el as HTMLElement | null)"
          class="event-card"
          :class="[
            `event-card--${event.category}`,
            {
              'event-card--clickable': event.coordinates,
              'event-card--active': event.id === activeEventId,
            },
          ]"
          @click="onCardClick(event)"
        >
          <div class="event-row">
            <span class="event-rel">{{ relativeDayLabel(event.date, currentDate) }}</span>
            <svg
              v-if="event.id === activeEventId"
              class="event-active-pin"
              viewBox="0 0 24 32"
              width="10"
              height="13"
              aria-hidden="true"
              :style="{ color: CATEGORY_COLORS[event.category] }"
            >
              <path
                d="M12 0 C 5 0, 0 5, 0 12 C 0 21, 12 32, 12 32 C 12 32, 24 21, 24 12 C 24 5, 19 0, 12 0 Z"
                fill="currentColor"
              />
            </svg>
            <span
              v-else
              class="event-cat-dot"
              :style="{ background: CATEGORY_COLORS[event.category] }"
              :title="CATEGORY_LABELS[event.category]"
            />
            <span class="event-cat">{{ CATEGORY_LABELS[event.category] }}</span>
          </div>
          <h3 class="event-title">{{ event.title }}</h3>
          <p class="event-desc">{{ event.description }}</p>
          <div v-if="event.coordinates" class="event-locate">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"
              />
            </svg>
            Auf Karte anzeigen
          </div>
        </article>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  eventsAroundDate,
  eventsInRange,
  relativeDayLabel,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type HistEvent,
} from '~/data/events'

const props = defineProps<{
  currentDate: Date
  isOpen: boolean
  activeEventId: string | null
  /** Wenn gesetzt: zeigt alle Events im Bereich, statt ±N Tage um currentDate. */
  dateRange?: { start: Date; end: Date }
  /** Optionaler Titel statt "An diesem Tag" (z.B. Schlacht-Name). */
  rangeTitle?: string
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'event-click', event: HistEvent): void
}>()

const WINDOW_OPTIONS = [3, 7, 30] as const
const windowDays = ref<number>(7)

const events = computed<HistEvent[]>(() => {
  if (props.dateRange) {
    return eventsInRange(props.dateRange.start, props.dateRange.end)
  }
  return eventsAroundDate(props.currentDate, windowDays.value)
})

const DATE_FMT = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const formattedDate = computed(() => {
  if (props.dateRange) {
    return `${DATE_FMT.format(props.dateRange.start)} – ${DATE_FMT.format(props.dateRange.end)}`
  }
  return DATE_FMT.format(props.currentDate)
})

function onCardClick(event: HistEvent) {
  if (event.coordinates) {
    emit('event-click', event)
  }
}

const cardRefs = new Map<string, HTMLElement>()
function registerCardRef(id: string, el: HTMLElement | null) {
  if (el) cardRefs.set(id, el)
  else cardRefs.delete(id)
}

function scrollToEvent(id: string) {
  cardRefs.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

defineExpose({ scrollToEvent })
</script>

<style scoped>
.feed-root {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
  z-index: 8;
  max-height: calc(100vh - 200px);
}

.feed-toggle {
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
  align-self: flex-start;
}

.feed-toggle:hover {
  background: rgba(40, 40, 40, 0.92);
}

.feed-panel {
  width: 360px;
  max-width: calc(100vw - 90px);
  display: flex;
  flex-direction: column;
  background: rgba(15, 15, 15, 0.94);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f5f5f5;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.feed-header {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.feed-title {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #a3a3a3;
  margin-bottom: 2px;
}

.feed-date {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.feed-window {
  display: flex;
  gap: 4px;
}

.feed-window-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d4d4d4;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
}

.feed-window-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.feed-window-btn--active {
  background: rgba(250, 204, 21, 0.15);
  color: #facc15;
  border-color: rgba(250, 204, 21, 0.4);
}

.feed-list {
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.feed-empty {
  padding: 24px 12px;
  text-align: center;
  font-size: 12px;
  color: #737373;
}

.event-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 10px 12px;
  transition: background 0.12s ease, border-color 0.12s ease;
}

.event-card--clickable {
  cursor: pointer;
}

.event-card--clickable:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.14);
}

.event-card--active {
  background: rgba(250, 204, 21, 0.08);
  border-color: rgba(250, 204, 21, 0.35);
  box-shadow: 0 0 0 1px rgba(250, 204, 21, 0.25) inset;
}

.event-card--active:hover {
  background: rgba(250, 204, 21, 0.12);
}

.event-active-pin {
  flex-shrink: 0;
  filter: drop-shadow(0 0 2px currentColor);
}

.event-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.event-rel {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #a3a3a3;
  flex-grow: 1;
}

.event-cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  flex-shrink: 0;
}

.event-cat {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #737373;
}

.event-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  margin: 2px 0 4px;
}

.event-desc {
  font-size: 12px;
  line-height: 1.45;
  color: #d4d4d4;
  margin: 0;
}

.event-locate {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 10px;
  color: #facc15;
}

/* Linker Akzent pro Kategorie */
.event-card--politics { border-left: 3px solid #dc2626; }
.event-card--diplomacy { border-left: 3px solid #2563eb; }
.event-card--command { border-left: 3px solid #7c3aed; }
.event-card--technology { border-left: 3px solid #0891b2; }
.event-card--partisan { border-left: 3px solid #16a34a; }
.event-card--logistics { border-left: 3px solid #ea580c; }
.event-card--symbolic { border-left: 3px solid #f59e0b; }
.event-card--milestone { border-left: 3px solid #737373; }
</style>
