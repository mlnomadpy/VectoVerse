import { ref, reactive, computed, nextTick } from 'vue'
import { useUIStore } from '@/stores/uiStore'
import { useVectorStore } from '@/stores/vectorStore'

export function useTabManager() {
  const uiStore = useUIStore()
  const vectorStore = useVectorStore()
  
  // State
  const tabs = ref(new Map())
  const activeTab = ref('vectors')
  const showAddTabDialog = ref(false)
  
  // Default tabs configuration
  const defaultTabs = [
    {
      id: 'vectors',
      title: 'Vectors',
      icon: '🎯',
      closeable: false,
      component: 'VectorsPanel'
    },
    {
      id: 'analysis',
      title: 'Analysis',
      icon: '📊',
      closeable: false,
      component: 'AnalysisPanel'
    },
    {
      id: 'visualization',
      title: 'Visualization',
      icon: '👁️',
      closeable: false,
      component: 'VisualizationPanel'
    },
    {
      id: 'neural',
      title: 'Neural Network',
      icon: '🧠',
      closeable: false,
      component: 'NeuralPanel'
    }
  ]
  
  // Initialize tabs
  const initializeTabs = () => {
    defaultTabs.forEach(tab => {
      tabs.value.set(tab.id, {
        ...tab,
        active: tab.id === activeTab.value
      })
    })
  }
  
  // Add a new tab
  const addTab = (id, title, component, icon = null, closeable = true) => {
    if (tabs.value.has(id)) {
      setActiveTab(id)
      return
    }
    
    tabs.value.set(id, {
      id,
      title,
      component,
      icon,
      closeable,
      active: false
    })
    
    setActiveTab(id)
  }
  
  // Remove a tab
  const removeTab = (id) => {
    if (!tabs.value.has(id)) return
    
    const tab = tabs.value.get(id)
    if (!tab.closeable) return
    
    tabs.value.delete(id)
    
    // If removing active tab, switch to first available tab
    if (activeTab.value === id) {
      const firstTab = Array.from(tabs.value.keys())[0]
      if (firstTab) {
        setActiveTab(firstTab)
      }
    }
  }
  
  // Set active tab
  const setActiveTab = (id) => {
    if (!tabs.value.has(id)) return
    
    // Deactivate all tabs
    tabs.value.forEach(tab => {
      tab.active = false
    })
    
    // Activate selected tab
    const tab = tabs.value.get(id)
    tab.active = true
    activeTab.value = id
    
    // Emit event for components to react
    uiStore.setActiveTab(id)
  }
  
  // Get tab title
  const getTabTitle = (id) => {
    const tab = tabs.value.get(id)
    return tab ? tab.title : ''
  }
  
  // Update tab title
  const updateTabTitle = (id, newTitle) => {
    const tab = tabs.value.get(id)
    if (tab) {
      tab.title = newTitle
    }
  }
  
  // Get all tabs as array
  const tabsArray = computed(() => {
    return Array.from(tabs.value.values())
  })
  
  // Get active tab data
  const activeTabData = computed(() => {
    return tabs.value.get(activeTab.value)
  })
  
  // Handle keyboard navigation
  const handleTabKeydown = (event, id) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        setActiveTab(id)
        break
      case 'ArrowLeft':
        event.preventDefault()
        navigateTabs(-1)
        break
      case 'ArrowRight':
        event.preventDefault()
        navigateTabs(1)
        break
      case 'Delete':
      case 'Backspace':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          removeTab(id)
        }
        break
    }
  }
  
  // Navigate tabs with arrow keys
  const navigateTabs = (direction) => {
    const tabIds = Array.from(tabs.value.keys())
    const currentIndex = tabIds.indexOf(activeTab.value)
    const newIndex = (currentIndex + direction + tabIds.length) % tabIds.length
    setActiveTab(tabIds[newIndex])
  }
  
  // Analysis methods
  const runPCAAnalysis = async (components = 2) => {
    try {
      const vectors = vectorStore.getAllVectors()
      if (vectors.length < 2) {
        throw new Error('Need at least 2 vectors for PCA analysis')
      }
      
      // Simplified PCA implementation
      const result = {
        type: 'pca',
        components,
        vectors: vectors.map((v, i) => ({
          id: v.id,
          original: v.components,
          reduced: v.components.slice(0, components)
        }))
      }
      
      return result
    } catch (error) {
      console.error('PCA Analysis error:', error)
      throw error
    }
  }
  
  const runKMeansAnalysis = async (k = 3) => {
    try {
      const vectors = vectorStore.getAllVectors()
      if (vectors.length < k) {
        throw new Error(`Need at least ${k} vectors for k-means clustering`)
      }
      
      // Simplified k-means implementation
      const result = {
        type: 'kmeans',
        k,
        clusters: Array.from({ length: k }, (_, i) => ({
          id: i,
          center: vectors[i % vectors.length].components,
          vectors: []
        }))
      }
      
      // Assign vectors to nearest clusters (simplified)
      vectors.forEach(vector => {
        const clusterIndex = Math.floor(Math.random() * k)
        result.clusters[clusterIndex].vectors.push(vector.id)
      })
      
      return result
    } catch (error) {
      console.error('K-Means Analysis error:', error)
      throw error
    }
  }
  
  const runSimilarityAnalysis = (method = 'cosine') => {
    try {
      const vectors = vectorStore.getAllVectors()
      const selectedVector = vectorStore.getSelectedVector()
      
      if (!selectedVector) {
        throw new Error('Please select a vector for similarity analysis')
      }
      
      const similarities = vectors
        .filter(v => v.id !== selectedVector.id)
        .map(v => ({
          vectorId: v.id,
          similarity: calculateSimilarity(selectedVector.components, v.components, method)
        }))
        .sort((a, b) => b.similarity - a.similarity)
      
      return {
        type: 'similarity',
        method,
        baseVector: selectedVector.id,
        similarities
      }
    } catch (error) {
      console.error('Similarity Analysis error:', error)
      throw error
    }
  }
  
  // Helper function for similarity calculation
  const calculateSimilarity = (a, b, method) => {
    switch (method) {
      case 'cosine':
        return cosineSimilarity(a, b)
      case 'euclidean':
        return 1 / (1 + euclideanDistance(a, b))
      case 'pearson':
        return pearsonCorrelation(a, b)
      default:
        return cosineSimilarity(a, b)
    }
  }
  
  const cosineSimilarity = (a, b) => {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
    return dotProduct / (magA * magB)
  }
  
  const euclideanDistance = (a, b) => {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0))
  }
  
  const pearsonCorrelation = (a, b) => {
    const n = a.length
    const sumA = a.reduce((sum, val) => sum + val, 0)
    const sumB = b.reduce((sum, val) => sum + val, 0)
    const sumAB = a.reduce((sum, val, i) => sum + val * b[i], 0)
    const sumA2 = a.reduce((sum, val) => sum + val * val, 0)
    const sumB2 = b.reduce((sum, val) => sum + val * val, 0)
    
    const numerator = n * sumAB - sumA * sumB
    const denominator = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB))
    
    return denominator === 0 ? 0 : numerator / denominator
  }
  
  // Export functions
  return {
    // State
    tabs,
    activeTab,
    showAddTabDialog,
    tabsArray,
    activeTabData,
    
    // Methods
    initializeTabs,
    addTab,
    removeTab,
    setActiveTab,
    getTabTitle,
    updateTabTitle,
    handleTabKeydown,
    navigateTabs,
    
    // Analysis methods
    runPCAAnalysis,
    runKMeansAnalysis,
    runSimilarityAnalysis
  }
} 