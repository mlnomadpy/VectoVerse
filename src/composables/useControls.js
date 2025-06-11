import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useVectorStore } from '../stores/vectorStore'

export function useControls() {
  const vectorStore = useVectorStore()

  const controls = reactive({
    // Visualization
    showForces: { label: 'Show Forces', value: true, type: 'checkbox', group: 'Visualization' },
    showLabels: { label: 'Show Labels', value: false, type: 'checkbox', group: 'Visualization' },
    showGrid: { label: 'Show Grid', value: true, type: 'checkbox', group: 'Visualization' },

    // Forces
    forceStrength: { label: 'Force Strength', value: 50, type: 'slider', min: 1, max: 200, group: 'Forces' },
    linkDistance: { label: 'Link Distance', value: 100, type: 'slider', min: 10, max: 300, group: 'Forces' },
    charge: { label: 'Charge', value: -30, type: 'slider', min: -100, max: 10, group: 'Forces' },

    // Aesthetics
    particleSize: { label: 'Particle Size', value: 5, type: 'slider', min: 1, max: 20, group: 'Aesthetics' },
    rainbowMode: { label: 'Rainbow Mode', value: false, type: 'checkbox', group: 'Aesthetics' },

    // Neural Net Mode
    nnMode: { label: 'Neural Net Mode', value: false, type: 'checkbox', group: 'Mode' },
  })

  // History for Undo/Redo
  const history = ref([])
  const historyIndex = ref(-1)

  const recordHistory = (key, oldValue, newValue) => {
    // If we are not at the end of the history, slice it
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }
    history.value.push({ key, oldValue, newValue });
    historyIndex.value++;
     // Limit history size
    if (history.value.length > 50) {
        history.value.shift();
        historyIndex.value--;
    }
  }

  const undo = () => {
    if (historyIndex.value >= 0) {
      const lastChange = history.value[historyIndex.value];
      controls[lastChange.key].value = lastChange.oldValue;
      historyIndex.value--;
    }
  }

  const redo = () => {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++;
      const nextChange = history.value[historyIndex.value];
      controls[nextChange.key].value = nextChange.newValue;
    }
  }

  // Presets
  const presets = ref([])

  const loadPresets = () => {
    const savedPresets = localStorage.getItem('vectoverse_presets')
    if (savedPresets) {
      presets.value = JSON.parse(savedPresets)
    } else {
      // Add some default presets if none are saved
      presets.value = [
        { name: 'Default', values: getCurrentControlValues() },
        { name: 'Focused Work', values: { ...getCurrentControlValues(), forceStrength: 20, linkDistance: 50 } },
        { name: 'Chaos', values: { ...getCurrentControlValues(), forceStrength: 200, charge: 10 } },
      ]
    }
  }

  const savePreset = (name) => {
    if (!name) return
    const newPreset = { name, values: getCurrentControlValues() }
    const existingIndex = presets.value.findIndex(p => p.name === name)
    if (existingIndex > -1) {
      presets.value[existingIndex] = newPreset
    } else {
      presets.value.push(newPreset)
    }
    persistPresets()
  }

  const loadPreset = (name) => {
    const preset = presets.value.find(p => p.name === name)
    if (preset) {
      for (const key in preset.values) {
        if (controls[key]) {
          controls[key].value = preset.values[key]
        }
      }
    }
  }
  
  const deletePreset = (name) => {
      presets.value = presets.value.filter(p => p.name !== name);
      persistPresets();
  }

  const persistPresets = () => {
    localStorage.setItem('vectoverse_presets', JSON.stringify(presets.value))
  }

  const getCurrentControlValues = () => {
    return Object.entries(controls).reduce((acc, [key, config]) => {
      acc[key] = config.value
      return acc
    }, {})
  }
  
  onMounted(loadPresets)

  // Watch for changes and update the framework
  Object.keys(controls).forEach(key => {
    watch(() => controls[key].value, (newValue, oldValue) => {
      recordHistory(key, oldValue, newValue)
      if (vectorStore.framework) {
        vectorStore.framework.updateConfig(key, newValue)
      }
    })
  })

  // Method to get controls by group
  const getControlsByGroup = (group) => {
    return Object.entries(controls)
      .filter(([key, config]) => config.group === group)
      .reduce((obj, [key, config]) => {
        obj[key] = config;
        return obj;
      }, {});
  }

  return {
    controls,
    getControlsByGroup,
    undo,
    redo,
    canUndo: computed(() => historyIndex.value > -1),
    canRedo: computed(() => historyIndex.value < history.value.length - 1),
    presets,
    savePreset,
    loadPreset,
    deletePreset,
  }
} 