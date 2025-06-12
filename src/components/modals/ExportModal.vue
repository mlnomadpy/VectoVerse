<template>
  <div class="export-modal">
    <div class="modal-header">
      <h3>💾 Export Data</h3>
      <p>Export your vectors, analysis results, and visualizations</p>
    </div>

    <!-- Export Type Selection -->
    <div class="export-sections">
      <div class="section-tabs">
        <button
          v-for="section in exportSections"
          :key="section.id"
          class="tab-btn"
          :class="{ active: activeSection === section.id }"
          @click="setActiveSection(section.id)"
        >
          <span class="tab-icon">{{ section.icon }}</span>
          {{ section.label }}
        </button>
      </div>

      <!-- Vector Data Export -->
      <div v-if="activeSection === 'vectors'" class="export-section">
        <div class="section-header">
          <h4>Vector Data Export</h4>
          <p>Export your current vector dataset</p>
        </div>

        <div class="export-options">
          <div class="option-group">
            <label class="checkbox-label">
              <input v-model="vectorExport.includeGenerated" type="checkbox" />
              Include generated vectors ({{ generatedVectorCount }})
            </label>
            <label class="checkbox-label">
              <input v-model="vectorExport.includeCustom" type="checkbox" />
              Include custom vectors ({{ customVectorCount }})
            </label>
            <label class="checkbox-label">
              <input v-model="vectorExport.includeMetadata" type="checkbox" />
              Include metadata (labels, timestamps, etc.)
            </label>
          </div>

          <div class="format-selection">
            <label>Export Format:</label>
            <select v-model="vectorExport.format" class="format-select">
              <option value="json">JSON (.json)</option>
              <option value="csv">CSV (.csv)</option>
              <option value="txt">Text (.txt)</option>
              <option value="numpy">NumPy Array (.npy)</option>
            </select>
          </div>
        </div>

        <div class="preview-info">
          <div class="info-item">
            <span class="info-label">Vectors to export:</span>
            <span class="info-value">{{ selectedVectorCount }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Dimensions:</span>
            <span class="info-value">{{ vectorStore.dimensions }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">File size estimate:</span>
            <span class="info-value">{{ estimatedFileSize }}</span>
          </div>
        </div>
      </div>

      <!-- Analysis Results Export -->
      <div v-if="activeSection === 'analysis'" class="export-section">
        <div class="section-header">
          <h4>Analysis Results Export</h4>
          <p>Export analysis reports and statistical data</p>
        </div>

        <div class="export-options">
          <div class="option-group">
            <label class="checkbox-label">
              <input v-model="analysisExport.includeStatistics" type="checkbox" />
              Include statistical analysis
            </label>
            <label class="checkbox-label">
              <input v-model="analysisExport.includeCorrelations" type="checkbox" />
              Include correlation matrix
            </label>
            <label class="checkbox-label">
              <input v-model="analysisExport.includeClusters" type="checkbox" />
              Include clustering results
            </label>
            <label class="checkbox-label">
              <input v-model="analysisExport.includeCharts" type="checkbox" />
              Include chart data
            </label>
          </div>

          <div class="format-selection">
            <label>Report Format:</label>
            <select v-model="analysisExport.format" class="format-select">
              <option value="json">JSON Data (.json)</option>
              <option value="pdf">PDF Report (.pdf)</option>
              <option value="html">HTML Report (.html)</option>
              <option value="txt">Text Report (.txt)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Visualization Export -->
      <div v-if="activeSection === 'visualization'" class="export-section">
        <div class="section-header">
          <h4>Visualization Export</h4>
          <p>Export the current visualization as an image</p>
        </div>

        <div class="export-options">
          <div class="option-group">
            <div class="resolution-group">
              <label>Resolution:</label>
              <select v-model="visualizationExport.resolution" class="resolution-select">
                <option value="1x">Current Size (1x)</option>
                <option value="2x">High Resolution (2x)</option>
                <option value="4x">Print Quality (4x)</option>
              </select>
            </div>

            <div class="format-selection">
              <label>Image Format:</label>
              <select v-model="visualizationExport.format" class="format-select">
                <option value="png">PNG (Transparent background)</option>
                <option value="jpg">JPEG (White background)</option>
                <option value="svg">SVG (Vector graphics)</option>
              </select>
            </div>

            <label class="checkbox-label">
              <input v-model="visualizationExport.includeUI" type="checkbox" />
              Include UI controls in export
            </label>
          </div>
        </div>
      </div>

      <!-- Configuration Export -->
      <div v-if="activeSection === 'config'" class="export-section">
        <div class="section-header">
          <h4>Configuration Export</h4>
          <p>Export current settings and preferences</p>
        </div>

        <div class="export-options">
          <div class="option-group">
            <label class="checkbox-label">
              <input v-model="configExport.includeVectorSettings" type="checkbox" />
              Vector space configuration
            </label>
            <label class="checkbox-label">
              <input v-model="configExport.includeVisualizationSettings" type="checkbox" />
              Visualization settings
            </label>
            <label class="checkbox-label">
              <input v-model="configExport.includeNeuralSettings" type="checkbox" />
              Neural network settings
            </label>
            <label class="checkbox-label">
              <input v-model="configExport.includeUIPreferences" type="checkbox" />
              UI preferences
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Actions -->
    <div class="modal-actions">
      <button class="btn-secondary" @click="$emit('close')">
        Cancel
      </button>
      <button 
        class="btn-primary" 
        :disabled="!canExport || isExporting"
        @click="performExport"
      >
        <span v-if="isExporting">Exporting...</span>
        <span v-else>💾 Export {{ activeSection }}</span>
      </button>
    </div>

    <!-- Export Progress -->
    <div v-if="isExporting" class="export-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: exportProgress + '%' }"></div>
      </div>
      <div class="progress-text">{{ exportStatus }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVectorStore } from '../../stores/vectorStore.js'
import { useUIStore } from '../../stores/uiStore.js'
import { fileSizeFormat } from '../../utils/formatUtils.js'

const vectorStore = useVectorStore()
const uiStore = useUIStore()

// Reactive state
const activeSection = ref('vectors')
const isExporting = ref(false)
const exportProgress = ref(0)
const exportStatus = ref('')

// Export configurations
const vectorExport = ref({
  includeGenerated: true,
  includeCustom: true,
  includeMetadata: true,
  format: 'json'
})

const analysisExport = ref({
  includeStatistics: true,
  includeCorrelations: true,
  includeClusters: true,
  includeCharts: false,
  format: 'json'
})

const visualizationExport = ref({
  resolution: '2x',
  format: 'png',
  includeUI: false
})

const configExport = ref({
  includeVectorSettings: true,
  includeVisualizationSettings: true,
  includeNeuralSettings: true,
  includeUIPreferences: false
})

// Export sections
const exportSections = [
  { id: 'vectors', label: 'Vectors', icon: '🎯' },
  { id: 'analysis', label: 'Analysis', icon: '📊' },
  { id: 'visualization', label: 'Image', icon: '🖼️' },
  { id: 'config', label: 'Settings', icon: '⚙️' }
]

// Computed properties
const generatedVectorCount = computed(() => {
  return vectorStore.vectors.filter(v => v.type !== 'custom').length
})

const customVectorCount = computed(() => {
  return vectorStore.vectors.filter(v => v.type === 'custom').length
})

const selectedVectorCount = computed(() => {
  let count = 0
  if (vectorExport.value.includeGenerated) count += generatedVectorCount.value
  if (vectorExport.value.includeCustom) count += customVectorCount.value
  return count
})

const estimatedFileSize = computed(() => {
  const vectorCount = selectedVectorCount.value
  const dimensions = vectorStore.dimensions
  const baseSize = vectorCount * dimensions * 8 // 8 bytes per number
  const metadataSize = vectorExport.value.includeMetadata ? vectorCount * 100 : 0
  const totalSize = baseSize + metadataSize
  
  return fileSizeFormat.bytes(totalSize)
})

const canExport = computed(() => {
  switch (activeSection.value) {
    case 'vectors':
      return selectedVectorCount.value > 0
    case 'analysis':
      return Object.values(analysisExport.value).some(v => v === true)
    case 'visualization':
      return true
    case 'config':
      return Object.values(configExport.value).some(v => v === true)
    default:
      return false
  }
})

// Methods
const setActiveSection = (section) => {
  activeSection.value = section
}

const performExport = async () => {
  if (!canExport.value || isExporting.value) return

  isExporting.value = true
  exportProgress.value = 0

  try {
    switch (activeSection.value) {
      case 'vectors':
        await exportVectors()
        break
      case 'analysis':
        await exportAnalysis()
        break
      case 'visualization':
        await exportVisualization()
        break
      case 'config':
        await exportConfiguration()
        break
    }

    uiStore.showSuccess('Export completed successfully!')
    emit('close')

  } catch (error) {
    uiStore.showError(`Export failed: ${error.message}`)
  } finally {
    isExporting.value = false
    exportProgress.value = 0
    exportStatus.value = ''
  }
}

const exportVectors = async () => {
  exportStatus.value = 'Preparing vector data...'
  exportProgress.value = 10

  const vectors = vectorStore.vectors.filter(vector => {
    if (vector.type === 'custom' && !vectorExport.value.includeCustom) return false
    if (vector.type !== 'custom' && !vectorExport.value.includeGenerated) return false
    return true
  })

  exportProgress.value = 30
  exportStatus.value = 'Formatting data...'

  let exportData
  let fileName
  let mimeType

  switch (vectorExport.value.format) {
    case 'json':
      exportData = JSON.stringify({
        metadata: {
          exportedAt: new Date().toISOString(),
          vectorCount: vectors.length,
          dimensions: vectorStore.dimensions,
          includeMetadata: vectorExport.value.includeMetadata
        },
        vectors: vectors.map(v => vectorExport.value.includeMetadata ? v : { values: v.values })
      }, null, 2)
      fileName = `vectors_${Date.now()}.json`
      mimeType = 'application/json'
      break

    case 'csv':
      const headers = vectorExport.value.includeMetadata 
        ? ['id', 'label', 'type', ...Array.from({length: vectorStore.dimensions}, (_, i) => `dim_${i+1}`)]
        : Array.from({length: vectorStore.dimensions}, (_, i) => `dim_${i+1}`)
      
      const csvRows = vectors.map(v => {
        const row = vectorExport.value.includeMetadata 
          ? [v.id, v.label || '', v.type || '', ...v.values]
          : v.values
        return row.join(',')
      })
      
      exportData = [headers.join(','), ...csvRows].join('\n')
      fileName = `vectors_${Date.now()}.csv`
      mimeType = 'text/csv'
      break

    case 'txt':
      exportData = vectors.map(v => {
        const vectorStr = v.values.join(', ')
        return vectorExport.value.includeMetadata 
          ? `${v.label || v.id}: [${vectorStr}]`
          : `[${vectorStr}]`
      }).join('\n')
      fileName = `vectors_${Date.now()}.txt`
      mimeType = 'text/plain'
      break
  }

  exportProgress.value = 80
  exportStatus.value = 'Downloading file...'

  downloadFile(exportData, fileName, mimeType)
  exportProgress.value = 100
}

const exportAnalysis = async () => {
  exportStatus.value = 'Gathering analysis data...'
  exportProgress.value = 20

  const analysisData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      vectorCount: vectorStore.vectors.length,
      dimensions: vectorStore.dimensions
    }
  }

  if (analysisExport.value.includeStatistics) {
    // Get statistics from the framework if available
    analysisData.statistics = vectorStore.framework ? 
      vectorStore.framework.modules.analysisEngine.getStatistics() : {}
  }

  exportProgress.value = 60
  exportStatus.value = 'Formatting report...'

  let exportData
  let fileName
  let mimeType

  switch (analysisExport.value.format) {
    case 'json':
      exportData = JSON.stringify(analysisData, null, 2)
      fileName = `analysis_${Date.now()}.json`
      mimeType = 'application/json'
      break

    case 'txt':
      exportData = generateTextReport(analysisData)
      fileName = `analysis_report_${Date.now()}.txt`
      mimeType = 'text/plain'
      break
  }

  exportProgress.value = 90
  downloadFile(exportData, fileName, mimeType)
  exportProgress.value = 100
}

