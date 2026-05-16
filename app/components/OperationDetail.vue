<template>
  <Transition name="slide">
    <aside v-if="operation" class="detail-panel">
      <figure v-if="wiki?.thumbnail" class="detail-hero">
        <a
          v-if="wiki.originalImage"
          :href="wiki.originalImage.source"
          target="_blank"
          rel="noopener noreferrer"
          :title="`${wiki.title} — Bild in voller Auflösung öffnen`"
        >
          <img
            :src="wiki.thumbnail.source"
            :alt="wiki.title"
            :width="wiki.thumbnail.width"
            :height="wiki.thumbnail.height"
            loading="lazy"
          />
        </a>
        <img
          v-else
          :src="wiki.thumbnail.source"
          :alt="wiki.title"
          :width="wiki.thumbnail.width"
          :height="wiki.thumbnail.height"
          loading="lazy"
        />
        <figcaption class="detail-hero-credit">Bild: Wikimedia Commons</figcaption>
      </figure>

      <header class="detail-header">
        <div>
          <div
            class="detail-badge"
            :class="operation.side === 'axis' ? 'detail-badge--axis' : 'detail-badge--soviet'"
          >
            {{ operation.side === 'axis' ? 'Achsen-Offensive' : 'Sowjetische Offensive' }}
          </div>
          <h2 class="detail-title">{{ operation.name }}</h2>
          <div class="detail-period">{{ formatRange(operation.start, operation.end) }}</div>
        </div>
        <button class="close-btn" aria-label="Schließen" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
      </header>

      <p class="detail-summary">{{ operation.summary }}</p>

      <section v-if="wikiLoading" class="detail-wiki detail-wiki--loading">
        <div class="detail-wiki-label">Aus der Wikipedia</div>
        <p class="detail-wiki-extract">Lead-Text wird geladen …</p>
      </section>
      <section v-else-if="wiki" class="detail-wiki">
        <div class="detail-wiki-label">Aus der Wikipedia</div>
        <p class="detail-wiki-extract">{{ wiki.extract }}</p>
        <a
          class="detail-wiki-link"
          :href="wiki.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          Vollständigen Artikel öffnen
          <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true">
            <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zM19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7z" />
          </svg>
        </a>
      </section>

      <section v-if="labeledThrusts.length" class="thrusts">
        <div class="thrusts-label">
          Stoßrichtungen
          <span class="thrusts-count">· {{ labeledThrusts.length }}</span>
        </div>
        <ul class="thrusts-list">
          <li
            v-for="(thrust, i) in labeledThrusts"
            :key="i"
            class="thrust-card"
            :class="`thrust-card--${operation.side}`"
          >
            <span class="thrust-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M4 11h12.17l-5.59-5.59L12 4l8 8-8 8-1.41-1.41L16.17 13H4v-2z" />
              </svg>
            </span>
            <span class="thrust-label">{{ thrust.label }}</span>
          </li>
        </ul>
      </section>

      <section v-if="relatedBattles.length" class="related">
        <div class="related-label">Schlachten im Zeitraum</div>
        <ul class="related-list">
          <li v-for="b in relatedBattles" :key="b.id">
            <button type="button" class="related-link" @click="$emit('select-battle', b)">
              <span class="related-dot" :class="b.major ? 'related-dot--major' : ''" />
              <span class="related-name">{{ b.name }}</span>
              <span class="related-date">{{ formatShort(b.start) }}</span>
            </button>
          </li>
        </ul>
      </section>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Operation } from '~/data/operations'
import { BATTLES, type Battle } from '~/data/battles'
import { haversineKm } from '~/lib/geo'
import { fetchWikiSummary, type WikiSummary } from '~/lib/wikipedia'

const props = defineProps<{
  operation: Operation | null
}>()
defineEmits<{
  (e: 'close'): void
  (e: 'select-battle', battle: Battle): void
}>()

const DATE_FMT = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const DATE_FMT_SHORT = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
})

function formatRange(start: string, end: string) {
  return `${DATE_FMT.format(new Date(start))} – ${DATE_FMT.format(new Date(end))}`
}
function formatShort(d: string) {
  return DATE_FMT_SHORT.format(new Date(d))
}

const wiki = ref<WikiSummary | null>(null)
const wikiLoading = ref(false)

const labeledThrusts = computed(() =>
  props.operation ? props.operation.thrusts.filter((t) => t.label) : [],
)

