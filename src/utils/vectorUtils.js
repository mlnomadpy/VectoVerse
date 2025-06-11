/**
 * Vector Utility Functions
 * Comprehensive helper functions for vector operations, validation, and manipulation
 */

// Vector Mathematical Operations
export const vectorOperations = {
  /**
   * Add two vectors
   * @param {number[]} a - First vector
   * @param {number[]} b - Second vector
   * @returns {number[]} Result vector
   */
  add(a, b) {
    if (a.length !== b.length) throw new Error('Vector dimensions must match')
    return a.map((val, i) => val + b[i])
  },

  /**
   * Subtract two vectors
   * @param {number[]} a - First vector
   * @param {number[]} b - Second vector
   * @returns {number[]} Result vector
   */
  subtract(a, b) {
    if (a.length !== b.length) throw new Error('Vector dimensions must match')
    return a.map((val, i) => val - b[i])
  },

  /**
   * Scale a vector by a scalar
   * @param {number[]} vector - Input vector
   * @param {number} scalar - Scaling factor
   * @returns {number[]} Scaled vector
   */
  scale(vector, scalar) {
    return vector.map(val => val * scalar)
  },

  /**
   * Calculate dot product of two vectors
   * @param {number[]} a - First vector
   * @param {number[]} b - Second vector
   * @returns {number} Dot product
   */
  dotProduct(a, b) {
    if (a.length !== b.length) throw new Error('Vector dimensions must match')
    return a.reduce((sum, val, i) => sum + val * b[i], 0)
  },

  /**
   * Calculate vector magnitude (L2 norm)
   * @param {number[]} vector - Input vector
   * @returns {number} Magnitude
   */
  magnitude(vector) {
    return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  },

  /**
   * Normalize a vector to unit length
   * @param {number[]} vector - Input vector
   * @returns {number[]} Normalized vector
   */
  normalize(vector) {
    const mag = this.magnitude(vector)
    if (mag === 0) return vector.slice() // Return copy of zero vector
    return vector.map(val => val / mag)
  },

  /**
   * Calculate cosine similarity between two vectors
   * @param {number[]} a - First vector
   * @param {number[]} b - Second vector
   * @returns {number} Cosine similarity (-1 to 1)
   */
  cosineSimilarity(a, b) {
    const dotProd = this.dotProduct(a, b)
    const magA = this.magnitude(a)
    const magB = this.magnitude(b)
    
    if (magA === 0 || magB === 0) return 0
    return dotProd / (magA * magB)
  },

  /**
   * Calculate Euclidean distance between two vectors
   * @param {number[]} a - First vector
   * @param {number[]} b - Second vector
   * @returns {number} Euclidean distance
   */
  euclideanDistance(a, b) {
    if (a.length !== b.length) throw new Error('Vector dimensions must match')
    const diff = this.subtract(a, b)
    return this.magnitude(diff)
  },

  /**
   * Calculate Manhattan distance between two vectors
   * @param {number[]} a - First vector
   * @param {number[]} b - Second vector
   * @returns {number} Manhattan distance
   */
  manhattanDistance(a, b) {
    if (a.length !== b.length) throw new Error('Vector dimensions must match')
    return a.reduce((sum, val, i) => sum + Math.abs(val - b[i]), 0)
  }
}

// Vector Generation Utilities
export const vectorGeneration = {
  /**
   * Generate a random vector with specified dimensions
   * @param {number} dimensions - Number of dimensions
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number[]} Random vector
   */
  random(dimensions, min = -1, max = 1) {
    return Array.from({ length: dimensions }, () => 
      Math.random() * (max - min) + min
    )
  },

  /**
   * Generate a zero vector
   * @param {number} dimensions - Number of dimensions
   * @returns {number[]} Zero vector
   */
  zero(dimensions) {
    return new Array(dimensions).fill(0)
  },

  /**
   * Generate a unit vector (one-hot)
   * @param {number} dimensions - Number of dimensions
   * @param {number} activeIndex - Index of the active dimension
   * @returns {number[]} Unit vector
   */
  unit(dimensions, activeIndex) {
    const vector = this.zero(dimensions)
    if (activeIndex >= 0 && activeIndex < dimensions) {
      vector[activeIndex] = 1
    }
    return vector
  },

  /**
   * Generate vectors with normal distribution
   * @param {number} dimensions - Number of dimensions
   * @param {number} mean - Mean value
   * @param {number} stdDev - Standard deviation
   * @returns {number[]} Normally distributed vector
   */
  normal(dimensions, mean = 0, stdDev = 1) {
    return Array.from({ length: dimensions }, () => 
      this.boxMullerRandom() * stdDev + mean
    )
  },

  /**
   * Box-Muller transformation for normal distribution
   * @returns {number} Normally distributed random number
   */
  boxMullerRandom() {
    const u1 = Math.random()
    const u2 = Math.random()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }
}

