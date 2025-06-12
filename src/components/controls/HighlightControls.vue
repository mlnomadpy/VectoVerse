<template>
  <div class="highlight-controls">
    <span class="highlight-label">Highlight Top 5:</span>
    <div class="button-group">
      <button @click="setHighlight('atomicMass')" title="Highest Magnitude">Magnitude</button>
      <button @click="setHighlight('excitatory')" title="Most Excitatory">Excitatory</button>
      <button @click="setHighlight('inhibitory')" title="Most Inhibitory">Inhibitory</button>
      <button @click="setHighlight('stability')" title="Most Stable">Stability</button>
      <button @click="clearHighlight" class="clear-btn" title="Clear Highlight">✖</button>
    </div>
  </div>
</template>

<script setup>
import { usePeriodicTable } from '../../composables/usePeriodicTable';
const { setHighlight, clearHighlight } = usePeriodicTable();
</script>

<style scoped>
.highlight-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.highlight-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}
.button-group {
  display: flex;
  background-color: var(--bg-tertiary);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}
.button-group button {
  background-color: transparent;
  color: var(--text-primary);
  border: none;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-left: 1px solid var(--border-color);
}
.button-group button:first-child {
  border-left: none;
}
.button-group button:hover {
  background-color: var(--accent-primary);
}
.button-group button.clear-btn {
  background-color: var(--status-danger);
}
.button-group button.clear-btn:hover {
  background-color: #dc2626; /* This could be a new variable for danger-hover */
}
</style> 