// Schlachten, deren Zeitraum mit der Operation überlappt und die geografisch
// in Reichweite eines Thrust-Endpunkts liegen (≤ 400 km zum nächsten Endpunkt).
// 400 km, damit auch breitflächige Operationen wie Bagration/Dnepr alle
// zugeordneten Schlachten erfassen.
const RELATED_BATTLE_RADIUS_KM = 400
const relatedBattles = computed<Battle[]>(() => {
  if (!props.operation) return []
  const op = props.operation
  const opStart = new Date(op.start).getTime()
  const opEnd = new Date(op.end).getTime()
  const ends = op.thrusts.map((t) => t.end)
  return BATTLES.filter((b) => {
    const bStart = new Date(b.start).getTime()
    const bEnd = new Date(b.end).getTime()
    if (bEnd < opStart || bStart > opEnd) return false
    return ends.some(
      ([lon, lat]) => haversineKm([lon, lat], b.coordinates) <= RELATED_BATTLE_RADIUS_KM,
    )
  }).sort((a, b) => a.start.localeCompare(b.start))
})

watch(
  () => props.operation?.id,
  async (id) => {
    wiki.value = null
    wikiLoading.value = false
    if (!id || !props.operation?.wikipediaSlug) return
    const slug = props.operation.wikipediaSlug
    wikiLoading.value = true
    const result = await fetchWikiSummary(slug)
    if (props.operation?.wikipediaSlug === slug) {
      wiki.value = result
    }
    wikiLoading.value = false
  },
  { immediate: true },
)
</script>

<style scoped>
.detail-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 420px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  background: rgba(15, 15, 15, 0.96);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f5f5f5;
  padding: 20px;
  z-index: 10;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.detail-hero {
  position: relative;
  margin: -20px -20px 14px;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  background: #000;
}

.detail-hero img {
  display: block;
  width: 100%;
  height: 180px;
  object-fit: cover;
  object-position: center;
  filter: saturate(0.85) contrast(1.05);
}

.detail-hero a:hover img {
  filter: saturate(1) contrast(1.05);
}

.detail-hero-credit {
  position: absolute;
  bottom: 6px;
  right: 8px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.55);
  padding: 2px 6px;
  border-radius: 3px;
  letter-spacing: 0.04em;
  pointer-events: none;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.detail-badge {
  display: inline-block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.detail-badge--axis {
  background: rgba(185, 28, 28, 0.18);
  color: #f87171;
}

.detail-badge--soviet {
  background: rgba(250, 204, 21, 0.15);
  color: #facc15;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.detail-period {
  font-size: 13px;
  color: #a3a3a3;
  margin-top: 4px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f5f5f5;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.detail-summary {
  font-size: 14px;
  line-height: 1.55;
  color: #d4d4d4;
  margin-bottom: 14px;
}

.detail-wiki {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 12px 12px;
  margin-bottom: 16px;
}

.detail-wiki--loading .detail-wiki-extract {
  color: #737373;
  font-style: italic;
}

.detail-wiki-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #737373;
  margin-bottom: 6px;
}

.detail-wiki-extract {
  font-size: 13px;
  line-height: 1.5;
  color: #c4c4c4;
  margin: 0 0 8px;
}

.detail-wiki-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #facc15;
  text-decoration: none;
  border-bottom: 1px solid rgba(250, 204, 21, 0.3);
  padding-bottom: 1px;
}

.detail-wiki-link:hover {
  color: #fde047;
  border-bottom-color: rgba(250, 204, 21, 0.7);
}

.thrusts {
  margin-bottom: 16px;
}

.thrusts-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #737373;
  margin-bottom: 8px;
}

.thrusts-count {
  color: #525252;
  font-weight: 400;
  letter-spacing: 0;
}

.thrusts-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.thrust-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 12px;
}

.thrust-card--axis {
  border-left: 2px solid #b91c1c;
}

.thrust-card--soviet {
  border-left: 2px solid #facc15;
}

.thrust-arrow {
  display: inline-flex;
  color: #a3a3a3;
}

.thrust-card--axis .thrust-arrow {
  color: #f87171;
}

.thrust-card--soviet .thrust-arrow {
  color: #facc15;
}

.thrust-label {
  color: #e5e5e5;
}

.related {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
}

.related-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #737373;
  margin-bottom: 6px;
}

.related-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.related-link {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: transparent;
  border: none;
  color: inherit;
  padding: 6px 0;
  cursor: pointer;
  text-align: left;
  font-size: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.related-list li:last-child .related-link {
  border-bottom: none;
}

.related-link:hover .related-name {
  color: #facc15;
}

.related-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #facc15;
  flex-shrink: 0;
}

.related-dot--major {
  background: #ef4444;
}

.related-name {
  color: #e5e5e5;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-date {
  color: #737373;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
