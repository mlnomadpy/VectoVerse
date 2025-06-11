import { ref, onMounted, onUnmounted } from 'vue'
import { useVectorStore } from '@/stores/vectorStore'
import { useUIStore } from '@/stores/uiStore'

export function useKeyboardShortcuts() {
  const vectorStore = useVectorStore()
  const uiStore = useUIStore()
  
  const isEnabled = ref(true)
  const shortcuts = ref(new Map())
  
  // Default keyboard shortcuts
  const defaultShortcuts = [
    {
      key: 'g',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Generate new vectors',
      action: () => vectorStore.generateVectors()
    },
    {
      key: 'a',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Add custom vector',
      action: () => uiStore.showAddVectorModal()
    },
    {
      key: 'n',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Toggle neural mode',
      action: () => vectorStore.toggleNeuralMode()
    },
    {
      key: 'f',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Toggle forces visualization',
      action: () => vectorStore.toggleForces()
    },
    {
      key: 'r',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Run analysis',
      action: () => uiStore.showAnalysisModal()
    },
    {
      key: 'h',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Show help',
      action: () => uiStore.showTutorialModal()
    },
    {
      key: 'Escape',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Close modals/cancel',
      action: () => uiStore.closeAllModals()
    },
    {
      key: 's',
      ctrl: true,
      alt: false,
      shift: false,
      description: 'Save/Export data',
      action: () => exportData()
    },
    {
      key: 'o',
      ctrl: true,
      alt: false,
      shift: false,
      description: 'Open/Import data',
      action: () => triggerFileInput()
    },
    {
      key: 'z',
      ctrl: true,
      alt: false,
      shift: false,
      description: 'Undo last action',
      action: () => vectorStore.undo()
    },
    {
      key: 'y',
      ctrl: true,
      alt: false,
      shift: false,
      description: 'Redo last action',
      action: () => vectorStore.redo()
    },
    {
      key: 'Delete',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Delete selected vector',
      action: () => deleteSelectedVector()
    },
    {
      key: 'Enter',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Confirm action',
      action: () => confirmCurrentAction()
    },
    {
      key: '1',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Switch to vectors tab',
      action: () => uiStore.setActiveTab('vectors')
    },
    {
      key: '2',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Switch to analysis tab',
      action: () => uiStore.setActiveTab('analysis')
    },
    {
      key: '3',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Switch to visualization tab',
      action: () => uiStore.setActiveTab('visualization')
    },
    {
      key: '4',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Switch to neural tab',
      action: () => uiStore.setActiveTab('neural')
    },
    {
      key: 'ArrowUp',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Select previous vector',
      action: () => selectPreviousVector()
    },
    {
      key: 'ArrowDown',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Select next vector',
      action: () => selectNextVector()
    },
    {
      key: 'ArrowLeft',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Previous tab',
      action: () => navigateTab(-1)
    },
    {
      key: 'ArrowRight',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Next tab',
      action: () => navigateTab(1)
    },
    {
      key: ' ',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Toggle selection',
      action: () => toggleVectorSelection()
    },
    {
      key: 'F11',
      ctrl: false,
      alt: false,
      shift: false,
      description: 'Toggle fullscreen',
      action: () => toggleFullscreen()
    }
  ]
  
  // Initialize shortcuts
  const initializeShortcuts = () => {
    defaultShortcuts.forEach(shortcut => {
      const key = createShortcutKey(shortcut)
      shortcuts.value.set(key, shortcut)
    })
  }
  
  // Create unique key for shortcut mapping
  const createShortcutKey = (shortcut) => {
    const modifiers = []
    if (shortcut.ctrl) modifiers.push('ctrl')
    if (shortcut.alt) modifiers.push('alt')
    if (shortcut.shift) modifiers.push('shift')
    return [...modifiers, shortcut.key.toLowerCase()].join('+')
  }
  
  // Handle keyboard events
  const handleKeyDown = (event) => {
    if (!isEnabled.value) return
    
    // Don't trigger shortcuts when typing in inputs
    if (isInputElement(event.target)) return
    
    const key = createEventKey(event)
    const shortcut = shortcuts.value.get(key)
    
    if (shortcut) {
      event.preventDefault()
      event.stopPropagation()
      
      try {
        shortcut.action()
        uiStore.showInfo(`Keyboard shortcut: ${shortcut.description}`)
      } catch (error) {
        console.error('Shortcut execution error:', error)
        uiStore.showError('Failed to execute keyboard shortcut')
      }
    }
  }
  
  // Create event key from keyboard event
  const createEventKey = (event) => {
    const modifiers = []
    if (event.ctrlKey || event.metaKey) modifiers.push('ctrl')
    if (event.altKey) modifiers.push('alt')
    if (event.shiftKey) modifiers.push('shift')
    return [...modifiers, event.key.toLowerCase()].join('+')
  }
  
  // Check if element is an input where we shouldn't trigger shortcuts
  const isInputElement = (element) => {
    const inputElements = ['input', 'textarea', 'select']
    const contentEditable = element.contentEditable === 'true'
    return inputElements.includes(element.tagName.toLowerCase()) || contentEditable
  }
  
  // Shortcut action implementations
  const exportData = () => {
    try {
      const data = {
        vectors: vectorStore.vectors,
        config: {
          dimensions: vectorStore.dimensions,
          forceType: vectorStore.forceType,
          activationFunction: vectorStore.activationFunction
        },
        timestamp: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vectoverse-export-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      uiStore.showError('Failed to export data')
    }
  }
  
  const triggerFileInput = () => {
    const fileInput = document.getElementById('vector-file')
    if (fileInput) {
      fileInput.click()
    }
  }
  
  const deleteSelectedVector = () => {
    if (vectorStore.selectedVectorId) {
      vectorStore.removeVector(vectorStore.selectedVectorId)
      uiStore.showSuccess('Selected vector deleted')
    }
  }
  
  const confirmCurrentAction = () => {
    // Find active modal and trigger its confirm button
    const activeModal = document.querySelector('.modal.active')
    if (activeModal) {
      const confirmButton = activeModal.querySelector('.btn-primary, .confirm-btn')
      if (confirmButton) {
        confirmButton.click()
      }
    }
  }
  
  const selectPreviousVector = () => {
    const vectors = vectorStore.vectors
    if (vectors.length === 0) return
    
    const currentIndex = vectors.findIndex(v => v.id === vectorStore.selectedVectorId)
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : vectors.length - 1
    vectorStore.selectVector(vectors[previousIndex].id)
  }
  
  const selectNextVector = () => {
    const vectors = vectorStore.vectors
    if (vectors.length === 0) return
    
    const currentIndex = vectors.findIndex(v => v.id === vectorStore.selectedVectorId)
    const nextIndex = currentIndex < vectors.length - 1 ? currentIndex + 1 : 0
    vectorStore.selectVector(vectors[nextIndex].id)
  }
  
  const navigateTab = (direction) => {
    const tabs = ['vectors', 'analysis', 'visualization', 'neural']
    const currentIndex = tabs.indexOf(uiStore.activeTab)
    const newIndex = (currentIndex + direction + tabs.length) % tabs.length
    uiStore.setActiveTab(tabs[newIndex])
  }
  
  const toggleVectorSelection = () => {
    if (vectorStore.selectedVectorId) {
      vectorStore.selectVector(null)
    } else if (vectorStore.vectors.length > 0) {
      vectorStore.selectVector(vectorStore.vectors[0].id)
    }
  }
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }
  
  // Add custom shortcut
  const addShortcut = (key, ctrl = false, alt = false, shift = false, description, action) => {
    const shortcut = { key, ctrl, alt, shift, description, action }
    const shortcutKey = createShortcutKey(shortcut)
    shortcuts.value.set(shortcutKey, shortcut)
  }
  
  // Remove shortcut
  const removeShortcut = (key, ctrl = false, alt = false, shift = false) => {
    const shortcutKey = createShortcutKey({ key, ctrl, alt, shift })
    shortcuts.value.delete(shortcutKey)
  }
  
  // Enable/disable shortcuts
  const enableShortcuts = () => {
    isEnabled.value = true
  }
  
  const disableShortcuts = () => {
    isEnabled.value = false
  }
  
  // Get all shortcuts for help display
  const getAllShortcuts = () => {
    return Array.from(shortcuts.value.values()).map(shortcut => ({
      ...shortcut,
      keyDisplay: formatShortcutDisplay(shortcut)
    }))
  }
  
  // Format shortcut for display
  const formatShortcutDisplay = (shortcut) => {
    const parts = []
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.shift) parts.push('Shift')
    parts.push(shortcut.key)
    return parts.join(' + ')
  }
  
  // Show shortcuts help
  const showShortcutsHelp = () => {
    const shortcuts = getAllShortcuts()
    uiStore.showShortcutsModal(shortcuts)
  }
  
  // Lifecycle
  onMounted(() => {
    initializeShortcuts()
    document.addEventListener('keydown', handleKeyDown)
  })
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
  
  return {
    isEnabled,
    addShortcut,
    removeShortcut,
    enableShortcuts,
    disableShortcuts,
    getAllShortcuts,
    showShortcutsHelp
  }
} 