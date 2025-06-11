import { ref, watch, nextTick } from 'vue'

/**
 * Vue Composable for Local Storage Management
 * Provides reactive local storage with automatic serialization/deserialization
 */
export function useLocalStorage(key, defaultValue = null, options = {}) {
  const {
    serializer = JSON,
    syncAcrossTabs = true,
    writeDelay = 100
  } = options
  
  // Reactive storage value
  const storedValue = ref(defaultValue)
  const isLoading = ref(true)
  const error = ref(null)
  
  // Debounced write function
  let writeTimeout = null
  
  /**
   * Read value from localStorage
   */
  const read = () => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return serializer.parse(item)
    } catch (err) {
      error.value = `Failed to read from localStorage: ${err.message}`
      console.error('localStorage read error:', err)
      return defaultValue
    }
  }
  
  /**
   * Write value to localStorage with debouncing
   */
  const write = (value) => {
    if (writeTimeout) {
      clearTimeout(writeTimeout)
    }
    
    writeTimeout = setTimeout(() => {
      try {
        if (value === null || value === undefined) {
          localStorage.removeItem(key)
        } else {
          localStorage.setItem(key, serializer.stringify(value))
        }
        error.value = null
      } catch (err) {
        error.value = `Failed to write to localStorage: ${err.message}`
        console.error('localStorage write error:', err)
      }
    }, writeDelay)
  }
  
  /**
   * Remove item from localStorage
   */
  const remove = () => {
    try {
      localStorage.removeItem(key)
      storedValue.value = defaultValue
      error.value = null
    } catch (err) {
      error.value = `Failed to remove from localStorage: ${err.message}`
      console.error('localStorage remove error:', err)
    }
  }
  
  /**
   * Clear all localStorage
   */
  const clear = () => {
    try {
      localStorage.clear()
      storedValue.value = defaultValue
      error.value = null
    } catch (err) {
      error.value = `Failed to clear localStorage: ${err.message}`
      console.error('localStorage clear error:', err)
    }
  }
  
  // Initialize
  nextTick(() => {
    storedValue.value = read()
    isLoading.value = false
  })
  
  // Watch for changes and persist
  watch(storedValue, (newValue) => {
    if (!isLoading.value) {
      write(newValue)
    }
  }, { deep: true })
  
  // Listen for storage events (sync across tabs)
  if (syncAcrossTabs) {
    window.addEventListener('storage', (e) => {
      if (e.key === key && e.newValue !== serializer.stringify(storedValue.value)) {
        try {
          storedValue.value = e.newValue ? serializer.parse(e.newValue) : defaultValue
        } catch (err) {
          console.error('Storage event parse error:', err)
        }
      }
    })
  }
  
  return {
    value: storedValue,
    isLoading,
    error,
    remove,
    clear
  }
}

/**
 * Specialized composable for user preferences
 */
export function useUserPreferences() {
  const preferences = useLocalStorage('vectoverse_preferences', {
    theme: 'dark',
    sidebarCollapsed: false,
    defaultDimensions: 4,
    defaultVectorCount: 6,
    forceType: 'resonance',
    activationFunction: 'sigmoid',
    learningRate: 0.01,
    showTutorial: true,
    autoSave: true,
    notifications: true
  })
  
  const updatePreference = (key, value) => {
    preferences.value.value = {
      ...preferences.value.value,
      [key]: value
    }
  }
  
  const resetPreferences = () => {
    preferences.remove()
  }
  
  return {
    preferences: preferences.value,
    isLoading: preferences.isLoading,
    error: preferences.error,
    updatePreference,
    resetPreferences
  }
}

/**
 * Composable for vector data persistence
 */
