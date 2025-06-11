<template>
  <div class="periodic-table-tab-content">
    <PeriodicTable />
    <div class="info-panel-wrapper">
      <div v-if="selectedElementInfo" class="selected-element-info-panel">
        <div class="panel-header">
          <span class="element-symbol" :style="{ color: selectedElementInfo.color }">{{ selectedElementInfo.symbol }}</span>
          <h3>{{ selectedElementInfo.name }}</h3>
        </div>
        <div class="panel-content">
          <div v-if="!selectedElementInfo.isPlaceholder" class="element-details-grid">
            <div class="details-column">
              <div class="info-grid">
                <div><strong>ID:</strong> <span>{{ selectedElementInfo.id }}</span></div>
                <div><strong>Magnitude:</strong> <span>{{ selectedElementInfo.atomicMass }}</span></div>
                <div><strong>Entropy:</strong> <span>{{ selectedElementInfo.entropy }}</span></div>
                <div><strong>Stability:</strong> <span>{{ selectedElementInfo.stability }}</span></div>
              </div>
              <div class="quantum-details">
                <h4>Quantum Profile</h4>
                <p><strong>Excitatory:</strong> {{ selectedElementInfo.excitatory }}</p>
                <p><strong>Inhibitory:</strong> {{ selectedElementInfo.inhibitory }}</p>
                <p><strong>Neutral:</strong> {{ selectedElementInfo.neutral }}</p>
              </div>
            </div>
            <div class="details-column">
              <div class="components-details">
                <h4>Vector Components</h4>
                <div class="components-list">
                  {{ selectedElementInfo.vector.components.map(c => c.toFixed(3)).join(', ') }}
                </div>
              </div>
              <div v-if="selectedElementInfo.vectors && selectedElementInfo.vectors.length > 1" class="stacked-vectors-details">
                <h4>Stacked Vectors ({{selectedElementInfo.vectors.length}})</h4>
                <div class="stacked-vectors-list">
                  IDs: {{ selectedElementInfo.vectors.map(v => v.id).join(', ') }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="placeholder-content">
            <div class="quantum-details">
              <h4>Quantum Profile</h4>
              <p><strong>Excitatory:</strong> {{ selectedElementInfo.excitatory }}</p>
              <p><strong>Inhibitory:</strong> {{ selectedElementInfo.inhibitory }}</p>
              <p><strong>Neutral:</strong> {{ selectedElementInfo.neutral }}</p>
            </div>
            <div class="undiscovered-text">
              This quantum state is not present in the current vector set.
            </div>
          </div>
        </div>
      </div>
      <div v-else class="placeholder-panel">
        Select an element to see its details.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { usePeriodicTable } from '../../composables/usePeriodicTable';
import { useVectorStore } from '../../stores/vectorStore';
import PeriodicTable from '../visualization/PeriodicTable.vue';

const { getElementData } = usePeriodicTable();
const vectorStore = useVectorStore();
const selectedElementInfo = ref(null);

watch(() => vectorStore.selectedVectorId, (newId) => {
  if (newId !== null) {
    selectedElementInfo.value = getElementData(newId);
  } else {
    selectedElementInfo.value = null;
  }
}, { immediate: true });
</script>

<style scoped>
.periodic-table-tab-content {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(10, 20, 30, 0.5);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: background-color 0.5s ease;
}

.info-panel-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: rgba(0,0,0,0.3);
  border-top: 1px solid rgba(255,255,255,0.1);
  min-height: 220px;
}

.selected-element-info-panel, .placeholder-panel {
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  transition: all 0.3s ease-in-out;
}

.placeholder-panel {
  text-align: center;
  font-size: 1.2rem;
  color: rgba(255,255,255,0.6);
  border-bottom: none;
}

.panel-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.element-symbol {
  font-size: 3rem;
  font-weight: bold;
  margin-right: 1rem;
  line-height: 1;
}

.panel-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
  font-weight: 500;
}

.panel-content {
  display: flex;
  gap: 1.5rem;
}

.element-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem 2rem;
  width: 100%;
}

.details-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0;
}

.info-grid div {
  background: none;
  padding: 0.25rem 0;
  font-size: 0.95rem;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.info-grid strong {
  opacity: 0.8;
  color: #a0aec0;
}

.quantum-details, .components-details, .stacked-vectors-details {
  margin-top: 0;
}

h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #667eea;
  border-bottom: 1px solid rgba(102, 126, 234, 0.3);
  padding-bottom: 0.5rem;
  font-size: 1.1rem;
}

.components-details {
  margin-top: 0;
}

.components-list {
  background: rgba(0,0,0,0.3);
  padding: 0.75rem;
  border-radius: 6px;
  max-height: 100px;
  overflow-y: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  word-break: break-all;
  line-height: 1.4;
}

.placeholder-content {
  width: 100%;
}

.undiscovered-text {
  margin-top: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  text-align: center;
  font-style: italic;
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
}

.stacked-vectors-details {
  margin-top: 0;
}

.stacked-vectors-list {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #bec8f1;
  max-height: 100px;
  overflow-y: auto;
}
</style> 