// Vector Validation
export const vectorValidation = {
  /**
   * Check if input is a valid vector
   * @param {any} input - Input to validate
   * @returns {boolean} True if valid vector
   */
  isValid(input) {
    return Array.isArray(input) && 
           input.length > 0 && 
           input.every(val => typeof val === 'number' && !isNaN(val))
  },

  /**
   * Check if two vectors have same dimensions
   * @param {number[]} a - First vector
   * @param {number[]} b - Second vector
   * @returns {boolean} True if same dimensions
   */
  sameDimensions(a, b) {
    return this.isValid(a) && this.isValid(b) && a.length === b.length
  },

  /**
   * Validate vector dimensions
   * @param {number[]} vector - Vector to validate
   * @param {number} expectedDimensions - Expected number of dimensions
   * @returns {boolean} True if dimensions match
   */
  validateDimensions(vector, expectedDimensions) {
    return this.isValid(vector) && vector.length === expectedDimensions
  },

  /**
   * Check if vector contains only finite numbers
   * @param {number[]} vector - Vector to check
   * @returns {boolean} True if all values are finite
   */
  isFinite(vector) {
    return this.isValid(vector) && vector.every(val => Number.isFinite(val))
  }
}

// Vector Statistics
export const vectorStatistics = {
  /**
   * Calculate vector statistics
   * @param {number[]} vector - Input vector
   * @returns {Object} Statistics object
   */
  calculate(vector) {
    if (!vectorValidation.isValid(vector)) {
      throw new Error('Invalid vector input')
    }

    const mean = this.mean(vector)
    const variance = this.variance(vector, mean)
    const stdDev = Math.sqrt(variance)

    return {
      mean,
      variance,
      standardDeviation: stdDev,
      min: Math.min(...vector),
      max: Math.max(...vector),
      magnitude: vectorOperations.magnitude(vector),
      sparsity: this.sparsity(vector),
      entropy: this.entropy(vector)
    }
  },

  /**
   * Calculate mean of vector components
   * @param {number[]} vector - Input vector
   * @returns {number} Mean value
   */
  mean(vector) {
    return vector.reduce((sum, val) => sum + val, 0) / vector.length
  },

  /**
   * Calculate variance of vector components
   * @param {number[]} vector - Input vector
   * @param {number} mean - Pre-calculated mean (optional)
   * @returns {number} Variance
   */
  variance(vector, mean = null) {
    const m = mean !== null ? mean : this.mean(vector)
    return vector.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / vector.length
  },

  /**
   * Calculate sparsity (ratio of zero/near-zero elements)
   * @param {number[]} vector - Input vector
   * @param {number} threshold - Threshold for considering values as zero
   * @returns {number} Sparsity ratio (0-1)
   */
  sparsity(vector, threshold = 1e-10) {
    const zeroCount = vector.filter(val => Math.abs(val) < threshold).length
    return zeroCount / vector.length
  },

  /**
   * Calculate information entropy of vector
   * @param {number[]} vector - Input vector
   * @returns {number} Entropy value
   */
  entropy(vector) {
    const sum = vector.reduce((acc, val) => acc + Math.abs(val), 0)
    if (sum === 0) return 0
    
    const probabilities = vector.map(val => Math.abs(val) / sum)
    return -probabilities.reduce((entropy, p) => {
      return p > 0 ? entropy + p * Math.log2(p) : entropy
    }, 0)
  }
}

// Vector Conversion Utilities
export const vectorConversion = {
  /**
   * Convert vector to string representation
   * @param {number[]} vector - Input vector
   * @param {number} precision - Decimal precision
   * @returns {string} String representation
   */
  toString(vector, precision = 3) {
    const formatted = vector.map(val => val.toFixed(precision))
    return `[${formatted.join(', ')}]`
  },

  /**
   * Parse vector from string
   * @param {string} str - String representation
   * @returns {number[]} Parsed vector
   */
  fromString(str) {
    try {
      // Remove brackets and split by comma
      const cleaned = str.replace(/[\[\]]/g, '').trim()
      if (!cleaned) return []
      
      return cleaned.split(',').map(val => {
        const num = parseFloat(val.trim())
        if (isNaN(num)) throw new Error(`Invalid number: ${val}`)
        return num
      })
    } catch (error) {
      throw new Error(`Failed to parse vector: ${error.message}`)
    }
  },

  /**
   * Convert vector to CSV row
   * @param {number[]} vector - Input vector
   * @param {string} separator - CSV separator
   * @returns {string} CSV row
   */
  toCSV(vector, separator = ',') {
    return vector.join(separator)
  },

  /**
   * Parse vector from CSV row
   * @param {string} csvRow - CSV row string
   * @param {string} separator - CSV separator
   * @returns {number[]} Parsed vector
   */
  fromCSV(csvRow, separator = ',') {
    return csvRow.split(separator).map(val => {
      const num = parseFloat(val.trim())
      if (isNaN(num)) throw new Error(`Invalid number: ${val}`)
      return num
    })
  }
} 