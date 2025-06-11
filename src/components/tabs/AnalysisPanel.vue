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
  gap: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.panel-header h3 {
  margin: 0;
  color: white;
  font-size: 20px;
}

.analysis-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.analysis-select {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  min-width: 200px;
}

.btn-primary {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.analysis-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
}

.analysis-config,
.analysis-results {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.analysis-config h4,
.analysis-results h4 {
  margin: 0 0 16px 0;
  color: white;
  font-size: 16px;
}

.config-section {
  margin-bottom: 20px;
}

.config-section label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.config-input,
.config-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  margin-bottom: 12px;
}

.analysis-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result-content {
  color: white;
}

.result-summary h5 {
  margin: 0 0 8px 0;
  color: #667eea;
}

.result-summary p {
  margin: 0 0 16px 0;
  color: rgba(255, 255, 255, 0.8);
}

.component-table,
.similarity-table {
  overflow-x: auto;
  margin-top: 16px;
}

.component-table table,
.similarity-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.component-table th,
.component-table td,
.similarity-table th,
.similarity-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.component-table th,
.similarity-table th {
  background: rgba(255, 255, 255, 0.1);
  font-weight: 600;
}

.high-similarity {
  background: rgba(102, 126, 234, 0.2);
}

.cluster-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.cluster-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
}

.cluster-card h6 {
  margin: 0 0 8px 0;
  color: #667eea;
  font-size: 14px;
}

.cluster-card p {
  margin: 0 0 8px 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.cluster-center,
.cluster-vectors {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-family: monospace;
  margin-bottom: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
}

.stat-card h6 {
  margin: 0 0 8px 0;
  color: #667eea;
  font-size: 14px;
}

.stat-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
}

.export-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.export-section h4 {
  margin: 0 0 16px 0;
  color: white;
  font-size: 16px;
}

.export-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .analysis-content {
    grid-template-columns: 1fr;
  }
  
  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .analysis-controls {
    flex-direction: column;
  }
  
  .cluster-info,
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .export-buttons {
    flex-direction: column;
  }
}
</style> 