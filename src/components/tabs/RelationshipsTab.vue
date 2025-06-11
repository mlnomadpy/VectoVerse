<template>
  <div class="relationships-tab">
    <div v-if="selectedVector">
      <h3>Relationships for Vector: <strong>{{ selectedVector.id }}</strong></h3>
      <div v-if="relationships.length > 0">
        <table>
          <thead>
            <tr>
              <th>Target Vector</th>
              <th>Cosine Similarity</th>
              <th>Euclidean Distance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rel in relationships" :key="rel.id">
              <td>{{ rel.id }}</td>
              <td>{{ rel.cosineSimilarity.toFixed(4) }}</td>
              <td>{{ rel.euclideanDistance.toFixed(4) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else>
        <p>Calculating relationships...</p>
      </div>
    </div>
    <div v-else>
      <p>Select a vector to see its relationships.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useVectorStore } from '../../stores/vectorStore'
import { useVectorOperations } from '../../composables/useVectorOperations'

const vectorStore = useVectorStore()
const vectorOps = useVectorOperations()

const selectedVector = computed(() => vectorStore.selectedVector)
const relationships = ref([])

const calculateRelationships = async () => {
  if (selectedVector.value) {
    relationships.value = []
    const otherVectors = vectorStore.vectors.filter(v => v.id !== selectedVector.value.id)
    const rels = await Promise.all(otherVectors.map(async (otherVector) => {
      const cosineSimilarity = await vectorOps.calculateCosineSimilarity(selectedVector.value, otherVector)
      const euclideanDistance = await vectorOps.calculateDistance(selectedVector.value, otherVector)
      return {
        id: otherVector.id,
        cosineSimilarity,
        euclideanDistance
      }
    }))
    relationships.value = rels
  } else {
    relationships.value = []
  }
}

watch(selectedVector, calculateRelationships)
onMounted(calculateRelationships)
</script>

<style scoped>
.relationships-tab {
  padding: 1rem;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
th {
  background-color: #f2f2f2;
  text-align: left;
}
</style> 