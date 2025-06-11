<template>
  <div class="advanced-stats-tab">
    <h4>Statistical Properties</h4>
    <ul class="stats-list">
      <li>
        <span class="stat-label">Mean</span>
        <span class="stat-value">{{ stats.mean.toFixed(4) }}</span>
      </li>
      <li>
        <span class="stat-label">Variance</span>
        <span class="stat-value">{{ stats.variance.toFixed(4) }}</span>
      </li>
      <li>
        <span class="stat-label">Standard Deviation</span>
        <span class="stat-value">{{ stats.standardDeviation.toFixed(4) }}</span>
      </li>
      <li>
        <span class="stat-label">Min Value</span>
        <span class="stat-value">{{ stats.min.toFixed(4) }}</span>
      </li>
      <li>
        <span class="stat-label">Max Value</span>
        <span class="stat-value">{{ stats.max.toFixed(4) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.advanced-stats-tab {
  padding: 1rem 0;
}
.stats-list {
  list-style-type: none;
  padding: 0;
  background: rgba(0,0,0,0.1);
  border-radius: 8px;
  padding: 1rem;
}
.stats-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.stats-list li:last-child {
  border-bottom: none;
}
.stat-label {
  color: #bbb;
}
.stat-value {
  font-weight: bold;
  color: #fff;
}
</style> 