import { ref, computed, watch, onMounted } from 'vue'
import { useLocalStorage } from './useLocalStorage.js'

/**
 * Vue Composable for Theme Management
 * Provides dark/light theme switching with system preference detection
 */
export function useTheme() {
  // Theme storage
  const themeStorage = useLocalStorage('vectoverse_theme', 'system')
  
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
    body.classList.remove('light-theme', 'dark-theme')
    root.classList.remove('light-theme', 'dark-theme')
    
    // Add new theme class
    const themeClass = `${theme}-theme`
    body.classList.add(themeClass)
    root.classList.add(themeClass)
    
    // Update CSS custom properties
    updateThemeVariables(theme)
    
    isDark.value = theme === 'dark'
  }
  
  /**
   * Update CSS custom properties for theme
   */
  const updateThemeVariables = (theme) => {
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#1a1a1a')
      root.style.setProperty('--bg-secondary', '#2d2d2d')
      root.style.setProperty('--bg-tertiary', '#404040')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#cccccc')
      root.style.setProperty('--text-tertiary', '#999999')
      root.style.setProperty('--border-color', '#404040')
      root.style.setProperty('--accent-color', '#667eea')
      root.style.setProperty('--accent-hover', '#5a67d8')
      root.style.setProperty('--success-color', '#10b981')
      root.style.setProperty('--error-color', '#ef4444')
      root.style.setProperty('--warning-color', '#f59e0b')
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)')
    } else {
      root.style.setProperty('--bg-primary', '#ffffff')
      root.style.setProperty('--bg-secondary', '#f8fafc')
      root.style.setProperty('--bg-tertiary', '#e2e8f0')
      root.style.setProperty('--text-primary', '#1a202c')
      root.style.setProperty('--text-secondary', '#2d3748')
      root.style.setProperty('--text-tertiary', '#4a5568')
      root.style.setProperty('--border-color', '#e2e8f0')
      root.style.setProperty('--accent-color', '#667eea')
      root.style.setProperty('--accent-hover', '#5a67d8')
      root.style.setProperty('--success-color', '#10b981')
      root.style.setProperty('--error-color', '#ef4444')
      root.style.setProperty('--warning-color', '#f59e0b')
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)')
    }
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
    applyTheme(effectiveTheme.value)
    
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
  const { isDark, effectiveTheme } = useTheme()
  
  // Visualization-specific theme properties
  const visualizationTheme = computed(() => {
    const theme = effectiveTheme.value
    
    if (theme === 'dark') {
      return {
        background: '#1a1a1a',
        vectorColors: {
          positive: '#ef4444',
          negative: '#3b82f6',
          neutral: '#6b7280',
          selected: '#fbbf24',
          input: '#10b981'
        },
        forceColors: {
          attraction: '#10b981',
          repulsion: '#ef4444',
          neutral: '#6b7280'
        },
        gridColor: '#404040',
        textColor: '#ffffff',
        axisColor: '#666666',
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    } else {
      return {
        background: '#ffffff',
        vectorColors: {
          positive: '#dc2626',
          negative: '#2563eb',
          neutral: '#4b5563',
          selected: '#f59e0b',
          input: '#059669'
        },
        forceColors: {
          attraction: '#059669',
          repulsion: '#dc2626',
          neutral: '#4b5563'
        },
        gridColor: '#e5e7eb',
        textColor: '#1f2937',
        axisColor: '#9ca3af',
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      }
    }
  })
  
  /**
   * Get color for vector based on type and value
   */
  const getVectorColor = (vector, alpha = 1) => {
    const colors = visualizationTheme.value.vectorColors
    
    if (vector.type === 'input') return colors.input
    if (vector.isSelected) return colors.selected
    
    // Color based on magnitude or charge
    const magnitude = Math.sqrt(vector.values.reduce((sum, v) => sum + v * v, 0))
    if (magnitude > 0.1) return colors.positive
    if (magnitude < -0.1) return colors.negative
    return colors.neutral
  }
  
  /**
   * Get force line color based on strength and type
   */
  const getForceColor = (strength, type = 'attraction') => {
    const colors = visualizationTheme.value.forceColors
    const baseColor = colors[type] || colors.neutral
    
    // Adjust opacity based on strength
    const opacity = Math.min(Math.abs(strength), 1)
    return `${baseColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`
  }
  
  /**
   * Apply theme to D3 visualization
   */
  const applyToD3Selection = (selection) => {
    const theme = visualizationTheme.value
    
    selection
      .style('background-color', theme.background)
      .style('color', theme.textColor)
    
    // Apply to axes
    selection.selectAll('.axis')
      .style('color', theme.axisColor)
    
    // Apply to grid
    selection.selectAll('.grid-line')
      .style('stroke', theme.gridColor)
    
    return selection
  }
  
  return {
    visualizationTheme,
    getVectorColor,
    getForceColor,
    applyToD3Selection,
    isDark
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