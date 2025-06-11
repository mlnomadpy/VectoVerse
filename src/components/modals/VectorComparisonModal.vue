<template>
  <transition name="fade">
    <div class="modal-overlay" v-if="show" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-button" @click="closeModal">&times;</button>
        <h2 class="modal-title">Vector Comparison</h2>
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
        <div class="modal-actions">
          <button @click="closeModal" class="btn btn-primary">Close</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { useUIStore } from '../../stores/uiStore';

const uiStore = useUIStore();

const show = computed(() => uiStore.isModalOpen && uiStore.modalName === 'vectorComparison');
const comparisonResults = computed(() => uiStore.modalData);

const closeModal = () => {
  uiStore.closeModal();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: opacity 0.3s ease;
}

.modal-content {
  background: #2c2c2e;
  color: #f5f5f7;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  transition: transform 0.3s ease;
}

.modal-title {
  margin-top: 0;
  color: #fff;
  font-size: 1.5rem;
  border-bottom: 1px solid #444;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #aaa;
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #fff;
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
  border-bottom: 1px solid #444;
}

.results-list li:last-child {
  border-bottom: none;
}

.results-list strong {
  color: #a0a0a5;
}

.results-list span {
  font-weight: bold;
  color: #f5f5f7;
}

.modal-actions {
  text-align: right;
  margin-top: 1.5rem;
}

.btn-primary {
  background-color: #007aff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-enter-active .modal-content,
.fade-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.fade-enter-from .modal-content,
.fade-leave-to .modal-content {
  transform: scale(0.95);
}
</style> 