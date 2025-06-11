/**
 * Format Utilities
 * Helper functions for formatting numbers, data, and display elements
 */

// Number Formatting
export const numberFormat = {
  /**
   * Format a number with specified decimal places
   * @param {number} value - Number to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted number
   */
  decimal(value, decimals = 2) {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A'
    return value.toFixed(decimals)
  },

  /**
   * Format a number in scientific notation
   * @param {number} value - Number to format
   * @param {number} precision - Number of significant digits
   * @returns {string} Scientific notation
   */
  scientific(value, precision = 3) {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A'
    return value.toExponential(precision)
  },

  /**
   * Format percentage with specified decimals
   * @param {number} value - Value between 0 and 1
   * @param {number} decimals - Decimal places
   * @returns {string} Formatted percentage
   */
  percentage(value, decimals = 1) {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A'
    return `${(value * 100).toFixed(decimals)}%`
  },

  /**
   * Format large numbers with appropriate units
   * @param {number} value - Number to format
   * @returns {string} Formatted number with units
   */
  compact(value) {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A'
    
    const abs = Math.abs(value)
    const sign = value < 0 ? '-' : ''
    
    if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`
    if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`
    if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`
    return value.toString()
  },

  /**
   * Format number with thousand separators
   * @param {number} value - Number to format
   * @param {string} separator - Thousand separator
   * @returns {string} Formatted number
   */
  thousands(value, separator = ',') {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A'
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  }
}

// Vector Formatting
export const vectorFormat = {
  /**
   * Format vector components for display
   * @param {number[]} vector - Vector to format
   * @param {number} decimals - Decimal places
   * @returns {string} Formatted vector string
   */
  components(vector, decimals = 3) {
    if (!Array.isArray(vector)) return 'Invalid Vector'
    const formatted = vector.map(val => numberFormat.decimal(val, decimals))
    return `[${formatted.join(', ')}]`
  },

  /**
   * Format vector with dimension labels
   * @param {number[]} vector - Vector to format
   * @param {number} decimals - Decimal places
   * @returns {string} Formatted vector with labels
   */
  labeled(vector, decimals = 3) {
    if (!Array.isArray(vector)) return 'Invalid Vector'
    const formatted = vector.map((val, i) => 
      `x${i + 1}: ${numberFormat.decimal(val, decimals)}`
    )
    return formatted.join(', ')
  },

  /**
   * Format vector magnitude
   * @param {number[]} vector - Vector to calculate magnitude
   * @param {number} decimals - Decimal places
   * @returns {string} Formatted magnitude
   */
  magnitude(vector, decimals = 3) {
    if (!Array.isArray(vector)) return 'N/A'
    const mag = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    return numberFormat.decimal(mag, decimals)
  },

  /**
   * Format vector for CSV export
   * @param {number[]} vector - Vector to format
   * @param {string} separator - CSV separator
   * @returns {string} CSV formatted vector
   */
  csv(vector, separator = ',') {
    if (!Array.isArray(vector)) return ''
    return vector.join(separator)
  }
}

// Time Formatting
export const timeFormat = {
  /**
   * Format duration in milliseconds to human readable
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Human readable duration
   */
  duration(ms) {
    if (typeof ms !== 'number' || ms < 0) return '0ms'
    
    const units = [
      { name: 'd', value: 86400000 },
      { name: 'h', value: 3600000 },
      { name: 'm', value: 60000 },
      { name: 's', value: 1000 },
      { name: 'ms', value: 1 }
    ]
    
    for (const unit of units) {
      if (ms >= unit.value) {
        const value = Math.floor(ms / unit.value)
        return `${value}${unit.name}`
      }
    }
    
    return '0ms'
  },

  /**
   * Format timestamp to readable format
   * @param {number|Date} timestamp - Timestamp or Date object
   * @returns {string} Formatted timestamp
   */
  timestamp(timestamp) {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString()
    } catch {
      return 'Invalid Date'
    }
  }
}

// Color Formatting
export const colorFormat = {
  /**
   * Convert value to HSL color based on range
   * @param {number} value - Value to convert
   * @param {number} min - Minimum value in range
   * @param {number} max - Maximum value in range
   * @returns {string} HSL color string
   */
  valueToHSL(value, min, max) {
    if (typeof value !== 'number' || isNaN(value)) return 'hsl(0, 0%, 50%)'
    
    const normalized = (value - min) / (max - min)
    const hue = Math.floor((1 - normalized) * 240) // Blue to Red
    return `hsl(${hue}, 70%, 50%)`
  },

  /**
   * Get color for vector component based on value
   * @param {number} value - Component value
   * @param {number} max - Maximum absolute value
   * @returns {string} Color string
   */
  componentColor(value, max) {
    if (typeof value !== 'number' || isNaN(value)) return '#666'
    
    const intensity = Math.abs(value) / max
    const alpha = Math.min(0.3 + intensity * 0.7, 1)
    
    if (value > 0) {
      return `rgba(239, 68, 68, ${alpha})` // Red for positive
    } else if (value < 0) {
      return `rgba(59, 130, 246, ${alpha})` // Blue for negative
    } else {
      return `rgba(156, 163, 175, ${alpha})` // Gray for zero
    }
  },

  /**
   * Convert hex color to RGBA
   * @param {string} hex - Hex color string
   * @param {number} alpha - Alpha value (0-1)
   * @returns {string} RGBA color string
   */
  hexToRGBA(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
}

// Text Formatting
export const textFormat = {
  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncate(text, maxLength = 50) {
    if (typeof text !== 'string') return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
  },

  /**
   * Capitalize first letter of each word
   * @param {string} text - Text to capitalize
   * @returns {string} Capitalized text
   */
  titleCase(text) {
    if (typeof text !== 'string') return ''
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  },

  /**
   * Convert camelCase to readable format
   * @param {string} text - CamelCase text
   * @returns {string} Readable text
   */
  camelToWords(text) {
    if (typeof text !== 'string') return ''
    return text.replace(/([A-Z])/g, ' $1').trim()
  },

  /**
   * Pluralize word based on count
   * @param {string} word - Word to pluralize
   * @param {number} count - Count value
   * @param {string} plural - Custom plural form
   * @returns {string} Pluralized word
   */
  pluralize(word, count, plural = null) {
    if (count === 1) return word
    return plural || word + 's'
  }
}

// Mathematical Formatting
export const mathFormat = {
  /**
   * Format mathematical expression with LaTeX
   * @param {string} expression - Mathematical expression
   * @returns {string} LaTeX formatted expression
   */
  latex(expression) {
    return `\\(${expression}\\)`
  },

  /**
   * Format vector in mathematical notation
   * @param {number[]} vector - Vector to format
   * @param {string} symbol - Vector symbol
   * @returns {string} LaTeX vector notation
   */
  vectorNotation(vector, symbol = 'v') {
    if (!Array.isArray(vector)) return ''
    const components = vector.map(val => numberFormat.decimal(val, 3))
    return `\\vec{${symbol}} = \\begin{pmatrix} ${components.join(' \\\\ ')} \\end{pmatrix}`
  },

  /**
   * Format matrix in mathematical notation
   * @param {number[][]} matrix - Matrix to format
   * @returns {string} LaTeX matrix notation
   */
  matrixNotation(matrix) {
    if (!Array.isArray(matrix) || !Array.isArray(matrix[0])) return ''
    const rows = matrix.map(row => 
      row.map(val => numberFormat.decimal(val, 3)).join(' & ')
    )
    return `\\begin{pmatrix} ${rows.join(' \\\\ ')} \\end{pmatrix}`
  }
}

// File Size Formatting
export const fileSizeFormat = {
  /**
   * Format bytes to human readable format
   * @param {number} bytes - File size in bytes
   * @param {number} decimals - Decimal places
   * @returns {string} Formatted file size
   */
  bytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
  }
}

// Export all formatters as default
export default {
  number: numberFormat,
  vector: vectorFormat,
  time: timeFormat,
  color: colorFormat,
  text: textFormat,
  math: mathFormat,
  fileSize: fileSizeFormat
} 