<template>
  <div class="individual-analysis-tab">
    <div v-if="loading" class="loading-state">
      <p>Analyzing Vector...</p>
    </div>
    <div v-else-if="selectedVector && vectorStats" class="analysis-content">
      <div class="vector-title">
        <h3>Analysis for Vector: <strong>{{ selectedVector.id }}</strong></h3>
      </div>
      
      <div class="sub-tabs-container">
        <div class="sub-tabs">
          <button 
            v-for="tab in subTabs" 
            :key="tab.id"
            class="sub-tab-btn" 
            :class="{ active: activeSubTab === tab.id }"
            @click="activeSubTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="sub-tab-content">
        <Transition name="fade" mode="out-in">
          <KeepAlive>
            <component 
              :is="activeComponent" 
              :stats="vectorStats" 
              :vector="selectedVector"
              :components="selectedVector.components" 
            />
          </KeepAlive>
        </Transition>
      </div>
    </div>
    <div v-else class="no-vector-selected">
      <div class="icon">📊</div>
      <h3>No Vector Selected</h3>
      <p>Click on a vector in the visualization to see its detailed analysis.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, markRaw } from 'vue'
import { useVectorStore } from '../../stores/vectorStore'
import { useVectorOperations } from '../../composables/useVectorOperations'

// Sub-components
import AnalysisOverview from './individual/AnalysisOverview.vue'
import ComponentAnalysis from './individual/ComponentAnalysis.vue'
import AdvancedStats from './individual/AdvancedStats.vue'
import VectorExplorer from './individual/VectorExplorer.vue'
import ContextualAnalysis from './individual/ContextualAnalysis.vue'

const vectorStore = useVectorStore()
const vectorOps = useVectorOperations()

const selectedVector = computed(() => vectorStore.selectedVector)
const vectorStats = ref(null)
const activeSubTab = ref('overview')
const loading = ref(false)

const subTabs = ref([
  { id: 'overview', label: 'Overview', component: markRaw(AnalysisOverview) },
  { id: 'components', label: 'Components', component: markRaw(ComponentAnalysis) },
  { id: 'explorer', label: 'Explorer', component: markRaw(VectorExplorer) },
  { id: 'contextual', label: 'Context', component: markRaw(ContextualAnalysis) },
  { id: 'advanced', label: 'Advanced', component: markRaw(AdvancedStats) }
])

const activeComponent = computed(() => {
  const active = subTabs.value.find(tab => tab.id === activeSubTab.value)
  return active ? active.component : null
})

const analyzeVector = async () => {
  if (selectedVector.value) {
    loading.value = true
    try {
      const stats = await vectorOps.analyzeVector(selectedVector.value)
      vectorStats.value = stats
    } catch (error) {
      console.error("Failed to analyze vector:", error)
      vectorStats.value = null
    } finally {
      loading.value = false
    }
  } else {
    vectorStats.value = null
  }
}

watch(selectedVector, (newVector) => {
  if (newVector) {
    activeSubTab.value = 'overview' // Reset to overview when vector changes
    analyzeVector()
  } else {
    vectorStats.value = null
  }
})

onMounted(() => {
  if (selectedVector.value) {
    analyzeVector()
  }
})
</script>

<style scoped>
.individual-analysis-tab {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.loading-state, .no-vector-selected {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  text-align: center;
  color: var(--text-secondary);
}

.no-vector-selected .icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-vector-selected h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.vector-title {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.vector-title h3 {
  margin: 0;
}

.sub-tabs-container {
  overflow-x: auto;
  scrollbar-width: thin;
}

.sub-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  width: max-content;
}

.sub-tab-btn {
  padding: 0.7rem 1.2rem;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;
}

.sub-tab-btn.active {
  color: var(--text-primary-inverse, #fff);
  background-color: var(--accent-primary);
}

.sub-tab-btn:hover:not(.active) {
  background: var(--bg-quaternary);
  color: var(--text-primary);
}

.sub-tab-content {
  flex-grow: 1;
  min-height: 250px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 