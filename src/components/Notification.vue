<template>
  <Teleport to="body">
    <div class="notification" :class="type" @click="$emit('close')">
      <div class="notification-icon">
        {{ type === 'error' ? '❌' : '✅' }}
      </div>
      <div class="notification-message">
        {{ message }}
      </div>
      <button class="notification-close" @click.stop="$emit('close')">×</button>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['success', 'error'].includes(value)
  },
  message: {
    type: String,
    required: true
  }
})

defineEmits(['close'])
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 8px 32px var(--shadow-color);
  backdrop-filter: blur(10px);
  z-index: 1100;
  cursor: pointer;
  max-width: 400px;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: var(--status-success);
  color: var(--text-primary-inverse, #fff);
  border: 1px solid var(--status-success);
}

.notification.error {
  background: var(--status-danger);
  color: var(--text-primary-inverse, #fff);
  border: 1px solid var(--status-danger);
}

.notification-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.notification-message {
  flex: 1;
  font-weight: 500;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.notification-close:hover {
  opacity: 1;
  background: var(--bg-tertiary);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style> 