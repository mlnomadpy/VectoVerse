<template>
  <div id="app" class="vectoverse-app">
    <!-- Theme Switcher -->
    <div class="theme-switcher" @click="toggleTheme">🌙</div>

    <div class="container">
      <!-- Header Component -->
      <AppHeader />

      <main class="app-main">
        <!-- Controls Toolbar -->
        <ControlsToolbar />

        <!-- Enhanced Tab Container -->
        <TabContainer />

        <!-- Main Visualization Container -->
        <VisualizationContainer />

        <!-- Vector Analysis Studio -->
        <VectorAnalysisStudio />
      </main>

      <!-- Sidebar -->
      <InfoSidebar />
    </div>

    <!-- Modals -->
    <ModalContainer />

    <!-- Floating Action Button -->
    <FloatingActionButton />
  </div>
</template>

<script setup>
import { ref, onMounted, provide, nextTick } from 'vue'
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
import { VectorAtomicFramework } from '@modules/VectorAtomicFramework.js'

// Components
import AppHeader from './components/AppHeader.vue'
import ControlsToolbar from './components/ControlsToolbar.vue'
import TabContainer from './components/TabContainer.vue'
import VisualizationContainer from './components/VisualizationContainer.vue'
import VectorAnalysisStudio from './components/VectorAnalysisStudio.vue'
import InfoSidebar from './components/InfoSidebar.vue'
import ModalContainer from './components/ModalContainer.vue'
import FloatingActionButton from './components/FloatingActionButton.vue'

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

// Framework instance
const framework = ref(null)

// Theme management
const isDarkTheme = ref(false)

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  document.body.classList.toggle('dark-theme', isDarkTheme.value)
}

// Initialize the framework
onMounted(async () => {
  try {
    // Wait a bit for DOM to be ready
    await nextTick()
    
    // Initialize the VectorAtomicFramework
    framework.value = new VectorAtomicFramework()
    
    // Store the framework reference in the vector store
    vectorStore.setFramework(framework.value)
    
    // Initialize accessibility features
    accessibility.initialize()
    
    // Initialize periodic table if container exists
    const visualizationContainer = document.querySelector('.visualization-container')
    if (visualizationContainer) {
      periodicTable.initializePeriodicTable(visualizationContainer)
    }
    
    console.log('VectoVerse Vue app initialized successfully with enhanced features!')
    
    // Setup enhanced controls
    setupEnhancedControls()
    
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

// Setup enhanced controls (converted from original script.js)
const setupEnhancedControls = () => {
  if (!framework.value) return

  // Listen for neural mode events
  framework.value.eventBus.on('neuralModeActivated', (data) => {
    console.log('Neural network mode activated with input vector:', data.inputVectorId)
    uiStore.setNeuralModeActive(true)
  })

  framework.value.eventBus.on('neuralModeDeactivated', () => {
    console.log('Neural network mode deactivated')
    uiStore.setNeuralModeActive(false)
  })

  // Listen for activation function changes
  framework.value.eventBus.on('activationFunctionChanged', (data) => {
    console.log('Activation function changed to:', data.function)
    vectorStore.setActivationFunction(data.function)
  })

  // Listen for learning rate changes
  framework.value.eventBus.on('learningRateChanged', (data) => {
    console.log('Learning rate changed to:', data.rate)
    vectorStore.setLearningRate(data.rate)
  })
}

// Provide the framework and composables to child components
provide('framework', framework)
provide('tutorialManager', tutorialManager)
provide('accessibility', accessibility)
provide('performanceOptimizer', performanceOptimizer)
provide('periodicTable', periodicTable)
provide('exportManager', exportManager)
provide('errorHandler', errorHandler)
provide('mathRenderer', mathRenderer)
provide('controls', controls)
</script>

<style>
.vectoverse-app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Import existing styles - they will be scoped appropriately by child components */
</style> 