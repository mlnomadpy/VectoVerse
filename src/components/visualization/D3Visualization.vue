<template>
  <div ref="container" class="vector-renderer-container">
    <svg ref="svgElement"></svg>
    <div ref="tooltip" class="renderer-tooltip"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import * as d3 from 'd3';
import { useVectorStore } from '@/stores/vectorStore';
import { useConfigStore } from '@/stores/configStore';
import { vectorOperations } from '@/utils/vectorUtils';
import { Constants } from '@/utils/Constants';
import { useForceCalculator } from '@/composables/useForceCalculator';
// Assuming composables exist, if not, they would need to be created or logic integrated.
// import { useAnimationEngine } from '@/composables/useAnimationEngine';

const props = defineProps({
  analysisResult: {
    type: Object,
    default: null,
  },
});

const vectorStore = useVectorStore();
const configStore = useConfigStore();
const forceCalculator = useForceCalculator();
// const forceCalculator = useForceCalculator(); // Assuming this provides calculation methods

const container = ref(null);
const svgElement = ref(null);
const tooltip = ref(null);
let svg;

// useAnimationEngine(svgElement); // This would set up a simulation if we use one

onMounted(() => {
  svg = d3.select(svgElement.value);
  
  if (svg.select("defs").empty()) {
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
  }

  resize();
  render();
  setupKeyboardNavigation();
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});

watch(() => [configStore.width, configStore.height], resize);
watch(() => [vectorStore.vectors, vectorStore.selectedVectorId, configStore.showForces, vectorStore.forceType, vectorStore.inputVector], render, { deep: true });
watch(() => props.analysisResult, handleAnalysisResults);

function resize() {
  if (!svg) return;
  svg.attr("width", configStore.width)
     .attr("height", configStore.height)
     .attr("viewBox", `0 0 ${configStore.width} ${configStore.height}`);
  render();
}

function render() {
  if (!svg) return;
  nextTick(() => {
    svg.selectAll(".bg-particle").remove(); // Clear only particles and vectors, not defs
    svg.selectAll(".vector-atom").remove();
    svg.selectAll(".input-vector").remove();
    svg.selectAll(".force-line").remove();
    
    renderBackgroundParticles();
    renderVectors();
    if (configStore.showForces) {
      renderForces();
    }
    if (vectorStore.inputVector) {
      renderInputVector();
    }
    updateVectorSelection();
  });
}

function renderVectors() {
    const vectorGroups = svg.selectAll(".vector-atom")
        .data(vectorStore.vectors, d => d.id)
        .join("g")
        .attr("class", "vector-atom")
        .attr("transform", d => `translate(${d.x || configStore.width / 2}, ${d.y || configStore.height / 2})`)
        .attr("tabindex", "0")
        .attr("role", "button")
        .attr("aria-label", d => `Vector ${d.id}, magnitude ${vectorOperations.magnitude(d.components).toFixed(2)}`)
        .on("click", (event, d) => {
            event.stopPropagation();
            vectorStore.selectVector(d.id);
        })
        .on("keydown", (event, d) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                vectorStore.selectVector(d.id);
            }
        });

    vectorGroups.append("circle")
        .attr("r", d => getVectorRadius(d))
        .attr("fill", "var(--vis-bg-transparent)")
        .attr("stroke", "var(--vis-text-color-transparent)")
        .attr("stroke-width", 2)
        .attr("filter", "url(#glow)");

    vectorGroups.each(function(d) {
        renderDimensionArcs(d3.select(this), d);
    });

    vectorGroups.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "var(--vis-text-color)")
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .text(d => `V${d.id}`);
}

