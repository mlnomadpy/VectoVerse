<template>
  <div class="visualization-container" ref="containerRef">
    <svg id="main-viz" ref="svgRef"></svg>
    <!-- Periodic table will be dynamically added here by the framework -->
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useVectorStore } from '../stores/vectorStore'

const containerRef = ref(null)
const svgRef = ref(null)
const framework = inject('framework')
const vectorStore = useVectorStore()

onMounted(() => {
  // The SVG is already created and will be used by the framework
  // The framework initializes the periodic table in this container
  if (framework.value && containerRef.value) {
    // Initialize periodic table visualization
    framework.value.initializePeriodicTable(containerRef.value)
  }
})
</script>

<style scoped>
.visualization-container {
  position: relative;
  width: 100%;
  height: 600px;
  background: radial-gradient(circle at center, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  overflow: hidden;
  margin-bottom: 2rem;
}

#main-viz {
  width: 100%;
  height: 100%;
  display: block;
}

/* Periodic table styles */
:deep(.periodic-table-container) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

:deep(.periodic-element) {
  pointer-events: all;
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.periodic-element:hover) {
  filter: brightness(1.2);
  transform: scale(1.05);
}

:deep(.periodic-element.selected) {
  filter: brightness(1.3) drop-shadow(0 0 10px rgba(102, 126, 234, 0.8));
}

:deep(.vector-atom) {
  cursor: pointer;
  transition: filter 0.2s ease, transform 0.2s ease;
}

:deep(.vector-atom:hover) {
  filter: brightness(1.2);
}

:deep(.vector-atom.selected) {
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.7));
}

:deep(.vector-atom.selected circle) {
  stroke-width: 4 !important;
  stroke: rgba(255, 255, 255, 0.9) !important;
}

/* Force visualization styles */
:deep(.force-line) {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

:deep(.force-line.force-resonance) {
  stroke: #667eea;
  stroke-width: 2;
}

:deep(.force-line.force-cosine) {
  stroke: #f093fb;
  stroke-width: 2;
}

:deep(.force-line.force-correlation) {
  stroke: #4facfe;
  stroke-width: 2;
}

:deep(.force-line.force-euclidean) {
  stroke: #ffecd2;
  stroke-width: 2;
}

:deep(.force-line.force-manhattan) {
  stroke: #a8edea;
  stroke-width: 2;
}

:deep(.force-line.force-quantum) {
  stroke: #d299c2;
  stroke-width: 2;
}

/* Neural network styles */
:deep(.neural-connection) {
  stroke: #00f2fe;
  stroke-width: 3;
  opacity: 0.8;
  animation: neuralPulse 2s ease-in-out infinite;
}

:deep(.activation-ring) {
  fill: none;
  stroke: #4facfe;
  stroke-width: 2;
  opacity: 0.7;
}

:deep(.neural-input-highlight) {
  animation: inputPulse 1.5s ease-in-out infinite;
}

@keyframes neuralPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

@keyframes inputPulse {
  0%, 100% { 
    filter: brightness(1);
    transform: scale(1);
  }
  50% { 
    filter: brightness(1.3) drop-shadow(0 0 15px rgba(79, 172, 254, 0.8));
    transform: scale(1.1);
  }
}

/* Tooltips */
:deep(.force-tooltip),
:deep(.periodic-tooltip) {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  pointer-events: none;
  z-index: 1000;
  max-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .visualization-container {
    height: 400px;
  }
}

@media (max-width: 480px) {
  .visualization-container {
    height: 300px;
  }
}
</style> 