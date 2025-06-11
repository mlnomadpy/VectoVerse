import { defineStore } from 'pinia';

export const useConfigStore = defineStore('config', {
  state: () => ({
    width: 800,
    height: 600,
    dimensions: 4,
    numVectors: 6,
    showForces: true,
    showLabels: false,
    showGrid: true,
    rainbowMode: false,
    neuronMode: false,
    forceStrength: 50,
    linkDistance: 100,
    charge: -30,
    particleSize: 5,
  }),
  actions: {
    updateConfig(key, value) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = value;
      }
    },
  },
}); 