function renderDimensionArcs(group, vector) {
    const radius = getVectorRadius(vector);
    const angleStep = (2 * Math.PI) / vector.components.length;
    
    vector.components.forEach((component, dimIndex) => {
        const angle = dimIndex * angleStep - Math.PI / 2;
        const intensity = Math.abs(component);
        const segmentRadius = radius * 0.8;
        
        const arc = d3.arc()
            .innerRadius(segmentRadius - 8)
            .outerRadius(segmentRadius - 2)
            .startAngle(angle - angleStep * 0.4)
            .endAngle(angle + angleStep * 0.4);
        
        group.append("path")
            .attr("d", arc)
            .attr("fill", getComponentColor(component))
            .attr("opacity", 0.3 + intensity * 0.7)
            .attr("class", "dimension-segment");
    });
}

function renderInputVector() {
    const iv = vectorStore.inputVector;
    if (!iv) return;

    const inputGroup = svg.selectAll(".input-vector")
        .data([iv])
        .join("g")
        .attr("class", "input-vector")
        .attr("transform", `translate(${iv.x || configStore.width - 50}, ${iv.y || 50})`);

    const radius = getVectorRadius(iv);

    inputGroup.append("circle")
        .attr("r", radius + 10)
        .attr("fill", "none")
        .attr("stroke", "var(--vis-vector-input)")
        .attr("stroke-width", 2)
        .attr("opacity", 0.5)
        .attr("class", "input-pulse");
    
    inputGroup.append("circle")
        .attr("r", radius)
        .attr("fill", "var(--vis-vector-input-transparent)")
        .attr("stroke", "var(--vis-vector-input)")
        .attr("stroke-width", 3);

    renderDimensionArcs(inputGroup, iv);

    inputGroup.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "var(--vis-vector-input)")
        .attr("font-weight", "bold")
        .attr("font-size", "16px")
        .text("INPUT");
}

function getVectorRadius(vector) {
    const magnitude = vectorOperations.magnitude(vector.components);
    const radius = Math.max(Constants.MIN_VECTOR_RADIUS, Math.min(Constants.MAX_VECTOR_RADIUS, magnitude * 25));
    return radius;
}

function getComponentColor(value) {
    if (Math.abs(value) < 0.1) return "var(--vis-vector-neutral)";
    return value > 0 ? "var(--vis-vector-positive)" : "var(--vis-vector-negative)";
}

function updateVectorSelection() {
    svg.selectAll(".vector-atom")
        .classed("selected", d => d.id === vectorStore.selectedVectorId);
}

function handleKeyDown(e) {
    if (e.target.closest('.modal-overlay') || e.target.tagName === 'INPUT') return;
            
    const vectors = vectorStore.vectors;
    if (!vectors.length) return;
    
    const currentIndex = vectors.findIndex(v => v.id === vectorStore.selectedVectorId);
    let newIndex = -1;

    switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
            e.preventDefault();
            newIndex = currentIndex < vectors.length - 1 ? currentIndex + 1 : 0;
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
            e.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : vectors.length - 1;
            break;
        case 'Home':
            e.preventDefault();
            newIndex = 0;
            break;
        case 'End':
            e.preventDefault();
            newIndex = vectors.length - 1;
            break;
    }
    
    if (newIndex !== -1) {
        const newVectorId = vectors[newIndex].id;
        vectorStore.selectVector(newVectorId);
        
        // Focus the newly selected element for accessibility
        const vectorElement = svg.selectAll(".vector-atom").filter(d => d.id === newVectorId).node();
        if (vectorElement) {
            vectorElement.focus();
        }
    }
}

function setupKeyboardNavigation() {
    document.addEventListener('keydown', handleKeyDown);
}

