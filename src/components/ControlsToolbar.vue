<template>
  <div class="controls-toolbar">
    <div class="toolbar-section history-controls">
        <button @click="controls.undo()" :disabled="!controls.canUndo.value" title="Undo">↩️</button>
        <button @click="controls.redo()" :disabled="!controls.canRedo.value" title="Redo">↪️</button>
    </div>

    <div class="toolbar-section">
      <ControlGroup 
        v-for="group in controlGroups" 
        :key="group.name" 
        :title="group.name"
      >
        <Control
          v-for="(config, key) in group.controls"
          :key="key"
          :id="key"
          :config="config"
          v-model="config.value"
        />
      </ControlGroup>
    </div>

    <div class="toolbar-section presets-controls">
        <h5>Presets</h5>
        <button class="btn-full" @click="uiStore.showPresetsModal">
          Manage Presets
        </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useControls } from '../composables/useControls'
import { useUIStore } from '../stores/uiStore'
import Control from './Control.vue'
import ControlGroup from './ControlGroup.vue'

const controls = useControls()
const uiStore = useUIStore()

const controlGroups = computed(() => {
  const groups = {}
  for (const key in controls.controls) {
    const config = controls.controls[key]
    if (!groups[config.group]) {
      groups[config.group] = {
        name: config.group,
        controls: {}
      }
    }
    groups[config.group].controls[key] = config
  }
  return Object.values(groups)
})

</script>

<style scoped>
.controls-toolbar {
  background: var(--sidebar-bg);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-right: 1px solid var(--border-color);
  width: 280px;
  overflow-y: auto;
}

.toolbar-section {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color-soft);
}
.toolbar-section:last-child {
  border-bottom: none;
}

.history-controls, .presets-controls .preset-buttons {
  display: flex;
  gap: 0.5rem;
}
.history-controls button, .presets-controls button {
  flex-grow: 1;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color-soft);
  color: var(--text-secondary);
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.history-controls button:hover:not(:disabled) {
  background-color: var(--primary);
  color: white;
}
.history-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.presets-controls h5 {
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    font-size: 0.8em;
    color: var(--text-secondary);
}

.btn-full {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color-soft);
    color: var(--text-primary);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-full:hover {
    background-color: var(--primary);
    color: white;
}
</style> 