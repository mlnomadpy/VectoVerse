<template>
  <div class="fab-container" ref="fabContainer">
    <!-- Main FAB Button -->
    <button
      class="fab-main"
      :class="{ expanded: isMenuOpen }"
      @click="toggleMenu"
      @keydown="handleMainKeydown"
      :aria-label="isMenuOpen ? 'Close quick actions menu' : 'Open quick actions menu'"
      :aria-expanded="isMenuOpen"
    >
      <span class="fab-icon">{{ isMenuOpen ? '✕' : '⚡' }}</span>
    </button>

    <!-- FAB Menu -->
    <Transition name="fab-menu">
      <div v-if="isMenuOpen" class="fab-menu" role="menu">
        <button
          v-for="action in fabActions"
          :key="action.id"
          class="fab-menu-item"
          :class="action.class"
          @click="handleAction(action.id)"
          :aria-label="action.label"
          role="menuitem"
        >
          <span class="fab-item-icon">{{ action.icon }}</span>
          <span class="fab-item-label">{{ action.label }}</span>
        </button>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div
      v-if="isMenuOpen"
      class="fab-backdrop"
      @click="closeMenu"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useVectorStore } from '@/stores/vectorStore'
import { useUIStore } from '@/stores/uiStore'

const vectorStore = useVectorStore()
const uiStore = useUIStore()

// State
const isMenuOpen = ref(false)
const fabContainer = ref(null)

// FAB Actions Configuration
const fabActions = computed(() => [
  {
    id: 'generate',
    icon: '🎲',
    label: 'Generate Vectors',
    class: 'fab-primary',
    action: () => vectorStore.generateVectors()
  },
  {
    id: 'add-vector',
    icon: '➕',
    label: 'Add Vector',
    class: 'fab-accent',
    action: () => uiStore.showAddVectorModal()
  },
  {
    id: 'neural-mode',
    icon: '🧠',
    label: 'Neural Mode',
    class: 'fab-neural',
    action: () => vectorStore.toggleNeuralMode()
  },
  {
    id: 'analysis',
    icon: '📊',
    label: 'Run Analysis',
    class: 'fab-info',
    action: () => uiStore.showAnalysisModal()
  },
  {
    id: 'export',
    icon: '💾',
    label: 'Export Data',
    class: 'fab-secondary',
    action: () => exportData()
  },
  {
    id: 'fullscreen',
    icon: '🔍',
    label: 'Fullscreen',
    class: 'fab-utility',
    action: () => toggleFullscreen()
  }
])

// Methods
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  
  if (isMenuOpen.value) {
    // Focus first menu item after opening
    setTimeout(() => {
      const firstMenuItem = fabContainer.value?.querySelector('.fab-menu-item')
      firstMenuItem?.focus()
    }, 100)
  }
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleMainKeydown = (event) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      toggleMenu()
      break
    case 'Escape':
      if (isMenuOpen.value) {
        event.preventDefault()
        closeMenu()
      }
      break
  }
}

const handleAction = (actionId) => {
  const action = fabActions.value.find(a => a.id === actionId)
  if (action) {
    action.action()
    closeMenu()
    
    // Show feedback
    uiStore.showSuccess(`${action.label} activated`)
  }
}

const exportData = () => {
  try {
    const data = {
      vectors: vectorStore.vectors,
      config: {
        dimensions: vectorStore.dimensions,
        forceType: vectorStore.forceType,
        activationFunction: vectorStore.activationFunction
      },
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vectoverse-export-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    uiStore.showSuccess('Data exported successfully')
  } catch (error) {
    console.error('Export error:', error)
    uiStore.showError('Failed to export data')
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// Lifecycle
onMounted(() => {
  // Close menu on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isMenuOpen.value) {
      closeMenu()
    }
  })
  
  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (isMenuOpen.value && !fabContainer.value?.contains(event.target)) {
      closeMenu()
    }
  })
})

onUnmounted(() => {
  // Cleanup is handled by Vue automatically for event listeners in onMounted
})
</script>

<style scoped>
.fab-container {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.fab-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  position: relative;
  z-index: 1001;
}

.fab-main:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.fab-main:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.fab-main.expanded {
  transform: rotate(45deg);
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.fab-icon {
  transition: transform 0.3s ease;
  display: inline-block;
}

.fab-menu {
  position: absolute;
  bottom: 70px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1000;
}

.fab-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  border-radius: 28px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 44px;
  height: 44px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  outline: none;
}

.fab-menu-item:hover {
  transform: translateX(-8px) scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.fab-menu-item:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.fab-item-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
}

.fab-item-label {
  font-weight: 500;
  opacity: 0;
  max-width: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.fab-menu-item:hover .fab-item-label {
  opacity: 1;
  max-width: 120px;
}

/* FAB Action Types */
.fab-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.fab-accent {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.fab-neural {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.fab-info {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
}

.fab-secondary {
  background: linear-gradient(135deg, #636e72 0%, #2d3436 100%);
}

.fab-utility {
  background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
}

.fab-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  z-index: 999;
}

/* Transitions */
.fab-menu-enter-active,
.fab-menu-leave-active {
  transition: all 0.3s ease;
}

.fab-menu-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.fab-menu-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.fab-menu-enter-active .fab-menu-item {
  animation: fabItemSlide 0.3s ease forwards;
}

.fab-menu-enter-active .fab-menu-item:nth-child(1) { animation-delay: 0ms; }
.fab-menu-enter-active .fab-menu-item:nth-child(2) { animation-delay: 50ms; }
.fab-menu-enter-active .fab-menu-item:nth-child(3) { animation-delay: 100ms; }
.fab-menu-enter-active .fab-menu-item:nth-child(4) { animation-delay: 150ms; }
.fab-menu-enter-active .fab-menu-item:nth-child(5) { animation-delay: 200ms; }
.fab-menu-enter-active .fab-menu-item:nth-child(6) { animation-delay: 250ms; }

@keyframes fabItemSlide {
  from {
    opacity: 0;
    transform: translateX(20px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .fab-container {
    bottom: 20px;
    right: 20px;
  }
  
  .fab-main {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
  
  .fab-menu-item {
    padding: 10px 14px;
    height: 40px;
    font-size: 12px;
  }
  
  .fab-item-icon {
    font-size: 14px;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .fab-main,
  .fab-menu-item {
    border: 2px solid white;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .fab-main,
  .fab-menu-item,
  .fab-icon {
    transition: none;
  }
  
  .fab-menu-item {
    animation: none;
  }
}

/* Focus indicators for accessibility */
.fab-main:focus-visible,
.fab-menu-item:focus-visible {
  outline: 3px solid #667eea;
  outline-offset: 2px;
}
</style> 