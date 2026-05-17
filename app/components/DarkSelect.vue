<template>
  <div ref="root" class="dsel" :class="{ 'dsel--open': open }">
    <button
      ref="triggerEl"
      type="button"
      class="dsel-trigger"
      :aria-haspopup="'listbox'"
      :aria-expanded="open"
      @click="toggle"
      @keydown.down.prevent="openMenu()"
      @keydown.enter.prevent="toggle"
    >
      <span class="dsel-value">{{ selectedLabel }}</span>
      <svg viewBox="0 0 12 8" width="10" height="7" class="dsel-chevron">
        <path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <Teleport to="body">
      <ul
        v-if="open"
        class="dsel-menu"
        role="listbox"
        :style="menuStyle"
      >
        <li
          v-for="opt in options"
          :key="String(opt.value)"
          class="dsel-option"
          :class="{ 'dsel-option--active': isSelected(opt.value) }"
          role="option"
          :aria-selected="isSelected(opt.value)"
          @click="pick(opt.value)"
        >
          {{ opt.label }}
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup lang="ts" generic="V extends string | number">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

interface Option {
  value: V
  label: string
}

const props = defineProps<{
  modelValue: V
  options: Option[]
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: V): void }>()

const open = ref(false)
const root = ref<HTMLDivElement>()
const triggerEl = ref<HTMLButtonElement>()
// Menu liegt via <Teleport to="body"> außerhalb des Stacking-Contextes vom
// BattleDetail/Header — Position berechnen wir aus dem Trigger-BoundingRect.
const menuStyle = ref<Record<string, string>>({})

const selectedLabel = computed(
  () => props.options.find((o) => o.value === props.modelValue)?.label ?? '',
)

function isSelected(v: V) {
  return v === props.modelValue
}

async function recalcMenuPosition() {
  await nextTick()
  const t = triggerEl.value
  if (!t) return
  const r = t.getBoundingClientRect()
  menuStyle.value = {
    // Öffnet nach oben (Timeline liegt unten am Viewport-Rand), rechtsbündig
    // zum Trigger damit es nie nach rechts aus dem Viewport rausragt.
    bottom: `${window.innerHeight - r.top + 4}px`,
    right: `${window.innerWidth - r.right}px`,
    minWidth: `${r.width}px`,
  }
}

function toggle() {
  if (open.value) {
    open.value = false
  } else {
    openMenu()
  }
}

function openMenu() {
  open.value = true
  recalcMenuPosition()
}

function pick(v: V) {
  emit('update:modelValue', v)
  open.value = false
}

function onDocClick(e: MouseEvent) {
  if (!open.value) return
  const target = e.target as Node
  if (root.value?.contains(target)) return
  // Klick im teleporteten Menu nicht als "outside" werten.
  const menu = document.querySelector('.dsel-menu')
  if (menu?.contains(target)) return
  open.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) open.value = false
}

function onWindowChange() {
  if (open.value) recalcMenuPosition()
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onWindowChange)
  window.addEventListener('scroll', onWindowChange, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onWindowChange)
  window.removeEventListener('scroll', onWindowChange, true)
})
</script>

<style scoped>
.dsel {
  position: relative;
}

.dsel-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: #f5f5f5;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.12s ease, background 0.12s ease;
}

.dsel-trigger:hover {
  background: rgba(255, 255, 255, 0.09);
}

.dsel--open .dsel-trigger,
.dsel-trigger:focus {
  outline: none;
  border-color: #facc15;
}

.dsel-value {
  white-space: nowrap;
}

.dsel-chevron {
  color: #a3a3a3;
  transition: transform 0.15s ease;
  flex-shrink: 0;
}

.dsel--open .dsel-chevron {
  transform: rotate(180deg);
}
</style>

<style>
/* Unscoped, weil das Menu per Teleport im <body> landet — scoped styles
   würden mit data-v-Attributen nicht greifen. */
.dsel-menu {
  position: fixed;
  margin: 0;
  padding: 4px;
  list-style: none;
  background: rgba(20, 20, 20, 0.98);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  z-index: 200;
  font-family: 'Inter', system-ui, sans-serif;
}

.dsel-option {
  padding: 6px 10px;
  font-size: 13px;
  color: #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.dsel-option:hover {
  background: rgba(255, 255, 255, 0.08);
}

.dsel-option--active {
  background: rgba(250, 204, 21, 0.15);
  color: #facc15;
}

.dsel-option--active:hover {
  background: rgba(250, 204, 21, 0.22);
}
</style>
