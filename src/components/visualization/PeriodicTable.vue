<template>
  <div class="periodic-table-container-wrapper">
    <div class="periodic-table-container" ref="tableContainerRef">
      <svg 
        class="periodic-table-svg" 
        :width="tableWidth" 
        :height="tableHeight"
      >
        <text x="20" y="20" class="table-title">🧪 Vector Periodic Table</text>
        <g>
          <text v-for="i in tableDimensions.rows" :key="`row-label-${i-1}`"
            :x="15"
            :y="40 + (i - 1) * (config.elementHeight + config.padding + 15) + config.elementHeight / 2 + 5"
            class="axis-label"
          >
            E{{ i - 1 }}
          </text>
        </g>
        <g>
           <text v-for="i in tableDimensions.cols" :key="`col-label-${i-1}`"
            :x="50 + (i - 1) * (config.elementWidth + config.padding + 15) + config.elementWidth / 2"
            :y="25"
            class="axis-label"
          >
            I{{ i - 1 }}
          </text>
        </g>
        <PeriodicElement 
          v-for="element in visibleElements" 
          :key="`${element.id}-${element.isPlaceholder}`"
          :element="element"
          :config="config"
          @showTooltip="onShowTooltip"
          @hideTooltip="onHideTooltip"
        />
      </svg>
    </div>
    <PeriodicElementTooltip 
      v-if="tooltip.visible"
      :element="tooltip.element"
      :position="tooltip.position"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePeriodicTable } from '../../composables/usePeriodicTable';
import PeriodicElement from './PeriodicElement.vue';
import PeriodicElementTooltip from './PeriodicElementTooltip.vue';

const { periodicData, config, tableDimensions, showPlaceholders } = usePeriodicTable();
const tableContainerRef = ref(null);

const visibleElements = computed(() => {
  if (showPlaceholders.value) {
    return periodicData.value;
  }
  return periodicData.value.filter(el => el.present);
});

const tableWidth = computed(() => {
  if (!periodicData.value.length) return '100%';
  return 50 + tableDimensions.value.cols * (config.value.elementWidth + config.value.padding + 15) + 50;
});

const tableHeight = computed(() => {
  if (!periodicData.value.length) return 200;
  return 40 + tableDimensions.value.rows * (config.value.elementHeight + config.value.padding + 15) + 40;
});

const tooltip = ref({
  visible: false,
  element: null,
  position: { top: '0px', left: '0px' }
});

const onShowTooltip = ({ event, element }) => {
  tooltip.value.element = element;
  tooltip.value.visible = true;
  
  const rect = event.target.getBoundingClientRect();
  const containerRect = tableContainerRef.value?.getBoundingClientRect() ?? { top: 0, left: 0 };
  
  tooltip.value.position = {
    left: `${rect.right - containerRect.left}px`,
    top: `${rect.top - containerRect.top}px`
  };
};

const onHideTooltip = () => {
  tooltip.value.visible = false;
  tooltip.value.element = null;
};
</script>

<style scoped>
.periodic-table-container-wrapper {
  width: 100%;
  flex-grow: 1;
  background: rgba(0,0,0,0.1);
  position: relative; /* For tooltip positioning */
  overflow: hidden;
}
.periodic-table-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}
.periodic-table-svg {
  display: block;
  min-width: 100%;
  min-height: 100%;
}
.table-title {
  fill: white;
  font-size: 16px;
  font-weight: bold;
}
.axis-label {
  fill: #667eea;
  font-size: 12px;
  text-anchor: middle;
}
</style> 