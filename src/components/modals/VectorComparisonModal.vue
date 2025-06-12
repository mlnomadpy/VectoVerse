<template>
  <ModalBase v-if="show" title="Vector Comparison" @close="closeModal">
    <div v-if="comparisonResults" class="results-container">
      <p>Comparison between <strong>{{ comparisonResults.vectorA.id }}</strong> and <strong>{{ comparisonResults.vectorB.id }}</strong></p>
      <ul class="results-list">
        <li><strong>Cosine Similarity:</strong> <span>{{ comparisonResults.cosineSimilarity.toFixed(4) }}</span></li>
        <li><strong>Euclidean Distance:</strong> <span>{{ comparisonResults.euclideanDistance.toFixed(4) }}</span></li>
        <li><strong>Dot Product:</strong> <span>{{ comparisonResults.dotProduct.toFixed(4) }}</span></li>
      </ul>
    </div>
    <div v-else>
      <p>Select two vectors to compare.</p>
    </div>
    <template #footer>
      <button @click="closeModal" class="btn-primary">Close</button>
    </template>
  </ModalBase>
</template>

<script setup>
import { computed } from 'vue';
import { useUIStore } from '../../stores/uiStore';
import ModalBase from './ModalBase.vue';

const uiStore = useUIStore();

const show = computed(() => uiStore.isModalOpen && uiStore.modalName === 'vectorComparison');
const comparisonResults = computed(() => uiStore.modalData);

const closeModal = () => {
  uiStore.hideModal();
};
</script>

<style scoped>
p {
  color: var(--text-secondary);
}

.results-container {
  margin-bottom: 1.5rem;
}

.results-list {
  list-style: none;
  padding: 0;
}

.results-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.results-list li:last-child {
  border-bottom: none;
}

.results-list strong {
  color: var(--text-secondary);
}

.results-list span {
  font-weight: bold;
  color: var(--text-primary);
}

.btn-primary {
  background-color: var(--accent-primary);
  color: var(--text-primary-inverse);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--accent-secondary);
}
</style> 