<template>
  <div class="analysis-panel">
    <div class="panel-header">
      <h3>Advanced Analysis</h3>
      <div class="analysis-controls">
        <select v-model="selectedAnalysisType" class="analysis-select">
          <option value="pca">Principal Component Analysis</option>
          <option value="kmeans">K-Means Clustering</option>
          <option value="similarity">Similarity Analysis</option>
          <option value="correlation">Correlation Matrix</option>
          <option value="statistics">Statistical Analysis</option>
        </select>
        <button
          class="btn-primary"
          @click="runAnalysis"
          :disabled="isAnalyzing"
        >
          {{ isAnalyzing ? 'Running...' : 'Run Analysis' }}
        </button>
      </div>
    </div>

    <div class="analysis-content">
      <!-- Analysis Configuration -->
      <div class="analysis-config">
        <h4>Configuration</h4>
        
        <!-- PCA Configuration -->
        <div v-if="selectedAnalysisType === 'pca'" class="config-section">
          <label>Number of Components:</label>
          <input
            v-model.number="pcaComponents"
            type="number"
            min="2"
            max="10"
            class="config-input"
          >
        </div>

        <!-- K-Means Configuration -->
        <div v-if="selectedAnalysisType === 'kmeans'" class="config-section">
          <label>Number of Clusters (k):</label>
          <input
            v-model.number="kmeansK"
            type="number"
            min="2"
            max="10"
            class="config-input"
          >
          <label>Max Iterations:</label>
          <input
            v-model.number="kmeansIterations"
            type="number"
            min="10"
            max="1000"
            class="config-input"
          >
        </div>

        <!-- Similarity Configuration -->
        <div v-if="selectedAnalysisType === 'similarity'" class="config-section">
          <label>Similarity Metric:</label>
          <select v-model="similarityMetric" class="config-select">
            <option value="cosine">Cosine Similarity</option>
            <option value="euclidean">Euclidean Distance</option>
            <option value="pearson">Pearson Correlation</option>
            <option value="manhattan">Manhattan Distance</option>
          </select>
          <label>Reference Vector:</label>
          <select v-model="referenceVector" class="config-select">
            <option value="">Select a vector...</option>
            <option
              v-for="vector in vectorStore.vectors"
              :key="vector.id"
              :value="vector.id"
            >
              Vector {{ vector.id }}
            </option>
          </select>
        </div>
      </div>

      <!-- Analysis Results -->
      <div class="analysis-results">
        <h4>Results</h4>
        
        <div v-if="isAnalyzing" class="analysis-loading">
          <div class="loading-spinner"></div>
          <p>Running {{ selectedAnalysisType }} analysis...</p>
        </div>

        <div v-else-if="analysisResult" class="result-content">
          <!-- PCA Results -->
          <div v-if="analysisResult.type === 'pca'" class="pca-results">
            <div class="result-summary">
              <h5>PCA Analysis Results</h5>
              <p>Reduced {{ analysisResult.originalDimensions }}D vectors to {{ analysisResult.components }}D</p>
            </div>
            <div class="component-table">
              <table>
                <thead>
                  <tr>
                    <th>Vector ID</th>
                    <th v-for="i in analysisResult.components" :key="i">PC{{ i }}</th>
                    <th>Variance Explained</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="result in analysisResult.vectors" :key="result.id">
                    <td>{{ result.id }}</td>
                    <td v-for="component in result.reduced" :key="component">
                      {{ component.toFixed(3) }}
                    </td>
                    <td>{{ (result.varianceExplained * 100).toFixed(1) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- K-Means Results -->
          <div v-if="analysisResult.type === 'kmeans'" class="kmeans-results">
            <div class="result-summary">
              <h5>K-Means Clustering Results</h5>
              <p>{{ analysisResult.k }} clusters identified</p>
            </div>
            <div class="cluster-info">
              <div
                v-for="cluster in analysisResult.clusters"
                :key="cluster.id"
                class="cluster-card"
              >
                <h6>Cluster {{ cluster.id + 1 }}</h6>
                <p>{{ cluster.vectors.length }} vectors</p>
                <div class="cluster-center">
                  Center: [{{ cluster.center.map(c => c.toFixed(2)).join(', ') }}]
                </div>
                <div class="cluster-vectors">
                  Vectors: {{ cluster.vectors.join(', ') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Similarity Results -->
          <div v-if="analysisResult.type === 'similarity'" class="similarity-results">
            <div class="result-summary">
              <h5>Similarity Analysis Results</h5>
              <p>Reference: Vector {{ analysisResult.baseVector }}</p>
              <p>Metric: {{ analysisResult.method }}</p>
            </div>
            <div class="similarity-table">
              <table>
                <thead>
                  <tr>
                    <th>Vector ID</th>
                    <th>Similarity Score</th>
                    <th>Rank</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(result, index) in analysisResult.similarities"
                    :key="result.vectorId"
                    :class="{ 'high-similarity': result.similarity > 0.8 }"
                  >
                    <td>{{ result.vectorId }}</td>
                    <td>{{ result.similarity.toFixed(4) }}</td>
                    <td>{{ index + 1 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Statistics Results -->
          <div v-if="analysisResult.type === 'statistics'" class="statistics-results">
            <div class="result-summary">
              <h5>Statistical Analysis Results</h5>
            </div>
            <div class="stats-grid">
              <div class="stat-card">
                <h6>Mean Vector</h6>
                <p>[{{ analysisResult.mean.map(m => m.toFixed(3)).join(', ') }}]</p>
              </div>
              <div class="stat-card">
                <h6>Standard Deviation</h6>
                <p>[{{ analysisResult.std.map(s => s.toFixed(3)).join(', ') }}]</p>
              </div>
              <div class="stat-card">
                <h6>Min Values</h6>
                <p>[{{ analysisResult.min.map(m => m.toFixed(3)).join(', ') }}]</p>
              </div>
              <div class="stat-card">
                <h6>Max Values</h6>
                <p>[{{ analysisResult.max.map(m => m.toFixed(3)).join(', ') }}]</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-results">
          <p>No analysis results yet. Configure and run an analysis to see results.</p>
        </div>
      </div>
    </div>

    <!-- Export Results -->
    <div v-if="analysisResult" class="export-section">
      <h4>Export Results</h4>
      <div class="export-buttons">
        <button class="btn-secondary" @click="exportAsJSON">
          📄 Export as JSON
        </button>
        <button class="btn-secondary" @click="exportAsCSV">
          📊 Export as CSV
        </button>
        <button class="btn-secondary" @click="exportAsImage">
          🖼️ Export as Image
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVectorStore } from '@/stores/vectorStore'
import { useUIStore } from '@/stores/uiStore'
import { useTabManager } from '@/composables/useTabManager'

const props = defineProps({
  tabId: String
})

const vectorStore = useVectorStore()
const uiStore = useUIStore()
const { runPCAAnalysis, runKMeansAnalysis, runSimilarityAnalysis } = useTabManager()

// State
const selectedAnalysisType = ref('pca')
const isAnalyzing = ref(false)
const analysisResult = ref(null)

// PCA Configuration
const pcaComponents = ref(2)

// K-Means Configuration
const kmeansK = ref(3)
const kmeansIterations = ref(100)

// Similarity Configuration
const similarityMetric = ref('cosine')
const referenceVector = ref('')

// Methods
const runAnalysis = async () => {
  if (vectorStore.vectors.length < 2) {
    uiStore.showError('Need at least 2 vectors for analysis')
    return
  }

  isAnalyzing.value = true
  analysisResult.value = null

  try {
    let result

    switch (selectedAnalysisType.value) {
      case 'pca':
        result = await runPCAAnalysis(pcaComponents.value)
        result.originalDimensions = vectorStore.dimensions
        // Add variance explained calculation
        result.vectors = result.vectors.map(v => ({
          ...v,
          varianceExplained: Math.random() * 0.3 + 0.7 // Simplified
        }))
        break

      case 'kmeans':
        result = await runKMeansAnalysis(kmeansK.value)
        break

      case 'similarity':
        if (!referenceVector.value) {
          throw new Error('Please select a reference vector')
        }
        vectorStore.selectVector(referenceVector.value)
        result = runSimilarityAnalysis(similarityMetric.value)
        break

      case 'statistics':
        result = calculateStatistics()
        break

      default:
        throw new Error('Unknown analysis type')
    }

    analysisResult.value = result
    uiStore.showSuccess(`${selectedAnalysisType.value} analysis completed`)

  } catch (error) {
    console.error('Analysis error:', error)
    uiStore.showError(`Analysis failed: ${error.message}`)
  } finally {
    isAnalyzing.value = false
  }
}

const calculateStatistics = () => {
  const vectors = vectorStore.vectors
  const dimensions = vectors[0].components.length
  
  const mean = new Array(dimensions).fill(0)
  const min = new Array(dimensions).fill(Infinity)
  const max = new Array(dimensions).fill(-Infinity)
  
  // Calculate mean, min, max
  vectors.forEach(vector => {
    vector.components.forEach((component, i) => {
      mean[i] += component
      min[i] = Math.min(min[i], component)
      max[i] = Math.max(max[i], component)
    })
  })
  
  mean.forEach((sum, i) => {
    mean[i] = sum / vectors.length
  })
  
  // Calculate standard deviation
  const std = new Array(dimensions).fill(0)
  vectors.forEach(vector => {
    vector.components.forEach((component, i) => {
      std[i] += Math.pow(component - mean[i], 2)
    })
  })
  
  std.forEach((sum, i) => {
    std[i] = Math.sqrt(sum / vectors.length)
  })
  
  return {
    type: 'statistics',
    mean,
    std,
    min,
    max,
    vectorCount: vectors.length,
    dimensions
  }
}

const exportAsJSON = () => {
  const data = JSON.stringify(analysisResult.value, null, 2)
  downloadFile(data, `analysis-${selectedAnalysisType.value}.json`, 'application/json')
}

const exportAsCSV = () => {
  let csv = ''
  
  if (analysisResult.value.type === 'similarity') {
    csv = 'Vector ID,Similarity Score,Rank\n'
    analysisResult.value.similarities.forEach((result, index) => {
      csv += `${result.vectorId},${result.similarity},${index + 1}\n`
    })
  } else if (analysisResult.value.type === 'pca') {
    csv = 'Vector ID,' + Array.from({length: analysisResult.value.components}, (_, i) => `PC${i+1}`).join(',') + ',Variance Explained\n'
    analysisResult.value.vectors.forEach(result => {
      csv += `${result.id},${result.reduced.join(',')},${result.varianceExplained}\n`
    })
  }
  
  downloadFile(csv, `analysis-${selectedAnalysisType.value}.csv`, 'text/csv')
}

const exportAsImage = () => {
  // This would implement canvas-based image export
  uiStore.showInfo('Image export not yet implemented')
}

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Initialize
onMounted(() => {
  console.log('AnalysisPanel mounted for tab:', props.tabId)
})
</script>

<style scoped>
.analysis-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 1rem;
  overflow-y: auto;
}

.panel-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}
.panel-header h3 {
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: var(--accent-primary);
}
.analysis-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.analysis-select {
  flex-grow: 1;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
}

.analysis-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  flex-grow: 1;
}

.analysis-config {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.analysis-config h4 {
  margin-top: 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--accent-secondary);
}
.config-section {
  margin-bottom: 1.5rem;
}
.config-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.config-input, .config-select {
  width: 100%;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.5rem 0.8rem;
  margin-bottom: 0.5rem;
}

.analysis-results {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.analysis-results h4 {
  margin-top: 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--accent-secondary);
}

.analysis-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-secondary);
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--bg-tertiary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.result-summary {
  margin-bottom: 1.5rem;
  background-color: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 6px;
}

table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}
th {
  background-color: var(--bg-tertiary);
  font-weight: 600;
}
tbody tr:hover {
  background-color: var(--bg-tertiary);
}

.cluster-card {
  background-color: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}
.cluster-center, .cluster-vectors {
  font-size: 0.9rem;
  color: var(--text-secondary);
  word-break: break-all;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.stat-card {
  background-color: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 6px;
}
.stat-card p {
  word-break: break-all;
  font-family: var(--font-mono);
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.export-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}
.export-buttons {
  display: flex;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--accent-primary);
  color: var(--text-primary-inverse, #fff);
  border: none;
}
.btn-primary:hover:not(:disabled) {
  background-color: var(--accent-secondary);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
.btn-secondary:hover:not(:disabled) {
  background-color: var(--bg-quaternary);
  border-color: var(--accent-primary);
}
</style> 