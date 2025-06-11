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
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(30, 144, 255, 0.1) 100%);
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

.neural-toggle-container {
  text-align: center;
  padding: 1.5rem;
  background: rgba(138, 43, 226, 0.05);
  border-radius: 12px;
  border: 2px dashed rgba(138, 43, 226, 0.3);
}

.neural-toggle-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: 600;
}

.neural-toggle-label input[type="checkbox"] {
  display: none;
}

.neural-toggle-switch {
  position: relative;
  width: 60px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  transition: all 0.3s ease;
}

.neural-toggle-switch::before {
  content: '';
  position: absolute;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
}

.neural-toggle-label input[type="checkbox"]:checked + .neural-toggle-switch {
  background: linear-gradient(135deg, #8a2be2, #1e90ff);
}

.neural-toggle-label input[type="checkbox"]:checked + .neural-toggle-switch::before {
  transform: translateX(30px);
}

.toggle-text {
  color: var(--text-primary);
}

.input-vector-selection {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.vector-select {
  flex: 1;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.9em;
}

.activation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.activation-btn {
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
  text-align: center;
}

.activation-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.activation-btn.active {
  background: linear-gradient(135deg, #8a2be2, #1e90ff);
  color: white;
  border-color: #8a2be2;
}

.activation-icon {
  font-size: 1.5em;
}

.activation-name {
  font-size: 0.9em;
  font-weight: 600;
  text-transform: capitalize;
}

.activation-formula {
  font-size: 0.7em;
  font-family: 'Monaco', 'Menlo', monospace;
  opacity: 0.8;
}

.parameter-group {
  margin-bottom: 1rem;
}

.parameter-group label {
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

.parameter-slider {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.parameter-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #8a2be2, #1e90ff);
  border-radius: 50%;
  cursor: pointer;
}

.slider-value {
  min-width: 60px;
  text-align: right;
  color: var(--text-primary);
  font-size: 0.9em;
  font-weight: 600;
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
  background: linear-gradient(135deg, #8a2be2, #1e90ff);
}

.toggle-label input[type="checkbox"]:checked + .toggle-switch::before {
  transform: translateX(20px);
}

.neural-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  text-align: center;
}

.stat-label {
  font-size: 0.8em;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 1.1em;
  font-weight: 600;
  color: var(--primary);
}

.training-controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.training-controls button {
  flex: 1;
}

.training-progress {
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8a2be2, #1e90ff);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9em;
  color: var(--text-secondary);
}

.help-content {
  font-size: 0.9em;
}

.help-details {
  margin-bottom: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  border-left: 3px solid var(--primary);
}

.help-details summary {
  padding: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  color: var(--primary);
}

.help-details p,
.help-details ul {
  padding: 0 0.75rem 0.75rem 0.75rem;
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.help-details li {
  margin-bottom: 0.25rem;
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