import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
  state: () => ({
    width: 800,
    height: 600,
    dimensions: 4,
    numVectors: 6,
    showForces: false,
  }),
  actions: {
    updateConfig(key, value) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = value;
      }
    },
  },
}); 