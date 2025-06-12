<template>
  <ModalBase v-if="show" title="Settings" @close="closeModal">
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
  uiStore.hideModal();
};
</script>

<style scoped>
p {
  color: var(--text-secondary);
}
.btn-secondary {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--bg-tertiary);
}
</style> 