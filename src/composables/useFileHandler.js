import { useVectorStore } from '../stores/vectorStore';
import { useConfigStore } from '../stores/configStore';
import { useUIStore } from '../stores/uiStore';

export function useFileHandler() {
  const vectorStore = useVectorStore();
  const configStore = useConfigStore();
  const uiStore = useUIStore();

  const maxDimensions = 10000;
  const maxFileSize = 100 * 1024 * 1024; // 100MB

  function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      uiStore.showError(`File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`);
      return;
    }

    uiStore.setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        processFileContent(e.target.result, file.name);
      } catch (error) {
        console.error("File upload error:", error);
        uiStore.showError(`Error processing file: ${error.message}`);
      } finally {
        uiStore.setLoading(false);
      }
    };

    reader.onerror = () => {
      uiStore.showError('Error reading file. Please try again.');
      uiStore.setLoading(false);
    };

    reader.readAsText(file);
  }

  function processFileContent(content, filename) {
    const extension = filename.toLowerCase().split('.').pop();
    let vectors;

    try {
      switch (extension) {
        case 'json':
          vectors = parseJSON(content);
          break;
        case 'csv':
          vectors = parseCSV(content);
          break;
        case 'txt':
          vectors = parseTXT(content);
          break;
        default:
          vectors = autoDetectFormat(content);
          break;
      }

      if (!vectors || vectors.length === 0) {
        throw new Error('No valid vectors found in file');
      }

      loadVectors(vectors);

    } catch (error) {
      throw new Error(`Failed to parse ${extension.toUpperCase()} file: ${error.message}`);
    }
  }

  function parseJSON(content) {
    const data = JSON.parse(content);
    if (Array.isArray(data)) return data;
    if (data.vectors && Array.isArray(data.vectors)) return data.vectors;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.matrix && Array.isArray(data.matrix)) return data.matrix;
    throw new Error('JSON must contain an array of vectors or an object with "vectors", "data", or "matrix" property');
  }

  function parseCSV(content) {
    const lines = content.trim().split('\\n').filter(line => line.trim());
    const vectors = [];
    const firstLine = lines[0].split(',').map(cell => cell.trim());
    const hasHeaders = firstLine.some(cell => isNaN(parseFloat(cell)));
    const startIndex = hasHeaders ? 1 : 0;

    if (lines.length <= startIndex) {
      throw new Error('CSV file appears to contain only headers or is empty');
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const components = line.split(',').map(val => parseFloat(val.trim())).filter(num => !isNaN(num));
      if (components.length > 0) vectors.push(components);
    }
    return vectors;
  }

  function parseTXT(content) {
    const lines = content.trim().split('\\n').filter(line => line.trim());
    const vectors = [];
    for (const line of lines) {
      const components = line.split(/\\s+/).map(val => parseFloat(val.trim())).filter(num => !isNaN(num));
      if (components.length > 0) vectors.push(components);
    }
    return vectors;
  }

  function autoDetectFormat(content) {
    try { return parseJSON(content); } catch (e) { /* ignore */ }
    try { return parseCSV(content); } catch (e) { /* ignore */ }
    try { return parseTXT(content); } catch (e) { /* ignore */ }
    throw new Error('Could not auto-detect file format.');
  }

  function loadVectors(vectorData) {
    if (vectorData.length === 0) throw new Error('No vectors found in file');
    
    const dimensions = vectorData[0].length;
    if (dimensions === 0) throw new Error('Vectors cannot be empty');
    if (dimensions > maxDimensions) throw new Error(`Too many dimensions (${dimensions}). Max: ${maxDimensions}`);

    for (let i = 1; i < vectorData.length; i++) {
      if (vectorData[i].length !== dimensions) {
        throw new Error(`Inconsistent dimensions: Vector ${i + 1} has ${vectorData[i].length}, expected ${dimensions}`);
      }
    }
    
    configStore.updateConfig('dimensions', dimensions);
    configStore.updateConfig('numVectors', vectorData.length);

    const uploadedVectors = vectorData.map((components, index) => ({
      id: index,
      components: components,
      x: Math.random() * (configStore.width - 100) + 50,
      y: Math.random() * (configStore.height - 100) + 50,
      isUploaded: true,
    }));

    vectorStore.vectors = uploadedVectors;
    
    uiStore.showSuccess(`Successfully loaded ${vectorData.length} vectors with ${dimensions} dimensions`);
  }
  
  function exportStateToJson() {
    try {
        const state = {
            vectors: vectorStore.vectors,
            config: {
                dimensions: configStore.dimensions,
                numVectors: configStore.numVectors,
                showForces: configStore.showForces,
                forceType: vectorStore.forceType,
                neuralModeActive: vectorStore.neuralModeActive,
                activationFunction: vectorStore.activationFunction,
                learningRate: vectorStore.learningRate
            },
            timestamp: new Date().toISOString()
        };

        const jsonString = JSON.stringify(state, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `vectoverse_state_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        uiStore.showSuccess('State exported successfully!');

    } catch (error) {
        console.error('Failed to export state:', error);
        uiStore.showError(`Export failed: ${error.message}`);
    }
  }

  return { handleFileUpload, exportStateToJson };
} 