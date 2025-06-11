<template>
  <div class="visualization-panel">
    <div class="panel-header">
      <h3>🌐 Visualization Controls</h3>
      <p>Customize the visual representation of your vector space</p>
    </div>

    <div class="panel-content">
      <!-- Visualization Mode Section -->
      <div class="control-section">
        <h4>🎯 Visualization Mode</h4>
        <div class="mode-selector">
          <button 
            class="mode-btn"
            :class="{ active: visualizationMode === '2d' }"
            @click="setVisualizationMode('2d')"
          >
            <span class="mode-icon">📊</span>
            <span class="mode-text">2D View</span>
          </button>
          <button 
            class="mode-btn"
            :class="{ active: visualizationMode === '3d' }"
            @click="setVisualizationMode('3d')"
          >
            <span class="mode-icon">🌐</span>
            <span class="mode-text">3D View</span>
          </button>
          <button 
            class="mode-btn"
            :class="{ active: visualizationMode === 'periodic' }"
            @click="setVisualizationMode('periodic')"
          >
            <span class="mode-icon">🧪</span>
            <span class="mode-text">Periodic Table</span>
          </button>
        </div>
      </div>

      <!-- Visual Settings Section -->
      <div class="control-section">
        <h4>🎨 Visual Settings</h4>
        
        <div class="setting-group">
          <label>Vector Size</label>
          <div class="slider-container">
            <input 
              type="range" 
              v-model="vectorSize" 
              min="0.5" 
              max="3" 
              step="0.1"
              class="setting-slider"
            >
            <span class="slider-value">{{ vectorSize }}x</span>
          </div>
        </div>

        <div class="setting-group">
          <label>Opacity</label>
          <div class="slider-container">
            <input 
              type="range" 
              v-model="vectorOpacity" 
              min="0.1" 
              max="1" 
              step="0.1"
              class="setting-slider"
            >
            <span class="slider-value">{{ Math.round(vectorOpacity * 100) }}%</span>
          </div>
        </div>

        <div class="setting-group">
          <label>Animation Speed</label>
          <div class="slider-container">
            <input 
              type="range" 
              v-model="animationSpeed" 
              min="0.1" 
              max="2" 
              step="0.1"
              class="setting-slider"
            >
            <span class="slider-value">{{ animationSpeed }}x</span>
          </div>
        </div>
      </div>

      <!-- Force Visualization Section -->
      <div class="control-section">
        <h4>⚡ Force Visualization</h4>
        
        <div class="toggle-group">
          <label class="toggle-label">
            <input 
              type="checkbox" 
              v-model="showForces" 
              @change="toggleForces"
            >
            <span class="toggle-switch"></span>
            Show Force Lines
          </label>
        </div>

        <div v-if="showForces" class="force-options">
          <div class="setting-group">
            <label>Force Strength</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model="forceStrength" 
                min="0.1" 
                max="2" 
                step="0.1"
                class="setting-slider"
              >
              <span class="slider-value">{{ forceStrength }}x</span>
            </div>
          </div>

          <div class="setting-group">
            <label>Force Type</label>
            <select v-model="forceType" class="setting-select">
              <option value="cosine">Cosine Similarity</option>
              <option value="euclidean">Euclidean Distance</option>
              <option value="correlation">Correlation</option>
              <option value="manhattan">Manhattan Distance</option>
              <option value="resonance">Resonance Force</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Color and Theme Section -->
      <div class="control-section">
        <h4>🌈 Colors & Theme</h4>
        
        <div class="setting-group">
          <label>Color Scheme</label>
          <div class="color-scheme-grid">
            <button 
              v-for="scheme in colorSchemes" 
              :key="scheme.name"
              class="color-scheme-btn"
              :class="{ active: colorScheme === scheme.name }"
              @click="setColorScheme(scheme.name)"
            >
              <div class="color-preview">
                <span 
                  v-for="color in scheme.colors" 
                  :key="color"
                  class="color-dot" 
                  :style="{ backgroundColor: color }"
                ></span>
              </div>
              <span class="scheme-name">{{ scheme.name }}</span>
            </button>
          </div>
        </div>

        <div class="toggle-group">
          <label class="toggle-label">
            <input 
              type="checkbox" 
              v-model="showLabels" 
              @change="toggleLabels"
            >
            <span class="toggle-switch"></span>
            Show Vector Labels
          </label>
        </div>

        <div class="toggle-group">
          <label class="toggle-label">
            <input 
              type="checkbox" 
              v-model="showGrid" 
              @change="toggleGrid"
            >
            <span class="toggle-switch"></span>
            Show Grid
          </label>
        </div>
      </div>

      <!-- Performance Section -->
      <div class="control-section">
        <h4>🚀 Performance</h4>
        
        <div class="performance-info">
          <div class="perf-metric">
            <span class="metric-label">FPS:</span>
            <span class="metric-value">{{ performanceMetrics.fps || 0 }}</span>
          </div>
          <div class="perf-metric">
            <span class="metric-label">Memory:</span>
            <span class="metric-value">{{ performanceMetrics.memory || 0 }}MB</span>
          </div>
        </div>

        <div class="toggle-group">
          <label class="toggle-label">
            <input 
              type="checkbox" 
              v-model="performanceMode" 
              @change="togglePerformanceMode"
            >
            <span class="toggle-switch"></span>
            Performance Mode
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="panel-actions">
        <button class="btn-secondary" @click="resetVisualization">
          🔄 Reset View
        </button>
        <button class="btn-secondary" @click="exportVisualization">
          📸 Export Image
        </button>
        <button class="btn-primary" @click="openFullscreen">
          📺 Fullscreen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue'
