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
  max-width: 700px;
  margin: 0 auto;
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.modal-header h3 {
  color: var(--accent-primary);
  margin: 0 0 0.5rem 0;
}

.modal-header p {
  color: var(--text-secondary);
  margin: 0;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.analysis-card {
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
  background-color: var(--bg-secondary);
}

.analysis-card:hover:not(.disabled) {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  transform: translateY(-2px);
}

.analysis-card.selected {
  border-color: var(--accent-primary);
  background: var(--bg-tertiary);
  box-shadow: 0 0 15px rgba(10, 132, 255, 0.3);
}

.analysis-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.card-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.card-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.card-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #f59e0b;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.analysis-config {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.analysis-config h4 {
  margin: 0 0 1rem 0;
  color: var(--accent-primary);
}

.config-section {
  margin-bottom: 1rem;
}

.config-group {
  margin-bottom: 1rem;
}

.config-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.number-input, .select-input {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 6px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.number-input:focus, .select-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 5px rgba(10, 132, 255, 0.5);
}

.config-info {
  background: rgba(10, 132, 255, 0.1);
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  border-left: 3px solid var(--accent-primary);
}

.config-info p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.config-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-primary);
}

.checkbox-label input[type="checkbox"] {
  accent-color: var(--accent-primary);
  margin: 0;
}

.results-section {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.results-header h4 {
  margin: 0;
  color: var(--accent-primary);
}

.results-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 6px;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.2em;
}

.eigenvalues, .cluster-info, .outliers-info {
  margin-top: 1.5rem;
}

.eigenvalues h5, .cluster-info h5, .outliers-info h5 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}

.eigenvalue-list, .cluster-list, .outlier-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.eigenvalue-item, .outlier-item {
  background: rgba(10, 132, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.875rem;
  color: var(--accent-primary);
  font-weight: 500;
}

.cluster-item {
  background: var(--bg-secondary);
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-left: 3px solid #10b981;
}

.cluster-label {
  font-weight: 500;
  color: #10b981;
}

.cluster-size, .cluster-distance {
  color: var(--text-secondary);
}

.more-outliers {
  color: var(--text-secondary);
  font-style: italic;
  padding: 0.25rem 0.5rem;
}

.analysis-progress {
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--accent-primary);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.error-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-weight: 500;
}

.error-icon {
  font-size: 1.2rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.btn-secondary, .btn-primary, .btn-utility {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #555;
  color: white;
}

.btn-secondary:hover {
  background: #777;
}

.btn-utility {
  background: #10b981;
  color: white;
}

.btn-utility:hover {
  background: #059669;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-secondary);
}

.btn-primary:disabled {
  background: #555;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}
</style> 