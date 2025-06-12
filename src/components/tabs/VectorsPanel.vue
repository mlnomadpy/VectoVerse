<template>
  <div class="vectors-panel">
    <div class="panel-header">
      <h3>Vector Management</h3>
      <div class="panel-stats">
        <StatCard
          title="Total Vectors"
          :value="vectorStore.vectors.length"
          icon="🎯"
        />
        <StatCard
          title="Dimensions"
          :value="`${vectorStore.dimensions}D`"
          icon="📐"
        />
        <StatCard
          title="Selected"
          :value="vectorStore.selectedVectorId ? '1' : '0'"
          icon="👆"
        />
      </div>
    </div>

    <div class="panel-content">
      <!-- Vector List -->
      <div class="vector-list">
        <div class="list-header">
          <h4>Current Vectors</h4>
          <div class="list-controls">
            <button
              class="btn-small btn-primary"
              @click="vectorStore.generateVectors"
            >
              🎲 Generate New
            </button>
            <button
              class="btn-small btn-accent"
              @click="showAddVectorModal = true"
            >
              ➕ Add Vector
            </button>
          </div>
        </div>

        <div class="vector-items">
          <div
            v-for="vector in vectorStore.vectors"
            :key="vector.id"
            class="vector-item"
            :class="{ selected: vector.id === vectorStore.selectedVectorId }"
            @click="vectorStore.selectVector(vector.id)"
          >
            <div class="vector-header">
              <span class="vector-id">{{ vector.id }}</span>
              <div class="vector-actions">
                <button
                  class="btn-icon"
                  title="Edit vector"
                  @click.stop="editVector(vector)"
                >
                  ✏️
                </button>
                <button
                  class="btn-icon"
                  title="Duplicate vector"
                  @click.stop="duplicateVector(vector)"
                >
                  📋
                </button>
                <button
                  class="btn-icon btn-danger"
                  title="Delete vector"
                  @click.stop="deleteVector(vector.id)"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div class="vector-info">
              <div class="vector-magnitude">
                Magnitude: {{ vector.magnitude?.toFixed(3) || 'N/A' }}
              </div>
              <div class="vector-components">
                Components: [{{ vector.components.map(c => c.toFixed(2)).join(', ') }}]
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vector Operations -->
      <div class="vector-operations">
        <h4>Vector Operations</h4>
        <div class="operation-buttons">
          <button
            class="btn-operation"
            :disabled="selectedVectors.length < 2"
            @click="addVectors"
          >
            ➕ Add Selected
          </button>
          <button
            class="btn-operation"
            :disabled="selectedVectors.length < 2"
            @click="subtractVectors"
          >
            ➖ Subtract Selected
          </button>
          <button
            class="btn-operation"
            :disabled="selectedVectors.length < 2"
            @click="calculateDotProduct"
          >
            📐 Dot Product
          </button>
          <button
            class="btn-operation"
            :disabled="selectedVectors.length < 2"
            @click="calculateCrossProduct"
          >
            ✖️ Cross Product
          </button>
          <button
            class="btn-operation"
            :disabled="!vectorStore.selectedVectorId"
            @click="normalizeVector"
          >
            📏 Normalize
          </button>
        </div>
      </div>
    </div>

    <!-- Add Vector Modal -->
    <Teleport to="body">
      <div
        v-if="showAddVectorModal"
        class="modal-overlay"
        @click="showAddVectorModal = false"
      >
        <div class="add-vector-modal" @click.stop>
          <h3>Add Custom Vector</h3>
          <form @submit.prevent="addCustomVector">
            <div class="form-group">
              <label>Vector Components:</label>
              <div class="components-input">
                <input
                  v-for="(component, index) in newVectorComponents"
                  :key="index"
                  v-model.number="newVectorComponents[index]"
                  type="number"
                  step="0.01"
                  :placeholder="`Component ${index + 1}`"
                >
              </div>
              <div class="dimension-controls">
                <button
                  type="button"
                  @click="adjustDimensions(-1)"
                  :disabled="newVectorComponents.length <= 2"
                >
                  -
                </button>
                <span>{{ newVectorComponents.length }}D</span>
                <button
                  type="button"
                  @click="adjustDimensions(1)"
                  :disabled="newVectorComponents.length >= 20"
                >
                  +
                </button>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" @click="showAddVectorModal = false">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Add Vector
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVectorStore } from '@/stores/vectorStore'
import { useUIStore } from '@/stores/uiStore'
import StatCard from '@/components/StatCard.vue'

const props = defineProps({
  tabId: String
})

const vectorStore = useVectorStore()
const uiStore = useUIStore()

// Local state
const showAddVectorModal = ref(false)
const newVectorComponents = ref([0, 0])