import { useVectorStore } from '../../stores/vectorStore'
import { useUIStore } from '../../stores/uiStore'

const vectorStore = useVectorStore()
const uiStore = useUIStore()
const performanceOptimizer = inject('performanceOptimizer')
const exportManager = inject('exportManager')

// Visualization settings
const visualizationMode = ref('2d')
const vectorSize = ref(1)
const vectorOpacity = ref(0.8)
const animationSpeed = ref(1)
const showForces = ref(false)
const forceStrength = ref(1)
const forceType = ref('cosine')
const colorScheme = ref('default')
const showLabels = ref(false)
const showGrid = ref(false)
const performanceMode = ref(false)

// Color schemes
const colorSchemes = ref([
  {
    name: 'default',
    colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c']
  },
  {
    name: 'neon',
    colors: ['#ff0080', '#00ff80', '#8000ff', '#ff8000']
  },
  {
    name: 'ocean',
    colors: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7']
  },
  {
    name: 'sunset',
    colors: ['#fa709a', '#fee140', '#ff9a9e', '#fecfef']
  },
  {
    name: 'monochrome',
    colors: ['#ffffff', '#cccccc', '#999999', '#666666']
  }
])

// Performance metrics
const performanceMetrics = computed(() => {
  return performanceOptimizer?.performanceMetrics?.value || { fps: 0, memory: 0 }
})

// Methods
const setVisualizationMode = (mode) => {
  visualizationMode.value = mode
  
  if (mode === '3d') {
    uiStore.showSuccess('Switched to 3D visualization mode')
  } else if (mode === 'periodic') {
    uiStore.showSuccess('Switched to periodic table view')
  } else {
    uiStore.showSuccess('Switched to 2D visualization mode')
  }
}

const toggleForces = () => {
  // Implementation would connect to the vector visualization
  uiStore.showInfo(`Force visualization ${showForces.value ? 'enabled' : 'disabled'}`)
}

const setColorScheme = (scheme) => {
  colorScheme.value = scheme
  uiStore.showInfo(`Color scheme changed to ${scheme}`)
}

const toggleLabels = () => {
  uiStore.showInfo(`Vector labels ${showLabels.value ? 'enabled' : 'disabled'}`)
}

