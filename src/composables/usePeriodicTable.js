import { ref, watch, computed } from 'vue'
import { useVectorStore } from '../stores/vectorStore'
import { useConfigStore } from '../stores/configStore'
import { 
  calculateVectorStatistics, 
  getInformationQuantums 
} from '../utils/periodicTableCalculations'
import { generateElementName } from '../utils/nameGenerator'

export function usePeriodicTable() {
  const vectorStore = useVectorStore()
  const configStore = useConfigStore()
  
  const periodicData = ref([])
  
  const config = ref({
    elementWidth: 70, // Increased width
    elementHeight: 70, // Increased height
    padding: 4,
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

        const x = 50 + col * (config.value.elementWidth + config.value.padding + 15);
        const y = 40 + row * (config.value.elementHeight + config.value.padding + 15);

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
        const stats = calculateVectorStatistics(firstVector);
        const quantumData = getInformationQuantums(firstVector);

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

  const updatePeriodicData = () => {
    const fullTable = generateFullPeriodicTable();
    periodicData.value = mapVectorsToTable(fullTable);
  }

  const getElementData = (vectorId) => {
    if (typeof vectorId === 'string' && vectorId.startsWith('p_')) {
        // It's a placeholder
        return periodicData.value.find(element => element.id === vectorId)
    }
    return periodicData.value.find(element => !element.isPlaceholder && element.id === vectorId)
  }

  watch(() => [vectorStore.vectors, configStore.dimensions], updatePeriodicData, { deep: true, immediate: true })

  return {
    periodicData,
    config,
    getElementData,
    tableDimensions
  }
} 