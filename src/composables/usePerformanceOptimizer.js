import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '../stores/uiStore'

export function usePerformanceOptimizer() {
  const uiStore = useUIStore()
  
  // Performance metrics
  const frameRate = ref(60)
  const renderQueue = ref([])
  const isRendering = ref(false)
  const performanceMetrics = ref({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    vectorCount: 0
  })

  // Performance tracking
  let lastTime = performance.now()
  let frameCount = 0
  let animationFrameId = null

  // Computed properties
  const isLowPerformance = computed(() => performanceMetrics.value.fps < 30)
  const isHighMemoryUsage = computed(() => performanceMetrics.value.memoryUsage > 100)
  const shouldReduceComplexity = computed(() => {
    const isMobile = window.innerWidth < 768
    const isLowMemory = performanceMetrics.value.memoryUsage > 50
    const isLowFPS = performanceMetrics.value.fps < 20
    const tooManyVectors = performanceMetrics.value.vectorCount > (isMobile ? 30 : 100)
    
    return isMobile || isLowMemory || isLowFPS || tooManyVectors
  })

  // FPS tracking
  const trackFPS = () => {
    frameCount++
    const currentTime = performance.now()
    
    if (currentTime - lastTime >= 1000) {
      performanceMetrics.value.fps = Math.round(frameCount * 1000 / (currentTime - lastTime))
      frameCount = 0
      lastTime = currentTime
      
      // Adjust rendering quality based on FPS
      adjustRenderingQuality()
    }
    
    animationFrameId = requestAnimationFrame(trackFPS)
  }

  // Monitor memory usage
  const monitorMemory = () => {
    if (performance.memory) {
      performanceMetrics.value.memoryUsage = Math.round(
        performance.memory.usedJSHeapSize / 1024 / 1024
      )
    }
  }

  // Adjust rendering quality based on performance
  const adjustRenderingQuality = () => {
    if (performanceMetrics.value.fps < 30) {
      optimizeForLowPerformance()
    } else if (performanceMetrics.value.fps > 50) {
      restoreHighQuality()
    }
    
    // Show performance warning if needed
    if (performanceMetrics.value.vectorCount > 100 && performanceMetrics.value.fps < 15) {
      uiStore.showError('Performance warning: Too many vectors. Consider reducing the count.')
    }
  }

  // Optimize for low performance devices
  const optimizeForLowPerformance = () => {
    const svg = document.querySelector('#main-viz')
    if (svg) {
      svg.style.shapeRendering = 'optimizeSpeed'
      svg.style.textRendering = 'optimizeSpeed'
    }

    // Reduce animation frequency
    frameRate.value = 30
    
    // Disable expensive visual effects
    document.querySelectorAll('.vector-atom').forEach(atom => {
      atom.style.filter = 'none'
    })

    // Reduce force line complexity
    document.querySelectorAll('.force-line').forEach(line => {
      line.style.strokeDasharray = 'none'
    })
  }

  // Restore high quality rendering
  const restoreHighQuality = () => {
    const svg = document.querySelector('#main-viz')
    if (svg) {
      svg.style.shapeRendering = 'auto'
      svg.style.textRendering = 'auto'
    }

    frameRate.value = 60
    
    // Re-enable visual effects
    document.querySelectorAll('.vector-atom').forEach(atom => {
      atom.style.filter = ''
    })
  }

  // Throttle function execution
  const throttleRender = (renderFunction, delay = 16) => {
    let lastRender = 0
    
    return (...args) => {
      const now = performance.now()
      
      if (now - lastRender >= delay) {
        lastRender = now
        return renderFunction(...args)
      }
    }
  }

  // Debounce function execution
  const debounceRender = (renderFunction, delay = 100) => {
    let timeoutId
    
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => renderFunction(...args), delay)
    }
  }

  // Batch render updates for efficiency
  const batchRenderUpdates = (updates) => {
    renderQueue.value.push(...updates)
    
    if (!isRendering.value) {
      isRendering.value = true
      requestAnimationFrame(() => processRenderQueue())
    }
  }

  // Process render queue
  const processRenderQueue = () => {
    const startTime = performance.now()
    
    // Process updates in batches
    const batchSize = shouldReduceComplexity.value ? 5 : 10
    const batch = renderQueue.value.splice(0, batchSize)
    
    batch.forEach(update => {
      try {
        if (typeof update === 'function') {
          update()
        }
      } catch (error) {
        console.error('Render queue error:', error)
      }
    })
    
    // Continue processing if queue is not empty
    if (renderQueue.value.length > 0) {
      requestAnimationFrame(() => processRenderQueue())
    } else {
      isRendering.value = false
    }
    
    performanceMetrics.value.renderTime = performance.now() - startTime
  }

  // Optimize vector rendering with level-of-detail
  const optimizeVectorRendering = (vectors) => {
    if (vectors.length > 50) {
      return applyLevelOfDetail(vectors)
    }
    return vectors
  }

  // Apply level-of-detail rendering
  const applyLevelOfDetail = (vectors) => {
    const viewBox = getViewBox()
    
    return vectors.map(vector => {
      const distance = getDistanceFromCenter(vector, viewBox)
      const shouldSimplify = distance > viewBox.width * 0.4
      
      return {
        ...vector,
        simplified: shouldSimplify,
        renderDetail: shouldSimplify ? 'low' : 'high'
      }
    })
  }

  // Get current view box
  const getViewBox = () => {
    const svg = document.querySelector('#main-viz')
    if (!svg) return { x: 0, y: 0, width: 800, height: 600, centerX: 400, centerY: 300 }
    
    const rect = svg.getBoundingClientRect()
    return {
      x: 0,
      y: 0,
      width: rect.width,
      height: rect.height,
      centerX: rect.width / 2,
      centerY: rect.height / 2
    }
  }

  // Calculate distance from center
  const getDistanceFromCenter = (vector, viewBox) => {
    const dx = vector.x - viewBox.centerX
    const dy = vector.y - viewBox.centerY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Memory management
  const manageMemory = () => {
    cleanupDOMElements()
    clearCaches()
    
    // Force garbage collection if available (dev only)
    if (window.gc && process.env.NODE_ENV === 'development') {
      window.gc()
    }
  }

  // Clean up unused DOM elements
  const cleanupDOMElements = () => {
    // Remove orphaned tooltips
    document.querySelectorAll('.vector-tooltip, .force-tooltip, .periodic-tooltip').forEach(tooltip => {
      if (!tooltip.style.display || tooltip.style.display === 'none') {
        tooltip.remove()
      }
    })
    
    // Remove old error notifications
    const errorNotifications = document.querySelectorAll('.error-notification')
    if (errorNotifications.length > 3) {
      errorNotifications[0].remove()
    }
    
    // Clean up modal overlays
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      if (!modal.parentNode) {
        modal.remove()
      }
    })
  }

  // Clear caches
  const clearCaches = () => {
    // Clear any cached calculations
    if (window.VectoVerse?.clearCache) {
      window.VectoVerse.clearCache()
    }
  }

  // Get optimized configuration
  const getOptimizedConfig = (baseConfig) => {
    if (shouldReduceComplexity.value) {
      return {
        ...baseConfig,
        numVectors: Math.min(baseConfig.numVectors || 20, 20),
        dimensions: Math.min(baseConfig.dimensions || 5, 5),
        showForces: false,
        animationSpeed: 0.5
      }
    }
    
    return baseConfig
  }

  // Get performance recommendations
  const getPerformanceRecommendations = () => {
    const recommendations = []
    
    if (performanceMetrics.value.fps < 30) {
      recommendations.push('Reduce the number of vectors for better performance')
    }
    
    if (performanceMetrics.value.memoryUsage > 100) {
      recommendations.push('Consider reducing dimensions or clearing old data')
    }
    
    if (performanceMetrics.value.vectorCount > 50) {
      recommendations.push('Large datasets may impact performance on mobile devices')
    }
    
    if (renderQueue.value.length > 20) {
      recommendations.push('Consider reducing animation frequency')
    }
    
    return recommendations
  }

  // Get performance report
  const getPerformanceReport = () => {
    return {
      metrics: performanceMetrics.value,
      recommendations: getPerformanceRecommendations(),
      systemInfo: {
        isMobile: window.innerWidth < 768,
        devicePixelRatio: window.devicePixelRatio || 1,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        memory: navigator.deviceMemory || 'unknown'
      },
      currentLoad: {
        vectors: performanceMetrics.value.vectorCount,
        renderQueueSize: renderQueue.value.length,
        isRendering: isRendering.value
      }
    }
  }

  // Wrap function with performance monitoring
  const wrapWithPerformanceCheck = (fn, name) => {
    return (...args) => {
      const start = performance.now()
      const result = fn(...args)
      const duration = performance.now() - start
      
      if (duration > 16) { // Longer than one frame
        console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`)
      }
      
      return result
    }
  }

  // Create optimized animation frame
  const createAnimationFrame = (callback) => {
    const frameCallback = (timestamp) => {
      if (performanceMetrics.value.fps > 15) {
        callback(timestamp)
      }
    }
    
    return requestAnimationFrame(frameCallback)
  }

  // Update vector count for monitoring
  const updateVectorCount = (count) => {
    performanceMetrics.value.vectorCount = count
  }

  // Lifecycle management
  onMounted(() => {
    // Start performance monitoring
    trackFPS()
    
    // Monitor memory usage periodically
    const memoryInterval = setInterval(monitorMemory, 5000)
    
    // Cleanup on unmount
    onUnmounted(() => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      clearInterval(memoryInterval)
      manageMemory()
    })
  })

  return {
    // State
    frameRate,
    renderQueue,
    isRendering,
    performanceMetrics,
    
    // Computed
    isLowPerformance,
    isHighMemoryUsage,
    shouldReduceComplexity,
    
    // Methods
    throttleRender,
    debounceRender,
    batchRenderUpdates,
    optimizeVectorRendering,
    manageMemory,
    getOptimizedConfig,
    getPerformanceReport,
    getPerformanceRecommendations,
    wrapWithPerformanceCheck,
    createAnimationFrame,
    updateVectorCount,
    optimizeForLowPerformance,
    restoreHighQuality,
    adjustRenderingQuality
  }
} 