<template>
  <div class="control-wrapper" :class="`control-${config.type}`">
    <label :for="controlId">{{ config.label }}</label>
    <div class="control-input">
      <template v-if="config.type === 'slider'">
        <input
          :id="controlId"
          type="range"
          :min="config.min"
          :max="config.max"
          :step="config.step || 1"
          :value="modelValue"
          @input="$emit('update:modelValue', parseFloat($event.target.value))"
        />
        <span class="slider-value">{{ modelValue }}</span>
      </template>

      <template v-if="config.type === 'checkbox'">
        <label class="switch">
          <input
            :id="controlId"
            type="checkbox"
            :checked="modelValue"
            @change="$emit('update:modelValue', $event.target.checked)"
          />
          <span class="slider round"></span>
        </label>
      </template>

      <template v-if="config.type === 'button'">
        <button :id="controlId" @click="$emit('click')">
          {{ config.label }}
        </button>
      </template>
      
      <template v-if="config.type === 'dropdown'">
        <select 
            :id="controlId" 
            :value="modelValue" 
            @change="$emit('update:modelValue', $event.target.value)"
        >
          <option v-for="option in config.options" :key="option.value" :value="option.value">
            {{ option.text }}
          </option>
        </select>
      </template>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  modelValue: {
    required: true
  },
  id: {
    type: String,
    required: true
  }
})

defineEmits(['update:modelValue', 'click'])

const controlId = computed(() => `control-${props.id}`)
</script>

<style scoped>
.control-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  background-color: rgba(255,255,255,0.05);
}
.control-wrapper:hover {
  background-color: rgba(255,255,255,0.1);
}

label {
  font-size: 0.9em;
  color: var(--text-secondary);
}

.control-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Slider */
.control-slider input[type="range"] {
  width: 120px;
}
.slider-value {
  font-weight: bold;
  font-size: 0.9em;
  width: 30px;
  text-align: right;
}

/* Checkbox (Switch) */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #4a4a4a;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}
input:checked + .slider {
  background-color: var(--primary);
}
input:checked + .slider:before {
  transform: translateX(20px);
}
.slider.round {
  border-radius: 24px;
}
.slider.round:before {
  border-radius: 50%;
}
</style> 