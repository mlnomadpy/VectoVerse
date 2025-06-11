/**
 * Validation Utilities
 * Comprehensive validation functions for forms, vectors, and user inputs
 */

// Vector Validation Rules
export const vectorValidation = {
  /**
   * Validate vector input string
   * @param {string} input - Vector input string
   * @returns {Object} Validation result
   */
  validateVectorInput(input) {
    const result = {
      isValid: false,
      errors: [],
      parsed: null
    }

    if (!input || typeof input !== 'string') {
      result.errors.push('Vector input is required')
      return result
    }

    const cleaned = input.trim()
    if (!cleaned) {
      result.errors.push('Vector input cannot be empty')
      return result
    }

    try {
      // Try to parse as JSON array
      if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
        const parsed = JSON.parse(cleaned)
        if (!Array.isArray(parsed)) {
          result.errors.push('Input must be an array of numbers')
          return result
        }
        
        const numbers = this.validateNumberArray(parsed)
        if (numbers.isValid) {
          result.isValid = true
          result.parsed = numbers.values
        } else {
          result.errors = numbers.errors
        }
        return result
      }

      // Try to parse as comma-separated values
      const values = cleaned.split(',').map(val => val.trim())
      const numbers = this.validateNumberArray(values.map(v => parseFloat(v)))
      
      if (numbers.isValid) {
        result.isValid = true
        result.parsed = numbers.values
      } else {
        result.errors = numbers.errors
      }

    } catch (error) {
      result.errors.push('Invalid vector format. Use [1,2,3] or 1,2,3')
    }

    return result
  },

  /**
   * Validate array of numbers
   * @param {any[]} arr - Array to validate
   * @returns {Object} Validation result
   */
  validateNumberArray(arr) {
    const result = {
      isValid: false,
      errors: [],
      values: []
    }

    if (!Array.isArray(arr)) {
      result.errors.push('Input must be an array')
      return result
    }

    if (arr.length === 0) {
      result.errors.push('Vector must have at least one component')
      return result
    }

    if (arr.length > 50) {
      result.errors.push('Vector cannot have more than 50 dimensions')
      return result
    }

    const invalidIndices = []
    const values = arr.map((val, index) => {
      const num = typeof val === 'number' ? val : parseFloat(val)
      if (isNaN(num) || !isFinite(num)) {
        invalidIndices.push(index + 1)
        return 0
      }
      return num
    })

    if (invalidIndices.length > 0) {
      result.errors.push(`Invalid numbers at positions: ${invalidIndices.join(', ')}`)
      return result
    }

    result.isValid = true
    result.values = values
    return result
  },

  /**
   * Validate vector dimensions
   * @param {number[]} vector - Vector to validate
   * @param {number} expectedDims - Expected dimensions
   * @returns {Object} Validation result
   */
  validateDimensions(vector, expectedDims) {
    const result = {
      isValid: false,
      errors: []
    }

    if (!Array.isArray(vector)) {
      result.errors.push('Input must be a vector array')
      return result
    }

    if (vector.length !== expectedDims) {
      result.errors.push(`Vector must have exactly ${expectedDims} dimensions, got ${vector.length}`)
      return result
    }

    result.isValid = true
    return result
  }
}

// Form Validation Rules
export const formValidation = {
  /**
   * Validate required field
   * @param {any} value - Value to validate
   * @param {string} fieldName - Field name for error message
   * @returns {Object} Validation result
   */
  required(value, fieldName = 'Field') {
    const result = {
      isValid: false,
      error: null
    }

    if (value === null || value === undefined || value === '') {
      result.error = `${fieldName} is required`
      return result
    }

    if (typeof value === 'string' && value.trim() === '') {
      result.error = `${fieldName} cannot be empty`
      return result
    }

    result.isValid = true
    return result
  },

  /**
   * Validate number input
   * @param {any} value - Value to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  number(value, options = {}) {
    const {
      min = null,
      max = null,
      integer = false,
      fieldName = 'Number'
    } = options

    const result = {
      isValid: false,
      error: null,
      value: null
    }

    const num = typeof value === 'number' ? value : parseFloat(value)
    
    if (isNaN(num) || !isFinite(num)) {
      result.error = `${fieldName} must be a valid number`
      return result
    }

    if (integer && !Number.isInteger(num)) {
      result.error = `${fieldName} must be an integer`
      return result
    }

    if (min !== null && num < min) {
      result.error = `${fieldName} must be at least ${min}`
      return result
    }

    if (max !== null && num > max) {
      result.error = `${fieldName} must be at most ${max}`
      return result
    }

    result.isValid = true
    result.value = num
    return result
  },

  /**
   * Validate string input
   * @param {any} value - Value to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  string(value, options = {}) {
    const {
      minLength = 0,
      maxLength = null,
      pattern = null,
      fieldName = 'Text'
    } = options

    const result = {
      isValid: false,
      error: null,
      value: null
    }

    if (typeof value !== 'string') {
      result.error = `${fieldName} must be a string`
      return result
    }

    if (value.length < minLength) {
      result.error = `${fieldName} must be at least ${minLength} characters`
      return result
    }

    if (maxLength !== null && value.length > maxLength) {
      result.error = `${fieldName} must be at most ${maxLength} characters`
      return result
    }

    if (pattern && !pattern.test(value)) {
      result.error = `${fieldName} format is invalid`
      return result
    }

    result.isValid = true
    result.value = value
    return result
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {Object} Validation result
   */
  email(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return this.string(email, {
      pattern: emailRegex,
      fieldName: 'Email'
    })
  },

  /**
   * Validate file input
   * @param {File} file - File to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  file(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = [],
      fieldName = 'File'
    } = options

    const result = {
      isValid: false,
      error: null
    }

    if (!file || !(file instanceof File)) {
      result.error = `${fieldName} is required`
      return result
    }

    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      result.error = `${fieldName} size must be less than ${maxSizeMB}MB`
      return result
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      result.error = `${fieldName} type must be one of: ${allowedTypes.join(', ')}`
      return result
    }

    result.isValid = true
    return result
  }
}

// Configuration Validation
export const configValidation = {
  /**
   * Validate vector space configuration
   * @param {Object} config - Configuration object
   * @returns {Object} Validation result
   */
  vectorSpaceConfig(config) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    }

    // Validate dimensions
    const dims = formValidation.number(config.dimensions, {
      min: 2,
      max: 50,
      integer: true,
      fieldName: 'Dimensions'
    })
    if (!dims.isValid) {
      result.errors.push(dims.error)
      result.isValid = false
    }

    // Validate number of vectors
    const numVectors = formValidation.number(config.numVectors, {
      min: 2,
      max: 100,
      integer: true,
      fieldName: 'Number of vectors'
    })
    if (!numVectors.isValid) {
      result.errors.push(numVectors.error)
      result.isValid = false
    }

    // Performance warnings
    if (dims.isValid && numVectors.isValid) {
      const complexity = dims.value * numVectors.value
      if (complexity > 1000) {
        result.warnings.push('High complexity may cause performance issues')
      }
    }

    return result
  },

  /**
   * Validate neural network configuration
   * @param {Object} config - Neural network config
   * @returns {Object} Validation result
   */
  neuralConfig(config) {
    const result = {
      isValid: true,
      errors: []
    }

    // Validate learning rate
    const learningRate = formValidation.number(config.learningRate, {
      min: 0.0001,
      max: 1.0,
      fieldName: 'Learning rate'
    })
    if (!learningRate.isValid) {
      result.errors.push(learningRate.error)
      result.isValid = false
    }

    // Validate activation function
    const validActivations = [
      'sigmoid', 'tanh', 'relu', 'leaky_relu', 
      'softplus', 'swish', 'softmax', 'softermax', 'soft_sigmoid'
    ]
    if (!validActivations.includes(config.activationFunction)) {
      result.errors.push('Invalid activation function')
      result.isValid = false
    }

    return result
  }
}

