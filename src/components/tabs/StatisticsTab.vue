<template>
  <div class="statistics-tab">
    <h4>Global Vector Statistics</h4>
    <div v-if="stats">
      <p><strong>Total Vectors:</strong> {{ stats.count }}</p>
      <p><strong>Dimensions:</strong> {{ stats.dimensions }}</p>
      
      <h5>Mean Vector</h5>
      <p class="vector-display">{{ formatVector(stats.meanVector) }}</p>

      <h5>Magnitude Distribution</h5>
      <p>Mean: {{ stats.magnitude.mean.toFixed(4) }}, StdDev: {{ stats.magnitude.stdDev.toFixed(4) }}</p>

    </div>
    <div v-else>
      <p>Calculating statistics...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useVectorStore } from '../../stores/vectorStore'
import { vectorStatistics } from '../../utils/vectorUtils'

const vectorStore = useVectorStore()
const stats = ref(null)

const calculateGlobalStats = () => {
  const vectors = vectorStore.vectors.map(v => v.components)
  if (vectors.length === 0) return

  const count = vectors.length
  const dimensions = vectors[0].length
  
  // Mean vector
  const meanVector = Array(dimensions).fill(0)
  vectors.forEach(vector => {
    for (let i = 0; i < dimensions; i++) {
      meanVector[i] += vector[i]
    }
  })
  for (let i = 0; i < dimensions; i++) {
    meanVector[i] /= count
  }

  // Magnitude distribution
  const magnitudes = vectors.map(v => vectorStatistics.calculate(v).magnitude)
  const magMean = vectorStatistics.mean(magnitudes)
  const magVariance = vectorStatistics.variance(magnitudes, magMean)
  const magStdDev = Math.sqrt(magVariance)

  stats.value = {
    count,
    dimensions,
    meanVector,
    magnitude: {
      mean: magMean,
      stdDev: magStdDev
    }
  }
}

const formatVector = (vector) => {
  return '[' + vector.map(c => c.toFixed(2)).join(', ') + ']'
}

onMounted(calculateGlobalStats)
</script>

<style scoped>
.statistics-tab {
  padding: 1rem;
}
.vector-display {
  word-break: break-all;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  padding: 1rem;
  border-radius: 6px;
}
</style> 