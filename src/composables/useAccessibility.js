import { ref, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '../stores/uiStore'

export function useAccessibility() {
  const uiStore = useUIStore()
  
  // State
  const announcements = ref([])
  const highContrastMode = ref(false)
  const liveRegion = ref(null)
  const focusableElements = ref([])

  // Create ARIA live region for screen reader announcements
  const createAriaLiveRegion = () => {
    if (liveRegion.value) return

    const region = document.createElement('div')
    region.id = 'vectoverse-announcements'
    region.setAttribute('aria-live', 'polite')
    region.setAttribute('aria-atomic', 'true')
    region.className = 'sr-only'
    region.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `
    
    document.body.appendChild(region)
    liveRegion.value = region
  }

  // Announce message to screen readers
  const announce = (message, priority = 'polite') => {
    if (!liveRegion.value) return

    liveRegion.value.setAttribute('aria-live', priority)
    liveRegion.value.textContent = message
    
    // Track announcement
    announcements.value.push({
      message,
      priority,
      timestamp: new Date().toISOString()
    })
    
    // Limit announcements history
    if (announcements.value.length > 50) {
      announcements.value = announcements.value.slice(-50)
    }
    
    // Clear after announcement to allow repeated messages
    setTimeout(() => {
      if (liveRegion.value) {
        liveRegion.value.textContent = ''
      }
    }, 1000)
  }

  // Keyboard shortcut handlers
  const handleKeyboardShortcuts = (event) => {
    // Skip if user is typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return
    }

    // Handle keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'g':
          event.preventDefault()
          // Generate vectors action
          const generateBtn = document.querySelector('[data-action="generate"]')
          if (generateBtn) {
            generateBtn.click()
            announce('Generated new vectors')
          }
          break
        case 'r':
          event.preventDefault()
          // Reset visualization
          const resetBtn = document.querySelector('[data-action="reset"]')
          if (resetBtn) {
            resetBtn.click()
            announce('Reset visualization')
          }
          break
        case 'e':
          event.preventDefault()
          uiStore.showExportModal()
          announce('Export options opened')
          break
        case 'a':
          event.preventDefault()
          uiStore.showAnalysisModal()
          announce('Analysis modal opened')
          break
        case 'h':
          event.preventDefault()
          uiStore.showTutorialModal()
          announce('Help modal opened')
          break
      }
    } else {
      switch (event.key) {
        case '?':
          event.preventDefault()
          uiStore.toggleShortcuts()
          announce('Keyboard shortcuts displayed')
          break
        case 'Escape':
          uiStore.hideModal()
          announce('Modal closed')
          break
        case 'Tab':
          manageFocus(event)
          break
      }
    }
  }

  // Focus management
  const manageFocus = (event) => {
    const focusedElement = event.target
    
    // Ensure vector focus is announced
    if (focusedElement.classList.contains('vector-atom')) {
      announceVectorFocus(focusedElement)
    }
    
    // Ensure focused element is visible
    if (focusedElement.scrollIntoView) {
      focusedElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      })
    }
  }

  // Announce vector focus for screen readers
  const announceVectorFocus = (vectorElement) => {
    const vectorId = vectorElement.getAttribute('data-id')
    if (vectorId) {
      const message = `Vector ${parseInt(vectorId) + 1} focused. Use Enter to select, arrow keys to navigate.`
      announce(message)
    }
  }

  // Focus trap for modals
  const trapFocusInModal = (modal, event) => {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey && event.target === firstElement) {
      event.preventDefault()
      lastElement?.focus()
    } else if (!event.shiftKey && event.target === lastElement) {
      event.preventDefault()
      firstElement?.focus()
    }
  }

  // Setup high contrast mode
  const setupHighContrastMode = () => {
    // Detect high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    
    const updateHighContrast = (matches) => {
      highContrastMode.value = matches
      document.body.classList.toggle('high-contrast', matches)
      announce(matches ? 'High contrast mode enabled' : 'High contrast mode disabled')
    }
    
    updateHighContrast(highContrastQuery.matches)
    
    // Listen for changes
    highContrastQuery.addEventListener('change', (e) => {
      updateHighContrast(e.matches)
    })
  }

  // Add ARIA labels to controls
  const addAriaLabelsToControls = () => {
    const controls = {
      '#dimensions-slider': 'Number of dimensions',
      '#num-vectors-slider': 'Number of vectors',
      '#regenerate': 'Generate new random vectors',
      '#toggle-forces': 'Toggle force visualization',
      '#run-analysis': 'Open analysis modal',
      '#file-upload': 'Upload vector data file',
      '.theme-switcher': 'Switch between light and dark theme',
      '.floating-action-button': 'Quick actions menu',
      '.tab-button': 'Tab navigation'
    }

    Object.entries(controls).forEach(([selector, label]) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        if (!element.getAttribute('aria-label')) {
          element.setAttribute('aria-label', label)
        }
      })
    })
  }

  // Update visualization description for screen readers
  const updateVisualizationDescription = () => {
    const svg = document.querySelector('#main-viz')
    const vectorElements = document.querySelectorAll('.vector-atom')
    
    if (svg) {
      const description = `Vector visualization with ${vectorElements.length} vectors. Use arrow keys to navigate between vectors, Enter to select, and ? for keyboard shortcuts.`
      svg.setAttribute('aria-label', description)
      svg.setAttribute('role', 'img')
    }
  }

  // Handle focus events
  const handleFocusIn = (event) => {
    const modal = event.target.closest('.modal-overlay')
    if (modal) {
      trapFocusInModal(modal, event)
    }
  }

  // Show keyboard shortcuts modal
  const showKeyboardShortcuts = () => {
    const shortcuts = [
      { key: 'Ctrl+G', action: 'Generate new vectors' },
      { key: 'Ctrl+R', action: 'Reset visualization' },
      { key: 'Ctrl+E', action: 'Export data' },
      { key: 'Ctrl+A', action: 'Open analysis modal' },
      { key: 'Ctrl+H', action: 'Show help' },
      { key: 'Arrow Keys', action: 'Navigate between vectors' },
      { key: 'Enter/Space', action: 'Select vector' },
      { key: 'Escape', action: 'Close modals' },
      { key: '?', action: 'Show keyboard shortcuts' },
      { key: 'Tab', action: 'Navigate between controls' }
    ]

    uiStore.showShortcutsModal(shortcuts)
  }

  // Ensure color contrast
  const ensureColorContrast = () => {
    // Add high contrast styles if needed
    if (highContrastMode.value) {
      const style = document.createElement('style')
      style.id = 'accessibility-high-contrast'
      style.textContent = `
        .high-contrast .vector-atom {
          stroke: #000 !important;
          stroke-width: 2px !important;
        }
        .high-contrast .force-line {
          stroke: #000 !important;
          stroke-width: 3px !important;
        }
        .high-contrast .modal-content {
          background: #fff !important;
          color: #000 !important;
          border: 3px solid #000 !important;
        }
      `
      document.head.appendChild(style)
    }
  }

  // Get accessibility report
  const getAccessibilityReport = () => {
    return {
      announcements: announcements.value,
      focusableElements: document.querySelectorAll('[tabindex], button, input, select, textarea, a[href]').length,
      ariaLabels: document.querySelectorAll('[aria-label]').length,
      highContrastMode: highContrastMode.value,
      screenReaderSupport: {
        liveRegion: !!liveRegion.value,
        landmarks: document.querySelectorAll('[role]').length,
        headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length
      }
    }
  }

  // Initialize accessibility features
  const initialize = () => {
    createAriaLiveRegion()
    setupHighContrastMode()
    addAriaLabelsToControls()
    ensureColorContrast()
    updateVisualizationDescription()
    
    announce('VectoVerse visualization loaded. Press ? for keyboard shortcuts.')
  }

  // Cleanup
  const cleanup = () => {
    if (liveRegion.value) {
      document.body.removeChild(liveRegion.value)
      liveRegion.value = null
    }
    
    const highContrastStyle = document.getElementById('accessibility-high-contrast')
    if (highContrastStyle) {
      document.head.removeChild(highContrastStyle)
    }
  }

  // Lifecycle
  onMounted(() => {
    initialize()
    document.addEventListener('keydown', handleKeyboardShortcuts)
    document.addEventListener('focusin', handleFocusIn)
  })

  onUnmounted(() => {
    cleanup()
    document.removeEventListener('keydown', handleKeyboardShortcuts)
    document.removeEventListener('focusin', handleFocusIn)
  })

  return {
    // State
    announcements,
    highContrastMode,
    
    // Methods
    announce,
    manageFocus,
    announceVectorFocus,
    trapFocusInModal,
    setupHighContrastMode,
    addAriaLabelsToControls,
    updateVisualizationDescription,
    showKeyboardShortcuts,
    ensureColorContrast,
    getAccessibilityReport,
    initialize,
    cleanup
  }
} 