const exportVisualization = async () => {
  exportStatus.value = 'Capturing visualization...'
  exportProgress.value = 30

  // Get the SVG element from the visualization
  const svgElement = document.querySelector('#main-viz')
  if (!svgElement) {
    throw new Error('Visualization not found')
  }

  exportProgress.value = 60
  exportStatus.value = 'Processing image...'

  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)

  let fileName
  let mimeType

  switch (visualizationExport.value.format) {
    case 'svg':
      downloadFile(svgString, `visualization_${Date.now()}.svg`, 'image/svg+xml')
      break

    case 'png':
    case 'jpg':
      // Convert SVG to canvas and then to image
      await exportAsImage(svgString, visualizationExport.value.format)
      break
  }

  exportProgress.value = 100
}

const exportConfiguration = async () => {
  exportStatus.value = 'Collecting configuration...'
  exportProgress.value = 30

  const config = {
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }
  }

  if (configExport.value.includeVectorSettings) {
    config.vectorSettings = {
      dimensions: vectorStore.dimensions,
      numVectors: vectorStore.numVectors,
      forceType: vectorStore.forceType
    }
  }

  if (configExport.value.includeNeuralSettings) {
    config.neuralSettings = {
      activationFunction: vectorStore.activationFunction,
      learningRate: vectorStore.learningRate
    }
  }

  exportProgress.value = 80
  const exportData = JSON.stringify(config, null, 2)
  downloadFile(exportData, `config_${Date.now()}.json`, 'application/json')
  exportProgress.value = 100
}

