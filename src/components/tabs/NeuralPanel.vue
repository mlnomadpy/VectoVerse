<template>
  <div class="neural-panel">
    <div class="panel-header">
      <h3>🧠 Neural Network Mode</h3>
      <p>Transform vectors into neural network representations with advanced activation functions</p>
    </div>

    <div class="panel-content">
      <!-- Neural Mode Toggle -->
      <div class="control-section">
        <div class="neural-toggle-container">
          <label class="neural-toggle-label">
            <input 
              type="checkbox" 
              v-model="neuralModeActive" 
              @change="toggleNeuralMode"
            >
            <span class="neural-toggle-switch"></span>
            <span class="toggle-text">
              {{ neuralModeActive ? 'Neural Mode Active' : 'Activate Neural Mode' }}
            </span>
          </label>
        </div>
      </div>

      <!-- Neural Network Configuration -->
      <div v-if="neuralModeActive" class="neural-config">
        <!-- Input Vector Selection -->
        <div class="control-section">
          <h4>🎯 Input Vector</h4>
          <div class="input-vector-selection">
            <select v-model="selectedInputVector" @change="setInputVector" class="vector-select">
              <option value="">Select input vector...</option>
              <option 
                v-for="vector in vectorStore.vectors" 
                :key="vector.id" 
                :value="vector.id"
              >
                Vector {{ vector.id + 1 }} ({{ vector.components.length }}D)
              </option>
            </select>
            <button 
              v-if="selectedInputVector !== ''" 
              class="btn-secondary"
              @click="visualizeInputVector"
            >
              👁️ Visualize
            </button>
          </div>
        </div>

        <!-- Activation Function -->
        <div class="control-section">
          <h4>⚡ Activation Function</h4>
          <div class="activation-grid">
            <button 
              v-for="func in activationFunctions" 
              :key="func.name"
              class="activation-btn"
              :class="{ active: activationFunction === func.name }"
              @click="setActivationFunction(func.name)"
              :title="func.description"
            >
              <span class="activation-icon">{{ func.icon }}</span>
              <span class="activation-name">{{ func.name }}</span>
              <span class="activation-formula">{{ func.formula }}</span>
            </button>
          </div>
        </div>

        <!-- Network Parameters -->
        <div class="control-section">
          <h4>🔧 Network Parameters</h4>
          
          <div class="parameter-group">
            <label>Learning Rate</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model="learningRate" 
                min="0.001" 
                max="1" 
                step="0.001"
                class="parameter-slider"
                @input="updateLearningRate"
              >
              <span class="slider-value">{{ learningRate }}</span>
            </div>
          </div>

          <div class="parameter-group">
            <label>Threshold</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model="threshold" 
                min="0" 
                max="1" 
                step="0.01"
                class="parameter-slider"
              >
              <span class="slider-value">{{ threshold }}</span>
            </div>
          </div>

          <div class="parameter-group">
            <label>Network Depth</label>
            <div class="slider-container">
              <input 
                type="range" 
                v-model="networkDepth" 
                min="1" 
                max="5" 
                step="1"
                class="parameter-slider"
              >
              <span class="slider-value">{{ networkDepth }} layers</span>
            </div>
          </div>
        </div>

        <!-- Neural Visualization Settings -->
        <div class="control-section">
          <h4>🎨 Neural Visualization</h4>
          
          <div class="toggle-group">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="showConnections" 
                @change="toggleConnections"
              >
              <span class="toggle-switch"></span>
              Show Neural Connections
            </label>
          </div>

          <div class="toggle-group">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="showActivationRings" 
                @change="toggleActivationRings"
              >
              <span class="toggle-switch"></span>
              Show Activation Rings
            </label>
          </div>

          <div class="toggle-group">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                v-model="animateNeuralFlow" 
                @change="toggleNeuralFlow"
              >
              <span class="toggle-switch"></span>
              Animate Neural Flow
            </label>
          </div>
        </div>

        <!-- Neural Network Stats -->
        <div class="control-section">
          <h4>📊 Network Statistics</h4>
          <div class="neural-stats">
            <div class="stat-item">
              <span class="stat-label">Active Neurons:</span>
              <span class="stat-value">{{ neuralStats.activeNeurons }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Connections:</span>
              <span class="stat-value">{{ neuralStats.totalConnections }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Network Energy:</span>
              <span class="stat-value">{{ neuralStats.networkEnergy.toFixed(3) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Convergence:</span>
              <span class="stat-value">{{ (neuralStats.convergence * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>

        <!-- Neural Training -->
        <div class="control-section">
          <h4>🏋️ Neural Training</h4>
          
          <div class="training-controls">
            <button 
              class="btn-primary"
              :disabled="!selectedInputVector || isTraining"
              @click="startTraining"
            >
              {{ isTraining ? 'Training...' : '🚀 Start Training' }}
            </button>
            
            <button 
              class="btn-secondary"
              :disabled="!isTraining"
              @click="pauseTraining"
            >
              ⏸️ Pause
            </button>
            
            <button 
              class="btn-secondary"
              @click="resetNetwork"
            >
              🔄 Reset Network
            </button>
          </div>

          <div v-if="isTraining" class="training-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: trainingProgress + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ trainingProgress.toFixed(1) }}% - Epoch {{ currentEpoch }}</span>
          </div>
        </div>

        <!-- Help Information -->
        <div class="control-section">
          <h4>ℹ️ Neural Mode Help</h4>
          <div class="help-content">
            <details class="help-details">
              <summary>🎯 How Neural Mode Works</summary>
              <p>Neural mode transforms your vector space into a neural network where each vector becomes a neuron. 
                 The connections between neurons are determined by vector similarities and the chosen activation function.</p>
            </details>
            
            <details class="help-details">
              <summary>⚡ Activation Functions</summary>
              <ul>
                <li><strong>Sigmoid:</strong> Smooth activation, good for gradual transitions</li>
                <li><strong>Tanh:</strong> Symmetric activation, centered around zero</li>
                <li><strong>ReLU:</strong> Simple and effective, commonly used in deep learning</li>
                <li><strong>Softmax:</strong> Probability distribution, good for classification</li>
              </ul>
            </details>
            
            <details class="help-details">
              <summary>🏋️ Training Process</summary>
              <p>Training adjusts the neural connections based on the input vector. The network learns to respond 
                 to similar patterns and creates emergent behaviors in the vector space.</p>
            </details>
          </div>
        </div>
      </div>

      <!-- Neural Mode Disabled State -->
      <div v-else class="neural-disabled">
        <div class="disabled-content">
          <div class="disabled-icon">🧠</div>
          <h4>Neural Network Mode</h4>
          <p>Transform your vector space into an interactive neural network. Enable neural mode to:</p>
          <ul>
            <li>Visualize vectors as neurons with activation functions</li>
            <li>See neural connections and signal flow</li>
            <li>Train the network with custom input vectors</li>
            <li>Explore emergent behaviors in high-dimensional space</li>
          </ul>
          <button class="btn-primary" @click="neuralModeActive = true; toggleNeuralMode()">
            🚀 Activate Neural Mode
          </button>
        </div>
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
const framework = inject('framework')

// Neural mode state
const neuralModeActive = ref(false)
const selectedInputVector = ref('')
const activationFunction = ref('sigmoid')
const learningRate = ref(0.01)
const threshold = ref(0.5)
const networkDepth = ref(2)

// Visualization settings
const showConnections = ref(true)
const showActivationRings = ref(true)
const animateNeuralFlow = ref(true)

// Training state
const isTraining = ref(false)
const trainingProgress = ref(0)
const currentEpoch = ref(0)

// Activation functions
const activationFunctions = ref([
  {
    name: 'sigmoid',
    icon: '📈',
    formula: '1/(1+e^-x)',
    description: 'Sigmoid activation function - smooth and differentiable'
  },
  {
    name: 'tanh',
    icon: '🌊',
    formula: 'tanh(x)',
    description: 'Hyperbolic tangent - symmetric around zero'
  },
  {
    name: 'relu',
    icon: '⚡',
    formula: 'max(0,x)',
    description: 'Rectified Linear Unit - simple and effective'
  },
  {
    name: 'leaky_relu',
    icon: '⚡',
    formula: 'max(0.1x,x)',
    description: 'Leaky ReLU - prevents dead neurons'
  },
  {
    name: 'softmax',
    icon: '🎯',
    formula: 'e^x/Σe^x',
    description: 'Softmax - probability distribution output'
  },
  {
    name: 'swish',
    icon: '🌀',
    formula: 'x*sigmoid(x)',
    description: 'Swish - smooth and self-gated'
  }
])

// Neural statistics
const neuralStats = computed(() => {
  if (!neuralModeActive.value) {
    return {
      activeNeurons: 0,
      totalConnections: 0,
      networkEnergy: 0,
      convergence: 0
    }
  }

  const vectors = vectorStore.vectors
  return {
    activeNeurons: vectors.length,
    totalConnections: vectors.length * (vectors.length - 1) / 2,
    networkEnergy: Math.random() * 10, // Placeholder calculation
    convergence: Math.min(trainingProgress.value / 100, 1)
  }
})

// Methods
const toggleNeuralMode = () => {
  if (neuralModeActive.value) {
    // Activate neural mode
    uiStore.showSuccess('Neural Network Mode activated! 🧠')
    uiStore.setNeuralModeActive(true)
    
    // Initialize with first vector if available
    if (vectorStore.vectors.length > 0 && !selectedInputVector.value) {
      selectedInputVector.value = vectorStore.vectors[0].id
    }
  } else {
    // Deactivate neural mode
    uiStore.showInfo('Neural Network Mode deactivated')
    uiStore.setNeuralModeActive(false)
    resetNetwork()
  }
}

const setInputVector = () => {
  if (selectedInputVector.value && framework.value) {
    const vectorId = parseInt(selectedInputVector.value)
    uiStore.showInfo(`Selected Vector ${vectorId + 1} as neural network input`)
    
    // Highlight the selected vector
    vectorStore.selectVector(vectorId)
  }
}

const visualizeInputVector = () => {
  if (selectedInputVector.value) {
    const vectorId = parseInt(selectedInputVector.value)
    vectorStore.selectVector(vectorId)
    uiStore.showSuccess(`Visualizing Vector ${vectorId + 1} as neural input`)
  }
}

const setActivationFunction = (funcName) => {
  activationFunction.value = funcName
  const func = activationFunctions.value.find(f => f.name === funcName)
  uiStore.showInfo(`Activation function changed to ${func.name}: ${func.formula}`)
  
  // Update in vector store
  vectorStore.setActivationFunction(funcName)
}

const updateLearningRate = () => {
  vectorStore.setLearningRate(learningRate.value)
}

const toggleConnections = () => {
  uiStore.showInfo(`Neural connections ${showConnections.value ? 'enabled' : 'disabled'}`)
}

const toggleActivationRings = () => {
  uiStore.showInfo(`Activation rings ${showActivationRings.value ? 'enabled' : 'disabled'}`)
}

const toggleNeuralFlow = () => {
  uiStore.showInfo(`Neural flow animation ${animateNeuralFlow.value ? 'enabled' : 'disabled'}`)
}

const startTraining = () => {
  if (!selectedInputVector.value) {
    uiStore.showError('Please select an input vector first')
    return
  }

  isTraining.value = true
  trainingProgress.value = 0
  currentEpoch.value = 0
  
  uiStore.showSuccess('Neural network training started! 🏋️')
  
  // Simulate training progress
  const trainingInterval = setInterval(() => {
    trainingProgress.value += Math.random() * 5
    currentEpoch.value++
    
    if (trainingProgress.value >= 100) {
      trainingProgress.value = 100
      isTraining.value = false
      clearInterval(trainingInterval)
      uiStore.showSuccess('Neural network training completed! 🎉')
    }
  }, 200)
}

const pauseTraining = () => {
  isTraining.value = false
  uiStore.showInfo('Neural network training paused')
}

const resetNetwork = () => {
  isTraining.value = false
  trainingProgress.value = 0
  currentEpoch.value = 0
  selectedInputVector.value = ''
  activationFunction.value = 'sigmoid'
  learningRate.value = 0.01
  threshold.value = 0.5
  
  uiStore.showInfo('Neural network reset to initial state')
}

// Watch for vector changes
watch(() => vectorStore.vectors.length, (newLength) => {
  if (newLength === 0) {
    neuralModeActive.value = false
    uiStore.setNeuralModeActive(false)
  }
})
</script>

<style scoped>
.neural-panel {
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

/* Neural Mode Toggle */
.neural-toggle-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.neural-toggle-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 500;
}
.neural-toggle-label input {
  display: none;
}
.neural-toggle-switch {
  position: relative;
  width: 50px;
  height: 28px;
  background-color: var(--bg-tertiary);
  border-radius: 14px;
  transition: background-color 0.2s;
}
.neural-toggle-switch::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: var(--text-primary);
  top: 3px;
  left: 3px;
  transition: transform 0.2s;
}
.neural-toggle-label input:checked + .neural-toggle-switch {
  background-color: var(--accent-primary);
}
.neural-toggle-label input:checked + .neural-toggle-switch::before {
  transform: translateX(22px);
}
.toggle-text {
  color: var(--text-primary);
}


/* Input Vector Selection */
.input-vector-selection {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.vector-select {
  flex-grow: 1;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.5rem 0.8rem;
  font-size: 1rem;
}

/* Activation Grid */
.activation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}
.activation-btn {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.activation-btn:hover {
  border-color: var(--accent-primary);
  background-color: var(--bg-primary);
}
.activation-btn.active {
  border-color: var(--accent-primary);
  background-color: var(--bg-primary);
  box-shadow: 0 0 10px var(--accent-primary);
}
.activation-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.5rem;
}
.activation-name {
  font-weight: 600;
  display: block;
}
.activation-formula {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

/* Parameter Sliders */
.parameter-group {
  margin-bottom: 1rem;
}
.parameter-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}
.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.parameter-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  outline: none;
  border-radius: 4px;
}
.parameter-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--accent-primary);
  cursor: pointer;
  border-radius: 50%;
}
.parameter-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--accent-primary);
  cursor: pointer;
  border-radius: 50%;
}
.slider-value {
  font-weight: 500;
  min-width: 80px;
  text-align: right;
}

/* Visualization Toggles */
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

/* Stats */
.neural-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.stat-item {
  background-color: var(--bg-tertiary);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
}
.stat-label {
  color: var(--text-secondary);
}
.stat-value {
  font-weight: 600;
  font-family: var(--font-mono);
}

/* Training */
.training-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.training-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.progress-bar {
  flex-grow: 1;
  height: 12px;
  background-color: var(--bg-tertiary);
  border-radius: 6px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background-color: var(--status-success);
  transition: width 0.3s;
}
.progress-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Help Section */
.help-details {
  background-color: var(--bg-tertiary);
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid var(--border-color);
}
.help-details summary {
  cursor: pointer;
  font-weight: 500;
  outline: none;
}
.help-details p, .help-details ul {
  margin-top: 0.75rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
}
.help-details ul {
  padding-left: 1.5rem;
}

/* Button styles (assuming these are defined globally, but can be scoped) */
.btn-primary {
  background-color: var(--accent-primary);
  color: var(--text-primary-inverse, #fff);
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
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
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover:not(:disabled) {
  background-color: var(--bg-quaternary);
  border-color: var(--accent-primary);
}
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.neural-disabled {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

.disabled-content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.disabled-icon {
  font-size: 4em;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.disabled-content h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.3em;
}

.disabled-content p {
  margin: 0 0 1rem 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.disabled-content ul {
  text-align: left;
  margin: 0 0 2rem 0;
  color: var(--text-secondary);
}

.disabled-content li {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .panel-content {
    padding: 1rem;
  }
  
  .activation-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .neural-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .training-controls {
    flex-direction: column;
  }
  
  .input-vector-selection {
    flex-direction: column;
  }
}
</style> 