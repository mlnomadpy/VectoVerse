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
  padding: 1rem 1.5rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  height: 100%;
  overflow-y: auto;
}

.panel-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.panel-header h3 {
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
  color: var(--accent-primary);
}

.panel-header p {
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.control-section {
  background-color: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.control-section h4 {
  font-size: 1.2rem;
  color: var(--accent-secondary);
  margin-top: 0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

/* Mode Selector */
.mode-selector {
  display: flex;
  justify-content: center;
  gap: 1rem;
  background-color: var(--bg-tertiary);
  padding: 0.5rem;
  border-radius: 8px;
}
.mode-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: none;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
}
.mode-btn:hover {
  background-color: var(--bg-quaternary);
  color: var(--text-primary);
}
.mode-btn.active {
  background-color: var(--accent-primary);
  color: var(--text-primary-inverse, #fff);
  box-shadow: 0 4px 10px var(--accent-primary-transparent, rgba(0, 122, 255, 0.25));
}
.mode-icon {
  font-size: 1.2rem;
}

/* Setting Sliders */
.setting-group {
  margin-bottom: 1rem;
}
.setting-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}
.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.setting-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  outline: none;
  border-radius: 4px;
}
.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--accent-primary);
  cursor: pointer;
  border-radius: 50%;
}
.setting-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--accent-primary);
  cursor: pointer;
  border-radius: 50%;
}
.slider-value {
  font-weight: 500;
  min-width: 60px;
  text-align: right;
}
.setting-select {
  width: 100%;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.5rem 0.8rem;
}

/* Toggle Switches */
.toggle-group {
  margin-bottom: 0.75rem;
}
.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}
.toggle-label input {
  display: none;
}
.toggle-switch {
  position: relative;
  width: 40px;
  height: 22px;
  background-color: var(--bg-tertiary);
  border-radius: 11px;
  transition: background-color 0.2s;
}
.toggle-switch::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--text-primary);
  top: 3px;
  left: 3px;
  transition: transform 0.2s;
}
.toggle-label input:checked + .toggle-switch {
  background-color: var(--accent-secondary);
}
.toggle-label input:checked + .toggle-switch::before {
  transform: translateX(18px);
}

/* Color Scheme */
.color-scheme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}
.color-scheme-btn {
  background-color: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}
.color-scheme-btn:hover {
  border-color: var(--accent-primary);
}
.color-scheme-btn.active {
  border-color: var(--accent-primary);
  box-shadow: 0 0 8px var(--accent-primary);
}
.color-preview {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 0.5rem;
}
.color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
}
.scheme-name {
  font-weight: 500;
  color: var(--text-primary);
}

/* Performance */
.performance-info {
  display: flex;
  justify-content: space-around;
  background-color: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}
.perf-metric {
  text-align: center;
}
.metric-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}
.metric-value {
  display: block;
  font-size: 1.4rem;
  font-weight: 600;
  font-family: var(--font-mono);
}

/* Actions */
.panel-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

/* Base Button Styles */
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
.btn-primary:hover {
  background-color: var(--accent-secondary);
}

.btn-secondary {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
.btn-secondary:hover {
  background-color: var(--bg-quaternary);
  border-color: var(--accent-primary);
}
</style> 