<template>
  <section class="vector-analysis-section" ref="analysisRef">
    <div class="analysis-header">
      <h2>🔬 Vector Analysis Studio</h2>
      <p>Deep dive into vector properties, relationships, and advanced analytics</p>
      <div class="analysis-toggle-controls">
        <button 
          class="btn-compact btn-secondary" 
          @click="toggleAnalysisView"
          :data-state="uiStore.analysisViewMode"
        >
          <span class="btn-icon">📊</span>
          <span class="btn-text">{{ uiStore.analysisViewMode === 'overview' ? 'Detailed View' : 'Overview' }}</span>
        </button>
        <button 
          class="btn-compact btn-accent" 
          @click="compareVectors"
          :disabled="!canCompareVectors"
        >
          <span class="btn-icon">⚖️</span>
          <span class="btn-text">Compare Selected</span>
        </button>
        <button 
          class="btn-compact btn-primary" 
          @click="exportAnalysis"
        >
          <span class="btn-icon">📄</span>
          <span class="btn-text">Export Report</span>
        </button>
      </div>
    </div>

    <!-- Analysis Content Container - this will be populated by the existing VectorAnalysisStudio module -->
    <div class="analysis-content" id="analysis-content">
      <!-- The existing analysis content will be inserted here -->
      <div class="analysis-overview" id="analysis-overview">
        <div class="overview-stats">
          <StatCard 
            icon="🎯" 
            :value="vectorStore.vectorCount" 
            label="Total Vectors" 
          />
          <StatCard 
            icon="📐" 
            :value="vectorStore.dimensions" 
            label="Dimensions" 
          />
          <StatCard 
            icon="⚡" 
            :value="vectorStore.averageMagnitude.toFixed(2)" 
            label="Avg Magnitude" 
          />
          <StatCard 
            icon="🌊" 
            :value="vectorStore.maxSimilarity.toFixed(2)" 
            label="Max Similarity" 
          />
        </div>

        <!-- Existing analysis tabs structure will be preserved -->
        <div class="analysis-tabs">
          <div class="tab-buttons">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              class="tab-btn" 
              :class="{ active: uiStore.activeTab === tab.id }"
              @click="setActiveTab(tab.id)"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="tab-content">
            <!-- Tab panels will be handled by the existing framework -->
            <div 
              v-for="tab in tabs" 
              :key="tab.id"
              class="tab-panel" 
              :class="{ active: uiStore.activeTab === tab.id }"
              :id="`${tab.id}-tab`"
            >
              <!-- Content populated by existing modules -->
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed analysis view -->
      <div 
        class="analysis-detailed" 
        id="analysis-detailed" 
        :style="{ display: uiStore.analysisViewMode === 'detailed' ? 'block' : 'none' }"
      >
        <!-- Content populated by existing modules -->
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useVectorStore } from '../stores/vectorStore'
import { useUIStore } from '../stores/uiStore'
import StatCard from './StatCard.vue'

const vectorStore = useVectorStore()
const uiStore = useUIStore()
const framework = inject('framework')
const analysisRef = ref(null)

const tabs = ref([
  { id: 'individual', label: 'Individual Analysis' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'clusters', label: 'Clustering' },
  { id: 'statistics', label: 'Statistics' }
])

const canCompareVectors = computed(() => {
  return vectorStore.selectedVector !== null && vectorStore.vectorCount > 1
})

const toggleAnalysisView = () => {
  const newMode = uiStore.analysisViewMode === 'overview' ? 'detailed' : 'overview'
  uiStore.setAnalysisViewMode(newMode)
}

const setActiveTab = (tabId) => {
  uiStore.setActiveTab(tabId)
}

const compareVectors = () => {
  if (framework.value && canCompareVectors.value) {
    // This will trigger the existing comparison functionality
    const compareButton = document.getElementById('compare-vectors')
    if (compareButton) {
      compareButton.click()
    }
  }
}

const exportAnalysis = () => {
  if (framework.value) {
    // This will trigger the existing export functionality
    const exportButton = document.getElementById('export-analysis')
    if (exportButton) {
      exportButton.click()
    }
  }
}

onMounted(() => {
  // The existing VectorAnalysisStudio will populate the content
  // We just need to ensure the tab switching works with our Vue state
  
  // Set up tab button listeners for the existing content
  setTimeout(() => {
    const tabButtons = document.querySelectorAll('.tab-btn')
    tabButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const tabId = tabs.value[index]?.id
        if (tabId) {
          setActiveTab(tabId)
        }
      })
    })
  }, 100)
})
</script>

<style scoped>
.vector-analysis-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.analysis-header {
  text-align: center;
  margin-bottom: 2rem;
}

.analysis-header h2 {
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.analysis-header p {
  color: #666;
  margin-bottom: 1rem;
}

.analysis-toggle-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.analysis-tabs {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tab-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.tab-btn {
  padding: 0.8rem 1.2rem;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #666;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.tab-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.1);
  color: #333;
}

.tab-content {
  min-height: 300px;
}

.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
}

.btn-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #333;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-accent {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-compact:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-compact:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .vector-analysis-section {
    padding: 1rem;
  }
  
  .analysis-toggle-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .tab-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .overview-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style> 