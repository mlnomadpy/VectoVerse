import { ref, computed, toRefs } from 'vue'
import { vectorOperations, vectorGeneration, vectorStatistics } from '../utils/vectorUtils.js'
import { useVectorStore } from '../stores/vectorStore.js'

/**
 * Vue Composable for Vector Operations
 * Provides reactive vector manipulation and analysis functions
 */
export function useVectorOperations() {
  const vectorStore = useVectorStore()
  
  // Reactive state
  const isCalculating = ref(false)
  const lastError = ref(null)
  const operationHistory = ref([])
  
  // Computed properties
  const selectedVector = computed(() => vectorStore.selectedVector)
  const allVectors = computed(() => vectorStore.vectors)
  const currentDimensions = computed(() => vectorStore.dimensions)
  
  /**
   * Execute vector operation with error handling
   * @param {Function} operation - Operation to execute
   * @param {string} operationName - Name for history tracking
   * @returns {Promise<any>} Operation result
   */
  const executeOperation = async (operation, operationName) => {
    isCalculating.value = true
    lastError.value = null
    
    try {
      const result = await operation()
      
      // Add to operation history
      operationHistory.value.unshift({
        name: operationName,
        timestamp: new Date(),
        success: true,
        result: typeof result === 'object' ? { ...result } : result
      })
      
      // Keep only last 50 operations
      if (operationHistory.value.length > 50) {
        operationHistory.value = operationHistory.value.slice(0, 50)
      }
      
      return result
    } catch (error) {
      lastError.value = error.message
      
      operationHistory.value.unshift({
        name: operationName,
        timestamp: new Date(),
        success: false,
        error: error.message
      })
      
      throw error
    } finally {
      isCalculating.value = false
    }
  }
  
  // Vector Creation Operations
  const createRandomVector = async (dimensions = null) => {
    return executeOperation(async () => {
      const dims = dimensions || currentDimensions.value
      const vector = vectorGeneration.random(dims, -10, 10)
      return {
        id: `random_${Date.now()}`,
        values: vector,
        magnitude: vectorOperations.magnitude(vector),
        created: new Date(),
        type: 'random'
      }
    }, 'Create Random Vector')
  }
  
  const createZeroVector = async (dimensions = null) => {
    return executeOperation(async () => {
      const dims = dimensions || currentDimensions.value
      const vector = vectorGeneration.zero(dims)
      return {
        id: `zero_${Date.now()}`,
        values: vector,
        magnitude: 0,
        created: new Date(),
        type: 'zero'
      }
    }, 'Create Zero Vector')
  }
  
  const createUnitVector = async (activeIndex, dimensions = null) => {
    return executeOperation(async () => {
      const dims = dimensions || currentDimensions.value
      const vector = vectorGeneration.unit(dims, activeIndex)
      return {
        id: `unit_${activeIndex}_${Date.now()}`,
        values: vector,
        magnitude: 1,
        created: new Date(),
        type: 'unit',
        activeIndex
      }
    }, `Create Unit Vector (e${activeIndex + 1})`)
  }
  
  const createNormalVector = async (mean = 0, stdDev = 1, dimensions = null) => {
    return executeOperation(async () => {
      const dims = dimensions || currentDimensions.value
      const vector = vectorGeneration.normal(dims, mean, stdDev)
      return {
        id: `normal_${Date.now()}`,
        values: vector,
        magnitude: vectorOperations.magnitude(vector),
        created: new Date(),
        type: 'normal',
        parameters: { mean, stdDev }
      }
    }, 'Create Normal Vector')
  }
  
  // Vector Arithmetic Operations
  const addVectors = async (vectorA, vectorB) => {
    return executeOperation(async () => {
      if (!vectorA || !vectorB) {
        throw new Error('Two vectors are required for addition')
      }
      
      const result = vectorOperations.add(vectorA.values, vectorB.values)
      return {
        id: `add_${Date.now()}`,
        values: result,
        magnitude: vectorOperations.magnitude(result),
        created: new Date(),
        type: 'addition',
        operands: [vectorA.id, vectorB.id]
      }
    }, 'Vector Addition')
  }
  
  const subtractVectors = async (vectorA, vectorB) => {
    return executeOperation(async () => {
      if (!vectorA || !vectorB) {
        throw new Error('Two vectors are required for subtraction')
      }
      
      const result = vectorOperations.subtract(vectorA.values, vectorB.values)
      return {
        id: `subtract_${Date.now()}`,
        values: result,
        magnitude: vectorOperations.magnitude(result),
        created: new Date(),
        type: 'subtraction',
        operands: [vectorA.id, vectorB.id]
      }
    }, 'Vector Subtraction')
  }
  
  const scaleVector = async (vector, scalar) => {
    return executeOperation(async () => {
      if (!vector) {
        throw new Error('Vector is required for scaling')
      }
      
      const result = vectorOperations.scale(vector.values, scalar)
      return {
        id: `scale_${Date.now()}`,
        values: result,
        magnitude: vectorOperations.magnitude(result),
        created: new Date(),
        type: 'scaling',
        operands: [vector.id],
        scalar
      }
    }, `Scale Vector by ${scalar}`)
  }
  
  const normalizeVector = async (vector) => {
    return executeOperation(async () => {
      if (!vector) {
        throw new Error('Vector is required for normalization')
      }
      
      const result = vectorOperations.normalize(vector.values)
      return {
        id: `normalize_${Date.now()}`,
        values: result,
        magnitude: 1,
        created: new Date(),
        type: 'normalization',
        operands: [vector.id]
      }
    }, 'Normalize Vector')
  }
  
  // Vector Analysis Operations
  const calculateDotProduct = async (vectorA, vectorB) => {
    return executeOperation(async () => {
      if (!vectorA || !vectorB) {
        throw new Error('Two vectors are required for dot product')
      }
      
      return vectorOperations.dotProduct(vectorA.values, vectorB.values)
    }, 'Calculate Dot Product')
  }
  
  const calculateCosineSimilarity = async (vectorA, vectorB) => {
    return executeOperation(async () => {
      if (!vectorA || !vectorB) {
        throw new Error('Two vectors are required for cosine similarity')
      }
      
      return vectorOperations.cosineSimilarity(vectorA.values, vectorB.values)
    }, 'Calculate Cosine Similarity')
  }
  
  const calculateDistance = async (vectorA, vectorB, metric = 'euclidean') => {
    return executeOperation(async () => {
      if (!vectorA || !vectorB) {
        throw new Error('Two vectors are required for distance calculation')
      }
      
      switch (metric.toLowerCase()) {
        case 'euclidean':
          return vectorOperations.euclideanDistance(vectorA.values, vectorB.values)
        case 'manhattan':
          return vectorOperations.manhattanDistance(vectorA.values, vectorB.values)
        default:
          throw new Error(`Unknown distance metric: ${metric}`)
      }
    }, `Calculate ${metric} Distance`)
  }
  
  const analyzeVector = async (vector) => {
    return executeOperation(async () => {
      if (!vector) {
        throw new Error('Vector is required for analysis')
      }
      
      const stats = vectorStatistics.calculate(vector.values)
      const magnitude = vectorOperations.magnitude(vector.values)
      
      return {
        vectorId: vector.id,
        statistics: stats,
        magnitude,
        dimensions: vector.values.length,
        timestamp: new Date(),
        components: vector.values.map((value, index) => ({
          index,
          value,
          absoluteValue: Math.abs(value),
          percentage: magnitude > 0 ? (Math.abs(value) / magnitude) * 100 : 0
        }))
      }
    }, 'Analyze Vector')
  }
  
  // Batch Operations
  const analyzeBatch = async (vectors) => {
    return executeOperation(async () => {
      if (!vectors || !Array.isArray(vectors)) {
        throw new Error('Array of vectors is required for batch analysis')
      }
      
      const analyses = await Promise.all(
        vectors.map(vector => analyzeVector(vector))
      )
      
      // Calculate batch statistics
      const magnitudes = vectors.map(v => vectorOperations.magnitude(v.values))
      const avgMagnitude = magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length
      const maxMagnitude = Math.max(...magnitudes)
      const minMagnitude = Math.min(...magnitudes)
      
      return {
        vectorAnalyses: analyses,
        batchStatistics: {
          count: vectors.length,
          averageMagnitude: avgMagnitude,
          maxMagnitude,
          minMagnitude,
          totalMagnitude: magnitudes.reduce((sum, mag) => sum + mag, 0)
        },
        timestamp: new Date()
      }
    }, 'Batch Analysis')
  }
  
  const calculateSimilarityMatrix = async (vectors) => {
    return executeOperation(async () => {
      if (!vectors || !Array.isArray(vectors)) {
        throw new Error('Array of vectors is required for similarity matrix')
      }
      
      const n = vectors.length
      const matrix = Array(n).fill().map(() => Array(n).fill(0))
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) {
            matrix[i][j] = 1 // Self-similarity is 1
          } else {
            matrix[i][j] = vectorOperations.cosineSimilarity(
              vectors[i].values,
              vectors[j].values
            )
          }
        }
      }
      
      return {
        matrix,
        vectors: vectors.map(v => ({ id: v.id, label: v.label || v.id })),
        timestamp: new Date()
      }
    }, 'Calculate Similarity Matrix')
  }
  
  // Utility functions
  const clearHistory = () => {
    operationHistory.value = []
  }
  
  const clearError = () => {
    lastError.value = null
  }
  
  const getOperationHistory = (limit = 10) => {
    return operationHistory.value.slice(0, limit)
  }
  
  const undoLastOperation = () => {
    if (operationHistory.value.length > 0) {
      const lastOp = operationHistory.value[0]
      operationHistory.value = operationHistory.value.slice(1)
      return lastOp
    }
    return null
  }
  
  return {
    // Reactive state
    isCalculating,
    lastError,
    operationHistory,
    
    // Computed properties
    selectedVector,
    allVectors,
    currentDimensions,
    
    // Vector creation
    createRandomVector,
    createZeroVector,
    createUnitVector,
    createNormalVector,
    
    // Vector arithmetic
    addVectors,
    subtractVectors,
    scaleVector,
    normalizeVector,
    
    // Vector analysis
    calculateDotProduct,
    calculateCosineSimilarity,
    calculateDistance,
    analyzeVector,
    
    // Batch operations
    analyzeBatch,
    calculateSimilarityMatrix,
    
    // Utility functions
    clearHistory,
    clearError,
    getOperationHistory,
    undoLastOperation
  }
} 