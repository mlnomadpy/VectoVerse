import { ref } from 'vue';
import { useVectorStore } from '@/stores/vectorStore';
import { useUIStore } from '@/stores/uiStore';
import { TSNE } from '@/utils/tsne'; // Assuming TSNE is moved to utils

export function useAnalysisEngine() {
  const vectorStore = useVectorStore();
  const uiStore = useUIStore();

  const isAnalyzing = ref(false);

  async function performAnalysis(type, options) {
    uiStore.setAnalyzing(true);
    isAnalyzing.value = true;
    
    const vectors = vectorStore.vectors;
    let result;

    try {
      switch (type) {
        case 'pca':
          result = await performPCA(vectors, options?.targetDimensions);
          break;
        case 'tsne':
          result = await performTSNE(vectors, options);
          break;
        case 'kmeans':
          result = await performKMeans(vectors, options?.k);
          break;
        default:
          throw new Error(`Unknown analysis type: ${type}`);
      }
      uiStore.setAnalysisResults(result);
      uiStore.showSuccess('Analysis complete!');
      return result;
    } catch (error) {
      uiStore.showError(`Analysis failed: ${error.message}`);
    } finally {
      uiStore.setAnalyzing(false);
      isAnalyzing.value = false;
    }
  }

  // --- Analysis Implementations (ported from AnalysisEngine.js) ---

  async function performPCA(vectors, targetDimensions = 2) {
      // PCA logic from original class
  }

  async function performTSNE(vectors, options = {}) {
      const tsne = new TSNE(options);
      const matrix = vectors.map(v => v.components);
      const embedding = await tsne.run(matrix); // Assuming TSNE is adapted to be async
      return {
          type: 'tsne',
          data: embedding,
          parameters: options,
          originalVectors: vectors
      };
  }

  async function performKMeans(vectors, k = 3) {
      // K-Means logic from original class
  }

  return {
    isAnalyzing,
    performAnalysis,
  };
} 