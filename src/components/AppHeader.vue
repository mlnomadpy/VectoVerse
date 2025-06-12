<template>
  <header class="app-header">
    <div class="header-branding">
      <h1 class="app-title">VectoVerse</h1>
    </div>

    <div class="controls-toolbar">
      <!-- Action Buttons -->
      <div class="toolbar-section action-buttons">
        <button @click="vectorStore.generateVectors()" title="Generate new vectors (G)">🎲</button>
        <button @click="uiStore.showAddVectorModal()" title="Add a custom vector (A)">➕</button>
        <button @click="uiStore.showAnalysisModal()" title="Run analysis (R)">📊</button>
        <button @click="appActions.exportData()" title="Export data (E)">💾</button>
        <button @click="appActions.toggleFullscreen()" title="Toggle fullscreen (F)">🔍</button>
      </div>

      <!-- Main Controls -->
      <div class="toolbar-section main-controls">
        <Control v-for="(config, key) in controls.controls" :key="key" :id="key" :config="config" v-model="config.value" />
      </div>

      <!-- History -->
      <div class="toolbar-section history-controls">
        <button @click="controls.undo()" :disabled="!controls.canUndo.value" title="Undo (Ctrl+Z)">↩️</button>
        <button @click="controls.redo()" :disabled="!controls.canRedo.value" title="Redo (Ctrl+Y)">↪️</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useControls } from '../composables/useControls'
import { useUIStore } from '../stores/uiStore'
import { useVectorStore } from '../stores/vectorStore'
import { useAppActions } from '../composables/useAppActions'
import Control from './Control.vue'

const controls = useControls()
const uiStore = useUIStore()
const vectorStore = useVectorStore()
const appActions = useAppActions()
</script>

<style scoped>
.app-header {
  grid-area: header;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  height: 50px;
}

.header-branding {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.controls-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 100%;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 100%;
}

.main-controls {
  flex-grow: 1;
}

.action-buttons button,
.history-controls button {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 0 0.4rem;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-buttons button:hover,
.history-controls button:hover:not(:disabled) {
  color: var(--accent-primary);
  background-color: var(--bg-secondary);
}

.history-controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style> 