function renderBackgroundParticles() {
    const particles = d3.range(30).map(() => ({
        x: Math.random() * configStore.width,
        y: Math.random() * configStore.height,
        r: Math.random() * 2 + 1
    }));
    
    svg.selectAll(".bg-particle")
        .data(particles)
        .enter()
        .append("circle")
        .attr("class", "bg-particle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.r)
        .style("fill", "rgba(255,255,255,0.1)");
}

function renderForces() {
  const forces = forceCalculator.calculateForces(vectorStore.vectors, vectorStore.forceType);
  
  const forceLines = svg.selectAll(".force-line")
    .data(forces)
    .join("line")
    .attr("class", "force-line")
    .attr("x1", d => d.x1)
    .attr("y1", d => d.y1)
    .attr("x2", d => d.x2)
    .attr("y2", d => d.y2)
    .attr("stroke", d => d.force > 0 ? Constants.COLORS.POSITIVE : Constants.COLORS.NEGATIVE)
    .attr("stroke-width", d => Math.min(5, Math.abs(d.force) * 5))
    .attr("opacity", d => Math.min(0.8, Math.abs(d.force) * 0.8));
}

function showVectorTooltip(event, data) {
    const tt = d3.select(tooltip.value);
    tt.style("opacity", 1)
      .style("left", `${event.pageX + 10}px`)
      .style("top", `${event.pageY}px`)
      .html(`<b>Vector ID: ${data.id}</b><br/>Components: ${data.components.length}`);
}

function hideVectorTooltip() {
    d3.select(tooltip.value).style("opacity", 0);
}

function showForceTooltip(event, data) {
    const tt = d3.select(tooltip.value);
    tt.style("opacity", 1)
      .style("left", `${event.pageX + 10}px`)
      .style("top", `${event.pageY}px`)
      .html(`<b>Force Type: ${data.forceType}</b><br/>Strength: ${data.force.toFixed(4)}`);
}

function hideForceTooltip() {
    d3.select(tooltip.value).style("opacity", 0);
}

function handleAnalysisResults(result) {
    if (!result || !result.type) return;

    const { data } = result;
    if (result.type === 'kmeans') {
        const colors = d3.scaleOrdinal(d3.schemeCategory10);
        svg.selectAll(".vector-atom")
            .each(function(d, i) {
                const clusterId = data.assignments[i];
                d3.select(this).select('circle').style('fill', colors(clusterId));
            });
    } else {
        const xScale = d3.scaleLinear().domain(d3.extent(data, d => d[0])).range([50, configStore.width - 50]);
        const yScale = d3.scaleLinear().domain(d3.extent(data, d => d[1])).range([50, configStore.height - 50]);

        svg.selectAll(".vector-atom")
            .transition().duration(750)
            .attr("transform", (d, i) => {
                // Also update the vector's position in the store if desired
                // vectorStore.updateVectorPosition(d.id, { x: xScale(data[i][0]), y: yScale(data[i][1]) });
                return `translate(${xScale(data[i][0])}, ${yScale(data[i][1])})`
            });
    }
}

</script>

<style scoped>
/* From _vector.css */
.vector-atom {
  cursor: pointer;
  transition: transform 0.2s ease-out;
}

.vector-atom:hover {
  transform: scale(1.1);
}

.vector-atom:focus {
  outline: none;
}

.vector-atom.selected > circle {
  stroke: var(--vis-vector-selected);
  stroke-width: 4px;
}

.vector-atom:focus > circle {
  stroke: var(--vis-vector-selected);
  stroke-width: 4px;
  stroke-dasharray: 4;
  animation: focus-ring 1s linear infinite;
}

.vector-renderer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: var(--vis-bg);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

svg {
  cursor: grab;
}
svg:active {
  cursor: grabbing;
}

.renderer-tooltip {
  position: absolute;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 4px 12px var(--shadow-color);
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  font-size: 14px;
}

.bg-particle {
  opacity: 0.3;
  animation: float 20s infinite alternate ease-in-out;
}

.input-pulse {
  animation: pulse 2s infinite;
}

.force-line {
  stroke-linecap: round;
  transition: all 0.3s ease;
}

@keyframes focus-ring {
  to {
    stroke-dashoffset: 8;
  }
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.5; }
  70% { transform: scale(1.2); opacity: 0.2; }
  100% { transform: scale(0.9); opacity: 0.5; }
}

@keyframes float {
  from { transform: translate(var(--tx-start), var(--ty-start)); }
  to { transform: translate(var(--tx-end), var(--ty-end)); }
}
</style>