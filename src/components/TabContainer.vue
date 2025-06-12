<template>
  <div class="tab-container">
    <!-- Tab Header -->
    <div class="tab-header" role="tablist">
      <button
        v-for="tab in tabsArray"
        :key="tab.id"
        :id="`tab-${tab.id}`"
        :aria-controls="`panel-${tab.id}`"
        :aria-selected="tab.active"
        :tabindex="tab.active ? 0 : -1"
        class="tab-button"
        :class="{ active: tab.active }"
        role="tab"
        @click="setActiveTab(tab.id)"
        @keydown="handleTabKeydown($event, tab.id)"
      >
        <span v-if="tab.icon" class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-title">{{ tab.title }}</span>
        <button
          v-if="tab.closeable"
          class="tab-close"
          :aria-label="`Close ${tab.title} tab`"
          @click.stop="removeTab(tab.id)"
        >
          ✕
        </button>
      </button>
      
      <button
        class="add-tab-button"
        title="Add new tab"
        @click="showAddTabDialog = true"
      >
        ➕
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <div
        v-for="tab in tabsArray"
        :key="`panel-${tab.id}`"
        :id="`panel-${tab.id}`"
        :aria-labelledby="`tab-${tab.id}`"
        class="tab-panel"
        :class="{ active: tab.active }"
        role="tabpanel"
        :tabindex="tab.active ? 0 : -1"
      >
        <component
          :is="tab.component"
          v-if="tab.active"
          :tab-id="tab.id"
        />
      </div>
    </div>

    <!-- Add Tab Dialog -->
    <Teleport to="body">
      <div
        v-if="showAddTabDialog"
        class="modal-overlay"
        @click="showAddTabDialog = false"
      >
        <div
          class="add-tab-modal"
          @click.stop
        >
          <h3>Add New Tab</h3>
          <form @submit.prevent="handleAddTab">
            <div class="form-group">
              <label for="tab-title">Tab Title:</label>
              <input
                id="tab-title"
                v-model="newTabTitle"
                type="text"
                required
                placeholder="Enter tab title"
              >
            </div>
            <div class="form-group">
              <label for="tab-type">Tab Type:</label>
              <select id="tab-type" v-model="newTabType">
                <option value="analysis">Analysis</option>
                <option value="visualization">Visualization</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" @click="showAddTabDialog = false">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Add Tab
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTabManager } from '@/composables/useTabManager'

// Import tab panel components
import VectorsPanel from './tabs/VectorsPanel.vue'
import AnalysisPanel from './tabs/AnalysisPanel.vue'
import VisualizationPanel from './tabs/VisualizationPanel.vue'
import NeuralPanel from './tabs/NeuralPanel.vue'

const {
  tabs,
  activeTab,
  showAddTabDialog,
  tabsArray,
  activeTabData,
  initializeTabs,
  addTab,
  removeTab,
  setActiveTab,
  handleTabKeydown
} = useTabManager()

// New tab form data
const newTabTitle = ref('')
const newTabType = ref('analysis')

// Initialize tabs on mount
onMounted(() => {
  initializeTabs()
})

// Handle adding new tab
const handleAddTab = () => {
  if (newTabTitle.value.trim()) {
    const id = `custom-${Date.now()}`
    const component = getComponentForType(newTabType.value)
    addTab(id, newTabTitle.value.trim(), component, '📋', true)
    
    // Reset form
    newTabTitle.value = ''
    newTabType.value = 'analysis'
    showAddTabDialog.value = false
  }
}

// Get component based on tab type
const getComponentForType = (type) => {
  switch (type) {
    case 'analysis':
      return 'AnalysisPanel'
    case 'visualization':
      return 'VisualizationPanel'
    default:
      return 'AnalysisPanel'
  }
}
</script>

<style scoped>
.tab-container {
  position: relative;
  background: var(--bg-secondary);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 0;
  margin: 16px 0;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.tab-header {
  display: flex;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  position: relative;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tab-header::-webkit-scrollbar {
  display: none;
}

.tab-button {
  flex: 1;
  padding: 16px 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  outline: none;
}

.tab-button:hover {
  background: var(--bg-quaternary);
  color: var(--text-primary);
}

.tab-button.active {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.tab-button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tab-button.active::after {
  transform: scaleX(1);
}

.tab-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-close {
  margin-left: 8px;
  padding: 2px;
  border-radius: 50%;
  background: var(--bg-quaternary);
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1;
}

.tab-button:hover .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background: var(--accent-primary);
  color: var(--text-primary);
}

.add-tab-button {
  padding: 0 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-tab-button:hover {
  background: var(--bg-quaternary);
  color: var(--accent-primary);
}

.tab-content {
  padding: 24px;
  min-height: 300px;
  position: relative;
}

.tab-panel {
  display: none;
  animation: fadeIn 0.5s ease;
}

.tab-panel.active {
  display: block;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.add-tab-modal {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px var(--shadow-color);
  width: 90%;
  max-width: 400px;
}

.add-tab-modal h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-primary-transparent, rgba(0, 122, 255, 0.25));
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.form-actions button {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-actions button[type="button"] {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.form-actions button[type="button"]:hover {
  background: var(--bg-quaternary);
}

.form-actions .btn-primary {
  background: var(--accent-primary);
  color: var(--text-primary-inverse, #fff);
}

.form-actions .btn-primary:hover {
  background: var(--accent-secondary);
}

/* Responsive design */
@media (max-width: 768px) {
  .tab-button {
    min-width: 100px;
    font-size: 12px;
    padding: 12px 16px;
  }
  
  .tab-content {
    padding: 16px;
  }
}

/* High contrast support */
@media (prefers-contrast: high) {
  .tab-container {
    border: 2px solid white;
  }
  
  .tab-button {
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
}
</style> 