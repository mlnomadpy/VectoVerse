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
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.vector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.vector-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #667eea;
  margin: 0;
}

.charge-indicator {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.charge-indicator.positive {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.charge-indicator.negative {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.charge-indicator.neutral {
  background: linear-gradient(135deg, #ffecd2, #fcb69f);
  color: #8b4513;
}

.vector-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-label {
  font-size: 0.8rem;
  color: #888;
  font-weight: 500;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #667eea;
}

.vector-components {
  margin-bottom: 1rem;
}

.vector-components h5 {
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
  color: #333;
  font-weight: 600;
}

.components-chart {
  display: flex;
  gap: 2px;
  height: 60px;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.02);
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.component-bar {
  flex: 1;
  min-height: 2px;
  border-radius: 1px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.component-bar:hover {
  filter: brightness(1.2);
  transform: scaleY(1.1);
}

.vector-stats-detailed {
  margin-bottom: 1rem;
}

.vector-stats-detailed h5 {
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
  color: #333;
  font-weight: 600;
}

.stats-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem;
}

.stat-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 3px;
  font-size: 0.8rem;
}

.stat-name {
  color: #888;
  font-weight: 500;
}

.stat-val {
  font-weight: 600;
  color: #667eea;
}

.vector-relationships h5 {
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
  color: #333;
  font-weight: 600;
}

.relationships-list {
  max-height: 120px;
  overflow-y: auto;
}

.relationship-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
  margin-bottom: 0.3rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.relationship-item:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateX(2px);
}

.rel-vector {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.rel-similarity {
  font-size: 0.8rem;
  font-weight: 600;
  color: #667eea;
}

/* Scrollbar for relationships */
.relationships-list::-webkit-scrollbar {
  width: 4px;
}

.relationships-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.relationships-list::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 2px;
}

@media (max-width: 768px) {
  .vector-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-list {
    grid-template-columns: 1fr;
  }
}
</style> 