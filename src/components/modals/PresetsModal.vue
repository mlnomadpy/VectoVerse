<template>
  <div>
    <div class="new-preset-form">
      <input v-model="newPresetName" placeholder="New preset name..." class="form-input" />
      <button @click="saveCurrentPreset" :disabled="!newPresetName" class="btn btn-primary">Save Current</button>
    </div>

    <div class="presets-list">
      <h4 class="list-header">Saved Presets</h4>
      <div v-if="!controls.presets.value || controls.presets.value.length === 0" class="no-presets">
        No presets saved yet.
      </div>
      <ul v-else>
        <li v-for="preset in controls.presets.value" :key="preset.name">
          <span class="preset-name">{{ preset.name }}</span>
          <div class="preset-actions">
            <button class="btn btn-secondary" @click="loadSelectedPreset(preset.name)">Load</button>
            <button class="btn btn-danger" @click="deleteSelectedPreset(preset.name)">Delete</button>
          </div>
        </li>
      </ul>
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
  if (!newPresetName.value) return;
  const presetName = newPresetName.value;
  controls.savePreset(presetName)
  newPresetName.value = ''
  uiStore.showSuccess(`Preset "${presetName}" saved!`)
}

const loadSelectedPreset = (name) => {
  controls.loadPreset(name)
  uiStore.showSuccess(`Preset "${name}" loaded!`)
  emit('close');
}

const deleteSelectedPreset = (name) => {
    controls.deletePreset(name);
    uiStore.showSuccess(`Preset "${name}" deleted!`);
}
</script>

<style scoped>
.new-preset-form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.form-input {
  flex-grow: 1;
  padding: 0.75rem;
  background: #1e1e1e;
  border: 1px solid #444;
  border-radius: 6px;
  color: #f5f5f7;
  font-size: 1rem;
}

.form-input::placeholder {
  color: #888;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

.btn-primary {
  background-color: #007aff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn:disabled {
  background-color: #555;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.list-header {
  margin: 0 0 0.75rem 0;
  color: #a0a0a5;
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.presets-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid #444;
  border-radius: 6px;
}

.presets-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #444;
}

.presets-list li:last-child {
  border-bottom: none;
}

.presets-list li:hover {
  background-color: #3a3a3c;
}

.preset-name {
  font-weight: 500;
  color: #f5f5f7;
}

.preset-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-secondary {
  background-color: #555;
  color: white;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
}
.btn-secondary:hover {
  background-color: #777;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
}
.btn-danger:hover {
  background-color: #c82333;
}

.no-presets {
  text-align: center;
  padding: 2rem;
  color: #888;
  font-style: italic;
  border: 1px dashed #555;
  border-radius: 6px;
}
</style> 