// Computed
const selectedVectors = computed(() => {
  return vectorStore.vectors.filter(v => v.selected)
})

// Methods
const editVector = (vector) => {
  // Implement vector editing functionality
  console.log('Edit vector:', vector)
  uiStore.showInfo(`Editing vector ${vector.id}`)
}

const duplicateVector = (vector) => {
  vectorStore.duplicateVector(vector.id)
  uiStore.showSuccess(`Vector ${vector.id} duplicated`)
}

const deleteVector = (vectorId) => {
  if (confirm('Are you sure you want to delete this vector?')) {
    vectorStore.removeVector(vectorId)
    uiStore.showSuccess('Vector deleted')
  }
}

const addVectors = () => {
  if (selectedVectors.value.length >= 2) {
    const result = vectorStore.addVectors(selectedVectors.value.map(v => v.id))
    uiStore.showSuccess(`Vector addition result: ${result}`)
  }
}

const subtractVectors = () => {
  if (selectedVectors.value.length >= 2) {
    const result = vectorStore.subtractVectors(selectedVectors.value.map(v => v.id))
    uiStore.showSuccess(`Vector subtraction result: ${result}`)
  }
}

const calculateDotProduct = () => {
  if (selectedVectors.value.length >= 2) {
    const result = vectorStore.calculateDotProduct(
      selectedVectors.value[0].id,
      selectedVectors.value[1].id
    )
    uiStore.showInfo(`Dot product: ${result.toFixed(3)}`)
  }
}

const calculateCrossProduct = () => {
  if (selectedVectors.value.length >= 2) {
    const result = vectorStore.calculateCrossProduct(
      selectedVectors.value[0].id,
      selectedVectors.value[1].id
    )
    uiStore.showInfo(`Cross product calculated`)
  }
}

const normalizeVector = () => {
  if (vectorStore.selectedVectorId) {
    vectorStore.normalizeVector(vectorStore.selectedVectorId)
    uiStore.showSuccess('Vector normalized')
  }
}

const adjustDimensions = (delta) => {
  const newLength = newVectorComponents.value.length + delta
  if (newLength >= 2 && newLength <= 20) {
    if (delta > 0) {
      newVectorComponents.value.push(0)
    } else {
      newVectorComponents.value.pop()
    }
  }
}

const addCustomVector = () => {
  if (newVectorComponents.value.length >= 2) {
    vectorStore.addCustomVector(newVectorComponents.value)
    uiStore.showSuccess('Custom vector added')
    showAddVectorModal.value = false
    // Reset form
    newVectorComponents.value = [0, 0]
  }
}

// Initialize
onMounted(() => {
  // Initialize component
  console.log('VectorsPanel mounted for tab:', props.tabId)
})
</script>

<style scoped>
.vectors-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 1.5rem;
  gap: 1.5rem;
  overflow-y: auto;
}

.panel-header {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}
.panel-header h3 {
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: var(--accent-primary);
}
.panel-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.vector-list .list-header,
.vector-operations h4 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--accent-secondary);
}
.vector-list .list-controls {
  display: flex;
  gap: 0.5rem;
}

.vector-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 0.5rem;
}

.vector-item {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.vector-item:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px var(--shadow-color);
}
.vector-item.selected {
  border-color: var(--accent-primary);
  box-shadow: 0 0 12px var(--accent-primary);
}

.vector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.vector-id {
  font-weight: 600;
  font-size: 1.1rem;
  background-color: var(--accent-primary);
  color: var(--text-primary-inverse, #fff);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}
.vector-actions {
  display: flex;
  gap: 0.25rem;
}

.vector-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.vector-magnitude {
  margin-bottom: 0.25rem;
}
.vector-components {
  word-break: break-all;
  font-family: var(--font-mono);
}

.operation-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}
.btn-operation {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

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

.add-vector-modal {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 10px 30px var(--shadow-color);
  width: 90%;
  max-width: 500px;
}
.add-vector-modal h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}
.components-input {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.components-input input {
  width: 100%;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.5rem;
  text-align: center;
}
.dimension-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}
.dimension-controls button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 1.2rem;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn-small, .btn-icon, .btn-operation {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--accent-primary);
  color: var(--text-primary-inverse, #fff);
}
.btn-accent {
  background-color: var(--accent-secondary);
  color: var(--text-primary-inverse, #fff);
}
.btn-icon {
  background-color: transparent;
  color: var(--text-secondary);
  padding: 0.4rem;
}
.btn-icon:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}
.btn-danger {
  color: var(--status-danger);
}
.btn-danger:hover {
  background-color: var(--status-danger);
  color: var(--text-primary-inverse, #fff);
}

.form-actions button[type="button"] {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
</style> 