export function useVectorStorage() {
  const savedVectors = useLocalStorage('vectoverse_vectors', [])
  const vectorHistory = useLocalStorage('vectoverse_vector_history', [])
  const maxHistorySize = 50
  
  const saveVectors = (vectors) => {
    const vectorData = vectors.map(vector => ({
      id: vector.id,
      values: vector.values,
      label: vector.label || null,
      created: vector.created || new Date(),
      type: vector.type || 'unknown'
    }))
    
    savedVectors.value.value = vectorData
    
    // Add to history
    const historyEntry = {
      id: Date.now(),
      timestamp: new Date(),
      vectors: vectorData,
      count: vectorData.length,
      dimensions: vectorData[0]?.values?.length || 0
    }
    
    const history = vectorHistory.value.value || []
    history.unshift(historyEntry)
    
    // Limit history size
    if (history.length > maxHistorySize) {
      history.splice(maxHistorySize)
    }
    
    vectorHistory.value.value = history
  }
  
  const loadVectors = () => {
    return savedVectors.value.value || []
  }
  
  const clearVectors = () => {
    savedVectors.remove()
  }
  
  const getVectorHistory = (limit = 10) => {
    const history = vectorHistory.value.value || []
    return history.slice(0, limit)
  }
  
  const restoreFromHistory = (historyId) => {
    const history = vectorHistory.value.value || []
    const entry = history.find(h => h.id === historyId)
    
    if (entry) {
      savedVectors.value.value = entry.vectors
      return entry.vectors
    }
    
    return null
  }
  
  const clearHistory = () => {
    vectorHistory.remove()
  }
  
  return {
    savedVectors: savedVectors.value,
    vectorHistory: vectorHistory.value,
    isLoading: savedVectors.isLoading || vectorHistory.isLoading,
    error: savedVectors.error || vectorHistory.error,
    saveVectors,
    loadVectors,
    clearVectors,
    getVectorHistory,
    restoreFromHistory,
    clearHistory
  }
}

/**
 * Composable for analysis results storage
 */
export function useAnalysisStorage() {
  const savedAnalyses = useLocalStorage('vectoverse_analyses', [])
  const maxAnalysisHistory = 20
  
  const saveAnalysis = (analysisResult) => {
    const analyses = savedAnalyses.value.value || []
    
    const analysisEntry = {
      id: Date.now(),
      timestamp: new Date(),
      type: analysisResult.type,
      data: analysisResult.data,
      vectorCount: analysisResult.vectorCount,
      dimensions: analysisResult.dimensions,
      summary: generateAnalysisSummary(analysisResult)
    }
    
    analyses.unshift(analysisEntry)
    
    // Limit history size
    if (analyses.length > maxAnalysisHistory) {
      analyses.splice(maxAnalysisHistory)
    }
    
    savedAnalyses.value.value = analyses
  }
  
  const getAnalysisHistory = (type = null, limit = 10) => {
    const analyses = savedAnalyses.value.value || []
    let filtered = type ? analyses.filter(a => a.type === type) : analyses
    return filtered.slice(0, limit)
  }
  
  const deleteAnalysis = (id) => {
    const analyses = savedAnalyses.value.value || []
    const filteredAnalyses = analyses.filter(a => a.id !== id)
    savedAnalyses.value.value = filteredAnalyses
  }
  
  const clearAnalysisHistory = () => {
    savedAnalyses.remove()
  }
  
  const generateAnalysisSummary = (analysisResult) => {
    switch (analysisResult.type) {
      case 'PCA':
        return {
          explainedVariance: analysisResult.data.explainedVariance,
          components: analysisResult.data.components
        }
      case 'K-Means':
        return {
          clusters: analysisResult.data.clusters.length,
          silhouetteScore: analysisResult.data.silhouetteScore,
          converged: analysisResult.data.converged
        }
      case 'Statistical Analysis':
        return {
          averageMagnitude: analysisResult.data.summary.averageMagnitude,
          outliers: analysisResult.data.outliers.length
        }
      default:
        return {}
    }
  }
  
  return {
    savedAnalyses: savedAnalyses.value,
    isLoading: savedAnalyses.isLoading,
    error: savedAnalyses.error,
    saveAnalysis,
    getAnalysisHistory,
    deleteAnalysis,
    clearAnalysisHistory
  }
}

/**
 * Composable for application state backup and restore
 */
