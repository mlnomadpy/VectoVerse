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
  max-width: 500px;
  margin: 0 auto;
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.modal-header h3 {
  color: #667eea;
  margin: 0 0 0.5rem 0;
}

.modal-header p {
  color: #666;
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
  font-weight: 500;
  color: #333;
}

.input-help {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.vector-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-family: monospace;
  resize: vertical;
  transition: border-color 0.2s;
}

.vector-input:focus {
  outline: none;
  border-color: #667eea;
}

.vector-input.error {
  border-color: #ef4444;
}

.label-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  transition: border-color 0.2s;
}

.label-input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.preview-section {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.preview-section h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
}

.vector-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.components-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.component {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875rem;
}

.component.positive {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.component.negative {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.component.zero {
  background: rgba(156, 163, 175, 0.1);
  color: #6b7280;
}

.more {
  padding: 0.25rem 0.5rem;
  color: #666;
  font-style: italic;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel, .btn-add {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-cancel {
  background: #6b7280;
  color: white;
}

.btn-cancel:hover {
  background: #4b5563;
}

.btn-add {
  background: #667eea;
  color: white;
}

.btn-add:hover:not(:disabled) {
  background: #5a67d8;
}

.btn-add:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style> 