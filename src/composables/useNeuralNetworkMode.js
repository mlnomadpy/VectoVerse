import { ref, watch, computed } from 'vue';
import { useVectorStore } from '@/stores/vectorStore';
import { useForceCalculator } from './useForceCalculator';

export function useNeuralNetworkMode() {
  const vectorStore = useVectorStore();
  const forceCalculator = useForceCalculator();

  const isActive = ref(false);
  const inputVector = ref(null);
  
  const neuronVectors = computed(() => {
    if (!inputVector.value) return [];
    return vectorStore.vectors.filter(v => v.id !== inputVector.value.id);
  });
  
  const activations = ref([]);
  const connections = ref([]);

  watch(() => vectorStore.selectedVectorId, (newId) => {
    if (isActive.value && newId !== null) {
      setInputVector(newId);
    }
  });

  watch(() => [vectorStore.vectors, vectorStore.forceType, vectorStore.activationFunction], () => {
    if (isActive.value) {
      calculateNeuralNetwork();
    }
  }, { deep: true });
  
  function activate(inputVectorId = null) {
    isActive.value = true;
    if (inputVectorId !== null) {
      setInputVector(inputVectorId);
    } else if (vectorStore.vectors.length > 0) {
      setInputVector(vectorStore.vectors[0].id);
    }
    vectorStore.toggleNeuralMode(); // Sync with vector store state
  }

  function deactivate() {
    isActive.value = false;
    inputVector.value = null;
    activations.value = [];
    connections.value = [];
    vectorStore.toggleNeuralMode(); // Sync with vector store state
  }

  function setInputVector(vectorId) {
    inputVector.value = vectorStore.vectors.find(v => v.id === vectorId);
    if (inputVector.value) {
      calculateNeuralNetwork();
    }
  }

  function calculateNeuralNetwork() {
    if (!inputVector.value || neuronVectors.value.length === 0) return;

    const neuronData = neuronVectors.value.map(neuron => {
      const metricValue = forceCalculator.calculateSelectedMetric(inputVector.value, neuron, vectorStore.forceType);
      // Other calculations from the original class can be added here
      return { neuron, metricValue };
    });

    const allMetricValues = neuronData.map(d => d.metricValue);

    activations.value = neuronData.map(data => {
      const activation = forceCalculator.applyActivation(data.metricValue, vectorStore.activationFunction, allMetricValues);
      return {
        neuronId: data.neuron.id,
        activation: activation,
        //... other properties
      };
    });

    connections.value = activations.value.map(act => ({
      from: inputVector.value.id,
      to: act.neuronId,
      activation: act.activation,
    }));
  }

  return {
    isActive,
    inputVector,
    neuronVectors,
    activations,
    connections,
    activate,
    deactivate,
  };
} 