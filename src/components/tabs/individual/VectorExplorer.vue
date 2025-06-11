<template>
  <div class="vector-explorer">
    <div class="controls">
      <label for="sort-by">Sort by:</label>
      <select id="sort-by" v-model="sortOption">
        <option value="index_asc">Index (Asc)</option>
        <option value="value_asc">Value (Asc)</option>
        <option value="value_desc">Value (Desc)</option>
      </select>
    </div>
    <div class="chart-container">
      <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  components: {
    type: Array,
    required: true
  }
})

const sortOption = ref('index_asc') // 'index_asc', 'value_asc', 'value_desc'

const sortedComponents = computed(() => {
  const indexed = props.components.map((value, index) => ({ value, index }))

  switch (sortOption.value) {
    case 'value_asc':
      return indexed.sort((a, b) => a.value - b.value)
    case 'value_desc':
      return indexed.sort((a, b) => b.value - a.value)
    case 'index_asc':
    default:
      return indexed
  }
})

const chartData = computed(() => {
  if (!props.components) return null
  
  const labels = sortedComponents.value.map(c => `Dim ${c.index}`)
  const data = sortedComponents.value.map(c => c.value)

  return {
    labels,
    datasets: [
      {
        label: 'Component Value',
        backgroundColor: data.map(v => v >= 0 ? 'rgba(102, 126, 234, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
        borderColor: data.map(v => v >= 0 ? 'rgba(102, 126, 234, 1)' : 'rgba(239, 68, 68, 1)'),
        borderWidth: 1,
        data,
      },
    ],
  }
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        title: (context) => context[0].label,
        label: (context) => `Value: ${context.raw.toFixed(4)}`
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#aaa'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    },
    y: {
      ticks: {
        color: '#aaa'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    }
  }
})
</script>

<style scoped>
.vector-explorer {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.controls label {
  color: #bbb;
}

.controls select {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
}

.chart-container {
  position: relative;
  height: 300px;
  flex-grow: 1;
}
</style> 