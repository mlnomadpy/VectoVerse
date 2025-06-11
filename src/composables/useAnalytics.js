import { ref, computed, watch } from 'vue'
import { useVectorStore } from '../stores/vectorStore.js'
import { vectorOperations, vectorStatistics } from '../utils/vectorUtils.js'

/**
 * Vue Composable for Advanced Vector Analytics
 * Provides clustering, PCA, statistical analysis, and pattern detection
 */
export function useAnalytics() {
  const vectorStore = useVectorStore()
  
  // Reactive state
  const isAnalyzing = ref(false)
  const analysisResults = ref(null)
  const lastAnalysisType = ref(null)
  const analysisError = ref(null)
  const analysisProgress = ref(0)
  
  // Computed properties
  const vectors = computed(() => vectorStore.vectors)
  const hasVectors = computed(() => vectors.value.length > 0)
  const canAnalyze = computed(() => hasVectors.value && !isAnalyzing.value)
  
  // Watch for vector changes to invalidate cache
  watch(vectors, () => {
    if (analysisResults.value) {
      analysisResults.value.isStale = true
    }
  }, { deep: true })
  
  /**
   * Execute analysis with progress tracking
   * @param {Function} analysisFunction - Analysis function to execute
   * @param {string} analysisType - Type of analysis
   * @returns {Promise} Analysis result
   */
  const executeAnalysis = async (analysisFunction, analysisType) => {
    if (isAnalyzing.value) {
      throw new Error('Analysis already in progress')
    }
    
    isAnalyzing.value = true
    analysisError.value = null
    analysisProgress.value = 0
    lastAnalysisType.value = analysisType
    
    try {
      const result = await analysisFunction()
      analysisResults.value = {
        type: analysisType,
        data: result,
        timestamp: new Date(),
        isStale: false,
        vectorCount: vectors.value.length,
        dimensions: vectors.value[0]?.values?.length || 0
      }
      analysisProgress.value = 100
      return result
    } catch (error) {
      analysisError.value = error.message
      throw error
    } finally {
      isAnalyzing.value = false
    }
  }
  
  // Principal Component Analysis
  const performPCA = async (components = 2) => {
    return executeAnalysis(async () => {
      if (!hasVectors.value) {
        throw new Error('No vectors available for PCA')
      }
      
      analysisProgress.value = 10
      const matrix = vectors.value.map(v => v.values)
      
      // Center the data
      analysisProgress.value = 20
      const means = calculateColumnMeans(matrix)
      const centered = matrix.map(row => 
        row.map((val, i) => val - means[i])
      )
      
      // Calculate covariance matrix
      analysisProgress.value = 40
      const covariance = calculateCovarianceMatrix(centered)
      
      // Perform eigendecomposition (simplified)
      analysisProgress.value = 60
      const { eigenvalues, eigenvectors } = performEigendecomposition(covariance, components)
      
      // Project data onto principal components
      analysisProgress.value = 80
      const projectedData = centered.map(row => 
        eigenvectors.slice(0, components).map(eigenvector =>
          row.reduce((sum, val, i) => sum + val * eigenvector[i], 0)
        )
      )
      
      analysisProgress.value = 100
      
      return {
        projectedData,
        eigenvalues: eigenvalues.slice(0, components),
        eigenvectors: eigenvectors.slice(0, components),
        explainedVariance: calculateExplainedVariance(eigenvalues, components),
        means,
        components
      }
    }, 'PCA')
  }
  
  // K-Means Clustering
  const performKMeans = async (k = 3, maxIterations = 100) => {
    return executeAnalysis(async () => {
      if (!hasVectors.value) {
        throw new Error('No vectors available for clustering')
      }
      
      if (k > vectors.value.length) {
        throw new Error('Number of clusters cannot exceed number of vectors')
      }
      
      analysisProgress.value = 10
      const data = vectors.value.map(v => v.values)
      
      // Initialize centroids randomly
      const centroids = initializeRandomCentroids(data, k)
      let assignments = new Array(data.length).fill(0)
      let hasConverged = false
      let iteration = 0
      
      while (!hasConverged && iteration < maxIterations) {
        analysisProgress.value = 10 + (iteration / maxIterations) * 80
        
        // Assign points to nearest centroid
        const newAssignments = data.map(point => 
          findNearestCentroid(point, centroids)
        )
        
        // Check for convergence
        hasConverged = newAssignments.every((assignment, i) => 
          assignment === assignments[i]
        )
        
        assignments = newAssignments
        
        // Update centroids
        if (!hasConverged) {
          updateCentroids(data, assignments, centroids, k)
        }
        
        iteration++
      }
      
      // Calculate cluster statistics
      const clusters = calculateClusterStatistics(data, assignments, centroids, k)
      
      analysisProgress.value = 100
      
      return {
        clusters,
        assignments,
        centroids,
        iterations: iteration,
        converged: hasConverged,
        silhouetteScore: calculateSilhouetteScore(data, assignments, centroids)
      }
    }, 'K-Means')
  }
  
  // Hierarchical Clustering
  const performHierarchicalClustering = async (linkage = 'ward') => {
    return executeAnalysis(async () => {
      if (!hasVectors.value) {
        throw new Error('No vectors available for hierarchical clustering')
      }
      
      analysisProgress.value = 10
      const data = vectors.value.map(v => v.values)
      const n = data.length
      
      // Calculate distance matrix
      analysisProgress.value = 30
      const distanceMatrix = calculateDistanceMatrix(data)
      
      // Perform hierarchical clustering
      analysisProgress.value = 50
      const dendrogram = buildDendrogram(distanceMatrix, linkage)
      
      // Generate clusters for different cut levels
      analysisProgress.value = 80
      const clusterLevels = generateClusterLevels(dendrogram, n)
      
      analysisProgress.value = 100
      
      return {
        dendrogram,
        distanceMatrix,
        clusterLevels,
        linkage
      }
    }, 'Hierarchical Clustering')
  }
  
  // Statistical Analysis
  const performStatisticalAnalysis = async () => {
    return executeAnalysis(async () => {
      if (!hasVectors.value) {
        throw new Error('No vectors available for statistical analysis')
      }
      
      analysisProgress.value = 20
      
      // Calculate individual vector statistics
      const vectorStats = vectors.value.map(vector => ({
        id: vector.id,
        ...vectorStatistics.calculate(vector.values)
      }))
      
      analysisProgress.value = 40
      
      // Calculate global statistics
      const allValues = vectors.value.flatMap(v => v.values)
      const globalStats = vectorStatistics.calculate(allValues)
      
      analysisProgress.value = 60
      
      // Calculate correlation matrix
      const correlationMatrix = calculateCorrelationMatrix(vectors.value)
      
      analysisProgress.value = 80
      
      // Detect outliers
      const outliers = detectOutliers(vectors.value)
      
      analysisProgress.value = 100
      
      return {
        vectorStatistics: vectorStats,
        globalStatistics: globalStats,
        correlationMatrix,
        outliers,
        summary: {
          totalVectors: vectors.value.length,
          dimensions: vectors.value[0]?.values?.length || 0,
          averageMagnitude: vectorStats.reduce((sum, stat) => sum + stat.magnitude, 0) / vectorStats.length,
          sparsityRange: {
            min: Math.min(...vectorStats.map(s => s.sparsity)),
            max: Math.max(...vectorStats.map(s => s.sparsity))
          }
        }
      }
    }, 'Statistical Analysis')
  }
  
  // Pattern Detection
  const detectPatterns = async () => {
    return executeAnalysis(async () => {
      if (!hasVectors.value) {
        throw new Error('No vectors available for pattern detection')
      }
      
      analysisProgress.value = 25
      const patterns = []
      
      // Detect linear relationships
      const linearPatterns = detectLinearPatterns(vectors.value)
      patterns.push(...linearPatterns)
      
      analysisProgress.value = 50
      
      // Detect clusters of similar vectors
      const similarityGroups = detectSimilarityGroups(vectors.value)
      patterns.push(...similarityGroups)
      
      analysisProgress.value = 75
      
      // Detect dimensional patterns
      const dimensionalPatterns = detectDimensionalPatterns(vectors.value)
      patterns.push(...dimensionalPatterns)
      
      analysisProgress.value = 100
      
      return {
        patterns,
        summary: {
          totalPatterns: patterns.length,
          patternTypes: [...new Set(patterns.map(p => p.type))],
          confidence: patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
        }
      }
    }, 'Pattern Detection')
  }
  
  // Helper Functions
  const calculateColumnMeans = (matrix) => {
    const rows = matrix.length
    const cols = matrix[0].length
    const means = new Array(cols).fill(0)
    
    for (let j = 0; j < cols; j++) {
      for (let i = 0; i < rows; i++) {
        means[j] += matrix[i][j]
      }
      means[j] /= rows
    }
    
    return means
  }
  
  const calculateCovarianceMatrix = (centeredMatrix) => {
    const rows = centeredMatrix.length
    const cols = centeredMatrix[0].length
    const covariance = Array(cols).fill().map(() => Array(cols).fill(0))
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < cols; j++) {
        let sum = 0
        for (let k = 0; k < rows; k++) {
          sum += centeredMatrix[k][i] * centeredMatrix[k][j]
        }
        covariance[i][j] = sum / (rows - 1)
      }
    }
    
    return covariance
  }
  
  const performEigendecomposition = (matrix, components) => {
    // Simplified eigendecomposition using power iteration
    // In a production app, you'd use a proper linear algebra library
    const size = matrix.length
    const eigenvalues = []
    const eigenvectors = []
    
    for (let i = 0; i < Math.min(components, size); i++) {
      const { value, vector } = powerIteration(matrix, 100)
      eigenvalues.push(value)
      eigenvectors.push(vector)
    }
    
    return { eigenvalues, eigenvectors }
  }
  
  const powerIteration = (matrix, iterations) => {
    const size = matrix.length
    let vector = Array.from({ length: size }, () => Math.random())
    
    for (let i = 0; i < iterations; i++) {
      // Multiply matrix by vector
      const newVector = matrix.map(row => 
        row.reduce((sum, val, j) => sum + val * vector[j], 0)
      )
      
      // Normalize
      const norm = Math.sqrt(newVector.reduce((sum, val) => sum + val * val, 0))
      vector = newVector.map(val => val / norm)
    }
    
    // Calculate eigenvalue
    const matrixVector = matrix.map(row => 
      row.reduce((sum, val, j) => sum + val * vector[j], 0)
    )
    const eigenvalue = vector.reduce((sum, val, i) => sum + val * matrixVector[i], 0)
    
    return { value: eigenvalue, vector }
  }
  
  const calculateExplainedVariance = (eigenvalues, components) => {
    const totalVariance = eigenvalues.reduce((sum, val) => sum + val, 0)
    const explainedVariance = eigenvalues.slice(0, components).reduce((sum, val) => sum + val, 0)
    return explainedVariance / totalVariance
  }
  
  const initializeRandomCentroids = (data, k) => {
    const dimensions = data[0].length
    const centroids = []
    
    for (let i = 0; i < k; i++) {
      const centroid = []
      for (let j = 0; j < dimensions; j++) {
        const min = Math.min(...data.map(point => point[j]))
        const max = Math.max(...data.map(point => point[j]))
        centroid.push(Math.random() * (max - min) + min)
      }
      centroids.push(centroid)
    }
    
    return centroids
  }
  
  const findNearestCentroid = (point, centroids) => {
    let minDistance = Infinity
    let nearestIndex = 0
    
    centroids.forEach((centroid, index) => {
      const distance = vectorOperations.euclideanDistance(point, centroid)
      if (distance < minDistance) {
        minDistance = distance
        nearestIndex = index
      }
    })
    
    return nearestIndex
  }
  
  const updateCentroids = (data, assignments, centroids, k) => {
    for (let i = 0; i < k; i++) {
      const clusterPoints = data.filter((_, index) => assignments[index] === i)
      
      if (clusterPoints.length > 0) {
        const dimensions = data[0].length
        for (let j = 0; j < dimensions; j++) {
          centroids[i][j] = clusterPoints.reduce((sum, point) => sum + point[j], 0) / clusterPoints.length
        }
      }
    }
  }
  
  const calculateClusterStatistics = (data, assignments, centroids, k) => {
    const clusters = []
    
    for (let i = 0; i < k; i++) {
      const clusterPoints = data.filter((_, index) => assignments[index] === i)
      const clusterIndices = assignments.map((assignment, index) => 
        assignment === i ? index : -1
      ).filter(index => index !== -1)
      
      if (clusterPoints.length > 0) {
        const distances = clusterPoints.map(point => 
          vectorOperations.euclideanDistance(point, centroids[i])
        )
        
        clusters.push({
          id: i,
          centroid: centroids[i],
          points: clusterPoints,
          pointIndices: clusterIndices,
          size: clusterPoints.length,
          avgDistance: distances.reduce((sum, d) => sum + d, 0) / distances.length,
          maxDistance: Math.max(...distances),
          minDistance: Math.min(...distances)
        })
      }
    }
    
    return clusters
  }
  
  const calculateSilhouetteScore = (data, assignments, centroids) => {
    // Simplified silhouette score calculation
    let totalScore = 0
    
    for (let i = 0; i < data.length; i++) {
      const point = data[i]
      const cluster = assignments[i]
      
      // Calculate average distance to points in same cluster
      const sameClusterPoints = data.filter((_, j) => assignments[j] === cluster && j !== i)
      const avgIntraDistance = sameClusterPoints.length > 0 
        ? sameClusterPoints.reduce((sum, p) => sum + vectorOperations.euclideanDistance(point, p), 0) / sameClusterPoints.length
        : 0
      
      // Calculate average distance to nearest other cluster
      let minInterDistance = Infinity
      for (let c = 0; c < centroids.length; c++) {
        if (c !== cluster) {
          const otherClusterPoints = data.filter((_, j) => assignments[j] === c)
          if (otherClusterPoints.length > 0) {
            const avgDistance = otherClusterPoints.reduce((sum, p) => sum + vectorOperations.euclideanDistance(point, p), 0) / otherClusterPoints.length
            minInterDistance = Math.min(minInterDistance, avgDistance)
          }
        }
      }
      
      const silhouette = (minInterDistance - avgIntraDistance) / Math.max(minInterDistance, avgIntraDistance)
      totalScore += silhouette
    }
    
    return totalScore / data.length
  }
  
  const calculateDistanceMatrix = (data) => {
    const n = data.length
    const matrix = Array(n).fill().map(() => Array(n).fill(0))
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const distance = vectorOperations.euclideanDistance(data[i], data[j])
        matrix[i][j] = distance
        matrix[j][i] = distance
      }
    }
    
    return matrix
  }
  
  const buildDendrogram = (distanceMatrix, linkage) => {
    // Simplified hierarchical clustering
    const n = distanceMatrix.length
    const clusters = Array.from({ length: n }, (_, i) => ({ id: i, members: [i], height: 0 }))
    const dendrogram = []
    
    while (clusters.length > 1) {
      // Find closest pair of clusters
      let minDistance = Infinity
      let mergeI = 0, mergeJ = 1
      
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const distance = calculateClusterDistance(clusters[i], clusters[j], distanceMatrix, linkage)
          if (distance < minDistance) {
            minDistance = distance
            mergeI = i
            mergeJ = j
          }
        }
      }
      
      // Merge clusters
      const newCluster = {
        id: n + dendrogram.length,
        members: [...clusters[mergeI].members, ...clusters[mergeJ].members],
        height: minDistance,
        left: clusters[mergeI],
        right: clusters[mergeJ]
      }
      
      dendrogram.push(newCluster)
      
      // Remove merged clusters and add new one
      clusters.splice(Math.max(mergeI, mergeJ), 1)
      clusters.splice(Math.min(mergeI, mergeJ), 1)
      clusters.push(newCluster)
    }
    
    return dendrogram
  }
  
  const calculateClusterDistance = (clusterA, clusterB, distanceMatrix, linkage) => {
    const distances = []
    
    for (const i of clusterA.members) {
      for (const j of clusterB.members) {
        distances.push(distanceMatrix[i][j])
      }
    }
    
    switch (linkage) {
      case 'single':
        return Math.min(...distances)
      case 'complete':
        return Math.max(...distances)
      case 'average':
        return distances.reduce((sum, d) => sum + d, 0) / distances.length
      case 'ward':
      default:
        return distances.reduce((sum, d) => sum + d, 0) / distances.length
    }
  }
  
  const generateClusterLevels = (dendrogram, n) => {
    const levels = []
    const maxHeight = Math.max(...dendrogram.map(node => node.height))
    
    for (let k = 2; k <= n; k++) {
      const threshold = maxHeight * (k - 1) / (n - 1)
      levels.push({
        k,
        threshold,
        clusters: cutDendrogram(dendrogram[dendrogram.length - 1], threshold, [])
      })
    }
    
    return levels
  }
  
  const cutDendrogram = (node, threshold, clusters) => {
    if (node.height <= threshold || !node.left || !node.right) {
      clusters.push(node.members)
      return clusters
    }
    
    cutDendrogram(node.left, threshold, clusters)
    cutDendrogram(node.right, threshold, clusters)
    return clusters
  }
  
  const calculateCorrelationMatrix = (vectors) => {
    const n = vectors.length
    const matrix = Array(n).fill().map(() => Array(n).fill(0))
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1
        } else {
          matrix[i][j] = vectorOperations.cosineSimilarity(vectors[i].values, vectors[j].values)
        }
      }
    }
    
    return matrix
  }
  
  const detectOutliers = (vectors) => {
    const magnitudes = vectors.map(v => vectorOperations.magnitude(v.values))
    const mean = magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length
    const stdDev = Math.sqrt(magnitudes.reduce((sum, mag) => sum + Math.pow(mag - mean, 2), 0) / magnitudes.length)
    
    const threshold = 2 * stdDev
    
    return vectors.filter((vector, index) => {
      const magnitude = magnitudes[index]
      return Math.abs(magnitude - mean) > threshold
    }).map((vector, originalIndex) => ({
      vector,
      originalIndex,
      magnitude: vectorOperations.magnitude(vector.values),
      deviationFromMean: Math.abs(vectorOperations.magnitude(vector.values) - mean)
    }))
  }
  
  const detectLinearPatterns = (vectors) => {
    const patterns = []
    
    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        const similarity = vectorOperations.cosineSimilarity(vectors[i].values, vectors[j].values)
        
        if (Math.abs(similarity) > 0.95) {
          patterns.push({
            type: 'linear_relationship',
            confidence: Math.abs(similarity),
            vectors: [vectors[i].id, vectors[j].id],
            description: similarity > 0 ? 'Highly positively correlated' : 'Highly negatively correlated'
          })
        }
      }
    }
    
    return patterns
  }
  
  const detectSimilarityGroups = (vectors) => {
    const threshold = 0.8
    const groups = []
    const visited = new Set()
    
    for (let i = 0; i < vectors.length; i++) {
      if (visited.has(i)) continue
      
      const group = [i]
      visited.add(i)
      
      for (let j = i + 1; j < vectors.length; j++) {
        if (visited.has(j)) continue
        
        const similarity = vectorOperations.cosineSimilarity(vectors[i].values, vectors[j].values)
        if (similarity > threshold) {
          group.push(j)
          visited.add(j)
        }
      }
      
      if (group.length > 1) {
        groups.push({
          type: 'similarity_group',
          confidence: 0.8,
          vectors: group.map(idx => vectors[idx].id),
          description: `Group of ${group.length} similar vectors`
        })
      }
    }
    
    return groups
  }
  
  const detectDimensionalPatterns = (vectors) => {
    const patterns = []
    const dimensions = vectors[0].values.length
    
    // Check for consistently zero dimensions
    for (let dim = 0; dim < dimensions; dim++) {
      const values = vectors.map(v => v.values[dim])
      const maxAbs = Math.max(...values.map(Math.abs))
      
      if (maxAbs < 1e-10) {
        patterns.push({
          type: 'zero_dimension',
          confidence: 1.0,
          dimension: dim,
          description: `Dimension ${dim + 1} is consistently zero across all vectors`
        })
      }
    }
    
    return patterns
  }
  
  // Utility functions
  const clearResults = () => {
    analysisResults.value = null
    analysisError.value = null
    analysisProgress.value = 0
  }
  
  const exportResults = () => {
    if (!analysisResults.value) return null
    
    return {
      ...analysisResults.value,
      exportedAt: new Date()
    }
  }
  
  return {
    // Reactive state
    isAnalyzing,
    analysisResults,
    lastAnalysisType,
    analysisError,
    analysisProgress,
    
    // Computed properties
    hasVectors,
    canAnalyze,
    
    // Analysis methods
    performPCA,
    performKMeans,
    performHierarchicalClustering,
    performStatisticalAnalysis,
    detectPatterns,
    
    // Utility methods
    clearResults,
    exportResults
  }
} 