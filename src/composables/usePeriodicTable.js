import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useVectorStore } from '../stores/vectorStore'

export function usePeriodicTable() {
  const vectorStore = useVectorStore()
  
  // State
  const periodicData = ref([])
  const selectedElement = ref(null)
  const container = ref(null)
  const svg = ref(null)
  const tooltip = ref(null)
  
  // Configuration
  const config = ref({
    elementWidth: 60,
    elementHeight: 60,
    padding: 2,
    maxColumns: 18,
    fontSize: 10,
    symbolFontSize: 14
  })

  // Computed properties
  const tableWidth = computed(() => {
    const maxCols = Math.min(config.value.maxColumns, Math.ceil(Math.sqrt(periodicData.value.length * 2)))
    return maxCols * (config.value.elementWidth + config.value.padding) + 100
  })

  const tableHeight = computed(() => {
    const maxCols = Math.min(config.value.maxColumns, Math.ceil(Math.sqrt(periodicData.value.length * 2)))
    const rows = Math.ceil(periodicData.value.length / maxCols)
    return rows * (config.value.elementHeight + config.value.padding) + 80
  })

  // Convert vectors to periodic elements
  const vectorsToPeriodicElements = (vectors) => {
    if (!vectors || vectors.length === 0) return []

    return vectors.map((vector, index) => {
      const stats = calculateVectorStatistics(vector)
      const quantumData = getInformationQuantums(vector)
      
      return {
        id: vector.id,
        symbol: generateElementSymbol(vector, index),
        name: `Vector ${vector.id + 1}`,
        atomicNumber: vector.id + 1,
        atomicMass: Math.round(stats.magnitude * 100) / 100,
        
        // Quantum properties
        excitatory: quantumData.excitatory,
        inhibitory: quantumData.inhibitory,
        neutral: quantumData.neutral,
        
        // Statistical properties
        entropy: Math.round(stats.entropy * 1000) / 1000,
        stability: Math.round(stats.stability * 1000) / 1000,
        
        // Visual properties
        color: getElementColor(vector, stats, quantumData),
        position: calculateElementPosition(vector, index, vectors.length),
        
        // Original vector reference
        vector: vector
      }
    })
  }

  // Generate chemical-style symbol for vector
  const generateElementSymbol = (vector, index) => {
    const magnitude = calculateMagnitude(vector.components)
    const entropy = calculateEntropy(vector.components)
    
    const firstLetter = String.fromCharCode(65 + (index % 26)) // A-Z
    
    if (magnitude > 1.5) {
      return firstLetter + 'h' // High magnitude
    } else if (entropy > 2.0) {
      return firstLetter + 'e' // High entropy
    } else if (magnitude < 0.5) {
      return firstLetter + 'l' // Low magnitude
    } else {
      return firstLetter + 'm' // Medium
    }
  }

  // Calculate vector statistics
  const calculateVectorStatistics = (vector) => {
    const magnitude = calculateMagnitude(vector.components)
    const entropy = calculateEntropy(vector.components)
    const stability = calculateStability(vector.components)
    
    return { magnitude, entropy, stability }
  }

  // Calculate magnitude
  const calculateMagnitude = (components) => {
    return Math.sqrt(components.reduce((sum, c) => sum + c * c, 0))
  }

  // Calculate entropy
  const calculateEntropy = (components) => {
    const total = components.reduce((sum, c) => sum + Math.abs(c), 0)
    if (total === 0) return 0
    
    const probabilities = components.map(c => Math.abs(c) / total)
    return -probabilities.reduce((sum, p) => {
      return p > 0 ? sum + p * Math.log2(p) : sum
    }, 0)
  }

  // Calculate stability
  const calculateStability = (components) => {
    const mean = components.reduce((sum, c) => sum + c, 0) / components.length
    const variance = components.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / components.length
    return 1 / (1 + variance) // Higher stability for lower variance
  }

  // Get information quantums
  const getInformationQuantums = (vector) => {
    const components = vector.components
    const excitatory = components.filter(c => c > 0).length
    const inhibitory = components.filter(c => c < 0).length
    const neutral = components.filter(c => c === 0).length
    
    return { excitatory, inhibitory, neutral }
  }

  // Get element color based on properties
  const getElementColor = (vector, stats, quantumData) => {
    if (quantumData.excitatory > quantumData.inhibitory && quantumData.excitatory > quantumData.neutral) {
      return '#ff6b6b' // Red for excitatory
    } else if (quantumData.inhibitory > quantumData.excitatory && quantumData.inhibitory > quantumData.neutral) {
      return '#4ecdc4' // Cyan for inhibitory
    } else if (quantumData.neutral > quantumData.excitatory && quantumData.neutral > quantumData.inhibitory) {
      return '#95a5a6' // Gray for neutral
    } else {
      return '#f39c12' // Orange for balanced
    }
  }

  // Calculate element position in periodic table
  const calculateElementPosition = (vector, index, totalVectors) => {
    const maxCols = Math.min(config.value.maxColumns, Math.ceil(Math.sqrt(totalVectors * 2)))
    const row = Math.floor(index / maxCols)
    const col = index % maxCols
    
    return {
      row: row,
      col: col,
      x: 50 + col * (config.value.elementWidth + config.value.padding),
      y: 40 + row * (config.value.elementHeight + config.value.padding)
    }
  }

  // Initialize periodic table
  const initializePeriodicTable = (containerElement) => {
    container.value = containerElement
    createPeriodicTableContainer()
    updatePeriodicTable()
  }

  // Create SVG container
  const createPeriodicTableContainer = () => {
    if (!container.value) return

    // Remove existing periodic table
    const existing = container.value.querySelector('.periodic-table-container')
    if (existing) {
      existing.remove()
    }

    // Create container
    const tableContainer = document.createElement('div')
    tableContainer.className = 'periodic-table-container'
    tableContainer.style.cssText = `
      width: 100%;
      height: 200px;
      background: rgba(0,0,0,0.1);
      border-top: 2px solid rgba(255,255,255,0.2);
      padding: 10px;
      overflow-x: auto;
      overflow-y: hidden;
      position: absolute;
      bottom: 0;
      left: 0;
    `

    // Create SVG
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svgElement.setAttribute('width', '100%')
    svgElement.setAttribute('height', '180')
    svgElement.setAttribute('class', 'periodic-table-svg')
    
    // Add title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    title.setAttribute('x', '20')
    title.setAttribute('y', '20')
    title.setAttribute('fill', 'white')
    title.setAttribute('font-size', '16px')
    title.setAttribute('font-weight', 'bold')
    title.textContent = '🧪 Vector Periodic Table'
    
    svgElement.appendChild(title)
    tableContainer.appendChild(svgElement)
    container.value.appendChild(tableContainer)
    
    svg.value = svgElement
  }

  // Update periodic table with current vectors
  const updatePeriodicTable = () => {
    if (!svg.value) return
    
    const vectors = vectorStore.vectors
    if (!vectors || vectors.length === 0) {
      clearTable()
      return
    }

    periodicData.value = vectorsToPeriodicElements(vectors)
    renderPeriodicTable()
  }

  // Render periodic table elements
  const renderPeriodicTable = () => {
    if (!svg.value || !periodicData.value.length) return

    // Clear existing elements
    const existingElements = svg.value.querySelectorAll('.periodic-element')
    existingElements.forEach(el => el.remove())

    // Create element groups
    periodicData.value.forEach(element => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('class', 'periodic-element')
      group.setAttribute('transform', `translate(${element.position.x}, ${element.position.y})`)
      group.style.cursor = 'pointer'
      
      // Background rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('width', config.value.elementWidth)
      rect.setAttribute('height', config.value.elementHeight)
      rect.setAttribute('fill', element.color)
      rect.setAttribute('stroke', 'rgba(255,255,255,0.3)')
      rect.setAttribute('stroke-width', '1')
      rect.setAttribute('rx', '4')
      rect.setAttribute('opacity', '0.8')
      
      // Atomic number (top-left)
      const atomicNumber = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      atomicNumber.setAttribute('x', '4')
      atomicNumber.setAttribute('y', '12')
      atomicNumber.setAttribute('fill', 'white')
      atomicNumber.setAttribute('font-size', config.value.fontSize)
      atomicNumber.setAttribute('font-weight', 'bold')
      atomicNumber.textContent = element.atomicNumber
      
      // Element symbol (center)
      const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      symbol.setAttribute('x', config.value.elementWidth / 2)
      symbol.setAttribute('y', config.value.elementHeight / 2 + 2)
      symbol.setAttribute('text-anchor', 'middle')
      symbol.setAttribute('dominant-baseline', 'middle')
      symbol.setAttribute('fill', 'white')
      symbol.setAttribute('font-size', config.value.symbolFontSize)
      symbol.setAttribute('font-weight', 'bold')
      symbol.textContent = element.symbol
      
      // Atomic mass (bottom)
      const atomicMass = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      atomicMass.setAttribute('x', config.value.elementWidth / 2)
      atomicMass.setAttribute('y', config.value.elementHeight - 6)
      atomicMass.setAttribute('text-anchor', 'middle')
      atomicMass.setAttribute('fill', 'rgba(255,255,255,0.8)')
      atomicMass.setAttribute('font-size', config.value.fontSize - 1)
      atomicMass.textContent = element.atomicMass
      
      // Add quantum indicators
      addQuantumIndicators(group, element)
      
      // Event listeners
      group.addEventListener('click', () => {
        vectorStore.selectVector(element.id)
        highlightElement(element.id)
      })
      
      group.addEventListener('mouseenter', (event) => {
        showElementTooltip(event, element)
      })
      
      group.addEventListener('mouseleave', () => {
        hideElementTooltip()
      })
      
      // Append all elements to group
      group.appendChild(rect)
      group.appendChild(atomicNumber)
      group.appendChild(symbol)
      group.appendChild(atomicMass)
      
      svg.value.appendChild(group)
    })
  }

  // Add quantum property indicators
  const addQuantumIndicators = (group, element) => {
    const indicatorSize = 3
    const spacing = 4
    const elementHeight = config.value.elementHeight
    
    // Excitatory indicators (red dots)
    for (let i = 0; i < Math.min(element.excitatory, 5); i++) {
      const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      indicator.setAttribute('cx', 4 + i * spacing)
      indicator.setAttribute('cy', elementHeight - 16)
      indicator.setAttribute('r', indicatorSize)
      indicator.setAttribute('fill', '#ff4757')
      indicator.setAttribute('opacity', '0.7')
      group.appendChild(indicator)
    }
    
    // Inhibitory indicators (blue dots)
    for (let i = 0; i < Math.min(element.inhibitory, 5); i++) {
      const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      indicator.setAttribute('cx', 4 + i * spacing)
      indicator.setAttribute('cy', elementHeight - 24)
      indicator.setAttribute('r', indicatorSize)
      indicator.setAttribute('fill', '#3742fa')
      indicator.setAttribute('opacity', '0.7')
      group.appendChild(indicator)
    }
  }

  // Highlight selected element
  const highlightElement = (vectorId) => {
    // Remove existing highlights
    const elements = svg.value?.querySelectorAll('.periodic-element')
    elements?.forEach(el => {
      el.classList.remove('selected')
      const rect = el.querySelector('rect')
      if (rect) {
        rect.setAttribute('stroke-width', '1')
        rect.setAttribute('stroke', 'rgba(255,255,255,0.3)')
      }
    })
    
    // Highlight selected element
    const selectedElement = periodicData.value.find(el => el.id === vectorId)
    if (selectedElement) {
      const elementIndex = periodicData.value.indexOf(selectedElement)
      const element = svg.value?.children[elementIndex + 1] // +1 for title
      if (element) {
        element.classList.add('selected')
        const rect = element.querySelector('rect')
        if (rect) {
          rect.setAttribute('stroke-width', '3')
          rect.setAttribute('stroke', '#ffd700')
        }
      }
    }
  }

  // Show element tooltip
  const showElementTooltip = (event, element) => {
    hideElementTooltip()
    
    tooltip.value = document.createElement('div')
    tooltip.value.className = 'periodic-tooltip'
    tooltip.value.style.cssText = `
      position: absolute;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 10px;
      border-radius: 6px;
      font-size: 12px;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      max-width: 200px;
    `
    
    tooltip.value.innerHTML = `
      <div><strong>${element.name}</strong></div>
      <div>Symbol: ${element.symbol}</div>
      <div>Atomic Mass: ${element.atomicMass}</div>
      <div>Entropy: ${element.entropy}</div>
      <div>Stability: ${element.stability}</div>
      <div>Excitatory: ${element.excitatory}</div>
      <div>Inhibitory: ${element.inhibitory}</div>
      <div>Neutral: ${element.neutral}</div>
    `
    
    document.body.appendChild(tooltip.value)
    
    const rect = event.target.getBoundingClientRect()
    tooltip.value.style.left = `${rect.right + 10}px`
    tooltip.value.style.top = `${rect.top}px`
  }

  // Hide element tooltip
  const hideElementTooltip = () => {
    if (tooltip.value) {
      document.body.removeChild(tooltip.value)
      tooltip.value = null
    }
  }

  // Clear periodic table
  const clearTable = () => {
    if (!svg.value) return
    
    const elements = svg.value.querySelectorAll('.periodic-element')
    elements.forEach(el => el.remove())
  }

  // Export periodic data
  const exportPeriodicData = () => {
    return {
      elements: periodicData.value,
      timestamp: new Date().toISOString(),
      totalElements: periodicData.value.length
    }
  }

  // Get element data by vector ID
  const getElementData = (vectorId) => {
    return periodicData.value.find(element => element.id === vectorId)
  }

  // Watch for vector changes
  watch(() => vectorStore.vectors, updatePeriodicTable, { deep: true })
  watch(() => vectorStore.selectedVectorId, (newId) => {
    if (newId !== null) {
      highlightElement(newId)
    }
  })

  // Cleanup
  onUnmounted(() => {
    hideElementTooltip()
  })

  return {
    // State
    periodicData,
    selectedElement,
    config,
    
    // Computed
    tableWidth,
    tableHeight,
    
    // Methods
    initializePeriodicTable,
    updatePeriodicTable,
    highlightElement,
    exportPeriodicData,
    getElementData,
    clearTable,
    showElementTooltip,
    hideElementTooltip
  }
} 