const toggleGrid = () => {
  uiStore.showInfo(`Grid ${showGrid.value ? 'enabled' : 'disabled'}`)
}

const togglePerformanceMode = () => {
  if (performanceOptimizer) {
    if (performanceMode.value) {
      performanceOptimizer.optimizeForLowPerformance()
      uiStore.showSuccess('Performance mode enabled')
    } else {
      performanceOptimizer.restoreHighQuality()
      uiStore.showSuccess('Performance mode disabled')
    }
  }
}

const resetVisualization = () => {
  visualizationMode.value = '2d'
  vectorSize.value = 1
  vectorOpacity.value = 0.8
  animationSpeed.value = 1
  showForces.value = false
  forceStrength.value = 1
  forceType.value = 'cosine'
  colorScheme.value = 'default'
  showLabels.value = false
  showGrid.value = false
  performanceMode.value = false
  
  uiStore.showSuccess('Visualization settings reset to defaults')
}

const exportVisualization = () => {
  if (exportManager) {
    exportManager.exportPNG()
  } else {
    uiStore.showError('Export functionality not available')
  }
}

const openFullscreen = () => {
  const element = document.querySelector('.visualization-container')
  if (element && element.requestFullscreen) {
    element.requestFullscreen()
    uiStore.showSuccess('Entered fullscreen mode')
  } else {
    uiStore.showError('Fullscreen not supported')
  }
}

// Watch for performance changes
watch(() => performanceMetrics.value.fps, (newFps) => {
  if (newFps < 20 && !performanceMode.value) {
    uiStore.showError('Low performance detected. Consider enabling performance mode.')
  }
})
</script>

<style scoped>
.visualization-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.panel-header h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.2em;
}

.panel-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9em;
}

.panel-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.control-section {
  margin-bottom: 2rem;
}

.control-section h4 {
  margin: 0 0 1rem 0;
  color: var(--primary);
  font-size: 1em;
  font-weight: 600;
}

.mode-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.mode-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.mode-icon {
  font-size: 1.5em;
}

.mode-text {
  font-size: 0.9em;
  font-weight: 500;
}

.setting-group {
  margin-bottom: 1rem;
}

.setting-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9em;
  font-weight: 500;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.setting-slider {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.setting-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--primary);
  border-radius: 50%;
  cursor: pointer;
}

.slider-value {
  min-width: 50px;
  text-align: right;
  color: var(--text-primary);
  font-size: 0.9em;
  font-weight: 600;
}

.setting-select {
  width: 100%;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.9em;
}

.toggle-group {
  margin-bottom: 1rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.9em;
}

.toggle-label input[type="checkbox"] {
  display: none;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: background-color 0.3s ease;
}

.toggle-switch::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease;
}

.toggle-label input[type="checkbox"]:checked + .toggle-switch {
  background: var(--primary);
}

.toggle-label input[type="checkbox"]:checked + .toggle-switch::before {
  transform: translateX(20px);
}

.force-options {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  border-left: 3px solid var(--primary);
}

.color-scheme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
}

.color-scheme-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-scheme-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.color-scheme-btn.active {
  border-color: var(--primary);
  background: rgba(102, 126, 234, 0.1);
}

.color-preview {
  display: flex;
  gap: 2px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.scheme-name {
  font-size: 0.8em;
  text-transform: capitalize;
}

.performance-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.perf-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.metric-label {
  font-size: 0.8em;
  color: var(--text-secondary);
}

.metric-value {
  font-size: 1.1em;
  font-weight: 600;
  color: var(--primary);
}

.panel-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.panel-actions button {
  flex: 1;
}

@media (max-width: 768px) {
  .panel-content {
    padding: 1rem;
  }
  
  .mode-selector {
    grid-template-columns: 1fr;
  }
  
  .color-scheme-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .panel-actions {
    flex-direction: column;
  }
}
</style> 