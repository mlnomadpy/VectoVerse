<template>
  <div class="add-vector-modal">
    <div class="modal-header">
      <h3>➕ Add Custom Vector</h3>
      <p>Enter vector components to create a new vector</p>
    </div>

    <div class="form-section">
      <div class="form-group">
        <label for="vector-input">Vector Components</label>
        <div class="input-help">
          Enter comma-separated values (e.g., 1, -2, 3.5, 4)
        </div>
        <textarea
          id="vector-input"
          v-model="vectorInput"
          class="vector-input"
          :class="{ error: hasError }"
          placeholder="1, 2, 3, 4"
          rows="3"
          @input="validateInput"
        ></textarea>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>

      <div class="form-group">
        <label for="vector-label">Vector Label (Optional)</label>
        <input
          id="vector-label"
          v-model="vectorLabel"
          type="text"
          class="label-input"
          placeholder="My Custom Vector"
          maxlength="50"
        />
      </div>

      <div v-if="parsedVector" class="preview-section">
        <h4>Preview</h4>
        <div class="vector-stats">
          <span>Dimensions: {{ parsedVector.length }}</span>
          <span>Magnitude: {{ magnitude.toFixed(3) }}</span>
        </div>
        <div class="components-preview">
          <span 
            v-for="(val, i) in parsedVector.slice(0, 8)" 
            :key="i"
            class="component"
            :class="componentClass(val)"
          >
            {{ val.toFixed(2) }}
          </span>
          <span v-if="parsedVector.length > 8" class="more">
            +{{ parsedVector.length - 8 }} more
          </span>
        </div>
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn-cancel" @click="$emit('close')">
        Cancel
      </button>
      <button 
        class="btn-add" 
        :disabled="!canAdd"
        @click="addVector"
      >
        Add Vector
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useVectorStore } from '../../stores/vectorStore.js'
import { useUIStore } from '../../stores/uiStore.js'

const vectorStore = useVectorStore()
const uiStore = useUIStore()

// Reactive state
const vectorInput = ref('')
const vectorLabel = ref('')
const parsedVector = ref(null)
const hasError = ref(false)
const errorMessage = ref('')

// Computed properties
const magnitude = computed(() => {
  if (!parsedVector.value) return 0
  return Math.sqrt(parsedVector.value.reduce((sum, val) => sum + val * val, 0))
})

const canAdd = computed(() => {
  return parsedVector.value && !hasError.value
})

// Methods
const validateInput = () => {
  const input = vectorInput.value.trim()
  
  if (!input) {
    parsedVector.value = null
    hasError.value = false
    errorMessage.value = ''
    return
  }

  try {
    // Try JSON format first
    if (input.startsWith('[') && input.endsWith(']')) {
      const parsed = JSON.parse(input)
      if (Array.isArray(parsed) && parsed.every(v => typeof v === 'number' && !isNaN(v))) {
        parsedVector.value = parsed
        hasError.value = false
        errorMessage.value = ''
        return
      }
    }

    // Try comma-separated values
    const values = input.split(',').map(v => parseFloat(v.trim()))
    
    if (values.some(isNaN)) {
      throw new Error('All values must be valid numbers')
    }
    
    if (values.length < 2) {
      throw new Error('Vector must have at least 2 components')
    }
    
    if (values.length > 50) {
      throw new Error('Vector cannot have more than 50 components')
    }

    parsedVector.value = values
    hasError.value = false
    errorMessage.value = ''
    
  } catch (error) {
    hasError.value = true
    errorMessage.value = error.message
    parsedVector.value = null
  }
}

const componentClass = (value) => {
  if (value > 0) return 'positive'
  if (value < 0) return 'negative'
  return 'zero'
}

const addVector = () => {
  if (!canAdd.value) return

  try {
    if (vectorStore.framework) {
      const newVector = {
        id: `custom_${Date.now()}`,
        values: parsedVector.value,
        label: vectorLabel.value || `Custom Vector ${Date.now()}`,
        type: 'custom',
        created: new Date()
      }
      
      // Add through the framework's state manager
      vectorStore.framework.stateManager.addCustomVector(newVector)
      uiStore.showSuccess('Vector added successfully!')
    }
    
    // Clear form and close
    vectorInput.value = ''
    vectorLabel.value = ''
    parsedVector.value = null
    emit('close')
    
  } catch (error) {
    uiStore.showError(`Failed to add vector: ${error.message}`)
  }
}

const emit = defineEmits(['close'])
</script>

<style scoped>
.add-vector-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: var(--bg-primary);
  padding: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.modal-header {
  text-align: center;
}
.modal-header h3 {
  font-size: 1.5rem;
  color: var(--accent-primary);
  margin: 0 0 0.5rem 0;
}
.modal-header p {
  color: var(--text-secondary);
  margin: 0;
}

.form-section {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.input-help {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-bottom: 0.5rem;
}

.vector-input,
.label-input {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.vector-input {
  font-family: monospace;
  resize: vertical;
}

.vector-input.error {
  border-color: var(--status-danger);
}

.error-message {
  color: var(--status-danger);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.preview-section {
  background-color: var(--bg-secondary);
  border-radius: 6px;
  padding: 1rem;
  border-left: 3px solid var(--accent-secondary);
}
.preview-section h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
}
.vector-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.components-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.component {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
.component.positive {
  background-color: var(--status-success-bg);
  color: var(--status-success);
}
.component.negative {
  background-color: var(--status-danger-bg);
  color: var(--status-danger);
}
.component.zero {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.btn-cancel,
.btn-add {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
.btn-add {
  background-color: var(--accent-primary);
  color: var(--text-primary-inverse);
}
.btn-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 