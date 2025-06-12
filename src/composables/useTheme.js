import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useLocalStorage } from './useLocalStorage.js'

/**
 * Vue Composable for Theme Management
 * Provides dark/light theme switching with system preference detection
 */
export function useTheme() {
  // Theme storage
  const themeStorage = useLocalStorage('vectoverse_theme', 'dark')
  
  // Reactive state
  const isDark = ref(false)
  const systemPrefersDark = ref(false)
  const isSystemTheme = computed(() => themeStorage.value.value === 'system')
  
  // Theme options
  const themes = [
    { id: 'light', name: 'Light', icon: '☀️' },
    { id: 'dark', name: 'Dark', icon: '🌙' },
    { id: 'system', name: 'System', icon: '💻' }
  ]
  
  // Current theme info
  const currentTheme = computed(() => {
    const themeId = themeStorage.value.value
    return themes.find(t => t.id === themeId) || themes[2] // Default to system
  })
  
  // Effective theme (resolves system to actual theme)
  const effectiveTheme = computed(() => {
    if (themeStorage.value.value === 'system') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return themeStorage.value.value
  })
  
  /**
   * Detect system color scheme preference
   */
  const detectSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemPrefersDark.value = mediaQuery.matches
      
      // Listen for changes
      const handleChange = (e) => {
        systemPrefersDark.value = e.matches
      }
      
      mediaQuery.addEventListener('change', handleChange)
      
      // Return cleanup function
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    return () => {}
  }
  
  /**
   * Apply theme to document
   */
  const applyTheme = (theme) => {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    const body = document.body
    
    // Remove existing theme classes
    body.classList.remove('light-theme', 'dark-theme', 'neon-theme')
    root.classList.remove('light-theme', 'dark-theme', 'neon-theme')
    
    // Add new theme class
    const themeClass = `${theme}-theme`
    body.classList.add(themeClass)
    root.classList.add(themeClass)
    
    isDark.value = theme === 'dark'
  }
  
  /**
   * Set theme
   */
  const setTheme = (themeId) => {
    if (themes.some(t => t.id === themeId)) {
      themeStorage.value.value = themeId
    }
  }
  
  /**
   * Toggle between light and dark (skip system)
   */
  const toggleTheme = () => {
    const current = effectiveTheme.value
    setTheme(current === 'dark' ? 'light' : 'dark')
  }
  
  /**
   * Cycle through all themes
   */
  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === themeStorage.value.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex].id)
  }
  
  // Watch for theme changes
  watch(effectiveTheme, (newTheme) => {
    applyTheme(newTheme)
  }, { immediate: true })
  
  // Watch for system theme changes
  watch(systemPrefersDark, () => {
    if (isSystemTheme.value) {
      applyTheme(effectiveTheme.value)
    }
  })
  
  // Initialize
  onMounted(() => {
    const cleanup = detectSystemTheme()
    
    // Apply initial theme
    applyTheme('dark')
    
    // Return cleanup function
    return cleanup
  })
  
  return {
    // State
    isDark,
    systemPrefersDark,
    isSystemTheme,
    currentTheme,
    effectiveTheme,
    themes,
    
    // Actions
    setTheme,
    toggleTheme,
    cycleTheme
  }
}

/**
 * Specialized composable for visualization theme
 */
