<template>
  <div class="analysis-modal">
    <div class="modal-header">
      <h3>🔬 Advanced Analysis</h3>
      <p>Perform comprehensive analysis on your vector dataset</p>
    </div>

    <!-- Analysis Type Selection -->
    <div class="analysis-types">
      <div class="type-grid">
        <div
          v-for="analysisType in analysisTypes"
          :key="analysisType.id"
          class="analysis-card"
          :class="{ 
            selected: selectedAnalysis === analysisType.id,
            disabled: !analysisType.available 
          }"
          @click="selectAnalysis(analysisType.id)"
        >
          <div class="card-icon">{{ analysisType.icon }}</div>
          <div class="card-title">{{ analysisType.title }}</div>
          <div class="card-description">{{ analysisType.description }}</div>
          <div v-if="!analysisType.available" class="card-badge">Coming Soon</div>
        </div>
      </div>
    </div>

    <!-- Analysis Configuration -->
    <div v-if="selectedAnalysis" class="analysis-config">
      <h4>{{ getAnalysisConfig(selectedAnalysis).title }} Configuration</h4>
      
      <!-- PCA Configuration -->
      <div v-if="selectedAnalysis === 'pca'" class="config-section">
        <div class="config-group">
          <label for="pca-components">Number of Components:</label>
          <input
            id="pca-components"
            v-model.number="pcaConfig.components"
            type="number"
            min="2"
            :max="Math.min(vectorStore.dimensions, vectorStore.vectorCount)"
            class="number-input"
          />
        </div>
        <div class="config-info">
          <p>PCA will reduce {{ vectorStore.dimensions }}D vectors to {{ pcaConfig.components }}D representation</p>
        </div>
      </div>

      <!-- K-Means Configuration -->
      <div v-if="selectedAnalysis === 'kmeans'" class="config-section">
        <div class="config-group">
          <label for="kmeans-k">Number of Clusters (k):</label>
          <input
            id="kmeans-k"
            v-model.number="kmeansConfig.k"
            type="number"
            min="2"
            :max="Math.min(10, vectorStore.vectorCount)"
            class="number-input"
          />
        </div>
        <div class="config-group">
          <label for="kmeans-iterations">Max Iterations:</label>
          <input
            id="kmeans-iterations"
            v-model.number="kmeansConfig.maxIterations"
            type="number"
            min="10"
            max="1000"
            class="number-input"
          />
        </div>
      </div>

      <!-- Hierarchical Clustering Configuration -->
      <div v-if="selectedAnalysis === 'hierarchical'" class="config-section">
        <div class="config-group">
          <label for="hierarchical-linkage">Linkage Method:</label>
          <select
            id="hierarchical-linkage"
            v-model="hierarchicalConfig.linkage"
            class="select-input"
          >
            <option value="single">Single Linkage</option>
            <option value="complete">Complete Linkage</option>
            <option value="average">Average Linkage</option>
            <option value="ward">Ward Linkage</option>
          </select>
        </div>
      </div>

      <!-- Statistical Analysis Configuration -->
      <div v-if="selectedAnalysis === 'statistics'" class="config-section">
        <div class="config-options">
          <label class="checkbox-label">
            <input v-model="statisticsConfig.includeCorrelation" type="checkbox" />
            Include correlation matrix
          </label>
          <label class="checkbox-label">
            <input v-model="statisticsConfig.includeOutliers" type="checkbox" />
            Detect outliers
          </label>
          <label class="checkbox-label">
            <input v-model="statisticsConfig.includeDistribution" type="checkbox" />
            Analyze distribution
          </label>
        </div>
      </div>
    </div>

    <!-- Analysis Results -->
    <div v-if="analytics.analysisResults" class="results-section">
      <div class="results-header">
        <h4>Analysis Results</h4>
        <div class="results-meta">
          <span>{{ analytics.analysisResults.type }}</span>
          <span>•</span>
          <span>{{ formatDate(analytics.analysisResults.timestamp) }}</span>
        </div>
      </div>

      <!-- PCA Results -->
      <div v-if="analytics.analysisResults.type === 'PCA'" class="results-content">
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-label">Explained Variance:</span>
            <span class="stat-value">{{ (analytics.analysisResults.data.explainedVariance * 100).toFixed(1) }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Components:</span>
            <span class="stat-value">{{ analytics.analysisResults.data.components }}</span>
          </div>
        </div>
        <div class="eigenvalues">
          <h5>Eigenvalues:</h5>
          <div class="eigenvalue-list">
            <span
              v-for="(value, index) in analytics.analysisResults.data.eigenvalues"
              :key="index"
              class="eigenvalue-item"
            >
              PC{{ index + 1 }}: {{ value.toFixed(3) }}
            </span>
          </div>
        </div>
      </div>

      <!-- K-Means Results -->
      <div v-if="analytics.analysisResults.type === 'K-Means'" class="results-content">
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-label">Clusters:</span>
            <span class="stat-value">{{ analytics.analysisResults.data.clusters.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Silhouette Score:</span>
            <span class="stat-value">{{ analytics.analysisResults.data.silhouetteScore.toFixed(3) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Converged:</span>
            <span class="stat-value">{{ analytics.analysisResults.data.converged ? 'Yes' : 'No' }}</span>
          </div>
        </div>
        <div class="cluster-info">
          <h5>Cluster Information:</h5>
          <div class="cluster-list">
            <div
              v-for="(cluster, index) in analytics.analysisResults.data.clusters"
              :key="index"
              class="cluster-item"
            >
              <span class="cluster-label">Cluster {{ cluster.id + 1 }}:</span>
              <span class="cluster-size">{{ cluster.size }} vectors</span>
              <span class="cluster-distance">Avg distance: {{ cluster.avgDistance.toFixed(3) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistical Results -->
      <div v-if="analytics.analysisResults.type === 'Statistical Analysis'" class="results-content">
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-label">Total Vectors:</span>
            <span class="stat-value">{{ analytics.analysisResults.data.summary.totalVectors }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Dimensions:</span>
            <span class="stat-value">{{ analytics.analysisResults.data.summary.dimensions }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Avg Magnitude:</span>
            <span class="stat-value">{{ analytics.analysisResults.data.summary.averageMagnitude.toFixed(3) }}</span>
          </div>
        </div>
        <div v-if="analytics.analysisResults.data.outliers.length > 0" class="outliers-info">
          <h5>Outliers Detected:</h5>
          <div class="outlier-list">
            <span
              v-for="outlier in analytics.analysisResults.data.outliers.slice(0, 5)"
              :key="outlier.vector.id"
              class="outlier-item"
            >
              {{ outlier.vector.label || outlier.vector.id }}
            </span>
            <span v-if="analytics.analysisResults.data.outliers.length > 5" class="more-outliers">
              +{{ analytics.analysisResults.data.outliers.length - 5 }} more
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Indicator -->
    <div v-if="analytics.isAnalyzing" class="analysis-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: analytics.analysisProgress + '%' }"></div>
      </div>
      <div class="progress-text">{{ getProgressText() }}</div>
    </div>

    <!-- Error Display -->
    <div v-if="analytics.analysisError" class="error-section">
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        {{ analytics.analysisError }}
      </div>
    </div>

    <!-- Modal Actions -->
    <div class="modal-actions">
      <button class="btn-secondary" @click="$emit('close')">
        Close
      </button>
      <button
        v-if="analytics.analysisResults"
        class="btn-utility"
        @click="exportResults"
      >
        💾 Export Results
      </button>
      <button
        class="btn-primary"
        :disabled="!selectedAnalysis || analytics.isAnalyzing || !analytics.hasVectors"
        @click="runAnalysis"
      >
        <span v-if="analytics.isAnalyzing">Analyzing...</span>
        <span v-else>🔬 Run Analysis</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useVectorStore } from '../../stores/vectorStore.js'
import { useUIStore } from '../../stores/uiStore.js'
import { useAnalytics } from '../../composables/useAnalytics.js'

const vectorStore = useVectorStore()
const uiStore = useUIStore()
const analytics = useAnalytics()

// Reactive state
const selectedAnalysis = ref(null)

// Analysis configurations
const pcaConfig = ref({
  components: Math.min(3, vectorStore.dimensions)
})

const kmeansConfig = ref({
  k: Math.min(3, vectorStore.vectorCount),
  maxIterations: 100
})

const hierarchicalConfig = ref({
  linkage: 'ward'
})

const statisticsConfig = ref({
  includeCorrelation: true,
  includeOutliers: true,
  includeDistribution: true
})

// Analysis types
const analysisTypes = [
  {
    id: 'pca',
    title: 'Principal Component Analysis',
    icon: '🔍',
    description: 'Discover the main dimensions of variation in your vector space',
    available: true
  },
  {
    id: 'kmeans',
    title: 'K-Means Clustering',
    icon: '🎯',
    description: 'Group similar vectors using K-means clustering algorithm',
    available: true
  },
  {
    id: 'hierarchical',
    title: 'Hierarchical Clustering',
    icon: '🌳',
    description: 'Build a hierarchy of clusters using different linkage methods',
    available: true
  },
  {
    id: 'statistics',
    title: 'Statistical Analysis',
    icon: '📊',
    description: 'Comprehensive statistical overview of vector properties',
    available: true
  },
  {
    id: 'tsne',
    title: 't-SNE Visualization',
    icon: '🗺️',
    description: 'Non-linear dimensionality reduction for visualization',
    available: false
  },
  {
    id: 'anomaly',
    title: 'Anomaly Detection',
    icon: '🚨',
    description: 'Detect unusual patterns and outliers in your data',
    available: false
  }
]

// Computed properties
const getAnalysisConfig = (type) => {
  return analysisTypes.find(a => a.id === type) || {}
}

// Methods
const selectAnalysis = (type) => {
  const analysisType = analysisTypes.find(a => a.id === type)
  if (analysisType && analysisType.available) {
    selectedAnalysis.value = type
  }
}

const runAnalysis = async () => {
  if (!selectedAnalysis.value || analytics.isAnalyzing.value) return

  try {
    switch (selectedAnalysis.value) {
      case 'pca':
        await analytics.performPCA(pcaConfig.value.components)
        break
      case 'kmeans':
        await analytics.performKMeans(kmeansConfig.value.k, kmeansConfig.value.maxIterations)
        break
      case 'hierarchical':
        await analytics.performHierarchicalClustering(hierarchicalConfig.value.linkage)
        break
      case 'statistics':
        await analytics.performStatisticalAnalysis()
        break
    }
    
    uiStore.showSuccess('Analysis completed successfully!')
  } catch (error) {
    uiStore.showError(`Analysis failed: ${error.message}`)
  }
}

const exportResults = () => {
  const results = analytics.exportResults()
  if (results) {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analysis_${results.type.toLowerCase()}_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    uiStore.showSuccess('Analysis results exported!')
  }
}

const getProgressText = () => {
  if (!analytics.lastAnalysisType.value) return 'Initializing...'
  
  const progress = analytics.analysisProgress.value
  if (progress < 25) return `Preparing ${analytics.lastAnalysisType.value}...`
  if (progress < 50) return 'Processing data...'
  if (progress < 75) return 'Calculating results...'
  if (progress < 100) return 'Finalizing analysis...'
  return 'Complete!'
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

const emit = defineEmits(['close'])
</script>

<style scoped>
.analysis-modal {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: var(--bg-primary);
  padding: 1rem;
}

.modal-header {
  text-align: center;
}
.modal-header h3 {
  font-size: 1.5rem;
  color: var(--accent-primary);
  margin: 0 0 0.5rem 0;
}
.modal-header p {
  color: var(--text-secondary);
  margin: 0;
}

.analysis-types {
  margin-bottom: 1rem;
}
.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}
.analysis-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.analysis-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px var(--shadow-color);
  border-color: var(--accent-primary);
}
.analysis-card.selected {
  border-color: var(--accent-primary);
  background-color: var(--bg-tertiary);
  box-shadow: 0 0 12px var(--accent-primary);
}
.analysis-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--bg-secondary);
}
.card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}
.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.card-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  min-height: 40px;
}
.card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: var(--accent-secondary);
  color: var(--text-primary-inverse, #fff);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.analysis-config {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}
.analysis-config h4 {
  margin: 0 0 1rem 0;
  color: var(--accent-secondary);
  font-size: 1.2rem;
}
.config-section {
  padding-bottom: 1rem;
}
.config-group, .config-options {
  margin-bottom: 1rem;
}
.config-group label, .checkbox-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}
.number-input, .select-input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.results-section {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
}
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}
.results-header h4 {
  margin: 0;
  color: var(--accent-secondary);
}
.results-meta {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.results-content {
  color: var(--text-primary);
}

.result-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  background-color: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 6px;
}

.stat-item {
  flex: 1;
}

.stat-label {
  color: var(--text-secondary);
}
.stat-value {
  font-weight: 600;
}

.eigenvalue-list, .outlier-list, .cluster-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.eigenvalue-item, .outlier-item, .cluster-item {
  background-color: var(--bg-tertiary);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
}

.analysis-progress {
  text-align: center;
}
.progress-bar {
  height: 8px;
  background-color: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}
.progress-fill {
  height: 100%;
  background-color: var(--accent-primary);
  transition: width 0.3s;
}
.progress-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.error-section {
  background-color: var(--status-danger-bg, rgba(220, 53, 69, 0.1));
  color: var(--status-danger);
  border: 1px solid var(--status-danger);
  padding: 1rem;
  border-radius: 6px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn-primary, .btn-secondary, .btn-utility {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background-color: var(--accent-primary);
  color: var(--text-primary-inverse, #fff);
}
.btn-secondary {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
.btn-utility {
  background-color: var(--accent-secondary);
  color: var(--text-primary-inverse, #fff);
}
</style> 