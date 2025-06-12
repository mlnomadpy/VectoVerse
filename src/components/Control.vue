<template>
  <div class="control-wrapper" :class="[`control-${config.type}`, { 'has-icon': config.icon }]">
    
    <!-- Icon Toggle Button -->
    <template v-if="config.type === 'checkbox' && config.icon">
      <button 
        class="icon-toggle"
        :class="{ active: modelValue }"
        :title="config.label"
        @click="$emit('update:modelValue', !modelValue)"
      >
        {{ config.icon }}
      </button>
    </template>

    <!-- Standard Controls -->
    <template v-else>
      <label :for="controlId" v-if="config.label">{{ config.label }}</label>
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

        <template v-if="config.type === 'checkbox' && !config.icon">
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
            <option v-for="option in config.options" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </template>

      </div>
    </template>
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
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}
.control-wrapper.has-icon {
  padding: 0;
  justify-content: center;
}

label {
  font-size: 0.85em;
  color: var(--text-secondary);
  margin-right: 0.5rem;
}

.control-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Icon Toggle Button */
.icon-toggle {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
}
.icon-toggle:hover {
  border-color: var(--bg-tertiary);
  color: var(--text-primary);
}
.icon-toggle.active {
  background-color: var(--accent-tertiary);
  color: var(--accent-primary);
  box-shadow: 0 0 10px 0 var(--accent-tertiary);
}

/* Slider */
.control-slider input[type="range"] {
  width: 100px;
}
.slider-value {
  font-weight: bold;
  font-size: 0.85em;
  width: 28px;
  text-align: right;
  color: var(--text-primary);
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
  background-color: var(--bg-quaternary);
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text-primary);
  transition: .4s;
}
input:checked + .slider {
  background-color: var(--accent-primary);
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

/* Dropdown */
select {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0.4rem 0.6rem;
}

select:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 5px var(--accent-primary);
}
</style> 