<template>
  <div class="periodic-table-container-wrapper" ref="wrapperRef">
    <svg class="periodic-table-svg" ref="svgRef"></svg>
    <PeriodicElementTooltip 
      v-if="tooltip.visible"
      :element="tooltip.element"
      :position="tooltip.position"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as d3 from 'd3';
import { usePeriodicTable } from '../../composables/usePeriodicTable';
import { useVectorStore } from '../../stores/vectorStore';
import PeriodicElementTooltip from './PeriodicElementTooltip.vue';

const { periodicData, config, tableDimensions, showPlaceholders, activeHeatmap, dataRanges } = usePeriodicTable();
const vectorStore = useVectorStore();

const wrapperRef = ref(null);
const svgRef = ref(null);
const tooltip = ref({ visible: false, element: null, position: { top: '0px', left: '0px' } });

let svg, g, zoom;

const tableWidth = computed(() => 50 + tableDimensions.value.cols * (config.value.elementWidth + config.value.padding + 15) + 50);
const tableHeight = computed(() => 40 + tableDimensions.value.rows * (config.value.elementHeight + config.value.padding + 15) + 40);

const visibleElements = computed(() => {
  return showPlaceholders.value 
    ? periodicData.value 
    : periodicData.value.filter(el => el.present);
});

onMounted(() => {
  if (!svgRef.value || !wrapperRef.value) return;

  svg = d3.select(svgRef.value)
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${tableWidth.value} ${tableHeight.value}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  g = svg.append('g').attr('class', 'periodic-table-content');

  zoom = d3.zoom()
    .scaleExtent([1, 5])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  d3.select(wrapperRef.value).call(zoom);
  
  renderChart();

  const resizeObserver = new ResizeObserver(updateViewbox);
  resizeObserver.observe(wrapperRef.value);

  onUnmounted(() => {
    resizeObserver.disconnect();
  });
});

watch([visibleElements, activeHeatmap, () => vectorStore.selectedVectorIds], renderChart, { deep: true });

function updateViewbox() {
  if (!svgRef.value) return;
  d3.select(svgRef.value)
    .attr('viewBox', `0 0 ${tableWidth.value} ${tableHeight.value}`);
}

function renderChart() {
  if (!g) return;

  const elements = g.selectAll('.periodic-element')
    .data(visibleElements.value, d => d.id);

  // Exit
  elements.exit()
    .transition().duration(300)
    .attr('opacity', 0)
    .remove();

  // Enter
  const enterG = elements.enter()
    .append('g')
    .attr('class', d => `periodic-element ${d.isPlaceholder ? 'is-placeholder' : ''}`)
    .attr('transform', d => `translate(${d.position.x}, ${d.position.y})`)
    .attr('opacity', 0)
    .on('click', (event, d) => {
      const isMultiSelect = event.ctrlKey || event.metaKey;
      vectorStore.selectVector(d.id, isMultiSelect);
    })
    .on('mouseenter', function(event, d) {
      d3.select(this).raise();
      onShowTooltip({ event, element: d });
    })
    .on('mouseleave', () => onHideTooltip());
  
  enterG.append('rect')
    .attr('class', 'element-rect')
    .attr('width', config.value.elementWidth)
    .attr('height', config.value.elementHeight)
    .attr('rx', 6)
    .attr('ry', 6);

  enterG.append('text')
    .attr('class', 'atomic-number')
    .attr('x', 4)
    .attr('y', config.value.fontSize + 2)
    .text(d => d.atomicNumber);
  
  enterG.append('text')
    .attr('class', 'element-name')
    .attr('x', config.value.elementWidth / 2)
    .attr('y', config.value.elementHeight / 2 - 2)
    .text(d => d.name);
  
  enterG.append('text')
    .attr('class', 'element-symbol')
    .attr('x', config.value.elementWidth / 2)
    .attr('y', config.value.elementHeight / 2 + 18)
    .text(d => d.symbol);

  // Update
  const updateG = elements.merge(enterG);

  updateG.transition().duration(500)
    .attr('opacity', 1)
    .attr('transform', d => `translate(${d.position.x}, ${d.position.y})`);

  updateG.select('.element-rect')
    .transition().duration(500)
    .attr('fill', getFillColor);

  updateG.classed('is-selected', d => vectorStore.selectedVectorIds.has(d.id));

  updateG.select('.element-name').style('font-size', getDynamicFontSize);
}

function getFillColor(d) {
  if (d.isPlaceholder) return "var(--bg-tertiary)";
  if (activeHeatmap.value === 'none' || !d.present) return d.color || "var(--bg-quaternary)";
  
  const property = activeHeatmap.value;
  const value = d[property];
  const range = dataRanges.value[property === 'atomicMass' ? 'magnitude' : property];

  if (range && value !== undefined) {
    return d3.scaleSequential(d3.interpolateViridis).domain([range.max, range.min])(value);
  }
  return d.color;
}

function getDynamicFontSize(d) {
  const baseSize = config.value.symbolFontSize || 16;
  const nameLength = d.name.length;
  if (nameLength > 7) {
    const scaleFactor = Math.max(0.5, 1 - (nameLength - 7) * 0.1);
    return `${baseSize * scaleFactor}px`;
  }
  return `${baseSize}px`;
}

const onShowTooltip = ({ event, element }) => {
  if (element.isPlaceholder) return;
  tooltip.value = {
    visible: true,
    element: element,
    position: {
      left: `${event.pageX + 15}px`,
      top: `${event.pageY}px`
    }
  };
};

const onHideTooltip = () => {
  tooltip.value.visible = false;
};

</script>

<style scoped>
.periodic-table-container-wrapper {
  width: 100%;
  flex-grow: 1;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
  cursor: grab;
}
.periodic-table-container-wrapper:active {
  cursor: grabbing;
}
.periodic-table-svg {
  display: block;
}
</style>
<style>
/* Global styles for D3 elements */
.periodic-element {
  cursor: pointer;
  transition: opacity 0.3s;
}
.periodic-element.is-placeholder {
  opacity: 0.3;
  cursor: default;
}
.periodic-element .element-rect {
  stroke-width: 1px;
  stroke: var(--border-color);
  transition: all 0.2s ease-in-out;
}
.periodic-element:hover .element-rect {
  stroke-width: 2px;
  stroke: var(--accent-primary);
}
.periodic-element.is-selected .element-rect {
  stroke: var(--accent-secondary);
  stroke-width: 3px;
}
.element-name, .element-symbol, .atomic-number {
  text-anchor: middle;
  fill: var(--text-primary);
  pointer-events: none;
  font-family: var(--font-sans);
}
.element-name { font-weight: 700; alignment-baseline: central; }
.element-symbol { font-size: 10px; opacity: 0.7; }
.atomic-number { font-size: 10px; text-anchor: start; }
</style> 