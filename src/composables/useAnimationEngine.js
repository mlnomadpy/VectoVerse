import { ref, onMounted, onUnmounted } from 'vue';
import { useVectorStore } from '@/stores/vectorStore';
import * as d3 from 'd3';

// Constants can be moved to a dedicated file in `utils` if they grow.
const PULSE_SPEED = 0.05;
const FLOAT_SPEED_Y = 0.02;
const FLOAT_SPEED_X = 0.015;
const FLOAT_AMPLITUDE_Y = 3;
const FLOAT_AMPLITUDE_X = 4;
const FORCE_PULSE_SPEED = 0.1;

export function useAnimationEngine(svgRef) {
  const vectorStore = useVectorStore();

  const isRunning = ref(false);
  let animationId = null;
  let pulseTime = 0;

  function start() {
    if (isRunning.value) return;
    isRunning.value = true;
    
    function animate() {
      if (!isRunning.value) return;
      
      pulseTime += PULSE_SPEED;
      updateAnimations();
      animationId = requestAnimationFrame(animate);
    }
    animate();
  }

  function stop() {
    isRunning.value = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function updateAnimations() {
    if (!svgRef.value) return;

    const svg = d3.select(svgRef.value);

    updateVectorPulse(svg);
    updateInputVectorFloat(svg);
    updateForceLineAnimation(svg);
  }

  function updateVectorPulse(svg) {
    const selectedId = vectorStore.selectedVectorId;
    svg.selectAll(".vector-atom circle")
      .each(function(d) {
        const baseWidth = d.id === selectedId ? 4 : 2;
        const pulse = Math.sin(pulseTime + (d.id || 0)) * 0.3 + 1;
        d3.select(this).attr("stroke-width", baseWidth + pulse * 0.5);
      });
  }

  function updateInputVectorFloat(svg) {
    const iv = vectorStore.inputVector;
    if (iv) {
      const floatY = Math.sin(pulseTime * FLOAT_SPEED_Y) * FLOAT_AMPLITUDE_Y;
      const floatX = Math.cos(pulseTime * FLOAT_SPEED_X) * FLOAT_AMPLITUDE_X;
      svg.select(".input-vector")
        .attr("transform", `translate(${iv.x + floatX}, ${iv.y + floatY})`);
    }
  }

  function updateForceLineAnimation(svg) {
    svg.selectAll(".force-line")
      .style("opacity", function(d) {
        const baseOpacity = parseFloat(d3.select(this).attr("data-base-opacity") || 0.6);
        const pulse = Math.sin(pulseTime * FORCE_PULSE_SPEED) * 0.2 + 1;
        return Math.min(1, baseOpacity * pulse);
      });
  }

  onMounted(start);
  onUnmounted(stop);

  return {
    isRunning,
    start,
    stop,
  };
} 