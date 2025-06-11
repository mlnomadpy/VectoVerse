<template>
  <g 
    :transform="`translate(${element.position.x}, ${element.position.y})`"
    @click="onClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    class="periodic-element"
    :class="{ 
      'is-selected': isSelected, 
      'is-placeholder': element.isPlaceholder, 
      'is-present': element.present,
      'is-highlighted': isHighlighted
    }"
  >
    <rect 
      class="element-rect"
      :width="config.elementWidth"
      :height="config.elementHeight"
      :fill="fillColor"
    />
    <text 
      :x="config.elementWidth / 2" 
      :y="config.elementHeight / 2 - 2"
      text-anchor="middle" 
      alignment-baseline="central"
      class="element-name"
      :style="{ fontSize: dynamicFontSize }"
    >
      {{ element.name }}
    </text>
    <text 
      :x="config.elementWidth / 2" 
      :y="config.elementHeight / 2 + 18" 
      :font-size="config.fontSize"
      text-anchor="middle"
      class="element-symbol"
    >
      {{ element.symbol }}
    </text>
    <text 
      :x="4"
      :y="config.fontSize + 2"
      :font-size="config.fontSize"
      class="atomic-number"
    >
      {{ element.atomicNumber }}
    </text>
  </g>
</template>

<script setup>
import { computed } from 'vue';
import { useVectorStore } from '../../stores/vectorStore';
import { usePeriodicTable } from '../../composables/usePeriodicTable';
import { getHeatmapColor } from '../../utils/colors';

const props = defineProps({
  element: {
    type: Object,
    required: true,
  },
  config: {
    type: Object,
    required: true,
  },
});

const vectorStore = useVectorStore();
const { activeHeatmap, dataRanges, highlightedElementIds } = usePeriodicTable();

const isSelected = computed(() => {
  return vectorStore.selectedVectorIds.has(props.element.id);
});

const isHighlighted = computed(() => {
  return highlightedElementIds.value.has(props.element.id);
});

const fillColor = computed(() => {
  if (props.element.isPlaceholder) return '#333';
  if (activeHeatmap.value === 'none' || !props.element.present) {
    return props.element.color;
  }
  
  const property = activeHeatmap.value; // e.g., 'atomicMass'
  const value = props.element[property];
  const range = dataRanges.value[property === 'atomicMass' ? 'magnitude' : property];

  if (range && value !== undefined) {
    return getHeatmapColor(value, range.min, range.max);
  }
  
  return props.element.color;
});

const dynamicFontSize = computed(() => {
  const baseSize = props.config.symbolFontSize || 16;
  const nameLength = props.element.name.length;
  if (nameLength > 7) {
    const scaleFactor = Math.max(0.5, 1 - (nameLength - 7) * 0.1);
    return `${baseSize * scaleFactor}px`;
  }
  return `${baseSize}px`;
});

const emit = defineEmits(['showTooltip', 'hideTooltip']);

const onClick = (event) => {
  const isMultiSelect = event.ctrlKey || event.metaKey;
  vectorStore.selectVector(props.element.id, isMultiSelect);
}

const onMouseEnter = (event) => {
  if (!props.element.isPlaceholder) {
    emit('showTooltip', { event, element: props.element });
  }
}

const onMouseLeave = () => {
  emit('hideTooltip');
}

</script>

<style scoped>
@keyframes pulse {
  0% {
    box-shadow: 0 0 20px #f39c12;
  }
  50% {
    box-shadow: 0 0 30px #f39c12;
  }
  100% {
    box-shadow: 0 0 20px #f39c12;
  }
}

.periodic-element {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.periodic-element.is-placeholder {
  opacity: 0.3;
  cursor: default;
}

.periodic-element.is-placeholder:hover {
  opacity: 0.6;
}

.periodic-element.is-placeholder .element-rect {
  stroke-dasharray: 3, 3;
}

.element-rect {
  rx: 6;
  ry: 6;
  stroke-width: 1px;
  stroke: rgba(255,255,255,0.2);
  transition: all 0.2s ease-in-out;
}

.periodic-element.is-present .element-rect {
  stroke: rgba(102, 126, 234, 0.7);
  stroke-width: 1.5px;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.periodic-element.is-present:hover .element-rect {
  stroke-width: 2px;
  stroke: #82a2ff;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.8);
}

.periodic-element.is-highlighted .element-rect {
  stroke: #10b981;
  stroke-width: 2.5px;
}

.periodic-element.is-selected .element-rect {
  stroke: #f39c12;
  stroke-width: 3px;
  transform: scale(1.05);
  transform-origin: center;
  box-shadow: 0 0 20px #f39c12;
  animation: pulse 2s infinite;
}

.element-name {
  font-weight: 700;
  fill: white;
  pointer-events: none;
}
.element-symbol {
  font-size: 10px;
  opacity: 0.7;
  fill: white;
  pointer-events: none;
}
.atomic-number {
  font-size: 10px;
  font-weight: 500;
  opacity: 0.9;
  fill: white;
  pointer-events: none;
}
</style> 