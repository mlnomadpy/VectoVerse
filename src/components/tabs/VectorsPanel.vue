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
  gap: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.panel-header h3 {
  margin: 0;
  color: white;
  font-size: 20px;
}

.panel-stats {
  display: flex;
  gap: 16px;
}

.panel-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.vector-list {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h4 {
  margin: 0;
  color: white;
  font-size: 16px;
}

.list-controls {
  display: flex;
  gap: 8px;
}

.btn-small {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-accent {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.btn-small:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.vector-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.vector-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.vector-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.vector-item.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.vector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.vector-id {
  font-weight: 600;
  color: #667eea;
  font-size: 14px;
}

.vector-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 12px;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-danger:hover {
  background: rgba(255, 107, 107, 0.2);
}

.vector-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.vector-magnitude {
  margin-bottom: 4px;
}

.vector-components {
  font-family: monospace;
  word-break: break-all;
}

.vector-operations {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.vector-operations h4 {
  margin: 0 0 16px 0;
  color: white;
  font-size: 16px;
}

.operation-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-operation {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-size: 14px;
}

.btn-operation:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.btn-operation:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.add-vector-modal {
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.add-vector-modal h3 {
  margin: 0 0 20px 0;
  color: white;
  font-size: 18px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.components-input {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.components-input input {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
}

.dimension-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
}

.dimension-controls button {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
}

.dimension-controls span {
  color: white;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.form-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-actions button:first-child {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.form-actions button:first-child:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .panel-content {
    grid-template-columns: 1fr;
  }
  
  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .panel-stats {
    flex-direction: column;
  }
}
</style> 