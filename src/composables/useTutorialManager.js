import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '../stores/uiStore'

export function useTutorialManager() {
  const uiStore = useUIStore()
  
  // Tutorial state
  const isActive = ref(false)
  const currentStep = ref(0)
  const announcements = ref([])
  
  // Tutorial steps
  const tutorialSteps = ref([
    {
      title: "Welcome to the Vectoverse! 🌌",
      content: "Welcome to an interactive environment for visualizing n-dimensional vectors as 'information atoms'. Let's explore the atomic-inspired world of vector mathematics!",
      target: null,
      action: null,
      highlight: false
    },
    {
      title: "Understanding Vector Atoms ⚛️", 
      content: "Each glowing sphere represents a vector in n-dimensional space. The size represents magnitude (like atomic mass) and the pulsing represents energy states.",
      target: "#main-viz",
      action: null,
      highlight: true
    },
    {
      title: "Vector Components 🔢",
      content: "Click on any vector to see its components and properties. Each component is like an electron with positive or negative charge.",
      target: ".vector-atom",
      action: "clickVector",
      highlight: true
    },
    {
      title: "Tab Navigation 📋",
      content: "Use the tab system to explore different views: Vectors, Analysis, Visualization, and Neural Network modes.",
      target: ".tab-container",
      action: null,
      highlight: true
    },
    {
      title: "Generating New Vectors 🎲",
      content: "Use the floating action button or controls to create new random vectors. Try changing dimensions and vector count!",
      target: ".floating-action-button",
      action: null,
      highlight: true
    },
    {
      title: "3D Visualization 🌐",
      content: "Switch to 3D mode for immersive vector exploration with camera controls and interactive features.",
      target: ".three-js-visualization",
      action: null,
      highlight: true
    },
    {
      title: "Vector Operations 🛠️",
      content: "Perform mathematical operations like addition, subtraction, dot product, and normalization on your vectors.",
      target: ".vectors-panel",
      action: null,
      highlight: true
    },
    {
      title: "Analysis Tools 🔬",
      content: "Run advanced analysis including PCA, K-means clustering, and similarity analysis to discover patterns.",
      target: ".analysis-panel",
      action: null,
      highlight: true
    },
    {
      title: "Keyboard Shortcuts ⌨️",
      content: "Press ? to see all keyboard shortcuts. Navigate efficiently with Ctrl+G (generate), Ctrl+E (export), and more!",
      target: null,
      action: "showShortcuts",
      highlight: false
    },
    {
      title: "Export Your Data 📁",
      content: "Export your vectors in multiple formats: JSON, CSV, Python, LaTeX, and more! Perfect for research and analysis.",
      target: null,
      action: null,
      highlight: false
    },
    {
      title: "You're Ready to Explore! 🚀",
      content: "Congratulations! You now understand the basics of VectoVerse. Explore different dimensions, analyze patterns, and discover the hidden relationships in vector space!",
      target: null,
      action: null,
      highlight: false
    }
  ])

  // Computed properties
  const progress = computed(() => {
    if (tutorialSteps.value.length === 0) return 0
    return ((currentStep.value + 1) / tutorialSteps.value.length) * 100
  })

  const currentStepData = computed(() => {
    return tutorialSteps.value[currentStep.value] || null
  })

  const isFirstStep = computed(() => currentStep.value === 0)
  const isLastStep = computed(() => currentStep.value === tutorialSteps.value.length - 1)

  // Methods
  const startTutorial = () => {
    isActive.value = true
    currentStep.value = 0
    uiStore.showTutorialModal()
    trackEvent('tutorial_started')
    announce('Tutorial started. Use arrow keys to navigate.')
  }

  const nextStep = () => {
    if (currentStep.value < tutorialSteps.value.length - 1) {
      currentStep.value++
      performStepAction()
      trackEvent('tutorial_step', { step: currentStep.value + 1 })
    } else {
      endTutorial()
    }
  }

  const previousStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < tutorialSteps.value.length) {
      currentStep.value = stepIndex
    }
  }

  const endTutorial = () => {
    isActive.value = false
    currentStep.value = 0
    uiStore.hideModal()
    clearHighlights()
    
    // Mark tutorial as completed
    localStorage.setItem('vectoverse-tutorial-completed', 'true')
    
    trackEvent('tutorial_completed', {
      completed_steps: currentStep.value + 1,
      total_steps: tutorialSteps.value.length
    })
    
    uiStore.showSuccess('Tutorial completed! Happy exploring! 🚀')
  }

  const performStepAction = () => {
    const step = currentStepData.value
    if (!step || !step.action) return

    switch (step.action) {
      case 'clickVector':
        // Highlight the first vector if available
        setTimeout(() => {
          const firstVector = document.querySelector('.vector-atom')
          if (firstVector) {
            firstVector.focus()
            highlightElement(firstVector)
          }
        }, 1000)
        break
        
      case 'showShortcuts':
        setTimeout(() => {
          uiStore.toggleShortcuts()
        }, 500)
        break
    }
  }

  const highlightElement = (selector) => {
    clearHighlights()
    
    let element
    if (typeof selector === 'string') {
      element = document.querySelector(selector)
    } else {
      element = selector
    }
    
    if (!element) return

    element.classList.add('tutorial-highlight')
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'center'
    })

    // Remove highlight after 3 seconds
    setTimeout(() => {
      element.classList.remove('tutorial-highlight')
    }, 3000)
  }

  const clearHighlights = () => {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight')
    })
  }

  const trackEvent = (eventName, data = {}) => {
    console.log(`Tutorial Event: ${eventName}`, data)
    
    // Could integrate with analytics services
    if (window.gtag) {
      window.gtag('event', eventName, {
        custom_parameter: data
      })
    }
  }

  const announce = (message, priority = 'polite') => {
    announcements.value.push({
      message,
      priority,
      timestamp: new Date().toISOString()
    })

    // Limit announcements array size
    if (announcements.value.length > 20) {
      announcements.value = announcements.value.slice(-20)
    }
  }

  const shouldShowTutorial = () => {
    const hasSeenTutorial = localStorage.getItem('vectoverse-tutorial-completed')
    const hasVisited = localStorage.getItem('vectoverse-visited')
    return !hasSeenTutorial && !hasVisited
  }

  const autoStartIfNew = () => {
    if (shouldShowTutorial()) {
      setTimeout(() => {
        startTutorial()
        localStorage.setItem('vectoverse-visited', 'true')
      }, 2000)
    }
  }

  // Keyboard navigation
  const handleKeydown = (event) => {
    if (!isActive.value) return

    switch (event.key) {
      case 'ArrowRight':
      case ' ':
        event.preventDefault()
        nextStep()
        break
      case 'ArrowLeft':
        event.preventDefault()
        previousStep()
        break
      case 'Escape':
        event.preventDefault()
        endTutorial()
        break
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        event.preventDefault()
        const stepNum = parseInt(event.key) - 1
        if (stepNum < tutorialSteps.value.length) {
          goToStep(stepNum)
        }
        break
    }
  }

  // Lifecycle
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    
    // Auto-start tutorial for new users
    autoStartIfNew()
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    clearHighlights()
  })

  return {
    // State
    isActive,
    currentStep,
    tutorialSteps,
    announcements,
    
    // Computed
    progress,
    currentStepData,
    isFirstStep,
    isLastStep,
    
    // Methods
    startTutorial,
    nextStep,
    previousStep,
    goToStep,
    endTutorial,
    performStepAction,
    highlightElement,
    clearHighlights,
    trackEvent,
    announce,
    shouldShowTutorial,
    autoStartIfNew
  }
} 