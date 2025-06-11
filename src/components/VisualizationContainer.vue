<template>
  <div class="visualization-container" ref="container">
    <D3Visualization :analysisResult="analysisResult" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import D3Visualization from './visualization/D3Visualization.vue';
import { useVectorStore } from '@/stores/vectorStore';
import { useEventBus } from '@/composables/useEventBus';

const vectorStore = useVectorStore();
const eventBus = useEventBus();

const analysisResult = ref(null);
const container = ref(null);

watch(() => vectorStore.analysisResults, (newResult) => {
  if (newResult) {
    analysisResult.value = newResult;
  }
}, { deep: true });

onMounted(() => {
  eventBus.on('analysisCompleted', (result) => {
    analysisResult.value = result;
  });
});

</script>

<style scoped>
.visualization-container {
  position: relative;
  width: 100%;
  height: 600px;
  background: radial-gradient(circle at center, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  overflow: hidden;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .visualization-container {
    height: 400px;
  }
}

@media (max-width: 480px) {
  .visualization-container {
    height: 300px;
  }
}
</style> 