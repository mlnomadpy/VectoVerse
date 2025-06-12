<template>
  <div id="app" class="vectoverse-app">
    <div class="container">
      <!-- Header Component -->
      <AppHeader class="app-header" />

      <main class="app-main">
        <!-- Main Visualization Container -->
        <VisualizationContainer />

        <!-- Vector Analysis Studio -->
        <VectorAnalysisStudio />
      </main>

      <!-- Sidebar -->
      <InfoSidebar class="info-sidebar" />
    </div>

    <!-- Modals -->
    <ModalContainer />
  </div>
</template>

<script setup>
import { onMounted, provide, nextTick } from 'vue'
import { useTheme } from './composables/useTheme'
import { useVectorStore } from './stores/vectorStore'
import { useUIStore } from './stores/uiStore'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { useTutorialManager } from './composables/useTutorialManager'
import { useAccessibility } from './composables/useAccessibility'
import { usePerformanceOptimizer } from './composables/usePerformanceOptimizer'
import { usePeriodicTable } from './composables/usePeriodicTable'
import { useExportManager } from './composables/useExportManager'
import { useErrorHandler } from './composables/useErrorHandler'
import { useMathRenderer } from './composables/useMathRenderer'
import { useControls } from './composables/useControls'

// Components
import AppHeader from './components/AppHeader.vue'
import VisualizationContainer from './components/VisualizationContainer.vue'
import VectorAnalysisStudio from './components/VectorAnalysisStudio.vue'
import InfoSidebar from './components/InfoSidebar.vue'
import ModalContainer from './components/ModalContainer.vue'

// Stores
const vectorStore = useVectorStore()
const uiStore = useUIStore()

// Composables
const keyboardShortcuts = useKeyboardShortcuts()
const tutorialManager = useTutorialManager()
const accessibility = useAccessibility()
const performanceOptimizer = usePerformanceOptimizer()
const periodicTable = usePeriodicTable()
const exportManager = useExportManager()
const errorHandler = useErrorHandler()
const mathRenderer = useMathRenderer()
const controls = useControls()

// Set dark theme on startup
const { setTheme } = useTheme()
setTheme('dark')

onMounted(async () => {
  try {
    await nextTick()
    
    // Initialize the vectors in the store
    vectorStore.generateVectors()
    
    // Initialize accessibility features
    accessibility.initialize()
    
    console.log('VectoVerse Vue app initialized successfully.')
    
    // Re-render math after framework initialization
    setTimeout(() => {
      if (window.renderMath) {
        window.renderMath()
      }
    }, 100)

  } catch (error) {
    console.error('Failed to initialize VectoVerse:', error)
    uiStore.showError('Failed to initialize VectoVerse. Please refresh and try again.')
  }
})

// Provide composables to child components
provide('tutorialManager', tutorialManager)
provide('accessibility', accessibility)
provide('performanceOptimizer', performanceOptimizer)
provide('periodicTable', periodicTable)
provide('exportManager', exportManager)
provide('errorHandler', errorHandler)
provide('mathRenderer', mathRenderer)
provide('controls', controls)
</script> 