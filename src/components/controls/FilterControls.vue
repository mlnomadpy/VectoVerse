<template>
  <div class="filter-controls">
    <div class="toggle-switch">
      <input type="checkbox" id="show-placeholders" v-model="showPlaceholders" class="toggle-switch-checkbox">
      <label for="show-placeholders" class="toggle-switch-label">
        <span class="toggle-switch-inner" />
        <span class="toggle-switch-switch" />
      </label>
    </div>
    <label for="show-placeholders" class="toggle-label-text">Show Undiscovered</label>
  </div>
</template>

<script setup>
import { usePeriodicTable } from '../../composables/usePeriodicTable';
const { showPlaceholders } = usePeriodicTable();
</script>

<style scoped>
.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.toggle-label-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
}
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}
.toggle-switch-checkbox {
  opacity: 0;
  width: 0;
  height: 0;
}
.toggle-switch-label {
  display: block;
  overflow: hidden;
  cursor: pointer;
  height: 100%;
  border: 1px solid var(--border-color);
  border-radius: 14px;
}
.toggle-switch-inner {
  display: block;
  width: 200%;
  margin-left: -100%;
  transition: margin 0.2s ease-in 0s;
}
.toggle-switch-inner:before, .toggle-switch-inner:after {
  display: block;
  float: left;
  width: 50%;
  height: 28px;
  padding: 0;
  line-height: 28px;
  font-size: 12px;
  color: var(--text-primary);
  box-sizing: border-box;
}
.toggle-switch-inner:before {
  content: "";
  padding-left: 10px;
  background-color: var(--bg-tertiary);
}
.toggle-switch-inner:after {
  content: "";
  padding-right: 10px;
  background-color: var(--accent-primary);
  text-align: right;
}
.toggle-switch-switch {
  display: block;
  width: 20px;
  height: 20px;
  margin: 4px;
  background: var(--text-primary);
  position: absolute;
  top: 0;
  bottom: 0;
  right: 22px;
  border-radius: 50%;
  transition: all 0.2s ease-in 0s;
}
.toggle-switch-checkbox:checked + .toggle-switch-label .toggle-switch-inner {
  margin-left: 0;
}
.toggle-switch-checkbox:checked + .toggle-switch-label .toggle-switch-switch {
  right: 0px;
}
</style> 