<template>
  <div class="presets-modal">
    <header class="modal-header">
      <h3>Manage Presets</h3>
      <button class="close-button" @click="$emit('close')">&times;</button>
    </header>
    <div class="modal-content">
      <div class="new-preset-form">
        <input v-model="newPresetName" placeholder="New preset name..." />
        <button @click="saveCurrentPreset" :disabled="!newPresetName">Save Current</button>
      </div>

      <div class="presets-list">
        <h4>Saved Presets</h4>
        <div v-if="controls.presets.value.length === 0" class="no-presets">
          No presets saved yet.
        </div>
        <ul>
          <li v-for="preset in controls.presets.value" :key="preset.name">
            <span class="preset-name">{{ preset.name }}</span>
            <div class="preset-actions">
              <button class="btn-compact" @click="loadSelectedPreset(preset.name)">Load</button>
              <button class="btn-compact btn-danger" @click="deleteSelectedPreset(preset.name)">Delete</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useControls } from '../../composables/useControls'
import { useUIStore } from '../../stores/uiStore'

const controls = useControls()
const uiStore = useUIStore()
const newPresetName = ref('')

defineEmits(['close'])

const saveCurrentPreset = () => {
  controls.savePreset(newPresetName.value)
  newPresetName.value = ''
  uiStore.showSuccess(`Preset "${newPresetName.value}" saved!`)
}

const loadSelectedPreset = (name) => {
  controls.loadPreset(name)
  uiStore.showSuccess(`Preset "${name}" loaded!`)
  uiStore.hideModal('presets')
}

const deleteSelectedPreset = (name) => {
    controls.deletePreset(name);
    uiStore.showSuccess(`Preset "${name}" deleted!`);
}

</script>

<style scoped>
.presets-modal {
  width: 400px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}
.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}
.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.modal-content {
  padding-top: 1rem;
}

.new-preset-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.new-preset-form input {
  flex-grow: 1;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
}
.new-preset-form button {
  padding: 0.5rem 1rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.new-preset-form button:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.presets-list h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-size: 0.8em;
}

.presets-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
}
.presets-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 4px;
}
.presets-list li:nth-child(odd) {
  background-color: var(--bg-secondary);
}

.preset-name {
  font-weight: 500;
}

.preset-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-danger {
  background-color: #e53935;
  color: white;
}
.no-presets {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-style: italic;
}
</style> 