const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const exportAsImage = async (svgString, format) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      const multiplier = parseInt(visualizationExport.value.resolution.replace('x', ''))
      canvas.width = img.width * multiplier
      canvas.height = img.height * multiplier

      if (format === 'jpg') {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `visualization_${Date.now()}.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        resolve()
      }, `image/${format}`)
    }

    img.onerror = reject
    img.src = 'data:image/svg+xml;base64,' + btoa(svgString)
  })
}

const generateTextReport = (data) => {
  let report = 'VECTOVERSE ANALYSIS REPORT\n'
  report += '=' .repeat(30) + '\n\n'
  report += `Generated: ${data.metadata.exportedAt}\n`
  report += `Vectors: ${data.metadata.vectorCount}\n`
  report += `Dimensions: ${data.metadata.dimensions}\n\n`
  
  if (data.statistics) {
    report += 'STATISTICS\n'
    report += '-' .repeat(15) + '\n'
    Object.entries(data.statistics).forEach(([key, value]) => {
      report += `${key}: ${value}\n`
    })
  }
  
  return report
}

const emit = defineEmits(['close'])
</script>

<style scoped>
.export-modal {
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

.export-sections {
  display: flex;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.section-tabs {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-tertiary);
  border-right: 1px solid var(--border-color);
  padding: 0.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.tab-btn.active {
  background-color: var(--accent-primary);
  color: var(--text-primary-inverse);
  font-weight: 600;
}

.export-section {
  padding: 1.5rem;
  flex-grow: 1;
}

.section-header {
  margin-bottom: 1.5rem;
}
.section-header h4 {
  font-size: 1.2rem;
  color: var(--text-primary);
}
.section-header p {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.export-options {
  margin-bottom: 1.5rem;
}
.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.format-selection,
.resolution-group {
  margin-top: 1rem;
}

.format-selection label,
.resolution-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.format-select,
.resolution-select {
  width: 100%;
  padding: 0.6rem 0.8rem;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.preview-info {
  background-color: var(--bg-tertiary);
  border-radius: 6px;
  padding: 1rem;
  border-left: 3px solid var(--accent-secondary);
}
.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.info-label {
  color: var(--text-secondary);
}
.info-value {
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn-primary,
.btn-secondary {
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

.export-progress {
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
</style> 