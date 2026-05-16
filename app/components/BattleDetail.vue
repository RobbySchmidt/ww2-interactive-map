<template>
  <Transition name="slide">
    <aside v-if="battle" class="detail-panel">
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
          <div class="detail-badge" :class="{ 'detail-badge--major': battle.major }">
            {{ battle.major ? 'Großschlacht' : 'Gefecht' }}
          </div>
          <h2 class="detail-title">{{ battle.name }}</h2>
          <div class="detail-period">{{ formatRange(battle.start, battle.end) }}</div>
        </div>
        <button class="close-btn" aria-label="Schließen" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
      </header>

      <p class="detail-summary">{{ battle.summary }}</p>

      <section v-if="wiki" class="detail-wiki">
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

      <div class="detail-outcome">
        <span class="outcome-label">Ausgang</span>
        <span class="outcome-text">{{ battle.outcome }}</span>
      </div>

      <div class="forces-grid">
        <div
          v-for="force in battle.forces"
          :key="force.side"
          class="force-card"
          :class="`force-card--${force.side}`"
        >
          <div class="force-header">
            {{ force.side === 'axis' ? 'Achse' : 'Sowjetunion' }}
          </div>
          <dl class="force-stats">
            <template v-if="force.commander">
              <dt>Befehlshaber</dt>
              <dd>{{ force.commander }}</dd>
            </template>
            <template v-if="force.troops">
              <dt>Truppenstärke</dt>
              <dd>{{ force.troops }}</dd>
            </template>
            <template v-if="force.tanks">
              <dt>Panzer</dt>
              <dd>{{ force.tanks }}</dd>
            </template>
            <template v-if="force.aircraft">
              <dt>Flugzeuge</dt>
              <dd>{{ force.aircraft }}</dd>
            </template>
            <template v-if="force.casualties">
              <dt>Verluste</dt>
              <dd>{{ force.casualties }}</dd>
            </template>
          </dl>
          <div v-if="force.units?.length" class="force-units">
            <div class="units-label">Beteiligte Verbände</div>
            <ul>
              <li v-for="unit in force.units" :key="unit">{{ unit }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div v-if="battle.notableUnits?.length" class="notable">
        <div class="notable-label">Bemerkenswert</div>
        <ul>
          <li v-for="u in battle.notableUnits" :key="u">{{ u }}</li>
        </ul>
      </div>

      <section v-if="!battleMode && gallery.length" class="detail-thumb-preview">
        <div class="detail-thumb-preview-label">
          Bildergalerie
          <span class="detail-thumb-preview-count">· {{ gallery.length }} Bilder</span>
        </div>
        <div class="detail-thumb-preview-grid">
          <button
            v-for="img in previewThumbs"
            :key="img.title"
            type="button"
            class="detail-thumb-preview-tile"
            :title="img.title.replace(/^Datei:/, '').replace(/_/g, ' ')"
            @click="lightbox = img"
          >
            <img :src="img.thumb" :alt="img.title" loading="lazy" />
          </button>
          <button
            v-if="gallery.length > PREVIEW_COUNT"
            type="button"
            class="detail-thumb-preview-more"
            :title="`Alle ${gallery.length} Bilder im Detail-Modus ansehen`"
            @click="$emit('enter-battle-mode')"
          >
            +{{ gallery.length - PREVIEW_COUNT }}
          </button>
        </div>
      </section>

      <div class="detail-mode-switch">
        <button
          v-if="!battleMode"
          type="button"
          class="mode-btn mode-btn--enter"
          :disabled="!battle.wikipediaSlug"
          @click="$emit('enter-battle-mode')"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 5 1.49-1.49-5-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" />
          </svg>
          In Schlacht-Detail wechseln
        </button>
        <button
          v-else
          type="button"
          class="mode-btn mode-btn--leave"
          @click="$emit('leave-battle-mode')"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Zurück zur Welt-Ansicht
        </button>
      </div>

      <section v-if="battleMode" class="detail-gallery">
        <div class="detail-gallery-label">
          Bildergalerie
          <span v-if="gallery.length" class="detail-gallery-count">· {{ gallery.length }} Bilder</span>
        </div>
        <div v-if="galleryLoading" class="detail-gallery-loading">Bilder werden geladen …</div>
        <div v-else-if="!gallery.length" class="detail-gallery-empty">
          Keine Bilder aus dem Wikipedia-Artikel verfügbar.
        </div>
        <div v-else class="detail-gallery-grid">
          <button
            v-for="img in gallery"
            :key="img.title"
            type="button"
            class="detail-gallery-tile"
            :title="img.title.replace(/^Datei:/, '').replace(/_/g, ' ')"
            @click="lightbox = img"
          >
            <img :src="img.thumb" :alt="img.title" loading="lazy" />
          </button>
        </div>
      </section>
    </aside>
  </Transition>

  <Teleport to="body">
    <div v-if="lightbox" class="lightbox" @click="lightbox = null">
      <button class="lightbox-close" type="button" aria-label="Schließen" @click.stop="lightbox = null">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
      <img :src="lightbox.original" :alt="lightbox.title" class="lightbox-img" @click.stop />
      <div class="lightbox-caption">{{ lightbox.title.replace(/^Datei:/, '').replace(/_/g, ' ') }}</div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Battle } from '~/data/battles'
import { fetchWikiSummary, fetchWikiGallery, type WikiSummary, type WikiImage } from '~/lib/wikipedia'

const props = defineProps<{
  battle: Battle | null
  battleMode: boolean
}>()
defineEmits<{
  (e: 'close'): void
  (e: 'enter-battle-mode'): void
  (e: 'leave-battle-mode'): void
}>()

