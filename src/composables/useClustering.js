import { ref } from 'vue'
import { useVectorStore } from '../stores/vectorStore'
import { vectorStatistics } from '../utils/vectorUtils'

export function useClustering() {
  const vectorStore = useVectorStore()
  const clusters = ref(null)
  const isClustering = ref(false)

  const runKMeans = async (k) => {
    isClustering.value = true
    clusters.value = null
    try {
      const vectors = vectorStore.vectors.map(v => v.components)
      const result = await new Promise((resolve) => {
          setTimeout(() => {
            const res = vectorStatistics.kmeans(vectors, k)
            resolve(res)
          }, 0)
      })
      
      // Map original vector objects to clusters
      const vectorMap = new Map(vectorStore.vectors.map(v => [JSON.stringify(v.components), v]));
      const clusteredVectors = result.clusters.map(cluster => 
        cluster.map(vectorComponents => vectorMap.get(JSON.stringify(vectorComponents)))
      );

      clusters.value = {
        centroids: result.centroids,
        clusters: clusteredVectors,
      };

    } catch (error) {
      console.error('Clustering failed:', error)
      clusters.value = null
    } finally {
      isClustering.value = false
    }
  }

  return {
    clusters,
    isClustering,
    runKMeans
  }
} 