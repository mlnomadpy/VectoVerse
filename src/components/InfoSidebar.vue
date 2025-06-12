<template>
  <aside class="info-sidebar" :class="{ collapsed: uiStore.sidebarCollapsed }">
    <div class="sidebar-toggle" @click="uiStore.toggleSidebar">
      <i class="arrow" :class="{ left: !uiStore.sidebarCollapsed, right: uiStore.sidebarCollapsed }"></i>
    </div>
    <div class="sidebar-content">
      <div v-if="selectedVector" class="vector-details">
        <h4>Vector #{{ selectedVector.id }} Details</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span>Magnitude</span>
            <strong v-if="vectorStats.magnitude" v-math="math.createMagnitudeFormula(vectorStats.magnitude)"></strong>
          </div>
          <div class="stat-item">
            <span>Entropy</span>
             <strong v-if="vectorStats.entropy" v-math="math.createEntropyFormula(vectorStats.entropy)"></strong>
          </div>
        </div>
        
        <h5>Components ({{ selectedVector.components.length }}D)</h5>
        <div class="components-view" v-math="math.createVectorNotation(selectedVector.components)">
        </div>

        <h5>Similarities</h5>
        <div v-if="similarities.length > 0" class="similarities-list">
           <ul>
            <li v-for="sim in similarities" :key="sim.id">
              <span>vs #{{ sim.id }}</span>
              <strong :style="{ color: sim.color }">{{ sim.similarity.toFixed(3) }}</strong>
            </li>
          </ul>
        </div>
         <div v-else class="no-data">
          No other vectors to compare.
        </div>
      </div>
      <div v-else class="no-selection">
        <p>Select a vector to see its details.</p>
        <div v-math="math.createCosineSimilarityFormula()"></div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useVectorStore } from '../stores/vectorStore'
import { useUIStore } from '../stores/uiStore'
import { useMathRenderer } from '../composables/useMathRenderer'
import { vectorStatistics, vectorOperations } from '../utils/vectorUtils'

const vectorStore = useVectorStore()
const uiStore = useUIStore()
const math = useMathRenderer()

const selectedVector = computed(() => vectorStore.selectedVector)

const vectorStats = computed(() => {
  if (!selectedVector.value) return {}
  return {
      magnitude: vectorOperations.magnitude(selectedVector.value.components),
      entropy: vectorStatistics.entropy(selectedVector.value.components),
  }
})

const similarities = computed(() => {
  if (!selectedVector.value) return []
  return vectorStore.vectors
    .filter(v => v.id !== selectedVector.value.id)
    .map(v => {
      const sim = vectorOperations.cosineSimilarity(selectedVector.value.components, v.components)
      return {
        id: v.id,
        similarity: sim,
        color: `hsl(${120 * sim}, 100%, 50%)`
      }
    })
    .sort((a,b) => b.similarity - a.similarity)
    .slice(0, 10)
})

const vMath = {
  mounted(el, binding) {
    el.innerHTML = binding.value
    math.renderMath(el)
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
        el.innerHTML = binding.value
        math.renderMath(el)
    }
  }
}

</script>

<style scoped>
.info-sidebar {
  width: 300px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: width 0.3s ease;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  border-left: 1px solid var(--border-color);
}

.info-sidebar.collapsed {
  width: 20px;
}

.sidebar-toggle {
  position: absolute;
  left: -15px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 50px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-right: none;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.sidebar-toggle:hover {
  background-color: var(--accent-primary);
}
.arrow {
  border: solid var(--text-primary);
  border-width: 0 3px 3px 0;
  display: inline-block;
  padding: 3px;
  transition: transform 0.2s;
}
.left { transform: rotate(135deg); }
.right { transform: rotate(-45deg); }


.sidebar-content {
  padding: 1rem;
  overflow: hidden;
  height: 100%;
}

.info-sidebar.collapsed .sidebar-content {
  display: none;
}

.vector-details h4 {
  margin-top: 0;
  color: var(--accent-primary);
}
.vector-details h5 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-size: 0.8em;
  letter-spacing: 0.5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
    background-color: var(--bg-secondary);
    padding: 0.75rem;
    border-radius: 6px;
    text-align: center;
}

.stat-item span {
  font-size: 0.8em;
  color: var(--text-secondary);
  display: block;
}

.stat-item strong {
    font-size: 1.2em;
    color: var(--text-primary);
    display: block;
    margin-top: 0.25rem;
    min-height: 25px;
}

.components-view {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.similarities-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}
.similarities-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-radius: 4px;
}
.similarities-list li:nth-child(odd) {
  background-color: var(--bg-secondary);
}

.no-selection, .no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

:deep(.katex) {
  font-size: 1.1em !important;
}

:deep(.katex-display) {
  margin: 0.5em 0 !important;
}
</style>