const DATE_FMT = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function formatRange(start: string, end: string) {
  return `${DATE_FMT.format(new Date(start))} – ${DATE_FMT.format(new Date(end))}`
}

const wiki = ref<WikiSummary | null>(null)
const gallery = ref<WikiImage[]>([])
const galleryLoading = ref(false)
const lightbox = ref<WikiImage | null>(null)

// Wie viele Thumbs in der Preview-Reihe im Nicht-Detail-Modus.
const PREVIEW_COUNT = 4
const previewThumbs = computed(() => gallery.value.slice(0, PREVIEW_COUNT))

watch(
  () => props.battle?.id,
  async (id) => {
    wiki.value = null
    if (!id || !props.battle?.wikipediaSlug) return
    const slug = props.battle.wikipediaSlug
    const result = await fetchWikiSummary(slug)
    if (props.battle?.wikipediaSlug === slug) {
      wiki.value = result
    }
  },
  { immediate: true },
)

// Galerie immer laden, sobald eine Schlacht mit Wiki-Slug ausgewählt wird —
// dadurch können wir auch im normalen Modus eine kleine Thumb-Vorschau zeigen.
// fetchWikiGallery cached 24h in LocalStorage, also unkritisch beim erneuten Öffnen.
watch(
  () => props.battle?.id,
  async (id) => {
    gallery.value = []
    if (!id || !props.battle?.wikipediaSlug) return
    const slug = props.battle.wikipediaSlug
    galleryLoading.value = true
    const result = await fetchWikiGallery(slug)
    if (props.battle?.wikipediaSlug === slug) {
      gallery.value = result
    }
    galleryLoading.value = false
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
  background: rgba(250, 204, 21, 0.15);
  color: #facc15;
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.detail-badge--major {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
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

.detail-outcome {
  background: rgba(255, 255, 255, 0.04);
  border-left: 3px solid #facc15;
  padding: 10px 12px;
  border-radius: 0 6px 6px 0;
  margin-bottom: 18px;
}

.outcome-label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #737373;
  margin-bottom: 2px;
}

.outcome-text {
  font-size: 13px;
  color: #f5f5f5;
}

.forces-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

.force-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px;
}

.force-card--axis {
  border-top: 2px solid #8b1e1e;
}

.force-card--soviet {
  border-top: 2px solid #dc2626;
}

.force-header {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: #a3a3a3;
  margin-bottom: 8px;
}

.force-stats {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
}

.force-stats dt {
  color: #737373;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 6px;
}

.force-stats dt:first-child {
  margin-top: 0;
}

.force-stats dd {
  margin: 0;
  color: #e5e5e5;
}

.force-units {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.units-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #737373;
  margin-bottom: 4px;
}

.force-units ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 11px;
  color: #d4d4d4;
}

.force-units li {
  padding: 2px 0;
}

.notable {
  background: rgba(250, 204, 21, 0.05);
  border: 1px solid rgba(250, 204, 21, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
}

.notable-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #facc15;
  margin-bottom: 4px;
}

.notable ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 12px;
  color: #e5e5e5;
}

.notable li {
  padding: 2px 0;
}

.detail-thumb-preview {
  margin-top: 14px;
  padding: 10px 12px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.detail-thumb-preview-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #737373;
  margin-bottom: 8px;
}

.detail-thumb-preview-count {
  color: #525252;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
}

.detail-thumb-preview-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
}

.detail-thumb-preview-tile,
.detail-thumb-preview-more {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  aspect-ratio: 1;
  transition: transform 0.12s ease, border-color 0.12s ease;
}

.detail-thumb-preview-tile:hover,
.detail-thumb-preview-more:hover {
  transform: scale(1.04);
  border-color: rgba(250, 204, 21, 0.6);
}

.detail-thumb-preview-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.detail-thumb-preview-more {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #facc15;
  background: rgba(250, 204, 21, 0.08);
  border-color: rgba(250, 204, 21, 0.25);
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

.detail-mode-switch {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.mode-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.mode-btn--enter {
  background: rgba(250, 204, 21, 0.12);
  color: #facc15;
  border-color: rgba(250, 204, 21, 0.4);
}

.mode-btn--enter:hover:not(:disabled) {
  background: rgba(250, 204, 21, 0.22);
  border-color: rgba(250, 204, 21, 0.6);
}

.mode-btn--leave {
  background: rgba(255, 255, 255, 0.06);
  color: #e5e5e5;
  border-color: rgba(255, 255, 255, 0.18);
}

.mode-btn--leave:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.detail-gallery {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-gallery-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #737373;
  margin-bottom: 10px;
}

.detail-gallery-count {
  color: #525252;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}

.detail-gallery-loading,
.detail-gallery-empty {
  font-size: 12px;
  color: #737373;
  padding: 16px 0;
  text-align: center;
}

.detail-gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.detail-gallery-tile {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  aspect-ratio: 1;
  transition: transform 0.12s ease, border-color 0.12s ease;
}

.detail-gallery-tile:hover {
  transform: scale(1.03);
  border-color: rgba(250, 204, 21, 0.6);
}

.detail-gallery-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>

<style>
/* Lightbox unscoped, weil per Teleport in body */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 40px 20px 60px;
  cursor: zoom-out;
}

.lightbox-img {
  max-width: 100%;
  max-height: calc(100vh - 140px);
  object-fit: contain;
  cursor: default;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.lightbox-caption {
  color: #d4d4d4;
  font-size: 13px;
  margin-top: 16px;
  max-width: 800px;
  text-align: center;
  font-family: 'Inter', system-ui, sans-serif;
}

.lightbox-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.16);
}
</style>
