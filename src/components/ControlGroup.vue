<template>
  <div class="control-group">
    <h5 class="group-title">{{ title }}</h5>
    <div class="group-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.control-group {
  margin-bottom: 1rem;
}

.group-title {
  text-transform: uppercase;
  font-size: 0.8em;
  color: var(--text-secondary);
  margin: 0 0 0.75rem 0.25rem;
  letter-spacing: 0.5px;
}

.group-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style> 