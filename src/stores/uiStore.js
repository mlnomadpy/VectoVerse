import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State
  const activeModal = ref(null)
  const errorMessage = ref('')
  const successMessage = ref('')
  const errorDetails = ref(null)
  const isLoading = ref(false)
  const sidebarCollapsed = ref(false)
  const activeTab = ref('individual')
  const analysisViewMode = ref('overview') // 'overview' or 'detailed'
  const neuralModeActive = ref(false)
  const forcesVisible = ref(false)
  
  // Analysis state
  const selectedAnalysisType = ref('pca')
  const analysisResults = ref(null)
  const isAnalyzing = ref(false)
  
  // Tutorial state
  const tutorialStep = ref(0)
  const tutorialActive = ref(false)
  
  // Keyboard shortcuts state
  const shortcutsVisible = ref(false)

  // Getters
  const hasError = computed(() => !!errorMessage.value)
  const hasSuccess = computed(() => !!successMessage.value)
  const isModalOpen = computed(() => !!activeModal.value)

  // Actions
  const showModal = (modalName) => {
    activeModal.value = modalName
  }

  const hideModal = () => {
    activeModal.value = null
  }

  const showError = (message, actions = []) => {
    errorMessage.value = message
    errorDetails.value = { message, actions }
    successMessage.value = ''
  }

  const hideError = () => {
    errorMessage.value = ''
    errorDetails.value = null
  }

  const showSuccess = (message, duration = 3000) => {
    successMessage.value = message
    if (duration > 0) {
      setTimeout(() => {
        successMessage.value = ''
      }, duration)
    }
  }

  const hideSuccess = () => {
    successMessage.value = ''
  }

  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setActiveTab = (tabName) => {
    activeTab.value = tabName
  }

  const setAnalysisViewMode = (mode) => {
    analysisViewMode.value = mode
  }

  const setNeuralModeActive = (active) => {
    neuralModeActive.value = active
  }

  const setForcesVisible = (visible) => {
    forcesVisible.value = visible
  }

  // Analysis methods
  const setAnalysisType = (type) => {
    selectedAnalysisType.value = type
  }

  const setAnalysisResults = (results) => {
    analysisResults.value = results
  }

  const setAnalyzing = (analyzing) => {
    isAnalyzing.value = analyzing
  }

  const runAnalysis = async (analysisFunction) => {
    setAnalyzing(true)
    try {
      const results = await analysisFunction()
      setAnalysisResults(results)
      showSuccess('Analysis completed successfully!')
    } catch (error) {
      showError(`Analysis failed: ${error.message}`)
    } finally {
      setAnalyzing(false)
    }
  }

  // Tutorial methods
  const startTutorial = () => {
    tutorialActive.value = true
    tutorialStep.value = 0
  }

  const nextTutorialStep = () => {
    tutorialStep.value++
  }

  const previousTutorialStep = () => {
    if (tutorialStep.value > 0) {
      tutorialStep.value--
    }
  }

  const endTutorial = () => {
    tutorialActive.value = false
    tutorialStep.value = 0
  }

  const toggleShortcuts = () => {
    shortcutsVisible.value = !shortcutsVisible.value
    if (shortcutsVisible.value) {
      showModal('shortcuts')
    } else {
      hideModal()
    }
  }

  // Modal management helpers
  const showTutorialModal = () => showModal('tutorial')
  const showAnalysisModal = () => showModal('analysis')
  const showUploadHelpModal = () => showModal('uploadHelp')
  const showActivationHelpModal = () => showModal('activationHelp')
  const showAddVectorModal = () => showModal('addVector')
  const showExportModal = () => showModal('export')
  const showShortcutsModal = (shortcuts) => {
    shortcutsData.value = shortcuts
    showModal('shortcuts')
  }
  const showPresetsModal = () => showModal('presets')

  // Additional UI helpers
  const closeAllModals = () => {
    hideModal()
    hideError()
    hideSuccess()
  }

  const showInfo = (message, duration = 3000) => {
    // Use success for info messages with different styling
    showSuccess(message, duration)
  }

  // Shortcuts data
  const shortcutsData = ref([])

  return {
    // State
    activeModal,
    errorMessage,
    successMessage,
    errorDetails,
    isLoading,
    sidebarCollapsed,
    activeTab,
    analysisViewMode,
    neuralModeActive,
    forcesVisible,
    selectedAnalysisType,
    analysisResults,
    isAnalyzing,
    tutorialStep,
    tutorialActive,
    shortcutsVisible,
    shortcutsData,
    
    // Getters
    hasError,
    hasSuccess,
    isModalOpen,
    
    // Actions
    showModal,
    hideModal,
    showError,
    hideError,
    showSuccess,
    hideSuccess,
    setLoading,
    toggleSidebar,
    setActiveTab,
    setAnalysisViewMode,
    setNeuralModeActive,
    setForcesVisible,
    setAnalysisType,
    setAnalysisResults,
    setAnalyzing,
    runAnalysis,
    startTutorial,
    nextTutorialStep,
    previousTutorialStep,
    endTutorial,
    toggleShortcuts,
    
    // Modal helpers
    showTutorialModal,
    showAnalysisModal,
    showUploadHelpModal,
    showActivationHelpModal,
    showAddVectorModal,
    showExportModal,
    showShortcutsModal,
    showPresetsModal,
    closeAllModals,
    showInfo
  }
}) 