export function useVisualizationTheme() {
  const { effectiveTheme } = useTheme()
  
  const visualizationTheme = ref({})

  const getCssVariable = (name) => {
    if (typeof window === 'undefined') return ''
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  const updateVisualizationTheme = () => {
    visualizationTheme.value = {
      background: getCssVariable('--vis-bg'),
      vectorColors: {
        positive: getCssVariable('--vis-vector-positive'),
        negative: getCssVariable('--vis-vector-negative'),
        neutral: getCssVariable('--vis-vector-neutral'),
        selected: getCssVariable('--vis-vector-selected'),
        input: getCssVariable('--vis-vector-input'),
      },
      forceColors: {
        attraction: getCssVariable('--vis-force-attraction'),
        repulsion: getCssVariable('--vis-force-repulsion'),
        neutral: getCssVariable('--vis-force-neutral'),
      },
      gridColor: getCssVariable('--vis-grid-color'),
      textColor: getCssVariable('--vis-text-color'),
      axisColor: getCssVariable('--vis-axis-color'),
      shadowColor: getCssVariable('--shadow-color'),
    }
  }

  watch(effectiveTheme, () => {
    // We need to wait for the DOM to update with the new theme classes
    nextTick(() => {
      updateVisualizationTheme()
    })
  }, { immediate: true })

  onMounted(() => {
    updateVisualizationTheme()
  })
  
  const getVectorColor = (vector, alpha = 1) => {
    const colors = visualizationTheme.value.vectorColors
    if (!colors) return `rgba(128, 128, 128, ${alpha})`

    if (vector.type === 'input') return colors.input
    if (vector.isSelected) return colors.selected
    
    const magnitude = Math.sqrt(vector.values.reduce((sum, v) => sum + v * v, 0))
    if (magnitude > 0.1) return colors.positive
    if (magnitude < -0.1) return colors.negative
    return colors.neutral
  }
  
  const getForceColor = (strength, type = 'attraction') => {
    const colors = visualizationTheme.value.forceColors
    if (!colors) return `rgba(128, 128, 128, 0.5)`

    if (type === 'attraction') {
      return strength > 0 ? colors.attraction : colors.neutral
    } else {
      return strength > 0 ? colors.repulsion : colors.neutral
    }
  }

  const applyToD3Selection = (selection) => {
    const theme = visualizationTheme.value
    if (!theme || !theme.background) return

    selection.style('background-color', theme.background)
    
    selection.selectAll('.grid-line')
      .style('stroke', theme.gridColor)
      
    selection.selectAll('.axis-label')
      .style('fill', theme.textColor)
  }
  
  return {
    visualizationTheme,
    getVectorColor,
    getForceColor,
    applyToD3Selection,
    effectiveTheme
  }
}

/**
 * Theme-aware color palette generator
 */
export function useColorPalette() {
  const { effectiveTheme } = useTheme()
  
  const colorPalettes = computed(() => {
    const theme = effectiveTheme.value
    
    if (theme === 'dark') {
      return {
        primary: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
        secondary: ['#00dbde', '#fc00ff', '#fdbb2d', '#22c1c3', '#a8edea'],
        categorical: [
          '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
          '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6',
          '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
        ],
        sequential: ['#1e1b4b', '#3730a3', '#4f46e5', '#6366f1', '#8b5cf6'],
        diverging: ['#ef4444', '#f97316', '#f59e0b', '#06b6d4', '#3b82f6']
      }
    } else {
      return {
        primary: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
        secondary: ['#00dbde', '#fc00ff', '#fdbb2d', '#22c1c3', '#a8edea'],
        categorical: [
          '#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d',
          '#16a34a', '#059669', '#0891b2', '#0284c7', '#2563eb',
          '#4f46e5', '#7c3aed', '#9333ea', '#c026d3', '#db2777'
        ],
        sequential: ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6'],
        diverging: ['#dc2626', '#ea580c', '#d97706', '#0891b2', '#2563eb']
      }
    }
  })
  
  /**
   * Get color from palette
   */
  const getColor = (palette, index) => {
    const colors = colorPalettes.value[palette] || colorPalettes.value.primary
    return colors[index % colors.length]
  }
  
  /**
   * Generate color scale for data
   */
  const createColorScale = (data, palette = 'categorical') => {
    const colors = colorPalettes.value[palette]
    const scale = (value, min, max) => {
      const normalized = (value - min) / (max - min)
      const index = Math.floor(normalized * (colors.length - 1))
      return colors[Math.max(0, Math.min(index, colors.length - 1))]
    }
    
    return scale
  }
  
  return {
    colorPalettes,
    getColor,
    createColorScale
  }
}

export default {
  useTheme,
  useVisualizationTheme,
  useColorPalette
} 