// Data Validation
export const dataValidation = {
  /**
   * Validate CSV data format
   * @param {string} csvData - CSV data string
   * @returns {Object} Validation result
   */
  csvFormat(csvData) {
    const result = {
      isValid: false,
      errors: [],
      rows: 0,
      columns: 0
    }

    if (!csvData || typeof csvData !== 'string') {
      result.errors.push('CSV data is required')
      return result
    }

    const lines = csvData.trim().split('\n')
    if (lines.length === 0) {
      result.errors.push('CSV data cannot be empty')
      return result
    }

    const rows = lines.map(line => line.split(',').map(val => val.trim()))
    
    // Check consistent column count
    const columnCounts = rows.map(row => row.length)
    const uniqueCounts = [...new Set(columnCounts)]
    
    if (uniqueCounts.length > 1) {
      result.errors.push('All rows must have the same number of columns')
      return result
    }

    // Validate numeric data
    const numericErrors = []
    rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== '' && isNaN(parseFloat(cell))) {
          numericErrors.push(`Non-numeric value at row ${rowIndex + 1}, column ${colIndex + 1}`)
        }
      })
    })

    if (numericErrors.length > 10) {
      result.errors.push(`Too many non-numeric values (${numericErrors.length} found)`)
    } else if (numericErrors.length > 0) {
      result.errors.push(...numericErrors)
    }

    if (result.errors.length === 0) {
      result.isValid = true
      result.rows = rows.length
      result.columns = rows[0].length
    }

    return result
  },

  /**
   * Validate JSON vector data
   * @param {string} jsonData - JSON data string
   * @returns {Object} Validation result
   */
  jsonVectorFormat(jsonData) {
    const result = {
      isValid: false,
      errors: [],
      vectors: []
    }

    try {
      const data = JSON.parse(jsonData)
      
      if (!Array.isArray(data)) {
        result.errors.push('JSON must be an array of vectors')
        return result
      }

      const vectorValidations = data.map((vector, index) => {
        const validation = vectorValidation.validateNumberArray(vector)
        if (!validation.isValid) {
          return { index, errors: validation.errors }
        }
        return { index, vector: validation.values }
      })

      const invalidVectors = vectorValidations.filter(v => v.errors)
      if (invalidVectors.length > 0) {
        invalidVectors.forEach(invalid => {
          result.errors.push(`Vector ${invalid.index + 1}: ${invalid.errors.join(', ')}`)
        })
        return result
      }

      // Check dimension consistency
      const dimensions = vectorValidations.map(v => v.vector.length)
      const uniqueDims = [...new Set(dimensions)]
      
      if (uniqueDims.length > 1) {
        result.errors.push('All vectors must have the same number of dimensions')
        return result
      }

      result.isValid = true
      result.vectors = vectorValidations.map(v => v.vector)

    } catch (error) {
      result.errors.push('Invalid JSON format')
    }

    return result
  }
}

// Form Field Validators Factory
export const createValidator = (rules) => {
  return (value) => {
    const errors = []
    
    for (const rule of rules) {
      const result = rule(value)
      if (!result.isValid) {
        errors.push(result.error)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Common validation rule builders
export const rules = {
  required: (fieldName) => (value) => formValidation.required(value, fieldName),
  number: (options) => (value) => formValidation.number(value, options),
  string: (options) => (value) => formValidation.string(value, options),
  vector: () => (value) => vectorValidation.validateVectorInput(value)
}

export default {
  vector: vectorValidation,
  form: formValidation,
  config: configValidation,
  data: dataValidation,
  createValidator,
  rules
} 