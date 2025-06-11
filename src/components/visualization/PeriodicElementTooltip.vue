<template>
  <div class="periodic-tooltip" :style="positionStyles">
    <div class="tooltip-content">
      <div class="tooltip-header">
        <div class="tooltip-symbol" :style="{ color: element.color }">{{ element.symbol }}</div>
        <div>
          <div class="tooltip-name">{{ element.name }}</div>
          <div class="tooltip-quantum-key">Quantum Profile: {{ element.quantumKey }}</div>
        </div>
      </div>
      <div class="tooltip-body">
        <div><strong>Magnitude:</strong> {{ element.atomicMass }}</div>
        <div><strong>Entropy:</strong> {{ element.entropy }}</div>
        <div><strong>Stability:</strong> {{ element.stability }}</div>
      </div>
      <div class="tooltip-footer">
        <div class="quantum-makeup-label">Quantum Makeup:</div>
        <div class="quantum-bar">
          <div 
            class="quantum-bar-item"
            :style="{ width: `${excitPct}%`, background: '#ff6b6b' }" 
            :title="`Excitatory: ${element.excitatory}`"
          ></div>
          <div 
            class="quantum-bar-item"
            :style="{ width: `${inhibPct}%`, background: '#4ecdc4' }" 
            :title="`Inhibitory: ${element.inhibitory}`"
          ></div>
          <div 
            class="quantum-bar-item"
            :style="{ width: `${neuPct}%`, background: '#95a5a6' }" 
            :title="`Neutral: ${element.neutral}`"
          ></div>
        </div>
      </div>
      <div v-if="element.vectors && element.vectors.length > 1" class="tooltip-footer">
        <strong>Stacked Vectors ({{ element.vectors.length }}):</strong>
        <div class="vector-id-list">
          {{ element.vectors.map(v => v.id).join(', ') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  element: {
    type: Object,
    required: true
  },
  position: {
    type: Object,
    required: true
  }
});

const positionStyles = computed(() => ({
  top: props.position.top,
  left: props.position.left,
  transform: 'translate(10px, 0)' // Add small offset
}));

const quantumTotal = computed(() => props.element.excitatory + props.element.inhibitory + props.element.neutral);
const excitPct = computed(() => quantumTotal.value > 0 ? (props.element.excitatory / quantumTotal.value * 100).toFixed(1) : 0);
const inhibPct = computed(() => quantumTotal.value > 0 ? (props.element.inhibitory / quantumTotal.value * 100).toFixed(1) : 0);
const neuPct = computed(() => quantumTotal.value > 0 ? (props.element.neutral / quantumTotal.value * 100).toFixed(1) : 0);
</script>

<style scoped>
.periodic-tooltip {
  position: absolute;
  background: rgba(20, 20, 30, 0.95);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 5px 15px rgba(0,0,0,0.4);
  max-width: 240px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  transition: opacity 0.2s;
}
.tooltip-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.tooltip-symbol {
  font-size: 24px;
  font-weight: bold;
  margin-right: 8px;
  line-height: 1;
}
.tooltip-name {
  font-weight: 600;
}
.tooltip-quantum-key {
  font-size: 11px;
  opacity: 0.7;
}
.tooltip-body {
  margin-bottom: 8px;
}
.tooltip-body > div {
  margin-bottom: 2px;
}
.tooltip-footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.tooltip-footer strong {
  font-size: 12px;
  color: #a0aec0;
}
.vector-id-list {
  font-size: 11px;
  opacity: 0.8;
  max-height: 40px;
  overflow-y: auto;
  word-break: break-all;
  margin-top: 4px;
}
.quantum-makeup-label {
  font-weight: 600;
  margin-bottom: 4px;
}
.quantum-bar {
  width: 100%;
  height: 10px;
  background: #333;
  border-radius: 5px;
  display: flex;
  overflow: hidden;
}
</style> 