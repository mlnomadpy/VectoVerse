<template>
  <div class="error-notification" :class="`error-${notification.severity || 'application'}`">
    <div class="error-content">
      <div class="error-icon">{{ getErrorIcon(notification.severity) }}</div>
      <div class="error-text">
        <strong>Oops! Something went wrong.</strong>
        <p>{{ notification.message }}</p>
      </div>
      <button class="error-close" aria-label="Close" @click="close">&times;</button>
    </div>
    <div v-if="notification.actions && notification.actions.length > 0" class="error-actions">
      <button
        v-for="(action, index) in notification.actions"
        :key="index"
        class="btn-compact error-action"
        @click="() => executeAction(action.action)"
      >
        {{ action.text }}
      </button>
    </div>
     <div class="error-progress" :style="{ width: `${progress}%` }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '../stores/uiStore'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

const uiStore = useUIStore()
const progress = ref(100)
let timer = null;

const close = () => {
  uiStore.hideError()
}

const executeAction = (action) => {
  if (typeof action === 'function') {
    action();
  }
  close();
}

const getErrorIcon = (severity) => {
  switch (severity) {
    case 'network': return '🌐';
    case 'permission': return '🔒';
    case 'memory': return '💾';
    case 'validation': return '⚠️';
    case 'timeout': return '⏱️';
    default: return '🔥';
  }
}

onMounted(() => {
  const duration = 10000; // 10 seconds
  const interval = 100; // update every 100ms
  const steps = duration / interval;
  const decrement = 100 / steps;

  timer = setInterval(() => {
    progress.value -= decrement;
    if (progress.value <= 0) {
      close();
    }
  }, interval);
})

onUnmounted(() => {
  clearInterval(timer)
})

</script>

<style scoped>
.error-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  background: #333;
  color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  overflow: hidden;
  z-index: 2000;
  border-left: 4px solid #f44336;
  animation: slideInUp 0.5s ease-out;
}

.error-notification.error-network { border-left-color: #2196F3; }
.error-notification.error-permission { border-left-color: #FFC107; }
.error-notification.error-memory { border-left-color: #9C27B0; }
.error-notification.error-validation { border-left-color: #FF9800; }
.error-notification.error-timeout { border-left-color: #607D8B; }

.error-content {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
}

.error-icon {
  font-size: 1.5rem;
  margin-right: 1rem;
}

.error-text {
  flex-grow: 1;
}

.error-text strong {
  display: block;
  margin-bottom: 0.25rem;
}

.error-text p {
  margin: 0;
  font-size: 0.9em;
  opacity: 0.9;
  line-height: 1.4;
}

.error-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.error-close:hover {
  opacity: 1;
}

.error-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0 1rem 0.75rem;
}

.error-action {
  background-color: rgba(255,255,255,0.1);
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
}
.error-action:hover {
  background-color: rgba(255,255,255,0.2);
}

.error-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background-color: rgba(255,255,255,0.5);
  transition: width 0.1s linear;
}

@keyframes slideInUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style> 