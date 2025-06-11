<template>
  <div class="individual-analysis-tab">
    <div v-if="selectedVector && vectorStats">
      <div class="vector-title">
        <h3>Analysis for Vector: <strong>{{ selectedVector.id }}</strong></h3>
      </div>
      
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

      <div class="sub-tab-content">
        <AnalysisOverview v-if="activeSubTab === 'overview'" :stats="vectorStats" />
        <ComponentAnalysis v-if="activeSubTab === 'components'" :stats="vectorStats" :components="selectedVector.components" />
        <AdvancedStats v-if="activeSubTab === 'advanced'" :stats="vectorStats" />
      </div>
    </div>
    <div v-else class="no-vector-selected">
      <p>Select a vector to see its individual analysis.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useVectorStore } from '../../stores/vectorStore'
import { useVectorOperations } from '../../composables/useVectorOperations'
import AnalysisOverview from './individual/AnalysisOverview.vue'
import ComponentAnalysis from './individual/ComponentAnalysis.vue'
import AdvancedStats from './individual/AdvancedStats.vue'

const vectorStore = useVectorStore()
const vectorOps = useVectorOperations()

const selectedVector = computed(() => vectorStore.selectedVector)
const vectorStats = ref(null)
const activeSubTab = ref('overview')

const subTabs = ref([
  { id: 'overview', label: 'Overview' },
  { id: 'components', label: 'Component Analysis' },
  { id: 'advanced', label: 'Advanced Stats' }
])

const analyzeVector = async () => {
  if (selectedVector.value) {
    const stats = await vectorOps.analyzeVector(selectedVector.value)
    vectorStats.value = stats
  } else {
    vectorStats.value = null
  }
}

watch(selectedVector, (newVector) => {
  if (newVector) {
    analyzeVector()
    activeSubTab.value = 'overview' // Reset to overview when vector changes
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
}

.vector-title {
  margin-bottom: 1.5rem;
}

.no-vector-selected {
  text-align: center;
  padding: 2rem;
  color: #888;
}

.sub-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
}

.sub-tab-btn {
  padding: 0.8rem 1.2rem;
  border: none;
  background: transparent;
  color: #aaa;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.sub-tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.sub-tab-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.sub-tab-content {
  min-height: 250px;
}
</style> 