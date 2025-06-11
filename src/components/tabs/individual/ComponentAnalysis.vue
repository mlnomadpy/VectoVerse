<template>
  <div class="component-analysis-tab">
    <div class="component-insights">
      <StatCard label="Positive" :value="stats.componentInsights.positiveCount" icon="➕" />
      <StatCard label="Negative" :value="stats.componentInsights.negativeCount" icon="➖" />
      <StatCard label="Zeros" :value="stats.componentInsights.zeroCount" icon="⭕" />
    </div>
    
    <h4>Component Values</h4>
    <div class="component-list-container">
      <ul class="component-list">
        <li v-for="(component, index) in components" :key="index">
          <span class="component-index">{{ index }}:</span>
          <span class="component-value">{{ component.toFixed(4) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import StatCard from '../../StatCard.vue'

defineProps({
  stats: {
    type: Object,
    required: true
  },
  components: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.component-analysis-tab {
  padding: 1rem 0;
}
.component-insights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.component-list-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
}
.component-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.component-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.component-list li:last-child {
  border-bottom: none;
}
.component-index {
  font-weight: bold;
  color: #888;
}
.component-value {
  font-family: 'Courier New', Courier, monospace;
}
</style> 