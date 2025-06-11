import { reactive, computed } from 'vue';
import { useVectorStore } from '@/stores/vectorStore';
import { vectorOperations } from '@/utils/vectorUtils';

export function useForceCalculator() {
  const vectorStore = useVectorStore();

  const state = reactive({
    epsilon: 0.01,
    temperature: 1.0,
  });

  // --- Core Physics & Math Functions ---
  const dotProduct = (v1, v2) => vectorOperations.dotProduct(v1.components, v2.components);
  const magnitude = (v) => vectorOperations.magnitude(v.components);
  const distanceSquared = (v1, v2) => {
      let sum = 0;
      for (let i = 0; i < v1.components.length; i++) {
          const diff = v1.components[i] - v2.components[i];
          sum += diff * diff;
      }
      return sum;
  };
  const euclideanDistance = (v1, v2) => Math.sqrt(distanceSquared(v1, v2));
  const manhattanDistance = (v1, v2) => v1.components.reduce((sum, c, i) => sum + Math.abs(c - v2.components[i]), 0);
  const cosineSimilarity = (v1, v2) => {
      const mag1 = magnitude(v1);
      const mag2 = magnitude(v2);
      if (mag1 === 0 || mag2 === 0) return 0;
      return dotProduct(v1, v2) / (mag1 * mag2);
  };

  // --- Force Calculation ---
  function calculateForces(vectors, forceType) {
    const forces = [];
    if (vectors.length < 2) return forces;

    for (let i = 0; i < vectors.length; i++) {
        for (let j = i + 1; j < vectors.length; j++) {
            const v1 = vectors[i];
            const v2 = vectors[j];
            const force = calculateSelectedMetric(v1, v2, forceType);
            forces.push({
                x1: v1.x, y1: v1.y,
                x2: v2.x, y2: v2.y,
                force: force,
                type: 'normal',
                forceType: forceType
            });
        }
    }
    return forces;
  }

  function calculateSelectedMetric(v1, v2, metricType) {
    switch (metricType) {
        case 'gravity':
            return (magnitude(v1) * magnitude(v2)) / (distanceSquared(v1, v2) + state.epsilon);
        case 'repulsion':
             return 1 / (distanceSquared(v1, v2) + state.epsilon);
        case 'cosine':
            return Math.abs(cosineSimilarity(v1, v2));
        case 'correlation':
            return Math.abs(vectorOperations.correlation(v1.components, v2.components));
        case 'euclidean':
            return 1 / (1 + euclideanDistance(v1, v2));
        case 'manhattan':
            return 1 / (1 + manhattanDistance(v1, v2));
        case 'resonance':
        default:
            const alignment = Math.pow(dotProduct(v1, v2), 2);
            const proximity = distanceSquared(v1, v2) + state.epsilon;
            return alignment / proximity;
    }
  }

  // --- Neural & Activation ---
  function applyActivation(value, type = vectorStore.activationFunction) {
      // Logic from EnhancedForceCalculator
  }

  // --- Comprehensive Analysis ---
  function getEnhancedVectorAnalysis(vectorId) {
      const vector = vectorStore.vectors.find(v => v.id === vectorId);
      if (!vector) return null;
      // Combine stats from both old calculators
  }

  return {
    state,
    calculateForces,
    getEnhancedVectorAnalysis,
    applyActivation,
    // Expose other specific metrics if needed by components
    cosineSimilarity,
    euclideanDistance,
    manhattanDistance
  };
} 