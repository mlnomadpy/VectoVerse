<template>
  <div class="heatmap-controls">
    <label for="heatmap-select">Heatmap:</label>
    <select id="heatmap-select" v-model="activeHeatmap" class="styled-select">
      <option value="none">None</option>
      <option value="atomicMass">Magnitude</option>
      <option value="entropy">Entropy</option>
      <option value="stability">Stability</option>
    </select>
  </div>
</template>

<script setup>
import { usePeriodicTable } from '../../composables/usePeriodicTable';
const { activeHeatmap } = usePeriodicTable();
</script>

<style scoped>
.heatmap-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0 1rem;
}
label {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}
.styled-select {
  background-color: rgba(0,0,0,0.3);
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.styled-select:hover {
  background-color: rgba(0,0,0,0.5);
  border-color: #667eea;
}
</style> 