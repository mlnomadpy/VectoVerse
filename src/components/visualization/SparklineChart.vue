<template>
  <div class="sparkline-container">
    <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none">
      <path :d="path" class="sparkline-path" />
      <line :x1="0" :y1="zeroAxis" :x2="width" :y2="zeroAxis" class="zero-axis" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  components: {
    type: Array,
    required: true,
  },
  width: {
    type: Number,
    default: 100,
  },
  height: {
    type: Number,
    default: 30,
  },
});

const path = computed(() => {
  if (!props.components || props.components.length === 0) return '';
  
  const values = props.components;
  const max = Math.max(...values.map(Math.abs));
  if (max === 0) { // Handle case where all components are 0
    const y = props.height / 2;
    return `M 0,${y} L ${props.width},${y}`;
  }

  const scaleY = props.height / (max * 2);
  const scaleX = props.width / (values.length - 1 || 1);

  const points = values.map((val, i) => {
    const x = i * scaleX;
    const y = (props.height / 2) - val * scaleY;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
});

const zeroAxis = computed(() => props.height / 2);
</script>

<style scoped>
.sparkline-container {
  width: 100%;
  height: 40px;
}

.sparkline-path {
  stroke: #667eea;
  stroke-width: 1.5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.zero-axis {
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 1;
  stroke-dasharray: 2, 2;
}
</style> 