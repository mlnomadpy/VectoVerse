<template>
  <div class="contextual-analysis">
    <div v-if="inputVector" class="input-vector-comparison analysis-card">
      <h4>Comparison with Input Vector</h4>
      <div class="similarity-score">
        <span>Cosine Similarity:</span>
        <span class="score">{{ inputVectorSimilarity.toFixed(4) }}</span>
      </div>
    </div>

    <div class="nearest-neighbors analysis-card">
      <div class="card-header">
        <h4>Nearest Neighbors</h4>
        <div class="neighbor-controls">
          <label for="neighbor-metric">Metric:</label>
          <select id="neighbor-metric" v-model="metric">
            <option value="cosine">Cosine Similarity</option>
            <option value="euclidean">Euclidean Distance</option>
          </select>
          <label for="neighbor-count">Top:</label>
          <select id="neighbor-count" v-model.number="k">
            <option>3</option>
            <option>5</option>
            <option>10</option>
          </select>
        </div>
      </div>
      
      <ul class="neighbor-list">
        <li v-for="neighbor in nearestNeighbors" :key="neighbor.id">
          <span class="neighbor-id">Vector {{ neighbor.id }}</span>
          <span class="neighbor-score">
            <span class="metric-label">{{ metric === 'cosine' ? 'Sim:' : 'Dist:' }}</span>
            {{ neighbor.score.toFixed(4) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useVectorStore } from '../../../stores/vectorStore'
import { vectorOperations } from '../../../utils/vectorUtils'

const props = defineProps({
  vector: {
    type: Object,
    required: true
  }
})

const vectorStore = useVectorStore()

const k = ref(5) // Number of nearest neighbors to show
const metric = ref('cosine') // 'cosine' or 'euclidean'

const inputVector = computed(() => vectorStore.inputVector)

const inputVectorSimilarity = computed(() => {
  if (!props.vector || !inputVector.value) return 0
  return vectorOperations.cosineSimilarity(props.vector.components, inputVector.value.components)
})

const nearestNeighbors = computed(() => {
  if (!props.vector) return []
  
  const allOtherVectors = vectorStore.vectors.filter(v => v.id !== props.vector.id)

  const scores = allOtherVectors.map(other => {
    let score;
    if (metric.value === 'cosine') {
      score = vectorOperations.cosineSimilarity(props.vector.components, other.components)
    } else {
      score = vectorOperations.euclideanDistance(props.vector.components, other.components)
    }
    return { id: other.id, score };
  });

  // For cosine similarity, higher is better. For euclidean distance, lower is better.
  const sortedScores = scores.sort((a, b) => {
    return metric.value === 'cosine' ? b.score - a.score : a.score - b.score
  })

  return sortedScores.slice(0, k.value)
})
</script>

<style scoped>
.contextual-analysis {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.analysis-card {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

h4 {
  margin: 0;
}

.similarity-score {
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.score {
  font-weight: bold;
  font-family: 'Courier New', Courier, monospace;
}

.neighbor-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.neighbor-controls label {
  color: var(--text-secondary);
  font-size: 0.9em;
}

.neighbor-controls select {
  background: var(--bg-quaternary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
}

.neighbor-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.neighbor-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0.2rem;
  border-bottom: 1px solid var(--border-color);
}

.neighbor-list li:last-child {
  border-bottom: none;
}

.neighbor-id {
  color: var(--text-secondary);
}

.neighbor-score {
  font-weight: bold;
  font-family: 'Courier New', Courier, monospace;
}

.metric-label {
  color: var(--text-tertiary);
  font-weight: normal;
  margin-right: 0.5rem;
}
</style> 