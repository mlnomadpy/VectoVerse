/**
 * Calculations for the Vector Periodic Table.
 * These functions handle the transformation of raw vectors into "elemental" properties.
 */

// Calculate vector statistics
export const calculateVectorStatistics = (vector) => {
  const magnitude = calculateMagnitude(vector.components)
  const entropy = calculateEntropy(vector.components)
  const stability = calculateStability(vector.components)
  
  return { magnitude, entropy, stability }
}

// Calculate magnitude
export const calculateMagnitude = (components) => {
  return Math.sqrt(components.reduce((sum, c) => sum + c * c, 0))
}

// Calculate entropy
export const calculateEntropy = (components) => {
  const total = components.reduce((sum, c) => sum + Math.abs(c), 0)
  if (total === 0) return 0
  
  const probabilities = components.map(c => Math.abs(c) / total)
  return -probabilities.reduce((sum, p) => {
    return p > 0 ? sum + p * Math.log2(p) : sum
  }, 0)
}

// Calculate stability
export const calculateStability = (components) => {
  const mean = components.reduce((sum, c) => sum + c, 0) / components.length
  const variance = components.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / components.length
  return 1 / (1 + variance) // Higher stability for lower variance
}

const QUANTUM_THRESHOLD = 0.2;

// Get information quantums
export const getInformationQuantums = (vector) => {
  const components = vector.components
  const excitatory = components.filter(c => c > QUANTUM_THRESHOLD).length
  const inhibitory = components.filter(c => c < -QUANTUM_THRESHOLD).length
  const neutral = components.filter(c => c >= -QUANTUM_THRESHOLD && c <= QUANTUM_THRESHOLD).length
  
  return { excitatory, inhibitory, neutral }
} 