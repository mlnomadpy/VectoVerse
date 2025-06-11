import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useConfigStore } from './configStore'
import { vectorOperations } from '../utils/vectorUtils'

export const useVectorStore = defineStore('vector', () => {
  // State
  const vectors = ref([])
  const selectedVectorIds = ref(new Set());
  const inputVector = ref(null)
  const forceType = ref('resonance')
  const activationFunction = ref('sigmoid')
  const learningRate = ref(0.01)

  // Getters
  const selectedVectors = computed(() => {
    return vectors.value.filter(v => selectedVectorIds.value.has(v.id))
  })

  const vectorCount = computed(() => vectors.value.length)

  const averageMagnitude = computed(() => {
    if (!vectors.value.length) return 0;
    const sum = vectors.value.reduce((acc, v) => {
        const magnitude = Math.sqrt(v.components.reduce((sum, c) => sum + c*c, 0));
        return acc + (magnitude || 0);
    }, 0);
    return sum / vectors.value.length;
  });

  const availableForceTypes = computed(() => ['resonance', 'gravity', 'repulsion'])

  const availableActivationFunctions = computed(() => [
    'sigmoid', 'tanh', 'relu', 'leaky_relu', 'softplus', 'swish', 'softmax', 'softermax', 'soft_sigmoid'
  ])

  const maxSimilarity = computed(() => {
    if (vectors.value.length < 2) return 0
    let max = 0
    for (let i = 0; i < vectors.value.length; i++) {
      for (let j = i + 1; j < vectors.value.length; j++) {
        const sim = vectorOperations.cosineSimilarity(
          vectors.value[i].components,
          vectors.value[j].components
        )
        if (sim > max) max = sim
      }
    }
    return max
  })

  // Actions
  function generateVectors() {
    const configStore = useConfigStore()
    const newVectors = []
    const margin = 80

    for (let i = 0; i < configStore.numVectors; i++) {
      const vector = {
        id: i,
        components: [],
        x: Math.random() * (configStore.width - 2 * margin) + margin,
        y: Math.random() * (configStore.height - 2 * margin) + margin,
      }

      for (let d = 0; d < configStore.dimensions; d++) {
        vector.components.push((Math.random() - 0.5) * 2)
      }
      newVectors.push(vector)
    }
    vectors.value = newVectors
    selectedVectorIds.value.clear();
    inputVector.value = null
  }

  function selectVector(vectorId, isMultiSelect = false) {
    if (!isMultiSelect) {
      if (selectedVectorIds.value.has(vectorId) && selectedVectorIds.value.size === 1) {
        selectedVectorIds.value.clear();
      } else {
        selectedVectorIds.value.clear();
        selectedVectorIds.value.add(vectorId);
      }
    } else {
      if (selectedVectorIds.value.has(vectorId)) {
        selectedVectorIds.value.delete(vectorId);
      } else {
        selectedVectorIds.value.add(vectorId);
      }
    }
  }

  function addInputVector() {
    const configStore = useConfigStore()
    const newIV = {
      id: 'input',
      components: [],
      x: Math.random() * (configStore.width - 100) + 50,
      y: Math.random() * (configStore.height - 100) + 50,
      isInput: true,
    }
    for (let d = 0; d < configStore.dimensions; d++) {
      newIV.components.push((Math.random() - 0.5) * 2)
    }
    inputVector.value = newIV
  }

  function removeInputVector() {
    inputVector.value = null
  }

  function randomizeInputVector() {
    if (!inputVector.value) return
    for (let i = 0; i < inputVector.value.components.length; i++) {
      inputVector.value.components[i] = (Math.random() - 0.5) * 2
    }
  }

  function updateInputVectorComponent(index, value) {
    if (!inputVector.value) return
    inputVector.value.components[index] = value
  }

  function removeVector(vectorId) {
    vectors.value = vectors.value.filter(v => v.id !== vectorId)
    selectedVectorIds.value.delete(vectorId);
  }

  function addCustomVector(components) {
    const configStore = useConfigStore()
    const margin = 80
    const vector = {
      id: vectors.value.length > 0 ? Math.max(...vectors.value.map(v => v.id)) + 1 : 0,
      components: components,
      x: Math.random() * (configStore.width - 2 * margin) + margin,
      y: Math.random() * (configStore.height - 2 * margin) + margin,
      isCustom: true
    }
    vectors.value.push(vector)
    configStore.updateConfig('numVectors', vectors.value.length)
  }

  function setVectorCustomColor(vectorId, color) {
    const vector = vectors.value.find(v => v.id === vectorId)
    if (vector) {
      vector.customColor = color
    }
  }

  function setVectorScale(vectorId, scale) {
    const vector = vectors.value.find(v => v.id === vectorId)
    if (vector) {
      vector.scale = scale
    }
  }

  function setForceType(type) {
    forceType.value = type
  }

  function setActivationFunction(func) {
    activationFunction.value = func
  }

  function setLearningRate(rate) {
    learningRate.value = rate
  }

  return {
    // State
    vectors,
    selectedVectorIds,
    inputVector,
    forceType,
    activationFunction,
    learningRate,
    // Getters
    selectedVectors,
    vectorCount,
    averageMagnitude,
    availableForceTypes,
    availableActivationFunctions,
    maxSimilarity,
    // Actions
    generateVectors,
    selectVector,
    addInputVector,
    removeInputVector,
    randomizeInputVector,
    updateInputVectorComponent,
    removeVector,
    addCustomVector,
    setVectorCustomColor,
    setVectorScale,
    setForceType,
    setActivationFunction,
    setLearningRate
  }
}) 