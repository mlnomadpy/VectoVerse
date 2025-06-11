<template>
  <div class="periodic-table-tab-content">
    <div class="table-controls">
      <HeatmapControls />
      <FilterControls />
      <HighlightControls />
    </div>
    <PeriodicTable 
      v-if="vectorStore.vectors.length > 0" 
      :key="vectorStore.vectors.length"
    />
    <div class="info-panel-wrapper">
      <transition name="fade" mode="out-in">
        <!-- Single Selection View -->
        <div v-if="selectedElements.length === 1" key="single-view" class="selected-element-info-panel">
          <div class="panel-header">
            <span class="element-symbol" :style="{ color: selectedElements[0].color }">{{ selectedElements[0].symbol }}</span>
            <h3>{{ selectedElements[0].name }}</h3>
          </div>
          <div class="panel-content">
            <div v-if="!selectedElements[0].isPlaceholder" class="element-details-grid">
              <div class="details-column">
                <div class="info-grid">
                  <div><strong>ID:</strong> <span>{{ selectedElements[0].id }}</span></div>
                  <div><strong>Magnitude:</strong> <span>{{ selectedElements[0].atomicMass }}</span></div>
                  <div><strong>Entropy:</strong> <span>{{ selectedElements[0].entropy }}</span></div>
                  <div><strong>Stability:</strong> <span>{{ selectedElements[0].stability }}</span></div>
                </div>
                <div class="quantum-details">
                  <h4>Quantum Profile</h4>
                  <p><strong>Excitatory:</strong> {{ selectedElements[0].excitatory }}</p>
                  <p><strong>Inhibitory:</strong> {{ selectedElements[0].inhibitory }}</p>
                  <p><strong>Neutral:</strong> {{ selectedElements[0].neutral }}</p>
                </div>
              </div>
              <div class="details-column">
                <div class="components-details">
                  <h4>Vector Components</h4>
                  <div class="components-list">
                    <SparklineChart v-if="selectedElements[0].vector" :components="selectedElements[0].vector.components" />
                  </div>
                </div>
                <div v-if="selectedElements[0].vectors && selectedElements[0].vectors.length > 1" class="stacked-vectors-details">
                  <h4>Stacked Vectors ({{selectedElements[0].vectors.length}})</h4>
                  <div class="stacked-vectors-list">
                    <p>Properties shown are averages for the stack.</p>
                    <strong>IDs:</strong> {{ selectedElements[0].vectors.map(v => v.id).join(', ') }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="placeholder-content">
              <div class="quantum-details">
                <h4>Quantum Profile</h4>
                <p><strong>Excitatory:</strong> {{ selectedElements[0].excitatory }}</p>
                <p><strong>Inhibitory:</strong> {{ selectedElements[0].inhibitory }}</p>
                <p><strong>Neutral:</strong> {{ selectedElements[0].neutral }}</p>
              </div>
              <div class="undiscovered-text">
                This quantum state is not present in the current vector set.
              </div>
            </div>
          </div>
        </div>

        <!-- Two-Element Comparison View -->
        <div v-else-if="selectedElements.length === 2" key="comparison-view" class="comparison-panel">
          <div class="comparison-column" v-for="element in selectedElements" :key="element.id">
            <div class="panel-header">
              <span class="element-symbol" :style="{ color: element.color }">{{ element.symbol }}</span>
              <h3>{{ element.name }}</h3>
            </div>
            <div class="info-grid">
              <div><strong>Magnitude:</strong> <span :class="getComparisonClass('atomicMass', 0, 1)">{{ element.atomicMass }}</span></div>
              <div><strong>Entropy:</strong> <span :class="getComparisonClass('entropy', 0, 1)">{{ element.entropy }}</span></div>
              <div><strong>Stability:</strong> <span :class="getComparisonClass('stability', 0, 1)">{{ element.stability }}</span></div>
            </div>
             <div class="quantum-details">
              <h4>Quantum Profile</h4>
              <p><strong>Excitatory:</strong> <span :class="getComparisonClass('excitatory', 0, 1)">{{ element.excitatory }}</span></p>
              <p><strong>Inhibitory:</strong> <span :class="getComparisonClass('inhibitory', 0, 1)">{{ element.inhibitory }}</span></p>
              <p><strong>Neutral:</strong> <span>{{ element.neutral }}</span></p>
            </div>
          </div>
        </div>
        
        <!-- Multi-Selection > 2 View -->
        <div v-else-if="selectedElements.length > 2" key="multi-select-view" class="multi-select-panel">
          <h3>{{ selectedElements.length }} Elements Selected</h3>
          <div class="multi-select-list">
            <span v-for="el in selectedElements" :key="el.id" class="multi-select-item" :style="{borderColor: el.color}">
              {{ el.name }}
            </span>
          </div>
        </div>

        <!-- Default Placeholder View -->
        <div v-else key="placeholder-view" class="placeholder-panel">
          Select an element to see its details. (Ctrl+Click to select multiple)
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { usePeriodicTable } from '../../composables/usePeriodicTable';
import { useVectorStore } from '../../stores/vectorStore';
import PeriodicTable from '../visualization/PeriodicTable.vue';
import SparklineChart from '../visualization/SparklineChart.vue';
import HeatmapControls from '../controls/HeatmapControls.vue';
import FilterControls from '../controls/FilterControls.vue';
import HighlightControls from '../controls/HighlightControls.vue';

const { getElementData } = usePeriodicTable();
const vectorStore = useVectorStore();
const selectedElements = ref([]);

watch(() => vectorStore.selectedVectorIds, (newIds) => {
  const elements = [];
  newIds.forEach(id => {
    const elementData = getElementData(id);
    if (elementData) {
      elements.push(elementData);
    }
  });
  selectedElements.value = elements;
}, { deep: true, immediate: true });

const getComparisonClass = (property, index1, index2) => {
  if (selectedElements.value.length !== 2) return '';
  const val1 = selectedElements.value[index1][property];
  const val2 = selectedElements.value[index2][property];
  if (val1 > val2) return 'is-higher';
  if (val2 > val1) return 'is-lower';
  return 'is-same';
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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

.table-controls {
  padding: 0.5rem 1rem;
  background: rgba(0,0,0,0.2);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  align-items: center;
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

.stacked-vectors-list p {
  margin: 0 0 0.5rem 0;
  font-style: italic;
  font-size: 0.85rem;
  opacity: 0.8;
}

.stacked-vectors-list strong {
  font-weight: 600;
}

.comparison-panel {
  display: flex;
  gap: 2rem;
  width: 100%;
}
.comparison-column {
  flex: 1;
  background: rgba(255,255,255,0.05);
  padding: 1rem;
  border-radius: 8px;
}
.is-higher { color: #34d399; font-weight: bold; }
.is-lower { color: #f87171; }
.is-same { color: #60a5fa; }

.multi-select-panel {
  width: 100%;
  text-align: center;
}
.multi-select-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}
.multi-select-item {
  background: rgba(255,255,255,0.1);
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  border-left: 3px solid;
}
</style> 