<template>
  <div class="vector-info" v-if="vector">
    <div class="vector-header">
      <h4 class="vector-name">{{ vector.id || `Vector ${vector.index || ''}` }}</h4>
      <div class="charge-indicator" :class="chargeType">
        {{ chargeType.charAt(0).toUpperCase() + chargeType.slice(1) }}
      </div>
    </div>
    
    <div class="vector-stats-grid">
      <div class="stat-item">
        <span class="stat-label">Magnitude</span>
        <span class="stat-value">{{ formatNumber(vector.magnitude || 0) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Entropy</span>
        <span class="stat-value">{{ formatNumber(entropy) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Max Component</span>
        <span class="stat-value">{{ formatNumber(maxComponent) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Min Component</span>
        <span class="stat-value">{{ formatNumber(minComponent) }}</span>
      </div>
    </div>

    <div class="vector-components">
      <h5>Components Visualization ({{ dimensions }}D):</h5>
      <div class="components-chart">
        <div 
          v-for="(value, index) in displayComponents" 
          :key="index"
          class="component-bar"
          :style="{ 
            height: `${Math.abs(value) * 100}%`,
            backgroundColor: value >= 0 ? '#4facfe' : '#f5576c'
          }"
          :title="`Component ${index + 1}: ${formatNumber(value)}`"
        ></div>
      </div>
    </div>

    <div class="vector-stats-detailed">
      <h5>Statistical Properties:</h5>
      <div class="stats-list">
        <div class="stat-detail">
          <span class="stat-name">Mean:</span>
          <span class="stat-val">{{ formatNumber(mean) }}</span>
        </div>
        <div class="stat-detail">
          <span class="stat-name">Std Dev:</span>
          <span class="stat-val">{{ formatNumber(standardDeviation) }}</span>
        </div>
        <div class="stat-detail">
          <span class="stat-name">Skewness:</span>
          <span class="stat-val">{{ formatNumber(skewness) }}</span>
        </div>
        <div class="stat-detail">
          <span class="stat-name">Kurtosis:</span>
          <span class="stat-val">{{ formatNumber(kurtosis) }}</span>
        </div>
      </div>
    </div>

    <div class="vector-relationships" v-if="topRelationships.length > 0">
      <h5>Top Relationships:</h5>
      <div class="relationships-list">
        <div 
          v-for="rel in topRelationships" 
          :key="rel.id"
          class="relationship-item"
          @click="selectRelatedVector(rel.id)"
        >
          <span class="rel-vector">{{ rel.name }}</span>
          <span class="rel-similarity">{{ formatNumber(rel.similarity) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useVectorStore } from '../stores/vectorStore'

const props = defineProps({
  vector: {
    type: Object,
    required: true
  },
  framework: {
    type: Object,
    default: null
  }
})

const vectorStore = useVectorStore()

// Computed properties for vector analysis
const dimensions = computed(() => {
  return props.vector.values ? props.vector.values.length : 0
})

const displayComponents = computed(() => {
  if (!props.vector.values) return []
  
  // Normalize values for display (0-1 range)
  const values = props.vector.values
  const maxAbs = Math.max(...values.map(Math.abs))
  if (maxAbs === 0) return values
  
  return values.map(v => v / maxAbs)
})

const chargeType = computed(() => {
  if (!props.vector.values) return 'neutral'
  
  const positiveCount = props.vector.values.filter(v => v > 0.1).length
  const negativeCount = props.vector.values.filter(v => v < -0.1).length
  
  if (positiveCount > negativeCount * 1.5) return 'positive'
  if (negativeCount > positiveCount * 1.5) return 'negative'
  return 'neutral'
})

const maxComponent = computed(() => {
  return props.vector.values ? Math.max(...props.vector.values) : 0
})

const minComponent = computed(() => {
  return props.vector.values ? Math.min(...props.vector.values) : 0
})

const mean = computed(() => {
  if (!props.vector.values) return 0
  const sum = props.vector.values.reduce((a, b) => a + b, 0)
  return sum / props.vector.values.length
})

const standardDeviation = computed(() => {
  if (!props.vector.values) return 0
  const avg = mean.value
  const squareDiffs = props.vector.values.map(value => Math.pow(value - avg, 2))
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length
  return Math.sqrt(avgSquareDiff)
})

const skewness = computed(() => {
  if (!props.vector.values || standardDeviation.value === 0) return 0
  const avg = mean.value
  const std = standardDeviation.value
  const n = props.vector.values.length
  
  const cubedDiffs = props.vector.values.map(value => Math.pow((value - avg) / std, 3))
  return cubedDiffs.reduce((a, b) => a + b, 0) / n
})

const kurtosis = computed(() => {
  if (!props.vector.values || standardDeviation.value === 0) return 0
  const avg = mean.value
  const std = standardDeviation.value
  const n = props.vector.values.length
  
  const fourthPowers = props.vector.values.map(value => Math.pow((value - avg) / std, 4))
  return (fourthPowers.reduce((a, b) => a + b, 0) / n) - 3
})

const entropy = computed(() => {
  if (!props.vector.values) return 0
  
  // Calculate entropy based on the distribution of component values
  const values = props.vector.values
  const absValues = values.map(Math.abs)
  const sum = absValues.reduce((a, b) => a + b, 0)
  
  if (sum === 0) return 0
  
  const probabilities = absValues.map(v => v / sum)
  return -probabilities.reduce((entropy, p) => {
    return entropy + (p > 0 ? p * Math.log2(p) : 0)
  }, 0)
})

const topRelationships = computed(() => {
  // This would be calculated by the framework
  // For now, return empty array - the framework will populate this
  return []
})

// Methods
const formatNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '0.00'
  return num.toFixed(3)
}

const selectRelatedVector = (vectorId) => {
  vectorStore.selectVector(vectorId)
}
</script>

<style scoped>
.vector-info {
  background-color: var(--sidebar-bg);
  padding: 1rem;
  color: var(--text-primary);
  height: 100%;
  overflow-y: auto;
}

.vector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.vector-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--accent-primary);
}

.charge-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}
.charge-indicator.positive {
  background-color: var(--status-success-bg);
  color: var(--status-success);
}
.charge-indicator.negative {
  background-color: var(--status-danger-bg);
  color: var(--status-danger);
}
.charge-indicator.neutral {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.vector-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  background-color: var(--bg-secondary);
  padding: 0.75rem;
  border-radius: 6px;
}
.stat-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}
.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
}

.vector-components {
  margin-bottom: 1.5rem;
}
.vector-components h5 {
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}
.components-chart {
  display: flex;
  gap: 2px;
  height: 80px;
  background-color: var(--bg-secondary);
  border-radius: 4px;
  padding: 5px;
  align-items: flex-end;
}
.component-bar {
  flex-grow: 1;
  background-color: var(--accent-primary);
  border-radius: 1px;
  transition: all 0.2s;
}
.component-bar:hover {
  opacity: 0.8;
}

.vector-stats-detailed h5 {
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}
.stats-list {
  background-color: var(--bg-secondary);
  padding: 0.75rem;
  border-radius: 6px;
}
.stat-detail {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}
.stat-name {
  color: var(--text-secondary);
}

.vector-relationships {
  margin-top: 1.5rem;
}
.vector-relationships h5 {
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}
.relationships-list {
  background-color: var(--bg-secondary);
  border-radius: 6px;
}
.relationship-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s;
}
.relationship-item:last-child {
  border: none;
}
.relationship-item:hover {
  background-color: var(--bg-tertiary);
}
.rel-vector {
  color: var(--accent-secondary);
}
</style> 