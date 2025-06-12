import { ref, watch, computed } from 'vue'
import { useVectorStore } from '../stores/vectorStore'
import { useConfigStore } from '../stores/configStore'
import { 
  calculateVectorStatistics, 
  getInformationQuantums 
} from '../utils/periodicTableCalculations'
import { generateElementName } from '../utils/nameGenerator'

// --- State should be defined outside the function to be a singleton ---
const activeHeatmap = ref('none'); // none, magnitude, entropy, stability
const dataRanges = ref({
  magnitude: { min: 0, max: 1 },
  entropy: { min: 0, max: 1 },
  stability: { min: 0, max: 1 }
});
const showPlaceholders = ref(true);
const highlightedElementIds = ref(new Set());
// --- End of singleton state ---

export function usePeriodicTable() {
  const vectorStore = useVectorStore()
  const configStore = useConfigStore()
  
  const periodicData = ref([])
  
  const config = ref({
    elementWidth: 70, // Increased width
    elementHeight: 70, // Increased height
    padding: 2,
    fontSize: 9,
    symbolFontSize: 16
  })

  const tableDimensions = computed(() => {
    return {
      rows: configStore.dimensions + 1,
      cols: configStore.dimensions + 1
    }
  });

  const generateFullPeriodicTable = () => {
    const { dimensions } = configStore;
    const newTable = [];

    for (let row = 0; row <= dimensions; row++) { // Excitatory
      for (let col = 0; col <= dimensions; col++) { // Inhibitory
        
        const neutralCount = dimensions - row - col;
        if (neutralCount < 0) continue;

        const x = 50 + col * (config.value.elementWidth + config.value.padding);
        const y = 40 + row * (config.value.elementHeight + config.value.padding);

        const element = {
          id: `p_${row}_${col}`,
          isPlaceholder: true,
          symbol: `E${row}I${col}`,
          name: generateElementName(row, col),
          atomicNumber: row * (dimensions + 1) + col + 1,
          atomicMass: 0,
          excitatory: row,
          inhibitory: col,
          neutral: neutralCount,
          entropy: 0,
          stability: 0,
          color: '#333', // Placeholder color
          position: { row, col, x, y },
          vector: null,
          present: false, // Indicates if a vector from the store occupies this slot
          vectors: [] // To hold multiple vectors if they map to the same slot
        };
        newTable.push(element);
      }
    }
    return newTable;
  }

  const mapVectorsToTable = (table) => {
    const vectors = vectorStore.vectors;
    const mappedTable = table; 

    const vectorGroups = new Map();
    vectors.forEach(vector => {
      const quantumData = getInformationQuantums(vector);
      const key = `${quantumData.excitatory}_${quantumData.inhibitory}`;
      if (!vectorGroups.has(key)) {
        vectorGroups.set(key, []);
      }
      vectorGroups.get(key).push(vector);
    });

    mappedTable.forEach(element => {
      const key = `${element.excitatory}_${element.inhibitory}`;
      const vectorsForElement = vectorGroups.get(key);

      if (vectorsForElement && vectorsForElement.length > 0) {
        const firstVector = vectorsForElement[0];
        const quantumData = getInformationQuantums(firstVector);
        let stats;

        if (vectorsForElement.length > 1) {
          // Calculate average stats for stacked vectors
          const avgMagnitude = vectorsForElement.reduce((sum, v) => sum + calculateVectorStatistics(v).magnitude, 0) / vectorsForElement.length;
          const avgEntropy = vectorsForElement.reduce((sum, v) => sum + calculateVectorStatistics(v).entropy, 0) / vectorsForElement.length;
          const avgStability = vectorsForElement.reduce((sum, v) => sum + calculateVectorStatistics(v).stability, 0) / vectorsForElement.length;
          stats = { magnitude: avgMagnitude, entropy: avgEntropy, stability: avgStability };
        } else {
          stats = calculateVectorStatistics(firstVector);
        }

        element.id = firstVector.id; 
        element.isPlaceholder = false;
        element.present = true;
        element.name = generateElementName(quantumData.excitatory, quantumData.inhibitory);
        element.atomicMass = Math.round(stats.magnitude * 100) / 100;
        element.entropy = Math.round(stats.entropy * 1000) / 1000;
        element.stability = Math.round(stats.stability * 1000) / 1000;
        element.color = getElementColor(firstVector, stats, quantumData);
        element.vector = firstVector;
        element.vectors = vectorsForElement;
      }
    });

    return mappedTable;
  }
  
  const getElementColor = (vector, stats, quantumData) => {
    if (quantumData.excitatory > quantumData.inhibitory) {
      return '#ff6b6b' // Red for excitatory dominant
    } else if (quantumData.inhibitory > quantumData.excitatory) {
      return '#4ecdc4' // Cyan for inhibitory dominant
    } else {
      return '#f39c12' // Orange for balanced or neutral
    }
  }

  const calculateDataRanges = (table) => {
    const presentElements = table.filter(el => el.present);
    if (presentElements.length === 0) return;

    const magnitudes = presentElements.map(el => el.atomicMass);
    const entropies = presentElements.map(el => el.entropy);
    const stabilities = presentElements.map(el => el.stability);

    dataRanges.value = {
      magnitude: { min: Math.min(...magnitudes), max: Math.max(...magnitudes) },
      entropy: { min: Math.min(...entropies), max: Math.max(...entropies) },
      stability: { min: Math.min(...stabilities), max: Math.max(...stabilities) },
    }
  }

  const setHighlight = (property, direction = 'desc', count = 5) => {
    const sorted = [...periodicData.value]
      .filter(el => el.present)
      .sort((a, b) => {
        const valA = property === 'excitatory' || property === 'inhibitory' ? a[property] : a.atomicMass;
        const valB = property === 'excitatory' || property === 'inhibitory' ? b[property] : b.atomicMass;
        return direction === 'desc' ? valB - valA : valA - valB;
      });
    
    const topIds = new Set(sorted.slice(0, count).map(el => el.id));
    highlightedElementIds.value = topIds;
  };

  const clearHighlight = () => {
    highlightedElementIds.value.clear();
  };

  const updatePeriodicData = () => {
    const fullTable = generateFullPeriodicTable();
    const mappedTable = mapVectorsToTable(fullTable);
    calculateDataRanges(mappedTable);
    periodicData.value = mappedTable;
  }

  const getElementData = (vectorId) => {
    if (typeof vectorId === 'string' && vectorId.startsWith('p_')) {
        // It's a placeholder
        return periodicData.value.find(element => element.id === vectorId)
    }
    return periodicData.value.find(element => !element.isPlaceholder && element.id === vectorId)
  }

  watch(
    () => vectorStore.vectors,
    () => {
      updatePeriodicData();
    },
    { deep: true, immediate: true }
  );

  watch(
    () => configStore.dimensions,
    () => {
      updatePeriodicData();
    },
    { immediate: true }
  );

  return {
    periodicData,
    config,
    getElementData,
    tableDimensions,
    activeHeatmap,
    dataRanges,
    showPlaceholders,
    highlightedElementIds,
    setHighlight,
    clearHighlight
  }
} 