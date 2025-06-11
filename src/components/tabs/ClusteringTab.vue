<template>
  <div class="clustering-tab">
    <div class="controls">
      <label for="k-value">Number of Clusters (k):</label>
      <input type="number" id="k-value" v-model.number="k" min="1" :max="maxK">
      <button @click="runClustering" :disabled="isClustering || k < 1">
        {{ isClustering ? 'Clustering...' : 'Run K-Means' }}
      </button>
    </div>
    <div v-if="clusters" class="results">
      <h4>Clustering Results</h4>
      <div v-for="(cluster, index) in clusters.clusters" :key="index" class="cluster">
        <h5>Cluster {{ index + 1 }}</h5>
        <ul>
          <li v-for="vector in cluster" :key="vector.id">
            {{ vector.id }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useClustering } from '../../composables/useClustering'
import { useVectorStore } from '../../stores/vectorStore'

const { clusters, isClustering, runKMeans } = useClustering()
const vectorStore = useVectorStore()

const k = ref(3)
const maxK = computed(() => vectorStore.vectors.length)

const runClustering = () => {
  if (k.value > 0) {
    runKMeans(k.value)
  }
}
</script>

<style scoped>
.clustering-tab {
  padding: 1rem;
}
.controls {
  margin-bottom: 1rem;
}
.cluster {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #eee;
  border-radius: 4px;
}
ul {
  padding-left: 20px;
}
</style> 