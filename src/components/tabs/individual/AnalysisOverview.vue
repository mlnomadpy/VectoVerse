<template>
  <div class="analysis-overview-tab">
    <h4>Vector Overview</h4>
    <div class="overview-grid">
      <StatCard label="Magnitude" :value="stats.magnitude.toFixed(4)" icon="📏" />
      <StatCard label="Dimensions" :value="stats.dimensions" icon="📐" />
      <StatCard label="Sparsity" :value="`${(stats.sparsity * 100).toFixed(2)}%`" icon="✨" />
      <StatCard label="Entropy" :value="stats.entropy.toFixed(4)" icon="🌀" />
      <StatCard label="Effective Dim." :value="stats.effectiveDimensionality.toFixed(2)" icon="🌐" />
      <StatCard label="Info Density" :value="`${(stats.informationDensity * 100).toFixed(2)}%`" icon=" densely" />
    </div>
  </div>
</template>

<script setup>
import StatCard from '../../StatCard.vue'

defineProps({
  stats: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.analysis-overview-tab {
  padding: 1rem 0;
}
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}
</style> 