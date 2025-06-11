<template>
  <ModalBase title="Settings" v-if="show" @close="closeModal">
    <p>Settings will be available here soon.</p>
    <template #footer>
      <button @click="closeModal" class="btn btn-secondary">Close</button>
    </template>
  </ModalBase>
</template>

<script setup>
import { computed } from 'vue';
import { useUIStore } from '../../stores/uiStore';
import ModalBase from './ModalBase.vue';

const uiStore = useUIStore();

const show = computed(() => uiStore.isModalOpen && uiStore.modalName === 'settings');

const closeModal = () => {
  uiStore.closeModal();
};
</script>

<style scoped>
.btn-secondary {
  background-color: #555;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-secondary:hover {
  background-color: #777;
}
</style> 