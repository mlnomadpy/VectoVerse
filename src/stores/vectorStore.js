import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useVectorStore = defineStore('vector', () => {
  // State
  const framework = ref(null)
  const vectors = ref([])
  const selectedVectorId = ref(null)
  const dimensions = ref(4)
  const numVectors = ref(6)
  const forcesEnabled = ref(false)
  const forceType = ref('resonance')
  const neuralModeActive = ref(false)
  const activationFunction = ref('sigmoid')
  const learningRate = ref(0.01)

  // Getters
  const selectedVector = computed(() => {
    if (!selectedVectorId.value || !vectors.value.length) return null
    return vectors.value.find(v => v.id === selectedVectorId.value)
  })

  const vectorCount = computed(() => vectors.value.length)

  const averageMagnitude = computed(() => {
    if (!vectors.value.length) return 0
    const sum = vectors.value.reduce((acc, v) => acc + (v.magnitude || 0), 0)
    return sum / vectors.value.length
  })

  const maxSimilarity = computed(() => {
    if (!vectors.value.length || !framework.value) return 0
    let max = 0
    
    for (let i = 0; i < vectors.value.length; i++) {
      for (let j = i + 1; j < vectors.value.length; j++) {
        const similarity = framework.value.modules.vectorOperations.cosineSimilarity(
          vectors.value[i].values,
          vectors.value[j].values
        )
        max = Math.max(max, Math.abs(similarity))
      }
    }
    
    return max
  })

  const availableForceTypes = computed(() => {
    return framework.value ? framework.value.getAvailableForceTypes() : []
  })

  const availableActivationFunctions = computed(() => {
    return framework.value ? framework.value.getAvailableActivationFunctions() : []
  })

  // Actions
  const setFramework = (frameworkInstance) => {
    framework.value = frameworkInstance
    
    // Subscribe to framework events
    if (frameworkInstance) {
      frameworkInstance.eventBus.on('vectorsUpdated', (data) => {
        vectors.value = data.vectors || []
      })
      
      frameworkInstance.eventBus.on('vectorSelected', (data) => {
        selectedVectorId.value = data.vectorId
      })
      
      frameworkInstance.eventBus.on('configChanged', () => {
        const config = frameworkInstance.getConfig()
        dimensions.value = config.dimensions
        numVectors.value = config.numVectors
      })
    }
  }

  const updateDimensions = (newDimensions) => {
    dimensions.value = newDimensions
    if (framework.value) {
      framework.value.updateConfig('dimensions', newDimensions)
    }
  }

  const updateNumVectors = (newNumVectors) => {
    numVectors.value = newNumVectors
    if (framework.value) {
      framework.value.updateConfig('numVectors', newNumVectors)
    }
  }

  const selectVector = (vectorId) => {
    selectedVectorId.value = vectorId
    if (framework.value) {
      framework.value.selectVector(vectorId)
    }
  }

  const generateVectors = () => {
    if (framework.value) {
      framework.value.stateManager.generateVectors()
    }
  }

  const toggleForces = () => {
    forcesEnabled.value = !forcesEnabled.value
    if (framework.value) {
      framework.value.updateConfig('showForces', forcesEnabled.value);
    }
  }

  const setForceType = (type) => {
    forceType.value = type
    if (framework.value) {
      framework.value.setForceType(type)
    }
  }

  const toggleNeuralMode = () => {
    if (framework.value) {
      const isActive = framework.value.isNeuralModeActive()
      
      if (isActive) {
        framework.value.deactivateNeuralNetworkMode()
      } else {
        framework.value.activateNeuralNetworkMode(selectedVectorId.value)
      }
    }
  }

  const setActivationFunction = (func) => {
    activationFunction.value = func
    if (framework.value) {
      framework.value.setActivationFunction(func)
    }
  }

  const setLearningRate = (rate) => {
    learningRate.value = rate
    if (framework.value) {
      framework.value.setLearningRate(rate)
    }
  }

  const addInputVector = () => {
    if (framework.value) {
      framework.value.addInputVector()
    }
  }

  const runAnalysis = () => {
    if (framework.value) {
      framework.value.modules.uiController.showAnalysisModal()
    }
  }

  const exportData = () => {
    if (framework.value) {
      return framework.value.exportEnhancedData()
    }
    return null
  }

  const loadVectorFile = (file) => {
    if (framework.value) {
      framework.value.modules.fileHandler.handleFileUpload({ target: { files: [file] } })
    }
  }

  return {
    // State
    framework,
    vectors,
    selectedVectorId,
    dimensions,
    numVectors,
    forcesEnabled,
    forceType,
    neuralModeActive,
    activationFunction,
    learningRate,
    
    // Getters
    selectedVector,
    vectorCount,
    averageMagnitude,
    maxSimilarity,
    availableForceTypes,
    availableActivationFunctions,
    
    // Actions
    setFramework,
    updateDimensions,
    updateNumVectors,
    selectVector,
    generateVectors,
    toggleForces,
    setForceType,
    toggleNeuralMode,
    setActivationFunction,
    setLearningRate,
    addInputVector,
    runAnalysis,
    exportData,
    loadVectorFile
  }
}) 