export function useStateBackup() {
  const createBackup = (vectorStore, uiStore) => {
    const backup = {
      version: '1.0.0',
      timestamp: new Date(),
      vectorState: {
        vectors: vectorStore.vectors,
        dimensions: vectorStore.dimensions,
        numVectors: vectorStore.numVectors,
        selectedVectorId: vectorStore.selectedVectorId,
        forceType: vectorStore.forceType,
        activationFunction: vectorStore.activationFunction,
        learningRate: vectorStore.learningRate
      },
      uiState: {
        activeTab: uiStore.activeTab,
        sidebarCollapsed: uiStore.sidebarCollapsed,
        analysisViewMode: uiStore.analysisViewMode
      }
    }
    
    const backupStorage = useLocalStorage('vectoverse_backup', [])
    const backups = backupStorage.value.value || []
    
    backups.unshift(backup)
    
    // Keep only last 5 backups
    if (backups.length > 5) {
      backups.splice(5)
    }
    
    backupStorage.value.value = backups
    
    return backup
  }
  
  const getBackups = () => {
    const backupStorage = useLocalStorage('vectoverse_backup', [])
    return backupStorage.value.value || []
  }
  
  const restoreBackup = (backupId, vectorStore, uiStore) => {
    const backups = getBackups()
    const backup = backups.find(b => b.timestamp === backupId)
    
    if (!backup) return false
    
    try {
      // Restore vector state
      if (backup.vectorState) {
        vectorStore.updateDimensions(backup.vectorState.dimensions)
        vectorStore.updateNumVectors(backup.vectorState.numVectors)
        vectorStore.setForceType(backup.vectorState.forceType)
        vectorStore.setActivationFunction(backup.vectorState.activationFunction)
        vectorStore.setLearningRate(backup.vectorState.learningRate)
      }
      
      // Restore UI state
      if (backup.uiState) {
        uiStore.setActiveTab(backup.uiState.activeTab)
        uiStore.setAnalysisViewMode(backup.uiState.analysisViewMode)
        if (backup.uiState.sidebarCollapsed !== uiStore.sidebarCollapsed) {
          uiStore.toggleSidebar()
        }
      }
      
      return true
    } catch (error) {
      console.error('Failed to restore backup:', error)
      return false
    }
  }
  
  const deleteBackup = (backupId) => {
    const backupStorage = useLocalStorage('vectoverse_backup', [])
    const backups = backupStorage.value.value || []
    const filteredBackups = backups.filter(b => b.timestamp !== backupId)
    backupStorage.value.value = filteredBackups
  }
  
  const clearBackups = () => {
    const backupStorage = useLocalStorage('vectoverse_backup', [])
    backupStorage.remove()
  }
  
  return {
    createBackup,
    getBackups,
    restoreBackup,
    deleteBackup,
    clearBackups
  }
}

/**
 * Composable for session storage (temporary data)
 */
export function useSessionStorage(key, defaultValue = null) {
  const storedValue = ref(defaultValue)
  const error = ref(null)
  
  const read = () => {
    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (err) {
      error.value = `Failed to read from sessionStorage: ${err.message}`
      return defaultValue
    }
  }
  
  const write = (value) => {
    try {
      if (value === null || value === undefined) {
        sessionStorage.removeItem(key)
      } else {
        sessionStorage.setItem(key, JSON.stringify(value))
      }
      error.value = null
    } catch (err) {
      error.value = `Failed to write to sessionStorage: ${err.message}`
    }
  }
  
  const remove = () => {
    try {
      sessionStorage.removeItem(key)
      storedValue.value = defaultValue
      error.value = null
    } catch (err) {
      error.value = `Failed to remove from sessionStorage: ${err.message}`
    }
  }
  
  // Initialize
  storedValue.value = read()
  
  // Watch for changes
  watch(storedValue, write, { deep: true })
  
  return {
    value: storedValue,
    error,
    remove
  }
}

export default {
  useLocalStorage,
  useUserPreferences,
  useVectorStorage,
  useAnalysisStorage,
  useStateBackup,
  useSessionStorage
} 